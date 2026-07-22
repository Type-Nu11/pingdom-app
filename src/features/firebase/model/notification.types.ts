export type NotificationRouteName = 'map' | 'place-detail';

export type NotificationRouteSource =
  | 'background-message'
  | 'background-open'
  | 'local-open'
  | 'quit-open';

export type NotificationRoute = {
  screen: NotificationRouteName;
  placeId?: string;
  postId?: string;
  notificationsId?: string;
  title?: string;
  body?: string;
  messageId?: string;
  source: NotificationRouteSource;
};
