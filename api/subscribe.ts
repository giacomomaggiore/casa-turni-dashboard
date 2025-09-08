import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUBSCRIPTIONS_KEY = 'subscriptions';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const subscription = req.body;

      if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ message: 'Invalid subscription object.' });
      }

      const subscriptions = (await kv.get<PushSubscription[]>(SUBSCRIPTIONS_KEY)) || [];

      // Check if the subscription already exists
      const existingSubscription = subscriptions.find(s => s.endpoint === subscription.endpoint);
      if (existingSubscription) {
        return res.status(200).json({ message: 'Subscription already exists.' });
      }

      subscriptions.push(subscription);
      await kv.set(SUBSCRIPTIONS_KEY, subscriptions);

      return res.status(201).json({ message: 'Subscription saved successfully.' });
    } catch (error) {
      console.error('Error saving subscription:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
