import type { PlaceExplorationOperationResponse } from '../../../shared/api';

export type PlaceDetail = PlaceExplorationOperationResponse<'getPlace', 200>;
export type PlaceAvailability = PlaceExplorationOperationResponse<'list_6', 200>[number];
export type PlaceAvailabilities = PlaceExplorationOperationResponse<'list_6', 200>;
