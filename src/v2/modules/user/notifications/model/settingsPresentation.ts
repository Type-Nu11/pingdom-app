import { ApiError } from '../../../../shared/api/ApiError';
import type { NotificationSetting } from './notificationApi.types';

export function notificationSettingsErrorKey(error: unknown, fallback = 'notificationSettings.contract.saveFailed'): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'notificationSettings.contract.unauthorized';
    if (error.status === 403) return 'notificationSettings.contract.forbidden';
    if (error.status === 400 && error.code === 'INVALID_QUIET_HOURS') return 'notificationSettings.contract.invalidQuietHours';
  }
  return fallback;
}

// Runtime validation is a presentation boundary, not a handwritten nullable DTO.
export function quietHoursPresentation(setting: NotificationSetting | undefined, locale: string): string | undefined {
  const timePattern = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.\d{1,9})?$/;
  const start = typeof setting?.quietHoursStart === 'string' ? timePattern.exec(setting.quietHoursStart) : null;
  const end = typeof setting?.quietHoursEnd === 'string' ? timePattern.exec(setting.quietHoursEnd) : null;
  if (!start || !end || typeof setting?.timezone !== 'string' || !setting.timezone.trim()) return undefined;
  try {
    new Intl.DateTimeFormat(locale, { timeZone: setting.timezone });
    const formatter = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', hour: 'numeric', minute: '2-digit', second: '2-digit' });
    const format = (parts: RegExpExecArray) => formatter.format(new Date(Date.UTC(2000, 0, 1, Number(parts[1]), Number(parts[2]), Number(parts[3]))));
    return `${format(start)} – ${format(end)} (${setting.timezone})`;
  } catch { return undefined; }
}
