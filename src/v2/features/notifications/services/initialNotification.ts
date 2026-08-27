import type { NotificationRoute } from '../model/notification.types';

type InitialNotificationCandidates = Readonly<{
  background: NotificationRoute | null;
  expo: NotificationRoute | null;
  firebase: NotificationRoute | null;
}>;

/** Select one cold-start intent when native providers report the same open. */
export function selectInitialNotificationRoute({
  background,
  expo,
  firebase,
}: InitialNotificationCandidates): NotificationRoute | null {
  return firebase ?? expo ?? background;
}
