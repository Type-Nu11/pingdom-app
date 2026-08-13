import type {
  PlaceExplorationOperationPath,
  PlaceExplorationOperationQuery,
  PlaceExplorationOperationRequestBody,
  PlaceExplorationOperationResponse,
} from '../placeExplorationContract';

type Equal<Left, Right> =
  (<Type>() => Type extends Left ? 1 : 2) extends
  (<Type>() => Type extends Right ? 1 : 2)
    ? true
    : false;
type Expect<Value extends true> = Value;

type ViewportKeys = keyof PlaceExplorationOperationQuery<'mapViewport'>;
type _viewportKeys = Expect<
  Equal<ViewportKeys, 'east' | 'north' | 'south' | 'west' | 'zoom'>
>;
type _cardPlaceId = Expect<
  Equal<PlaceExplorationOperationPath<'getTouristPlaceCard'>['placeId'], number>
>;
type _mediaId = Expect<
  Equal<PlaceExplorationOperationPath<'getVerificationMedia'>['id'], number>
>;
type _explanationRequestId = Expect<
  Equal<PlaceExplorationOperationPath<'getRecommendationExplanation'>['requestId'], string>
>;
type _conversionBody = Expect<
  Equal<
    keyof PlaceExplorationOperationRequestBody<'record'>,
    'linkType' | 'provider' | 'requestId'
  >
>;
type _mapResponse = Expect<
  Equal<
    PlaceExplorationOperationResponse<'mapViewport', 200>['markers'],
    import('../generated/placeExploration').components['schemas']['MapMarkerItem'][]
  >
>;

export {};
