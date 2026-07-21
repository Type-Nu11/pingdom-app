export type NotificationRoute = {
  body?: string;
  messageId?: string;
  notificationId?: string;
  placeId?: string;
  postId?: string;
  screen: 'fallback' | 'place-detail';
  source: 'background-message' | 'background-open' | 'foreground-open' | 'quit-open';
  title?: string;
};
