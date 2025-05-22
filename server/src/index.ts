import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { summarizeTodos } from './services/cohereService';
import { sendToSlack } from './services/slackService';
import { Todo } from './types/todo';
import { authenticateUser, AuthenticatedRequest } from './middleware/auth';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
} catch (error) {
  console.error('Error parsing Firebase service account:', error);
  process.exit(1);
}

if (!serviceAccount || Object.keys(serviceAccount).length === 0) {
  console.error('Firebase service account is not properly configured');
  process.exit(1);
}

try {
  initializeApp({
    credential: cert(serviceAccount)
  });
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  process.exit(1);
}

const db = getFirestore();

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Todo Summary Assistant API is running' });
});

// Todo routes
app.get('/todos', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const todosSnapshot = await db.collection('todos')
      .where('userId', '==', req.user?.uid)
      .get();
    
    const todos = todosSnapshot.docs.map(doc => {
      const data = doc.data();
      let formattedDate;
      if (data.createdAt instanceof Date) {
        formattedDate = data.createdAt.toISOString();
      } else if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        formattedDate = data.createdAt.toDate().toISOString();
      } else {
        formattedDate = data.createdAt;
      }
      
      return {
        id: doc.id,
        ...data,
        createdAt: formattedDate
      };
    }) as Todo[];
    
    res.json(todos || []);
  } catch (error) {
    console.error('Error in GET /todos:', error);
    res.status(500).json({ 
      error: 'Failed to fetch todos',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/todos', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, description, completed } = req.body;

    if (!title || !description) {
      res.status(400).json({ 
        error: 'Title and description are required',
        received: { title, description }
      });
      return;
    }

    const todoData = {
      title,
      description,
      completed: completed || false,
      createdAt: new Date().toISOString(),
      userId: req.user?.uid,
      userName: req.user?.email
    };

    const todoRef = await db.collection('todos').add(todoData);
    const newTodo = { id: todoRef.id, ...todoData };
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error in POST /todos:', error);
    res.status(500).json({ 
      error: 'Failed to create todo',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.delete('/todos/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const todoId = req.params.id;
    const todoRef = db.collection('todos').doc(todoId);
    const todoDoc = await todoRef.get();

    if (!todoDoc.exists) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    const todoData = todoDoc.data() as Todo;
    if (todoData.userId !== req.user?.uid) {
      res.status(403).json({ error: 'Not authorized to delete this todo' });
      return;
    }

    await todoRef.delete();
    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /todos/:id:', error);
    res.status(500).json({ 
      error: 'Failed to delete todo',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.patch('/todos/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const todoId = req.params.id;
    const { completed } = req.body;
    const todoRef = db.collection('todos').doc(todoId);
    const todoDoc = await todoRef.get();

    if (!todoDoc.exists) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    const todoData = todoDoc.data() as Todo;
    if (todoData.userId !== req.user?.uid) {
      res.status(403).json({ error: 'Not authorized to update this todo' });
      return;
    }

    await todoRef.update({ completed });
    const updatedTodo = {
      ...todoData,
      id: todoId,
      completed
    };
    
    res.status(200).json(updatedTodo);
  } catch (error) {
    console.error('Error in PATCH /todos/:id:', error);
    res.status(500).json({ 
      error: 'Failed to update todo',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.put('/todos/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const todoId = req.params.id;
    const { title, description } = req.body;
    const todoRef = db.collection('todos').doc(todoId);
    const todoDoc = await todoRef.get();

    if (!todoDoc.exists) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    const todoData = todoDoc.data() as Todo;
    if (todoData.userId !== req.user?.uid) {
      res.status(403).json({ error: 'Not authorized to update this todo' });
      return;
    }

    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }

    await todoRef.update({ title, description });
    const updatedTodo = {
      ...todoData,
      id: todoId,
      title,
      description
    };
    
    res.status(200).json(updatedTodo);
  } catch (error) {
    console.error('Error in PUT /todos/:id:', error);
    res.status(500).json({ 
      error: 'Failed to update todo',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/summarize', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const todosSnapshot = await db.collection('todos')
      .where('userId', '==', req.user?.uid)
      .get();
    
    const todos = todosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Todo[];

    const incompleteTodos = todos.filter(todo => !todo.completed);

    if (incompleteTodos.length === 0) {
      res.status(400).json({ error: 'No incomplete todos found to summarize' });
      return;
    }

    const summary = await summarizeTodos(incompleteTodos);
    
    // Format the Slack message
    const formattedMessage = incompleteTodos.map(todo => {
      const date = new Date(todo.createdAt);
      return `*${todo.title}*\n` +
             `Summary: ${summary}\n` +
             `Created by: ${todo.userName}\n` +
             `Created at: ${date.toLocaleString()}\n` +
             `---`;
    }).join('\n');

    const sentToSlack = await sendToSlack(formattedMessage);

    res.json({
      success: true,
      summary,
      sentToSlack
    });
  } catch (error) {
    console.error('Error in POST /summarize:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to summarize and send to Slack',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/summarize/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const todoId = req.params.id;
    const todoRef = db.collection('todos').doc(todoId);
    const todoDoc = await todoRef.get();

    if (!todoDoc.exists) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    const todoData = todoDoc.data() as Todo;
    if (todoData.userId !== req.user?.uid) {
      res.status(403).json({ error: 'Not authorized to summarize this todo' });
      return;
    }

    if (todoData.completed) {
      res.status(400).json({ error: 'Cannot summarize completed todos' });
      return;
    }

    const summary = await summarizeTodos([todoData]);
    
    // Format the Slack message for single todo
    const formattedMessage = `*${todoData.title}*\n` +
                           `Summary: ${summary}\n` +
                           `Created by: ${todoData.userName}\n` +
                           `Created at: ${new Date(todoData.createdAt).toLocaleString()}\n` +
                           `---`;

    const sentToSlack = await sendToSlack(formattedMessage);

    res.json({
      success: true,
      summary,
      sentToSlack
    });
  } catch (error) {
    console.error('Error in POST /summarize/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to summarize and send to Slack',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 