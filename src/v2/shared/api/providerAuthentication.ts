/** Provider credentials are not the app user's session. Do not inspect arbitrary error prose. */
export function isProviderCredentialFailure(body: unknown): boolean {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
  const error = (body as Record<string, unknown>).error;
  if (!error || typeof error !== 'object' || Array.isArray(error)) return false;
  const detail = error as Record<string, unknown>;
  return detail.code === 'invalid_api_key' || detail.code === 'missing_api_key'
    || (detail.type === 'invalid_request_error' && detail.message === 'Invalid API Key')
    || ((body as Record<string, unknown>).type === 'error' && detail.type === 'authentication_error');
}
