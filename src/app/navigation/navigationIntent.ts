// Legacy caller compatibility; canonical navigation policy belongs to application. Remove in #139.
export { claimNotificationMessage, createNotificationNavigationIntent, createFocusedPlaceMapParams, getRootRouteName, toMainNavigatorParams } from '../../application/navigation/navigationIntent';
export type { MainNavigationIntent, NotificationNavigationRoute } from '../../application/navigation/navigationIntent';
