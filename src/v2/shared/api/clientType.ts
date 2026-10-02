/**
 * Client classification header for requests sent to the Pingdom server.
 *
 * Identifies the caller as the mobile app for the proxy. It is not an
 * authentication factor: JWT handling is unchanged. Never attach it to
 * third-party services (exchange rates, Kakao, map SDKs).
 */
export const CLIENT_TYPE_HEADER = 'X-Client-Type';
export const CLIENT_TYPE_APP = 'App';

/**
 * Returns a copy of `headers` with `X-Client-Type: App` enforced.
 * Caller-provided variants of the header (any casing) are dropped so the value
 * cannot be overridden per request.
 */
export function withClientTypeHeader<TValue>(
  headers?: Record<string, TValue>,
): Record<string, TValue | typeof CLIENT_TYPE_APP> {
  const merged: Record<string, TValue | typeof CLIENT_TYPE_APP> = {};
  const headerKey = CLIENT_TYPE_HEADER.toLowerCase();

  for (const [key, value] of Object.entries(headers ?? {})) {
    if (key.toLowerCase() !== headerKey) merged[key] = value;
  }

  merged[CLIENT_TYPE_HEADER] = CLIENT_TYPE_APP;
  return merged;
}
