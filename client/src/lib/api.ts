import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }
  return user.getIdToken();
}

export async function fetchTodos() {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/todos`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch todos');
  }
  
  return response.json();
}

export async function createTodo(todo: { title: string; description: string }) {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(todo)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create todo');
  }
  
  return response.json();
}

export async function deleteTodo(id: string) {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete todo');
  }
  
  return response.json();
}

export async function summarizeTodo(todoId: string) {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/summarize/${todoId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to summarize todo');
  }
  
  return response.json();
}

export async function summarizeAllTodos() {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/summarize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to summarize todos');
  }
  
  return response.json();
}

export async function toggleTodo(id: string, completed: boolean) {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ completed })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update todo');
  }
  
  return response.json();
}

export async function updateTodo(id: string, todo: { title: string; description: string }) {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(todo)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update todo');
  }
  
  return response.json();
} 