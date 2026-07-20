export type AppEnvironment = 'development' | 'staging' | 'production';

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

const appEnvironment = readAppEnvironment(process.env.EXPO_PUBLIC_APP_ENV);

export const env = Object.freeze({
  apiBaseUrl: readHttpUrl('EXPO_PUBLIC_API_BASE_URL', process.env.EXPO_PUBLIC_API_BASE_URL),
  appEnvironment,
  featureFlags: Object.freeze({
    placeList: readBoolean(
      'EXPO_PUBLIC_ENABLE_PLACE_LIST',
      process.env.EXPO_PUBLIC_ENABLE_PLACE_LIST,
      false,
    ),
  }),
  isDevelopment: appEnvironment === 'development',
  isProduction: appEnvironment === 'production',
  kakaoRestApiKey: readOptional(process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY),
});

export type Environment = typeof env;
