import type {
  components,
  operations,
  paths,
} from './generated/placeReviews';

export type {
  components as PlaceReviewsComponents,
  operations as PlaceReviewsOperations,
  paths as PlaceReviewsPaths,
} from './generated/placeReviews';

export type PlaceReviewsSchemaName = keyof components['schemas'];
export type PlaceReviewsSchema<Name extends PlaceReviewsSchemaName> =
  components['schemas'][Name];
export type PlaceReviewsOperationName = keyof operations;

export type PlaceReviewsOperationQuery<
  Name extends PlaceReviewsOperationName,
> = operations[Name]['parameters'] extends { query?: infer Query }
  ? NonNullable<Query>
  : never;

export type PlaceReviewsOperationPath<
  Name extends PlaceReviewsOperationName,
> = operations[Name]['parameters'] extends { path: infer Path }
  ? Path
  : never;

export type PlaceReviewsOperationRequestBody<
  Name extends PlaceReviewsOperationName,
> = operations[Name] extends {
  requestBody: { content: { 'application/json': infer Body } };
}
  ? Body
  : never;

export type PlaceReviewsOperationResponse<
  Name extends PlaceReviewsOperationName,
  Status extends keyof operations[Name]['responses'],
> = operations[Name]['responses'][Status] extends { content: infer Content }
  ? Content[keyof Content]
  : void;
