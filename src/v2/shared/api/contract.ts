import type { components, operations, paths } from './generated/mvp';

export type { components, operations, paths } from './generated/mvp';

export type ApiSchemaName = keyof components['schemas'];
export type ApiSchema<Name extends ApiSchemaName> = components['schemas'][Name];
export type ApiOperationName = keyof operations;

export type OperationQuery<Name extends ApiOperationName> =
  operations[Name]['parameters'] extends { query?: infer Query }
    ? NonNullable<Query>
    : never;

export type OperationPath<Name extends ApiOperationName> =
  operations[Name]['parameters'] extends { path: infer Path }
    ? Path
    : never;

export type OperationRequestBody<Name extends ApiOperationName> =
  operations[Name] extends {
    requestBody: { content: { 'application/json': infer Body } };
  }
    ? Body
    : never;

export type OperationResponse<
  Name extends ApiOperationName,
  Status extends keyof operations[Name]['responses'],
> = operations[Name]['responses'][Status] extends {
  content: { 'application/json': infer Body };
}
  ? Body
  : never;

export type ErrorCode = ApiSchema<'ErrorCode'>;
export type ErrorResponse = ApiSchema<'ErrorResponse'>;
export type FieldError = ApiSchema<'FieldError'>;
