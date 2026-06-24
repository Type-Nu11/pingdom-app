import type { FirebaseRemoteMessage } from './firebaseMessaging';
import type { NotificationRoute, NotificationRouteSource } from '../model/notification.types';

function toStringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function parseNotificationRoute(
  message: FirebaseRemoteMessage,
  source: NotificationRouteSource
): NotificationRoute {
  const placeId = toStringValue(message.data?.placeId) ?? toStringValue(message.data?.targetId);
  const requestedScreen = toStringValue(message.data?.screen);
  const screen = requestedScreen === 'place-detail' || placeId ? 'place-detail' : 'map';

  return {
    screen,
    placeId,
    title: toStringValue(message.notification?.title) ?? toStringValue(message.data?.title),
    body: toStringValue(message.notification?.body) ?? toStringValue(message.data?.body),
    messageId: toStringValue(message.messageId),
    source,
  };
}
