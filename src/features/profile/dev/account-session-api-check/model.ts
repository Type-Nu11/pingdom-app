export const TEMPORARY_ACCOUNT_SESSION_ENDPOINTS = [
  'POST /auth/password-reset/request',
  'POST /auth/password-reset/confirm',
  'POST /auth/logout',
  'POST /auth/email/resend',
  'POST /users/me/oauth-accounts/google/link',
  'DELETE /users/me/oauth-accounts/google',
  'GET /users/me/export',
  'GET /users/me/travel-schedules',
  'POST /users/me/travel-schedules',
  'PATCH /users/me/travel-schedules/{scheduleId}',
  'POST /users/me/travel-schedules/{scheduleId}/cancel',
  'POST /firebase/fcm-tokens',
  'DELETE /firebase/fcm-tokens',
  'GET /notifications/settings',
  'PATCH /notifications/settings',
] as const;

export type TemporaryAccountSessionEndpoint =
  (typeof TEMPORARY_ACCOUNT_SESSION_ENDPOINTS)[number];
