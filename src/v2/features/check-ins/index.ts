// #362 compatibility only; remove with the consumers below after #124/#139 parity.
// test-only: src/features/place/hooks/__tests__/useLocationCheckIn.test.tsx
// production: src/features/place/hooks/useLocationCheckIn.ts
// Implementation: src/v2/modules/place/check-ins/api/checkInApi.ts
// Implementation: src/v2/modules/place/check-ins/hooks/useCheckIns.ts
// Direct named re-exports preserve the original function/component/object/type identity.
export { checkInApi, createInfiniteCheckInListQueryOptions, useInfiniteCheckIns, useCreateCheckIn } from '../../modules/place/check-ins';
export type { CreateCheckInBody, LocationCheckIn, LocationCheckInListItem } from '../../modules/place/check-ins';
