import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export interface TodoItem {
  id: string;
  name: string;
  person: string;
  completed: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const keys = await kv.keys('todo:*');
      if (keys.length === 0) {
        return res.status(200).json([]);
      }
      const todosStrings = await kv.mget(...keys);
      const todos = todosStrings.map(t => t); // kv.mget returns objects, no need to parse
      return res.status(200).json(todos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch todos' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, person } = req.body;
      if (!name || !person) {
        return res.status(400).json({ error: 'Name and person are required' });
      }

      const id = uuidv4();
      const newTodo: TodoItem = { id, name, person, completed: false };

      await kv.set(`todo:${id}`, newTodo);

      return res.status(201).json(newTodo);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create todo' });
    }
  }

    if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }

      await kv.del(`todo:${id}`);

      return res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to delete todo' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
