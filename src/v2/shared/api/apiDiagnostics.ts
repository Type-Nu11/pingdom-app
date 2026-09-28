import type { AxiosInstance } from 'axios';

type Transport = Pick<AxiosInstance, 'get' | 'post' | 'put' | 'patch' | 'delete'>;
const METHODS = new Set(['get', 'post', 'put', 'patch', 'delete']);
const PATH_SEGMENTS = new Set(['api', 'v1', 'v2', 'users', 'me', 'places', 'map', 'autocomplete', 'reservations', 'bookmarks', 'favorites', 'profile', 'notifications', 'coupons', 'offers', 'card', 'reviews', 'recommendations', 'auth', 'login', 'refresh', 'local', 'popular', 'national', 'home-feeds', 'location-check-ins']);
let sequence = 0;
const record = (value: unknown): Record<string, any> => value && typeof value === 'object' ? value as Record<string, any> : {};

/** Never include query values, URL credentials, or dynamic path IDs in diagnostics. */
export function diagnosticUrl(value: unknown, baseURL?: string): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value, baseURL);
    if (!['http:', 'https:'].includes(url.protocol)) return undefined;
    const path = url.pathname.split('/').map(part => !part || PATH_SEGMENTS.has(part) ? part : ':redacted').join('/');
    return `${url.origin}${path}`;
  } catch { return undefined; }
}
function hasAuthorization(headers: unknown): boolean {
  const entries = record(headers);
  return Object.keys(entries).some(key => key.toLowerCase() === 'authorization' && Boolean(entries[key]));
}
function safeCode(value: unknown): string | undefined {
  return typeof value === 'string' && /^[A-Z][A-Z_]{1,63}$/.test(value) ? value : undefined;
}
function responseSummary(response: unknown, error?: unknown) {
  const res = record(response), err = record(error), data = record(res.data);
  const message = typeof data.error === 'string' ? data.error : data.message;
  const missing = typeof message === 'string'
    ? /^missing required header: (x-timestamp|x-signaturebase64|x-app-version|x-device-id)$/i.exec(message)?.[1].toLowerCase() : undefined;
  const finalUrl = diagnosticUrl(record(res.request).responseURL ?? record(err.request).responseURL);
  const redirect = diagnosticUrl(record(res.headers).location, record(res.config).baseURL);
  return {
    status: typeof res.status === 'number' ? res.status : null,
    errorCode: safeCode(err.code), serverCode: safeCode(data.code),
    missingRequiredHeader: missing,
    responseFormat: typeof res.data === 'string' ? (/^\s*</.test(res.data) ? 'html' : 'text') : res.data == null ? 'none' : 'json',
    finalUrl, redirect,
    internalPortRedirect: [finalUrl, redirect].some(url => url && new URL(url).port === '8081'),
    insecureRedirect: [finalUrl, redirect].some(url => url?.startsWith('http:')),
    transportUrl: diagnosticUrl(record(res.config ?? err.config).url, record(res.config ?? err.config).baseURL),
    authorizationPresentAtTransport: res.config || err.config ? hasAuthorization(record(res.config ?? err.config).headers) : undefined,
    authRetryAttempted: record(res.config ?? err.config)._retry === true,
  };
}

/** Observes the injected transport as well as the default client; never changes requests or errors. */
export function withApiDiagnostics(transport: Transport, baseURL: string, enabled: boolean): Transport {
  if (!enabled) return transport;
  return new Proxy(transport, {
    get(target, property) {
      const original = Reflect.get(target, property);
      if (typeof property !== 'string' || !METHODS.has(property) || typeof original !== 'function') return original;
      return async (...args: unknown[]) => {
        const options = record(args[property === 'get' || property === 'delete' ? 1 : 2]);
        const id = `api-${++sequence}`;
        const start = Date.now();
        const context = { id, method: property.toUpperCase(), url: diagnosticUrl(args[0], baseURL), authorizationProvided: hasAuthorization(options.headers) };
        // Only allowlisted scalar metadata is emitted, never config/error/response objects.
        const emit = (phase: string, metadata: object) => {
          try { console.info('[api-diagnostic]', phase, { ...context, ...metadata }); } catch { /* Logging cannot break requests. */ }
        };
        emit('request', {});
        try {
          const response = await Reflect.apply(original, target, args);
          emit('response', { elapsedMs: Date.now() - start, ...responseSummary(response) });
          return response;
        } catch (error) {
          emit('failure', { elapsedMs: Date.now() - start, ...responseSummary(record(error).response, error) });
          throw error;
        }
      };
    },
  });
}
