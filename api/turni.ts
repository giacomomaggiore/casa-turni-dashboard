import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put, list, del } from '@vercel/blob';

const FILENAME = 'turni.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const assignments = req.body;
      if (!Array.isArray(assignments)) {
        return res.status(400).json({ message: 'Invalid data format. Expected an array.' });
      }

      // Find and delete the old blob to "overwrite" it.
      const { blobs } = await list({ prefix: FILENAME });
      if (blobs.length > 0) {
        await del(blobs[0].url);
      }

      const { url } = await put(FILENAME, JSON.stringify(assignments, null, 2), {
        access: 'public',
        contentType: 'application/json',
      });

      return res.status(200).json({ message: 'Assignments saved successfully.', url });
    } catch (error) {
      console.error('Error saving assignments:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: FILENAME });

      if (blobs.length === 0) {
        return res.status(200).json([]);
      }

      const turniBlob = blobs[0];
      const response = await fetch(turniBlob.url);

      if (!response.ok) {
        // If the fetch fails, it might be an old, deleted blob. Return empty.
        console.error(`Failed to fetch blob from ${turniBlob.url}`, { status: response.status });
        return res.status(200).json([]);
      }

      const data = await response.json();

      return res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
