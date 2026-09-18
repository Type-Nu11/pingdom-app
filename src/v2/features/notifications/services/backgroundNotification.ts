// #362 compatibility only; remove with the consumers below after #124/#139 parity.
// production: index.ts
// Implementation: src/v2/modules/user/notifications/services/backgroundNotification.ts
// Direct named re-exports preserve the original function/component/object/type identity.
export { registerBackgroundNotificationHandler } from '../../../modules/user/notifications/background';
