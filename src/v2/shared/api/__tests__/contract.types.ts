import type {
  ApiSchema,
  OperationRequestBody,
  OperationResponse,
} from '../contract';

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false;
type Assert<Condition extends true> = Condition;

type PlacePageMatchesOperation = Assert<
  Equal<ApiSchema<'PlacePage'>, OperationResponse<'listPlaces', 200>>
>;
type PlaceDetailMatchesOperation = Assert<
  Equal<ApiSchema<'PlaceDetail'>, OperationResponse<'getPlaceDetail', 200>>
>;
type CheckInRequestMatchesSchema = Assert<
  Equal<ApiSchema<'CreateLocationCheckInRequest'>, OperationRequestBody<'createLocationCheckIn'>>
>;
type CouponMatchesIssueOperation = Assert<
  Equal<ApiSchema<'Coupon'>, OperationResponse<'issueCoupon', 201>>
>;
type ReservationMatchesCreateOperation = Assert<
  Equal<ApiSchema<'Reservation'>, OperationResponse<'createReservation', 201>>
>;
type ConversionResultMatchesOperation = Assert<
  Equal<
    ApiSchema<'ConversionEventBatchResult'>,
    OperationResponse<'ingestConversionEventBatch', 202>
  >
>;
type TravelPurposeRequestMatchesSchema = Assert<
  Equal<
    ApiSchema<'TravelPurposePreferenceUpdateRequest'>,
    OperationRequestBody<'replaceTravelPurposes'>
  >
>;
type TravelPurposeResponseMatchesOperation = Assert<
  Equal<
    ApiSchema<'TravelPurposePreferenceResponse'>,
    OperationResponse<'getTravelPurposes', 200>
  >
>;

export type ContractTypeAssertions =
  | PlacePageMatchesOperation
  | PlaceDetailMatchesOperation
  | CheckInRequestMatchesSchema
  | CouponMatchesIssueOperation
  | ReservationMatchesCreateOperation
  | ConversionResultMatchesOperation
  | TravelPurposeRequestMatchesSchema
  | TravelPurposeResponseMatchesOperation;
