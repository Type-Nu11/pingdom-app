export type AppEnvironment = 'development' | 'staging' | 'production';
export type ApiMode = 'mock' | 'real';
export type MockScenario = 'empty' | 'expired' | 'forbidden' | 'network-error' | 'success';

class EnvironmentConfigurationError extends Error {
  constructor(message: string) {
    super(`[V2 environment] ${message}`);
    this.name = 'EnvironmentConfigurationError';
  }
}

function readAppEnvironment(value: string | undefined): AppEnvironment {
  if (!value) {
    return __DEV__ ? 'development' : 'production';
  }

  if (value === 'development' || value === 'staging' || value === 'production') {
    return value;
  }

  throw new EnvironmentConfigurationError(
    `EXPO_PUBLIC_APP_ENV must be development, staging, or production. Received: ${value}`,
  );
}

function readRequired(name: string, value: string | undefined): string {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    throw new EnvironmentConfigurationError(`${name} is required.`);
  }

  return normalizedValue;
}

function readOptional(value: string | undefined): string | undefined {
  const normalizedValue = value?.trim();
  return normalizedValue || undefined;
}

function readBoolean(name: string, value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;

  throw new EnvironmentConfigurationError(`${name} must be true or false. Received: ${value}`);
}

function readApiMode(value: string | undefined): ApiMode {
  if (!value || value === 'real') return 'real';
  if (value === 'mock') return 'mock';

  throw new EnvironmentConfigurationError(
    `EXPO_PUBLIC_API_MODE must be mock or real. Received: ${value}`,
  );
}

function readMockScenario(value: string | undefined): MockScenario {
  if (!value || value === 'success') return 'success';
  if (
    value === 'empty' ||
    value === 'expired' ||
    value === 'forbidden' ||
    value === 'network-error'
  ) {
    return value;
  }

  throw new EnvironmentConfigurationError(
    'EXPO_PUBLIC_MOCK_SCENARIO must be success, empty, forbidden, expired, or network-error. ' +
      `Received: ${value}`,
  );
}

function readNonNegativeInteger(
  name: string,
  value: string | undefined,
  fallback: number,
): number {
  if (!value) return fallback;

  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed >= 0) return parsed;

  throw new EnvironmentConfigurationError(`${name} must be a non-negative integer.`);
}

function readHttpUrl(name: string, value: string | undefined): string {
  const rawUrl = readRequired(name, value);

  try {
    const url = new URL(rawUrl);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Unsupported protocol');
    }

    return url.toString().replace(/\/$/, '');
  } catch {
    throw new EnvironmentConfigurationError(`${name} must be a valid HTTP(S) URL.`);
  }
}

export function resolvePlaceListEnabled({
  apiMode,
  appEnvironment,
  value,
}: {
  apiMode: ApiMode;
  appEnvironment: AppEnvironment;
  value?: string;
}): boolean {
  return readBoolean(
    'EXPO_PUBLIC_ENABLE_PLACE_LIST',
    value,
    appEnvironment === 'development' && apiMode === 'real',
  );
}

const appEnvironment = readAppEnvironment(process.env.EXPO_PUBLIC_APP_ENV);
const apiMode = readApiMode(process.env.EXPO_PUBLIC_API_MODE);

if (apiMode === 'mock' && appEnvironment !== 'development') {
  throw new EnvironmentConfigurationError(
    'EXPO_PUBLIC_API_MODE=mock is allowed only when EXPO_PUBLIC_APP_ENV=development.',
  );
}

export const env = Object.freeze({
  apiBaseUrl: readHttpUrl('EXPO_PUBLIC_API_BASE_URL', process.env.EXPO_PUBLIC_API_BASE_URL),
  apiMode,
  appEnvironment,
  featureFlags: Object.freeze({
    placeList: resolvePlaceListEnabled({
      apiMode,
      appEnvironment,
      value: process.env.EXPO_PUBLIC_ENABLE_PLACE_LIST,
    }),
  }),
  isDevelopment: appEnvironment === 'development',
  isProduction: appEnvironment === 'production',
  kakaoRestApiKey: readOptional(process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY),
  mock: Object.freeze({
    latencyMs: readNonNegativeInteger(
      'EXPO_PUBLIC_MOCK_LATENCY_MS',
      process.env.EXPO_PUBLIC_MOCK_LATENCY_MS,
      250,
    ),
    scenario: readMockScenario(process.env.EXPO_PUBLIC_MOCK_SCENARIO),
  }),
});

export type Environment = typeof env;
