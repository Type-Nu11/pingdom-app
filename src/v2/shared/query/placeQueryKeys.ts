export const placeQueryKeys = {
  all: ['v2', 'places'] as const,
  lists: () => [...placeQueryKeys.all, 'list'] as const,
  list: <TParams extends object>(params: TParams) =>
    [...placeQueryKeys.lists(), params] as const,
  autocompletes: () => [...placeQueryKeys.all, 'autocomplete'] as const,
  autocomplete: <TParams extends object>(params: TParams) =>
    [...placeQueryKeys.autocompletes(), params] as const,
  maps: () => [...placeQueryKeys.all, 'map'] as const,
  map: <TParams extends object>(params: TParams) =>
    [...placeQueryKeys.maps(), params] as const,
  entities: () => [...placeQueryKeys.all, 'entity'] as const,
  entity: (placeId: number) => [...placeQueryKeys.entities(), placeId] as const,
  detail: (placeId: number) => [...placeQueryKeys.entity(placeId), 'detail'] as const,
  card: (placeId: number) => [...placeQueryKeys.entity(placeId), 'card'] as const,
  visitDecision: (placeId: number) =>
    [...placeQueryKeys.entity(placeId), 'visit-decision'] as const,
  operatingNotices: (placeId: number) =>
    [...placeQueryKeys.entity(placeId), 'operating-notices'] as const,
  verificationMedia: (id: number) =>
    [...placeQueryKeys.entity(id), 'verification-media'] as const,
  explorationMedia: (id: number) =>
    [...placeQueryKeys.entity(id), 'exploration-media'] as const,
  reviews: (placeId: number) =>
    [...placeQueryKeys.entity(placeId), 'reviews'] as const,
  reviewList: <TParams extends object>(placeId: number, params: TParams) =>
    [...placeQueryKeys.reviews(placeId), params] as const,
  recommendations: () => [...placeQueryKeys.all, 'recommendations'] as const,
  recommendationExplanations: () =>
    [...placeQueryKeys.recommendations(), 'explanation'] as const,
  recommendationExplanation: (requestId: string) =>
    [...placeQueryKeys.recommendationExplanations(), requestId] as const,
};
