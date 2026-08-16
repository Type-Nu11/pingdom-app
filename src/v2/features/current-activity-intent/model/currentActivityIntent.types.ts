import type { components, operations } from '../../../shared/api/generated/currentActivityIntent';

export type ActivityIntent = NonNullable<
  components['schemas']['CurrentActivityIntentResponse']['intent']
>;
export type CurrentActivityIntent =
  operations['getCurrentActivityIntent']['responses'][200]['content']['*/*'];
export type ReplaceCurrentActivityIntentBody =
  operations['replaceCurrentActivityIntent']['requestBody']['content']['application/json'];

export type CurrentActivityIntentErrorResponse =
  components['schemas']['ErrorResponse'];

export const ACTIVITY_INTENT_VALUES = [
  'EXPLORE',
  'EAT',
  'CAFE',
  'SHOP',
  'ATTEND_EVENT',
  'NIGHTLIFE',
] as const satisfies readonly ActivityIntent[];

type AssertNever<Value extends never> = Value;
type AllOpenApiActivityIntentsAreListed = AssertNever<
  Exclude<ActivityIntent, (typeof ACTIVITY_INTENT_VALUES)[number]>
>;

export type ActivityIntentContractAssertion = AllOpenApiActivityIntentsAreListed;
