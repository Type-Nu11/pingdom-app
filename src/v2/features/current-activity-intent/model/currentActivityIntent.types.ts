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
