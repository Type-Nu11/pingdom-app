// #362 compatibility only; remove with the consumers below after #124/#139 parity.
// test-only: src/features/place/hooks/__tests__/useLocationCheckIn.test.tsx
// production: src/features/place/hooks/useLocationCheckIn.ts
// Implementation: src/v2/modules/place/map/location/hooks/useCurrentLocation.ts
// Direct named re-exports preserve the original function/component/object/type identity.
export { useCurrentLocation } from '../../../modules/place/map/location';
