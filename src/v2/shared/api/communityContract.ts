import type {
  components,
  operations,
  paths,
} from './generated/community';

export type {
  components as CommunityComponents,
  operations as CommunityOperations,
  paths as CommunityPaths,
} from './generated/community';

export type CommunitySchemaName = keyof components['schemas'];
export type CommunitySchema<Name extends CommunitySchemaName> =
  components['schemas'][Name];
export type CommunityOperationName = keyof operations;

export type CommunityOperationQuery<
  Name extends CommunityOperationName,
> = operations[Name]['parameters'] extends { query?: infer Query }
  ? NonNullable<Query>
  : never;

export type CommunityOperationPath<
  Name extends CommunityOperationName,
> = operations[Name]['parameters'] extends { path: infer Path }
  ? Path
  : never;

export type CommunityOperationRequestBody<
  Name extends CommunityOperationName,
> = operations[Name] extends {
  requestBody: { content: { 'application/json': infer Body } };
}
  ? Body
  : never;

export type CommunityOperationResponse<
  Name extends CommunityOperationName,
  Status extends keyof operations[Name]['responses'],
> = operations[Name]['responses'][Status] extends { content: infer Content }
  ? Content[keyof Content]
  : void;
