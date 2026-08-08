import { getToken } from 'firebase/messaging';
import { messaging } from '../firebase';

export async function requestNotificationPermission() {
  if (!messaging) {
    console.warn('Messaging not supported or initialized.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      return token;
    } else {
      console.warn('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
}
