import type {
  ApiSchema,
  OperationRequestBody,
  OperationResponse,
} from '../../../shared/api';

export type TravelPurpose = ApiSchema<'TravelPurpose'>;
export type ReplaceTravelPurposesBody = OperationRequestBody<'replaceTravelPurposes'>;
export type TravelPurposePreference = OperationResponse<'getTravelPurposes', 200>;

export const TRAVEL_PURPOSE_MAX_SELECTIONS = 9;

export const TRAVEL_PURPOSE_VALUES = [
  'K_POP',
  'BEAUTY',
  'FASHION',
  'CAFE',
  'FOOD',
  'POP_UP',
  'EXHIBITION',
  'NIGHTLIFE',
  'OTHER',
] as const satisfies readonly TravelPurpose[];

type AssertNever<Value extends never> = Value;
type AllOpenApiTravelPurposesAreListed = AssertNever<
  Exclude<TravelPurpose, (typeof TRAVEL_PURPOSE_VALUES)[number]>
>;

export type TravelPurposeContractAssertion = AllOpenApiTravelPurposesAreListed;

const travelPurposeValues = new Set<string>(TRAVEL_PURPOSE_VALUES);

export function isTravelPurpose(value: unknown): value is TravelPurpose {
  return typeof value === 'string' && travelPurposeValues.has(value);
}

export function validateReplaceTravelPurposesBody(
  body: ReplaceTravelPurposesBody,
): ReplaceTravelPurposesBody {
  if (!Array.isArray(body.travelPurposes)) {
    throw new TypeError('[travel-purposes] travelPurposes must be an array.');
  }

  if (body.travelPurposes.length > TRAVEL_PURPOSE_MAX_SELECTIONS) {
    throw new RangeError(
      `[travel-purposes] at most ${TRAVEL_PURPOSE_MAX_SELECTIONS} values may be selected.`,
    );
  }

  if (!body.travelPurposes.every(isTravelPurpose)) {
    throw new TypeError('[travel-purposes] travelPurposes contains an unsupported value.');
  }

  if (new Set(body.travelPurposes).size !== body.travelPurposes.length) {
    throw new TypeError('[travel-purposes] travelPurposes must not contain duplicates.');
  }

  return body;
}
