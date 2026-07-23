import type { ApiSchema, OperationQuery } from '../../../shared/api';

export type PlaceListItem = ApiSchema<'PlaceSummary'>;
export type PlaceListPage = ApiSchema<'PlacePage'>;
export type GetPlaceListParams = OperationQuery<'listPlaces'>;
