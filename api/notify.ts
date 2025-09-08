import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('VAPID keys are not configured.');
} else {
  webpush.setVapidDetails(
    'mailto:your-email@example.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

const SUBSCRIPTIONS_KEY = 'subscriptions';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { title, body } = req.body;

      if (!title || !body) {
        return res.status(400).json({ message: 'Missing title or body.' });
      }

      const subscriptions = (await kv.get<webpush.PushSubscription[]>(SUBSCRIPTIONS_KEY)) || [];

      const notificationPayload = JSON.stringify({ title, body });

      const promises = subscriptions.map(sub =>
        webpush.sendNotification(sub, notificationPayload).catch(err => {
          if (err.statusCode === 410) {
            // Subscription is no longer valid, remove it
            return kv.set(
              SUBSCRIPTIONS_KEY,
              subscriptions.filter(s => s.endpoint !== sub.endpoint)
            );
          } else {
            console.error('Error sending notification:', err);
          }
        })
      );

      await Promise.all(promises);

      return res.status(200).json({ message: 'Notifications sent.' });
    } catch (error) {
      console.error('Error sending notifications:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
