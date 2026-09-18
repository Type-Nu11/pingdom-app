// #362 compatibility only; remove with the consumers below after #124/#139 parity.
// production: src/features/place/hooks/useLocationCheckIn.ts
// Implementation: src/v2/modules/place/map/camera/model/map.types.ts
// Direct named re-exports preserve the original function/component/object/type identity.
export type { Coordinate } from '../../../modules/place/map/location';
