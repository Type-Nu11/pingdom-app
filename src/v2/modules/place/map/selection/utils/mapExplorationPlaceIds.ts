type PlaceIdentity = { id: number };

type SelectMapExplorationPlaceIdsOptions = {
  expanded: boolean;
  places: PlaceIdentity[];
  recommendationPlaces: PlaceIdentity[];
  recommendationsActive: boolean;
  selectedPlaceId?: number;
};

const MEDIUM_PLACE_LIMIT = 6;
const EXPANDED_PLACE_LIMIT = 20;

export function selectMapExplorationPlaceIds({
  expanded,
  places,
  recommendationPlaces,
  recommendationsActive,
  selectedPlaceId,
}: SelectMapExplorationPlaceIdsOptions) {
  const renderedPlaces = recommendationsActive ? recommendationPlaces : places;
  if (selectedPlaceId !== undefined) return [selectedPlaceId];

  const visiblePlaces = expanded
    ? renderedPlaces.slice(0, EXPANDED_PLACE_LIMIT)
    : [
      ...renderedPlaces.slice(0, MEDIUM_PLACE_LIMIT),
      ...renderedPlaces.slice(-MEDIUM_PLACE_LIMIT),
    ];

  return [...new Set(visiblePlaces.map((place) => place.id))];
}
