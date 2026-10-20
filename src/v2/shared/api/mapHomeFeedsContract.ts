import type { components, operations, paths } from './generated/mapHomeFeeds';

export type {
  components as MapHomeFeedsComponents,
  operations as MapHomeFeedsOperations,
  paths as MapHomeFeedsPaths,
} from './generated/mapHomeFeeds';

export type MapHomeFeedsSchemaName = keyof components['schemas'];
export type MapHomeFeedsSchema<Name extends MapHomeFeedsSchemaName> = components['schemas'][Name];
export type MapHomeFeedsOperationName = keyof operations;
export type MapHomeFeedsOperationQuery<Name extends MapHomeFeedsOperationName> =
  operations[Name]['parameters'] extends { query?: infer Query } ? NonNullable<Query> : never;
export type MapHomeFeedsOperationResponse<
  Name extends MapHomeFeedsOperationName,
  Status extends keyof operations[Name]['responses'],
> = operations[Name]['responses'][Status] extends { content: infer Content }
  ? Content[keyof Content]
  : void;
