import type { components, operations, paths } from './generated/placeMenus';

export type {
  components as PlaceMenusComponents,
  operations as PlaceMenusOperations,
  paths as PlaceMenusPaths,
} from './generated/placeMenus';

export type PlaceMenusSchemaName = keyof components['schemas'];
export type PlaceMenusSchema<Name extends PlaceMenusSchemaName> = components['schemas'][Name];
export type PlaceMenusOperationName = keyof operations;

export type PlaceMenusOperationResponse<
  Name extends PlaceMenusOperationName,
  Status extends keyof operations[Name]['responses'],
> = operations[Name]['responses'][Status] extends { content: infer Content }
  ? Content[keyof Content]
  : void;
