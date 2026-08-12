import { env } from '../../../shared/config';
import type { GoogleLinkStartResponse } from '../model/account.types';

export function resolveGoogleAuthorizationUrl(
  authorizationUrl: string | undefined,
  apiBaseUrl: string = env.apiBaseUrl,
): string {
  const value = authorizationUrl?.trim();

  if (!value) {
    throw new Error('Google OAuth authorizationUrl is missing from the server response.');
  }

  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(value);
  const candidate = hasScheme
    ? value
    : `${apiBaseUrl.replace(/\/$/, '')}/${value.replace(/^\/+/, '')}`;
  const resolved = new URL(candidate);
  if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') {
    throw new Error(`Unsupported Google OAuth URL protocol: ${resolved.protocol}`);
  }

  return resolved.toString();
}

export type OpenUrl = (url: string) => Promise<unknown>;

export async function openGoogleAuthorization(
  response: GoogleLinkStartResponse,
  openUrl: OpenUrl,
  apiBaseUrl: string = env.apiBaseUrl,
): Promise<string> {
  const absoluteUrl = resolveGoogleAuthorizationUrl(response.authorizationUrl, apiBaseUrl);
  await openUrl(absoluteUrl);
  return absoluteUrl;
}
