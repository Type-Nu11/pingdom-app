import type { components } from '../../../generated/notifications';

export const notificationSettingFixture = {
  newHotplaceEnabled: true,
  newLikeEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00:00',
  quietHoursEnd: '08:00:00',
  timezone: 'Asia/Seoul',
} satisfies components['schemas']['NotificationSettingResponse'];

