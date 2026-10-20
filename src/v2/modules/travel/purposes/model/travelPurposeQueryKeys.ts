export const userQueryKeys = {
  all: ['v2', 'users'] as const,
  me: () => [...userQueryKeys.all, 'me'] as const,
};

export const recommendationQueryKeys = {
  all: ['v2', 'recommendations'] as const,
  list: (params: object) => [...recommendationQueryKeys.all, 'list', params] as const,
};

export const travelPurposeQueryKeys = {
  all: [...userQueryKeys.me(), 'travel-purposes'] as const,
  mine: () => travelPurposeQueryKeys.all,
};
