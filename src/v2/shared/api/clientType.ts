import appMetadata from '../config/appMetadata.json';

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


export const TIMESTAMP_HEADER = 'X-Timestamp';
export const APP_VERSION_HEADER = 'X-App-Version';
export const APP_VERSION = appMetadata.version;

/** Device Unix time in whole seconds; generated for each outgoing request. */
export function unixTimestamp(): string {
  return String(Math.floor(Date.now() / 1000));
}

export function withAppRequestHeaders<TValue>(headers?: Record<string, TValue>): Record<string, TValue | string> {
  const merged = withClientTypeHeader(headers);
  for (const key of Object.keys(merged)) {
    if ([TIMESTAMP_HEADER.toLowerCase(), APP_VERSION_HEADER.toLowerCase()].includes(key.toLowerCase())) delete merged[key];
  }
  return { ...merged, [TIMESTAMP_HEADER]: unixTimestamp(), [APP_VERSION_HEADER]: APP_VERSION };
}


export const DEVICE_ID_HEADER = 'X-Device-Id';
let deviceIdProvider: () => string | null | Promise<string | null> = () => null;

export function configureApiDeviceIdProvider(provider: typeof deviceIdProvider): () => void {
  deviceIdProvider = provider;
  return () => { if (deviceIdProvider === provider) deviceIdProvider = () => null; };
}

export async function withDeviceRequestHeaders<TValue = string>(headers?: Record<string, TValue>): Promise<Record<string, TValue | string>> {
  const deviceId = await deviceIdProvider();
  const merged = withAppRequestHeaders(headers);
  for (const key of Object.keys(merged)) {
    if (key.toLowerCase() === DEVICE_ID_HEADER.toLowerCase()) delete merged[key];
  }
  if (deviceId) merged[DEVICE_ID_HEADER] = deviceId;
  return merged;
}
