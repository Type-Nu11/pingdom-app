import type { components, operations } from '../generated/currentActivityIntent';
import type {
  CurrentActivityIntent,
  ReplaceCurrentActivityIntentBody,
} from '../../../features/current-activity-intent/model/currentActivityIntent.types';

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false;
type Assert<Condition extends true> = Condition;

type RequestMatchesLiveSchema = Assert<
  Equal<
    ReplaceCurrentActivityIntentBody,
    components['schemas']['CurrentActivityIntentUpdateRequest']
  >
>;
type GetResponseMatchesLiveSchema = Assert<
  Equal<
    CurrentActivityIntent,
    components['schemas']['CurrentActivityIntentResponse']
  >
>;
type PutResponseMatchesGetResponse = Assert<
  Equal<
    operations['replaceCurrentActivityIntent']['responses'][200]['content']['*/*'],
    CurrentActivityIntent
  >
>;
type DeleteSuccessHasNoBody = Assert<
  Equal<
    operations['clearCurrentActivityIntent']['responses'][204]['content'],
    undefined
  >
>;

export type CurrentActivityIntentContractAssertions =
  | RequestMatchesLiveSchema
  | GetResponseMatchesLiveSchema
  | PutResponseMatchesGetResponse
  | DeleteSuccessHasNoBody;
