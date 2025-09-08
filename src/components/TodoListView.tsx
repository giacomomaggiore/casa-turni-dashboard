import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import type { TodoItem } from '../../api/todolist';

export function TodoListView() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPerson, setNewItemPerson] = useState('');

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todolist');
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Failed to fetch todos', error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPerson) {
      alert('Please provide a name and select a person.');
      return;
    }

    try {
      const response = await fetch('/api/todolist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItemName, person: newItemPerson }),
      });

      if (response.ok) {
        setNewItemName('');
        setNewItemPerson('');
        fetchTodos(); // Refetch to get the latest list
      } else {
        alert('Failed to add item.');
      }
    } catch (error) {
      console.error('Failed to add todo', error);
      alert('An error occurred while adding the item.');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch('/api/todolist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        fetchTodos(); // Refetch to update the list
      } else {
        alert('Failed to delete item.');
      }
    } catch (error) {
      console.error('Failed to delete todo', error);
      alert('An error occurred while deleting the item.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista della Spesa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {todos.map((todo) => (
              <div key={todo.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`todo-${todo.id}`}
                    onCheckedChange={() => handleDeleteItem(todo.id)}
                  />
                  <Label htmlFor={`todo-${todo.id}`} className="text-sm">
                    {todo.name} - <span className="text-muted-foreground">{todo.person}</span>
                  </Label>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddItem} className="flex items-end gap-2">
            <div className="grid gap-1.5 flex-grow">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Es. Latte"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="person">Persona</Label>
              <Select value={newItemPerson} onValueChange={setNewItemPerson}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleziona persona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Giacomo">Giacomo</SelectItem>
                  <SelectItem value="Marco">Marco</SelectItem>
                  <SelectItem value="Francesca">Francesca</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Aggiungi</Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
