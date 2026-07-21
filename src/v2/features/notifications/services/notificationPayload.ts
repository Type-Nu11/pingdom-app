import type { NotificationRoute } from '../model/notification.types';
import type { FirebaseRemoteMessage } from './firebaseMessaging';

function toText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

export function parseNotificationRoute(
  message: FirebaseRemoteMessage,
  source: NotificationRoute['source'],
): NotificationRoute {
  const placeId = toText(message.data?.placeId) ?? toText(message.data?.targetId);
  const requestedScreen = toText(message.data?.screen);
  const isKnownDetailScreen = requestedScreen === 'place-detail'
    || requestedScreen === 'PlaceDetail'
    || requestedScreen === 'PLACE_DETAIL';

  return {
    body: toText(message.notification?.body) ?? toText(message.data?.body),
    messageId: toText(message.messageId) ?? toText(message.data?.messageId),
    notificationId: toText(message.data?.notificationsId)
      ?? toText(message.data?.notificationId)
      ?? toText(message.data?.id),
    placeId,
    postId: toText(message.data?.postId) ?? toText(message.data?.mapImageId),
    screen: placeId || isKnownDetailScreen ? 'place-detail' : 'fallback',
    source,
    title: toText(message.notification?.title) ?? toText(message.data?.title),
  };
}
