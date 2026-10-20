import type {
  components,
  operations,
  paths,
} from './generated/placeExploration';

export type {
  components as PlaceExplorationComponents,
  operations as PlaceExplorationOperations,
  paths as PlaceExplorationPaths,
} from './generated/placeExploration';

export type PlaceExplorationSchemaName = keyof components['schemas'];
export type PlaceExplorationSchema<Name extends PlaceExplorationSchemaName> =
  components['schemas'][Name];
export type PlaceExplorationOperationName = keyof operations;

export type PlaceExplorationOperationQuery<
  Name extends PlaceExplorationOperationName,
> = operations[Name]['parameters'] extends { query?: infer Query }
  ? NonNullable<Query>
  : never;

export type PlaceExplorationOperationPath<
  Name extends PlaceExplorationOperationName,
> = operations[Name]['parameters'] extends { path: infer Path }
  ? Path
  : never;

export type PlaceExplorationOperationRequestBody<
  Name extends PlaceExplorationOperationName,
> = operations[Name] extends {
  requestBody: { content: { 'application/json': infer Body } };
}
  ? Body
  : never;

export type PlaceExplorationOperationResponse<
  Name extends PlaceExplorationOperationName,
  Status extends keyof operations[Name]['responses'],
> = operations[Name]['responses'][Status] extends { content: infer Content }
  ? Content[keyof Content]
  : void;
