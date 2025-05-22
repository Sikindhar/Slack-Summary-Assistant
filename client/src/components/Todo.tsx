import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format } from 'date-fns';
import { fetchTodos, createTodo, deleteTodo, summarizeTodo, summarizeAllTodos, toggleTodo, updateTodo } from '@/lib/api';
import { EditTodoDialog } from './EditTodoDialog';

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  userId: string;
  userName: string;
}

export function Todo() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState({ title: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [summarizingTodoId, setSummarizingTodoId] = useState<string | null>(null);
  const [showAllTodos, setShowAllTodos] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodo, setEditingTodo] = useState({ title: '', description: '' });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTodos();
    }
  }, [user]);

  const loadTodos = async () => {
    try {
      const data = await fetchTodos();
      setTodos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast.error("Failed to fetch todos");
      setTodos([]);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to add todos");
      return;
    }

    try {
      const data = await createTodo(newTodo);
      setTodos(prevTodos => [...prevTodos, data]);
      setNewTodo({ title: '', description: '' });
      toast.success("Todo added successfully");
    } catch (error) {
      console.error('Error adding todo:', error);
      toast.error("Failed to add todo");
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      toast.success("Todo deleted successfully");
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error("Failed to delete todo");
    }
  };

  const handleSummarizeTodo = async (todo: Todo) => {
    if (todo.completed) {
      toast.error("Cannot summarize completed todos");
      return;
    }

    setSummarizingTodoId(todo.id);
    try {
      const data = await summarizeTodo(todo.id);
      if (data.success) {
        toast.success("Summary sent to Slack successfully");
      } else {
        throw new Error(data.error || 'Failed to summarize todo');
      }
    } catch (error) {
      console.error('Error summarizing todo:', error);
      toast.error("Failed to summarize and send to Slack");
    } finally {
      setSummarizingTodoId(null);
    }
  };

  const handleSummarizeAllTodos = async () => {
    const incompleteTodos = todos.filter(todo => !todo.completed);
    if (incompleteTodos.length === 0) {
      toast.error("No incomplete todos to summarize");
      return;
    }

    setIsLoading(true);
    try {
      const data = await summarizeAllTodos();
      if (data.success) {
        toast.success("Summary sent to Slack successfully");
      } else {
        throw new Error(data.error || 'Failed to summarize todos');
      }
    } catch (error) {
      console.error('Error summarizing todos:', error);
      toast.error("Failed to summarize and send to Slack");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      await toggleTodo(id, completed);
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? { ...todo, completed } : todo
        )
      );
      toast.success(completed ? "Todo marked as completed" : "Todo marked as incomplete");
    } catch (error) {
      console.error('Error updating todo:', error);
      toast.error("Failed to update todo");
    }
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditingTodo({ title: todo.title, description: todo.description });
  };

  const handleUpdateTodo = async () => {
    if (!editingTodoId) return;
    
    try {
      const updatedTodo = await updateTodo(editingTodoId, editingTodo);
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === editingTodoId ? { ...todo, ...updatedTodo } : todo
        )
      );
      setEditingTodoId(null);
      toast.success("Todo updated successfully");
    } catch (error) {
      console.error('Error updating todo:', error);
      toast.error("Failed to update todo");
    }
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditingTodo({ title: '', description: '' });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Todo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addTodo} className="space-y-4">
            <Input
              placeholder="Title"
              value={newTodo.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setNewTodo({ ...newTodo, title: e.target.value })}
              required
            />
            <Input
              placeholder="Description"
              value={newTodo.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setNewTodo({ ...newTodo, description: e.target.value })}
              required
            />
            <Button type="submit">Add Todo</Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex justify-between mb-4">
        <Button
          onClick={() => setShowAllTodos(!showAllTodos)}
          variant="outline"
        >
          {showAllTodos ? "Hide All Todos" : "Show All Todos"}
        </Button>
        <Button
          onClick={handleSummarizeAllTodos}
          disabled={isLoading || todos.filter(t => !t.completed).length === 0}
          variant="secondary"
        >
          {isLoading ? "Sending..." : "Summarize All Incomplete Todos"}
        </Button>
      </div>

      {showAllTodos && (
        <div className="space-y-4">
          {todos.map((todo) => (
            <Card key={todo.id} className={todo.completed ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={(checked) => 
                        handleToggleTodo(todo.id, checked as boolean)}
                    />
                    <div>
                      <h3 className="font-semibold">{todo.title}</h3>
                      <p className="text-sm text-gray-500">{todo.description}</p>
                      <p className="text-xs text-gray-400">
                        Created by {todo.userName} on{' '}
                        {format(new Date(todo.createdAt), 'PPp')}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTodo(todo)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSummarizeTodo(todo)}
                      disabled={todo.completed || summarizingTodoId === todo.id}
                    >
                      {summarizingTodoId === todo.id ? "Sending..." : "Summarize"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTodo(todo.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EditTodoDialog
        isOpen={editingTodoId !== null}
        onClose={handleCancelEdit}
        onSave={handleUpdateTodo}
        title={editingTodo.title}
        description={editingTodo.description}
        onTitleChange={(value) => setEditingTodo({ ...editingTodo, title: value })}
        onDescriptionChange={(value) => setEditingTodo({ ...editingTodo, description: value })}
      />
    </div>
  );
} 