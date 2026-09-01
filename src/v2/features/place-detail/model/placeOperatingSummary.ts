import type { PlaceDetail } from './placeDetail.types';

const MINUTES_PER_DAY = 24 * 60;
const SEOUL_TIME_ZONE = 'Asia/Seoul';
const DAY_NAMES = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

type OperatingHour = PlaceDetail['regularHours'][number];
type PlaceOperatingSummarySource = Partial<Pick<
  PlaceDetail,
  'currentlyOperating' | 'operatingExceptions' | 'operatingStatus' | 'regularHours'
>>;

export type PlaceOperatingSummary = {
  kind:
    | 'open'
    | 'before-open'
    | 'closed'
    | 'closed-today'
    | 'temporarily-closed'
    | 'permanently-closed'
    | 'unknown';
  transitionDay: 'today' | 'tomorrow' | 'later' | null;
  transitionTime: string | null;
};

export type PlaceOperatingSummaryText = PlaceOperatingSummary & {
  detailText: string | null;
  fullText: string;
  statusText: string;
  tone: 'positive' | 'neutral' | 'warning';
};

type OperatingTranslationKey =
  | 'placeDetail.operating.beforeOpen'
  | 'placeDetail.operating.closed'
  | 'placeDetail.operating.closedToday'
  | 'placeDetail.operating.closesAt'
  | 'placeDetail.operating.open'
  | 'placeDetail.operating.opensAt'
  | 'placeDetail.operating.opensLaterAt'
  | 'placeDetail.operating.opensTomorrowAt'
  | 'placeDetail.operating.permanentlyClosed'
  | 'placeDetail.operating.temporarilyClosed'
  | 'placeDetail.operating.unknown';

type Translate = (key: OperatingTranslationKey, options?: { time?: string }) => string;

type ZonedDate = {
  dateKey: string;
  daySerial: number;
  minute: number;
};

type NormalizedInterval = {
  end: number;
  endTime: string;
  start: number;
  startTime: string;
};

const pad = (value: number): string => String(value).padStart(2, '0');

function parseTime(value: unknown): { label: string; minute: number } | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = match[3] === undefined ? 0 : Number(match[3]);
  if (hour > 23 || minute > 59 || second > 59) return null;
  return { label: `${pad(hour)}:${pad(minute)}`, minute: hour * 60 + minute };
}

function getZonedDate(now: Date, timeZone: string): ZonedDate | null {
  if (!Number.isFinite(now.getTime())) return null;
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      calendar: 'gregory',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
      minute: '2-digit',
      month: '2-digit',
      timeZone,
      year: 'numeric',
    }).formatToParts(now);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const year = Number(values.year);
    const month = Number(values.month);
    const day = Number(values.day);
    const hour = Number(values.hour);
    const minute = Number(values.minute);
    if (![year, month, day, hour, minute].every(Number.isFinite)) return null;
    return {
      dateKey: `${pad(year)}-${pad(month)}-${pad(day)}`,
      daySerial: Date.UTC(year, month - 1, day),
      minute: hour * 60 + minute,
    };
  } catch {
    return null;
  }
}

function getCalendarDate(daySerial: number, offset: number) {
  const date = new Date(daySerial + offset * 86_400_000);
  return {
    dateKey: `${pad(date.getUTCFullYear())}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`,
    dayOfWeek: DAY_NAMES[date.getUTCDay()],
  };
}

function normalizeHours(hours: readonly OperatingHour[], dayOffset: number): NormalizedInterval[] {
  return hours.flatMap((hour) => {
    const opensAt = parseTime(hour.opensAt);
    const closesAt = parseTime(hour.closesAt);
    if (!opensAt || !closesAt || opensAt.minute === closesAt.minute) return [];
    const start = dayOffset * MINUTES_PER_DAY + opensAt.minute;
    const overnight = closesAt.minute <= opensAt.minute;
    return [{
      end: dayOffset * MINUTES_PER_DAY + closesAt.minute + (overnight ? MINUTES_PER_DAY : 0),
      endTime: closesAt.label,
      start,
      startTime: opensAt.label,
    }];
  }).sort((left, right) => left.start - right.start || left.end - right.end);
}

function hoursForDate(
  detail: PlaceOperatingSummarySource,
  dateKey: string,
  dayOfWeek: string,
): readonly OperatingHour[] {
  const exception = (detail.operatingExceptions ?? []).find((item) => item.date === dateKey);
  if (exception?.closed) return [];
  if (exception && Array.isArray(exception.hours) && exception.hours.length > 0) {
    return exception.hours;
  }
  return (detail.regularHours ?? []).filter((hour) => hour.dayOfWeek === dayOfWeek);
}

function intervalsForOffset(
  detail: PlaceOperatingSummarySource,
  date: ZonedDate,
  offset: number,
): NormalizedInterval[] {
  const calendarDate = getCalendarDate(date.daySerial, offset);
  return normalizeHours(
    hoursForDate(detail, calendarDate.dateKey, calendarDate.dayOfWeek),
    offset,
  );
}

export function selectPlaceOperatingSummary(
  detail: PlaceOperatingSummarySource,
  now: Date = new Date(),
  timeZone = SEOUL_TIME_ZONE,
): PlaceOperatingSummary {
  const empty = (kind: PlaceOperatingSummary['kind']): PlaceOperatingSummary => ({
    kind,
    transitionDay: null,
    transitionTime: null,
  });

  if (detail.operatingStatus === 'PERMANENTLY_CLOSED') return empty('permanently-closed');
  if (detail.operatingStatus === 'TEMPORARILY_CLOSED') return empty('temporarily-closed');

  const date = getZonedDate(now, timeZone);
  if (!date) return empty('unknown');
  const todayException = (detail.operatingExceptions ?? [])
    .find((item) => item.date === date.dateKey);
  if (todayException?.closed) return empty('closed-today');

  if (typeof detail.currentlyOperating !== 'boolean') return empty('unknown');

  const currentMinute = date.minute;
  const nearbyIntervals = [
    ...intervalsForOffset(detail, date, -1),
    ...intervalsForOffset(detail, date, 0),
  ];

  if (detail.currentlyOperating) {
    const active = nearbyIntervals
      .filter((interval) => interval.start <= currentMinute && currentMinute < interval.end)
      .sort((left, right) => left.end - right.end)[0];
    return {
      kind: 'open',
      transitionDay: active ? (active.end < MINUTES_PER_DAY ? 'today' : 'tomorrow') : null,
      transitionTime: active?.endTime ?? null,
    };
  }

  const todayIntervals = intervalsForOffset(detail, date, 0);
  const next = [
    ...todayIntervals,
    ...Array.from({ length: 14 }, (_, index) => intervalsForOffset(detail, date, index + 1)).flat(),
  ].find((interval) => interval.start > currentMinute);
  const beforeFirstOpening = Boolean(
    next
    && next.start < MINUTES_PER_DAY
    && todayIntervals.every((interval) => interval.start >= currentMinute),
  );

  if (!next) return empty('closed');
  const dayOffset = Math.floor(next.start / MINUTES_PER_DAY);
  return {
    kind: beforeFirstOpening ? 'before-open' : 'closed',
    transitionDay: dayOffset === 0 ? 'today' : dayOffset === 1 ? 'tomorrow' : 'later',
    transitionTime: next.startTime,
  };
}

export function formatPlaceOperatingSummary(
  summary: PlaceOperatingSummary,
  translate: Translate,
): PlaceOperatingSummaryText {
  const statusKeys = {
    'before-open': 'placeDetail.operating.beforeOpen',
    closed: 'placeDetail.operating.closed',
    'closed-today': 'placeDetail.operating.closedToday',
    open: 'placeDetail.operating.open',
    'permanently-closed': 'placeDetail.operating.permanentlyClosed',
    'temporarily-closed': 'placeDetail.operating.temporarilyClosed',
    unknown: 'placeDetail.operating.unknown',
  } as const satisfies Record<PlaceOperatingSummary['kind'], OperatingTranslationKey>;
  const statusKey = statusKeys[summary.kind];
  const statusText = translate(statusKey);
  let detailText: string | null = null;
  if (summary.transitionTime) {
    if (summary.kind === 'open') {
      detailText = translate('placeDetail.operating.closesAt', { time: summary.transitionTime });
    } else if (summary.kind === 'before-open' || summary.kind === 'closed') {
      const key = summary.transitionDay === 'tomorrow'
        ? 'placeDetail.operating.opensTomorrowAt'
        : summary.transitionDay === 'later'
          ? 'placeDetail.operating.opensLaterAt'
          : 'placeDetail.operating.opensAt';
      detailText = translate(key, { time: summary.transitionTime });
    }
  }
  return {
    ...summary,
    detailText,
    fullText: detailText ? `${statusText} · ${detailText}` : statusText,
    statusText,
    tone: summary.kind === 'open'
      ? 'positive'
      : summary.kind === 'temporarily-closed' || summary.kind === 'closed-today'
        ? 'warning'
        : 'neutral',
  };
}
