import type { AccountApiSchema } from '../../../../shared/api/accountContract';

export type GoogleLinkStartResponse = AccountApiSchema<'OAuthAccountLinkStartResponse'>;
export type GoogleUnlinkRequest = AccountApiSchema<'OAuthAccountDisconnectRequest'>;
export type GoogleAccountResponse = AccountApiSchema<'OAuthAccountResponse'>;
export type UserDataExport = AccountApiSchema<'UserDataExportResponse'>;
