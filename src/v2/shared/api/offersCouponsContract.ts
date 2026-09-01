import type {
  components,
  operations,
  paths,
} from './generated/offersCoupons';

export type {
  components as OffersCouponsComponents,
  operations as OffersCouponsOperations,
  paths as OffersCouponsPaths,
} from './generated/offersCoupons';

export type OffersCouponsSchemaName = keyof components['schemas'];
export type OffersCouponsSchema<Name extends OffersCouponsSchemaName> =
  components['schemas'][Name];
export type OffersCouponsOperationName = keyof operations;

export type OffersCouponsOperationQuery<
  Name extends OffersCouponsOperationName,
> = operations[Name]['parameters'] extends { query?: infer Query }
  ? NonNullable<Query>
  : never;

export type OffersCouponsOperationPath<
  Name extends OffersCouponsOperationName,
> = operations[Name]['parameters'] extends { path: infer Path }
  ? Path
  : never;

export type OffersCouponsOperationRequestBody<
  Name extends OffersCouponsOperationName,
> = operations[Name] extends {
  requestBody: { content: { 'application/json': infer Body } };
}
  ? Body
  : never;

export type OffersCouponsOperationResponse<
  Name extends OffersCouponsOperationName,
  Status extends keyof operations[Name]['responses'],
> = operations[Name]['responses'][Status] extends { content: infer Content }
  ? Content[keyof Content]
  : void;
