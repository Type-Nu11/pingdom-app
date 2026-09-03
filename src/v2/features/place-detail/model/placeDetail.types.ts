import type { PlaceExplorationOperationResponse } from '../../../shared/api';

export type PlaceDetail = PlaceExplorationOperationResponse<'getPlace', 200>;
export type PlaceMenu = PlaceExplorationOperationResponse<'list_5', 200>[number];
export type PlaceMenus = PlaceExplorationOperationResponse<'list_5', 200>;
export type PlaceAvailability = PlaceExplorationOperationResponse<'list_6', 200>[number];
export type PlaceAvailabilities = PlaceExplorationOperationResponse<'list_6', 200>;
