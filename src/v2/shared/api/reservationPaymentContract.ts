import type { components, operations, paths } from './generated/reservationPayment';

export type {
  components as ReservationPaymentComponents,
  operations as ReservationPaymentOperations,
  paths as ReservationPaymentPaths,
} from './generated/reservationPayment';

export type ReservationPaymentSchemaName = keyof components['schemas'];
export type ReservationPaymentSchema<Name extends ReservationPaymentSchemaName> =
  components['schemas'][Name];

export type ReservationPaymentOperationName = keyof operations;

export type ReservationPaymentOperationQuery<
  Name extends ReservationPaymentOperationName,
> = operations[Name]['parameters'] extends { query?: infer Query }
  ? NonNullable<Query>
  : never;

export type ReservationPaymentOperationPath<
  Name extends ReservationPaymentOperationName,
> = operations[Name]['parameters'] extends { path: infer Path }
  ? Path
  : never;

export type ReservationPaymentOperationRequestBody<
  Name extends ReservationPaymentOperationName,
> = operations[Name] extends {
  requestBody: { content: { 'application/json': infer Body } };
}
  ? Body
  : never;

/**
 * The upstream `app` group serializes reservation and payment success bodies
 * under a wildcard media type rather than `application/json`, so this reads the
 * single media type by key instead of pinning `application/json` the way the
 * `mvp` contract helper does.
 */
export type ReservationPaymentOperationResponse<
  Name extends ReservationPaymentOperationName,
  Status extends keyof operations[Name]['responses'],
> = operations[Name]['responses'][Status] extends { content: infer Content }
  ? Content[keyof Content]
  : void;
