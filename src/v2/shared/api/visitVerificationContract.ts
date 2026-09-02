import type { components, operations, paths } from './generated/visitVerification';

export type {
  components as VisitVerificationComponents,
  operations as VisitVerificationOperations,
  paths as VisitVerificationPaths,
} from './generated/visitVerification';

export type VisitVerificationSchemaName = keyof components['schemas'];
export type VisitVerificationSchema<Name extends VisitVerificationSchemaName> =
  components['schemas'][Name];
export type VisitVerificationOperationName = keyof operations;
export type VisitVerificationOperationRequestBody<
  Name extends VisitVerificationOperationName,
> = operations[Name] extends { requestBody: { content: { 'application/json': infer Body } } }
  ? Body
  : never;
export type VisitVerificationOperationResponse<
  Name extends VisitVerificationOperationName,
  Status extends keyof operations[Name]['responses'],
> = operations[Name]['responses'][Status] extends { content: infer Content }
  ? Content[keyof Content]
  : void;
