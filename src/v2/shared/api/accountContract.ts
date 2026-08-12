import type {
  components as AccountComponents,
  operations as AccountOperations,
  paths as AccountPaths,
} from './generated/account';

export type { AccountComponents, AccountOperations, AccountPaths };

export type AccountApiSchemaName = keyof AccountComponents['schemas'];
export type AccountApiSchema<Name extends AccountApiSchemaName> =
  AccountComponents['schemas'][Name];
export type AccountApiOperationName = keyof AccountOperations;

export type AccountOperationRequestBody<Name extends AccountApiOperationName> =
  AccountOperations[Name] extends {
    requestBody: { content: { 'application/json': infer Body } };
  }
    ? Body
    : never;

export type AccountOperationResponse<
  Name extends AccountApiOperationName,
  Status extends keyof AccountOperations[Name]['responses'],
> = AccountOperations[Name]['responses'][Status] extends {
  content: infer Content;
}
  ? Content extends Record<string, infer Body>
    ? Body
    : never
  : void;
