import type { NavigatorScreenParams } from '@react-navigation/native';
import {
  MAIN_ROUTES,
  parseNotificationId,
  parsePlaceId,
  parsePostId,
  ROOT_ROUTES,
  type MainStackParamList,
  type NotificationNavigationContext,
} from './types';

type MapParams = Exclude<MainStackParamList['Map'], undefined>;
type ProfileParams = Exclude<MainStackParamList['Profile'], undefined>;

export type MainNavigationIntent =
  | { params?: MapParams; screen: typeof MAIN_ROUTES.Map }
  | { params: MainStackParamList['CheckIn']; screen: typeof MAIN_ROUTES.CheckIn }
  | { screen: typeof MAIN_ROUTES.CouponWallet }
  | { params?: ProfileParams; screen: typeof MAIN_ROUTES.Profile }
  | { screen: typeof MAIN_ROUTES.Settings }
  | { params: MainStackParamList['Merchant']; screen: typeof MAIN_ROUTES.Merchant };

export type NotificationNavigationRoute = Readonly<{
  body?: string;
  messageId?: string;
  notificationId?: string;
  notificationsId?: string;
  placeId?: string;
  postId?: string;
  screen?: string;
  title?: string;
}>;

function toOptionalText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

export function claimNotificationMessage(
  route: unknown,
  handledMessageIds: Set<string>,
): boolean {
  if (!route || typeof route !== 'object') {
    return true;
  }

  const messageId = toOptionalText((route as Record<string, unknown>).messageId);

  if (!messageId) {
    return true;
  }

  if (handledMessageIds.has(messageId)) {
    return false;
  }

  handledMessageIds.add(messageId);
  return true;
}

function createNotificationContext(
  route: NotificationNavigationRoute,
): NotificationNavigationContext | undefined {
  const rawRoute = route as unknown as Record<string, unknown>;
  const notificationId = parseNotificationId(
    rawRoute.notificationId ?? rawRoute.notificationsId,
  );
  const postId = parsePostId(rawRoute.postId);
  const body = toOptionalText(rawRoute.body);
  const title = toOptionalText(rawRoute.title);

  if (!notificationId && !postId && !title && !body) {
    return undefined;
  }

  return {
    body,
    notificationId: notificationId ?? undefined,
    postId: postId ?? undefined,
    title,
  };
}

export function createNotificationNavigationIntent(
  route: NotificationNavigationRoute,
): MainNavigationIntent {
  const rawRoute = route as unknown as Record<string, unknown>;
  const notificationContext = createNotificationContext(route);
  const placeId = parsePlaceId(rawRoute.placeId);

  if (rawRoute.screen === 'place-detail' && placeId) {
    return {
      params: {
        focusedPlaceId: placeId,
        notificationContext,
      },
      screen: MAIN_ROUTES.Map,
    };
  }

  return {
    params: notificationContext ? { notificationContext } : undefined,
    screen: MAIN_ROUTES.Map,
  };
}

export function createFocusedPlaceMapParams(value: unknown): MapParams | null {
  const focusedPlaceId = parsePlaceId(value);
  return focusedPlaceId ? { focusedPlaceId } : null;
}

export function getRootRouteName(isLoggedIn: boolean): keyof typeof ROOT_ROUTES {
  return isLoggedIn ? ROOT_ROUTES.Main : ROOT_ROUTES.Auth;
}

export function toMainNavigatorParams(
  intent: MainNavigationIntent,
): NavigatorScreenParams<MainStackParamList> {
  switch (intent.screen) {
    case MAIN_ROUTES.Map:
      return { params: intent.params, screen: MAIN_ROUTES.Map };
    case MAIN_ROUTES.Profile:
      return { params: intent.params, screen: MAIN_ROUTES.Profile };
    case MAIN_ROUTES.CheckIn:
      return { params: intent.params, screen: MAIN_ROUTES.CheckIn };
    case MAIN_ROUTES.Merchant:
      return { params: intent.params, screen: MAIN_ROUTES.Merchant };
    case MAIN_ROUTES.CouponWallet:
      return { params: undefined, screen: MAIN_ROUTES.CouponWallet };
    case MAIN_ROUTES.Settings:
      return { params: undefined, screen: MAIN_ROUTES.Settings };
  }
}
