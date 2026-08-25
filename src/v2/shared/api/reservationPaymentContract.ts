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

export type ReservationPaymentOperationResponse<
  Name extends ReservationPaymentOperationName,
  Status extends keyof operations[Name]['responses'],
> = operations[Name]['responses'][Status] extends { content: infer Content }
  ? Content[keyof Content]
  : void;
