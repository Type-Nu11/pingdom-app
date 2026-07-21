import type { NotificationRoute } from '../../features/notifications/model/notification.types';
import { parsePlaceId, V2_ROUTES, type V2StackParamList } from './types';

export type NotificationNavigationIntent =
  | { screen: typeof V2_ROUTES.Home }
  | {
      params: V2StackParamList['PlaceDetail'];
      screen: typeof V2_ROUTES.PlaceDetail;
    };

export function createNotificationNavigationIntent(
  route: NotificationRoute,
): NotificationNavigationIntent {
  const placeId = parsePlaceId(route.placeId);

  if (route.screen === 'place-detail' && placeId) {
    return {
      params: { placeId },
      screen: V2_ROUTES.PlaceDetail,
    };
  }

  return { screen: V2_ROUTES.Home };
}

export function claimNotificationMessage(
  messageId: string | undefined,
  handledMessageIds: Set<string>,
): boolean {
  if (!messageId) {
    return true;
  }

  if (handledMessageIds.has(messageId)) {
    return false;
  }

  handledMessageIds.add(messageId);
  return true;
}
