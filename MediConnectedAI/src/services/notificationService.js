/**
 * Local notification architecture for React Native CLI (not Expo).
 * Polls the shared backend /notifications endpoint.
 * Hook FCM / Notifee here later without changing screens.
 */
import {userApi} from '../api/userApi';

export async function fetchNotifications() {
  return userApi.notifications();
}

export async function markAllRead() {
  return userApi.markNotificationsRead();
}
