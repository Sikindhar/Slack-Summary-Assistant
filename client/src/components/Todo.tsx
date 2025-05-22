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
    <div className="w-full max-w-4xl mx-auto">
      <Card className="mb-6 sm:mb-8">
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
            <Button type="submit" className="w-full sm:w-auto">Add Todo</Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <Button
          onClick={() => setShowAllTodos(!showAllTodos)}
          variant="outline"
          className="w-full sm:w-auto"
        >
          {showAllTodos ? 'Show Incomplete' : 'Show All'}
        </Button>
        <Button
          onClick={handleSummarizeAllTodos}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Summarizing...' : 'Summarize All'}
        </Button>
      </div>

      <div className="space-y-4">
        {todos
          .filter(todo => showAllTodos || !todo.completed)
          .map(todo => (
            <Card key={todo.id} className="w-full">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={(checked) => 
                      handleToggleTodo(todo.id, checked as boolean)}
                    className="mt-1 sm:mt-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-semibold ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                      {todo.title}
                    </h3>
                    <p className={`text-sm text-gray-600 ${todo.completed ? 'line-through' : ''}`}>
                      {todo.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {format(new Date(todo.createdAt), 'PPp')}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      onClick={() => handleSummarizeTodo(todo)}
                      disabled={summarizingTodoId === todo.id || todo.completed}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      {summarizingTodoId === todo.id ? 'Summarizing...' : 'Summarize'}
                    </Button>
                    <Button
                      onClick={() => handleEditTodo(todo)}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteTodo(todo.id)}
                      variant="destructive"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {editingTodoId && (
        <EditTodoDialog
          todo={editingTodo}
          onUpdate={handleUpdateTodo}
          onCancel={handleCancelEdit}
          onChange={(field, value) => 
            setEditingTodo(prev => ({ ...prev, [field]: value }))}
        />
      )}
    </div>
  );
} 