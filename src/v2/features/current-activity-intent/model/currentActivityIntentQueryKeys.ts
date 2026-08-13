import {
  recommendationQueryKeys,
  userQueryKeys,
} from '../../travel-purposes/model/travelPurposeQueryKeys';

export { recommendationQueryKeys, userQueryKeys };

export const currentActivityIntentQueryKeys = {
  all: [...userQueryKeys.me(), 'current-activity-intent'] as const,
  mine: () => currentActivityIntentQueryKeys.all,
};
