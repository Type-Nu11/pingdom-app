import {
  ACTIVITY_INTENT_VALUES,
  type ActivityIntent,
} from '../../../travel/current-activity-intent';
import {
  TRAVEL_PURPOSE_MAX_SELECTIONS,
  TRAVEL_PURPOSE_VALUES,
  isTravelPurpose,
  type TravelPurpose,
} from '../../../travel/purposes';
import type { CreateTravelScheduleBody } from '../../../travel/schedules';

export type CurrentNeed = ActivityIntent;
export type TravelPurposeSelection = readonly TravelPurpose[];

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

export { TRAVEL_PURPOSE_MAX_SELECTIONS, TRAVEL_PURPOSE_VALUES };
export type { CreateTravelScheduleBody, TravelPurpose };

export { isServerTravelDate, parseTravelDateRange, toCreateTravelScheduleBody } from '../../../travel/calendar';
export type { TravelDateInput, ServerTravelDate, TravelDateRange } from '../../../travel/calendar';
