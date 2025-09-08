import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const KEY = 'turni';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const assignments = req.body;
      if (!Array.isArray(assignments)) {
        return res.status(400).json({ message: 'Invalid data format. Expected an array.' });
      }

      await kv.set(KEY, assignments);

      return res.status(200).json({ message: 'Assignments saved successfully.' });
    } catch (error) {
      console.error('Error saving assignments to KV store:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  if (req.method === 'GET') {
    try {
      const assignments = await kv.get(KEY);

      // If the key doesn't exist, kv.get returns null.
      // We'll return an empty array in that case, which the frontend expects.
      return res.status(200).json(assignments || []);
    } catch (error) {
      console.error('Error fetching assignments from KV store:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
