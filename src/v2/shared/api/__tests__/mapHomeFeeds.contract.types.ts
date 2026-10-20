import type {
  MapHomeFeedsOperationQuery,
  MapHomeFeedsOperationResponse,
  MapHomeFeedsSchema,
} from '../mapHomeFeedsContract';

type Equal<Left, Right> =
  (<Type>() => Type extends Left ? 1 : 2) extends
  (<Type>() => Type extends Right ? 1 : 2)
    ? true
    : false;
type Expect<Value extends true> = Value;

type _localQueryKeys = Expect<Equal<
  keyof MapHomeFeedsOperationQuery<'findLocalHotPlaces'>,
  'latitude' | 'limit' | 'longitude' | 'page' | 'regionCode'
>>;
type _trendPeriod = Expect<Equal<
  MapHomeFeedsOperationQuery<'findTrends'>['period'],
  string | undefined
>>;
type _itemRemainsOptional = Expect<Equal<
  MapHomeFeedsSchema<'Item'>['placeId'],
  number | undefined
>>;
type _localResponse = Expect<Equal<
  MapHomeFeedsOperationResponse<'findLocalHotPlaces', 200>,
  MapHomeFeedsSchema<'PlaceLocalHotResponse'>
>>;

export {};
