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
type ReservationCreateRequestMatchesLiveContract = Assert<
  Equal<
    OperationRequestBody<'createReservation'>,
    { availabilityId: number; idempotencyKey: string; quantity?: number }
  >
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
type TravelScheduleCreateRequestMatchesSchema = Assert<
  Equal<
    ApiSchema<'TravelScheduleCreateRequest'>,
    OperationRequestBody<'createTravelSchedule'>
  >
>;
type TravelScheduleUpdateRequestMatchesSchema = Assert<
  Equal<
    ApiSchema<'TravelScheduleUpdateRequest'>,
    OperationRequestBody<'updateTravelSchedule'>
  >
>;
type TravelScheduleListMatchesOperation = Assert<
  Equal<
    ApiSchema<'TravelScheduleListResponse'>,
    OperationResponse<'getTravelSchedules', 200>
  >
>;
type TravelScheduleMutationResponsesMatch = Assert<
  Equal<
    OperationResponse<'createTravelSchedule', 201>,
    OperationResponse<'updateTravelSchedule', 200>
  >
>;

export type ContractTypeAssertions =
  | PlacePageMatchesOperation
  | PlaceDetailMatchesOperation
  | CheckInRequestMatchesSchema
  | CouponMatchesIssueOperation
  | ReservationMatchesCreateOperation
  | ReservationCreateRequestMatchesLiveContract
  | ConversionResultMatchesOperation
  | TravelPurposeRequestMatchesSchema
  | TravelPurposeResponseMatchesOperation
  | TravelScheduleCreateRequestMatchesSchema
  | TravelScheduleUpdateRequestMatchesSchema
  | TravelScheduleListMatchesOperation
  | TravelScheduleMutationResponsesMatch;
