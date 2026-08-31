import {
  ACTIVITY_INTENT_VALUES,
  type ActivityIntent,
} from '../../current-activity-intent';
import {
  TRAVEL_PURPOSE_MAX_SELECTIONS,
  TRAVEL_PURPOSE_VALUES,
  isTravelPurpose,
  type TravelPurpose,
} from '../../travel-purposes';
import type { CreateTravelScheduleBody } from '../../travel-schedules';

export type CurrentNeed = ActivityIntent;
export type TravelPurposeSelection = readonly TravelPurpose[];

export type TravelDateInput = Readonly<{
  endDateText: string;
  startDateText: string;
}>;

declare const serverTravelDateBrand: unique symbol;

export type ServerTravelDate = CreateTravelScheduleBody['startDate'] & {
  readonly [serverTravelDateBrand]: 'ServerTravelDate';
};

export type TravelDateRange = Readonly<{
  endDate: ServerTravelDate;
  startDate: ServerTravelDate;
}>;

export type OnboardingPreferenceIconId =
  | 'art_svg'
  | 'beati_svg'
  | 'cafe_svg'
  | 'etc_svg'
  | 'fashion_svg'
  | 'food_svg'
  | 'hotplace'
  | 'maping_svg'
  | 'music_svg'
  | 'popup_svg';

type PreferenceOption<Value extends string> = Readonly<{
  iconId: OnboardingPreferenceIconId;
  labelKey: `onboarding.preferences.${'currentNeeds' | 'travelPurposes'}.${string}`;
  order: number;
  value: Value;
}>;

export const TRAVEL_PURPOSE_OPTIONS = [
  { iconId: 'music_svg', labelKey: 'onboarding.preferences.travelPurposes.kPop', order: 0, value: 'K_POP' },
  { iconId: 'beati_svg', labelKey: 'onboarding.preferences.travelPurposes.beauty', order: 1, value: 'BEAUTY' },
  { iconId: 'fashion_svg', labelKey: 'onboarding.preferences.travelPurposes.fashion', order: 2, value: 'FASHION' },
  { iconId: 'cafe_svg', labelKey: 'onboarding.preferences.travelPurposes.cafe', order: 3, value: 'CAFE' },
  { iconId: 'food_svg', labelKey: 'onboarding.preferences.travelPurposes.food', order: 4, value: 'FOOD' },
  { iconId: 'popup_svg', labelKey: 'onboarding.preferences.travelPurposes.popUp', order: 5, value: 'POP_UP' },
  { iconId: 'art_svg', labelKey: 'onboarding.preferences.travelPurposes.exhibition', order: 6, value: 'EXHIBITION' },
  { iconId: 'etc_svg', labelKey: 'onboarding.preferences.travelPurposes.other', order: 7, value: 'OTHER' },
] as const satisfies readonly PreferenceOption<TravelPurpose>[];

// NIGHTLIFE stays a valid server TravelPurpose but is intentionally not offered
// as an onboarding option.
const OMITTED_TRAVEL_PURPOSES = ['NIGHTLIFE'] as const;

export const CURRENT_NEED_OPTIONS = [
  { iconId: 'maping_svg', labelKey: 'onboarding.preferences.currentNeeds.explore', order: 0, value: 'EXPLORE' },
  { iconId: 'food_svg', labelKey: 'onboarding.preferences.currentNeeds.eat', order: 1, value: 'EAT' },
  { iconId: 'cafe_svg', labelKey: 'onboarding.preferences.currentNeeds.cafe', order: 2, value: 'CAFE' },
  { iconId: 'fashion_svg', labelKey: 'onboarding.preferences.currentNeeds.shop', order: 3, value: 'SHOP' },
  { iconId: 'art_svg', labelKey: 'onboarding.preferences.currentNeeds.attendEvent', order: 4, value: 'ATTEND_EVENT' },
  { iconId: 'hotplace', labelKey: 'onboarding.preferences.currentNeeds.nightlife', order: 5, value: 'NIGHTLIFE' },
] as const satisfies readonly PreferenceOption<CurrentNeed>[];

type AssertNever<Value extends never> = Value;
type AllTravelPurposesHaveOptions = AssertNever<
  Exclude<
    TravelPurpose,
    | (typeof TRAVEL_PURPOSE_OPTIONS)[number]['value']
    | (typeof OMITTED_TRAVEL_PURPOSES)[number]
  >
>;
type AllCurrentNeedsHaveOptions = AssertNever<
  Exclude<CurrentNeed, (typeof CURRENT_NEED_OPTIONS)[number]['value']>
>;

export type OnboardingPreferenceContractAssertion =
  | AllCurrentNeedsHaveOptions
  | AllTravelPurposesHaveOptions;

const currentNeedValues = new Set<string>(ACTIVITY_INTENT_VALUES);

export function isCurrentNeed(value: unknown): value is CurrentNeed {
  return typeof value === 'string' && currentNeedValues.has(value);
}

export function isTravelPurposeSelection(
  value: unknown,
): value is TravelPurposeSelection {
  return Array.isArray(value)
    && value.length <= TRAVEL_PURPOSE_MAX_SELECTIONS
    && value.every(isTravelPurpose)
    && new Set(value).size === value.length;
}

const SERVER_TRAVEL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[month - 1] ?? 0;
}

export function isServerTravelDate(value: unknown): value is ServerTravelDate {
  if (typeof value !== 'string') {
    return false;
  }

  const match = SERVER_TRAVEL_DATE_PATTERN.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
}

export function parseTravelDateRange(input: TravelDateInput): TravelDateRange | null {
  const { endDateText, startDateText } = input;

  if (
    !isServerTravelDate(startDateText)
    || !isServerTravelDate(endDateText)
    || endDateText < startDateText
  ) {
    return null;
  }

  return {
    endDate: endDateText,
    startDate: startDateText,
  };
}

export function toCreateTravelScheduleBody(
  range: TravelDateRange,
): CreateTravelScheduleBody {
  return {
    endDate: range.endDate,
    startDate: range.startDate,
  };
}

export { TRAVEL_PURPOSE_MAX_SELECTIONS, TRAVEL_PURPOSE_VALUES };
export type { CreateTravelScheduleBody, TravelPurpose };
