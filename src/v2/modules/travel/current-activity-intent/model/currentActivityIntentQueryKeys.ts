import {
  recommendationQueryKeys,
  userQueryKeys,
} from '../../purposes/model/travelPurposeQueryKeys';

export { recommendationQueryKeys, userQueryKeys };

export const currentActivityIntentQueryKeys = {
  all: [...userQueryKeys.me(), 'current-activity-intent'] as const,
  mine: () => currentActivityIntentQueryKeys.all,
};
