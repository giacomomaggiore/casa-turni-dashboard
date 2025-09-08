import { useState, useEffect } from 'react';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// This function is needed to convert the base64 string to a Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = () => {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js');
          let sub = await registration.pushManager.getSubscription();

          if (!sub) {
            const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
            sub = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey
            });
          }

          setSubscription(sub);

          // Send the subscription to the backend
          await fetch('/api/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(sub),
          });

        } catch (err) {
          console.error('Service Worker registration failed:', err);
          setError(err as Error);
        }
      }
    };

    registerServiceWorker();
  }, []);

  return { subscription, error };
};
