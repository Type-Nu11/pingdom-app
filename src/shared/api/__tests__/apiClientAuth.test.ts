import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { clearExpiredSession } from '../../../app/store/authStore';
import { api } from '../apiClient';
import { getCachedAccessToken, persistTokens } from '../authTokens';

jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  actual.default.defaults.adapter = jest.fn();
  return actual;
});

jest.mock('../../../app/store/authStore', () => ({
  clearExpiredSession: jest.fn(),
}));

jest.mock('../authTokens', () => ({
  getCachedAccessToken: jest.fn(),
  getRefreshPromise: jest.fn().mockReturnValue(null),
  hydrateAccessToken: jest.fn(),
  persistTokens: jest.fn(),
  removeTokens: jest.fn(),
  setRefreshPromise: jest.fn(),
}));

const mockAdapter = axios.defaults.adapter as jest.Mock;

function response(config: InternalAxiosRequestConfig, status: number, data: unknown): AxiosResponse {
  return { config, data, headers: {}, status, statusText: String(status) };
}

function unauthorized(config: InternalAxiosRequestConfig) {
  return new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, response(config, 401, {
    code: 'INVALID_CREDENTIALS',
    message: '아이디 또는 비밀번호가 올바르지 않습니다.',
  }));
}

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.mocked(getCachedAccessToken).mockReturnValue('expired-access-token');
  jest.mocked(persistTokens).mockImplementation(async tokens => {
    jest.mocked(getCachedAccessToken).mockReturnValue(tokens.accessToken);
  });
});

test.each([
  '/auth/login',
  'http://127.0.0.1/auth/login?source=app',
  '/auth/password-reset/confirm',
  '/auth/token/refresh',
])('공개 인증 요청 %s의 401은 갱신이나 로그인 재시도 없이 그대로 전달한다', async path => {
  let originalError: AxiosError | undefined;
  mockAdapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
    const error = unauthorized(config);
    originalError ??= error;
    throw error;
  });

  await expect(api.post(path, { username: 'example', password: 'invalid-example' }))
    .rejects.toMatchObject({ response: { status: 401, data: { code: 'INVALID_CREDENTIALS' } } });

  expect(mockAdapter).toHaveBeenCalledTimes(1);
  expect(originalError?.config?.headers.has('Authorization')).toBe(false);
  expect(persistTokens).not.toHaveBeenCalled();
  expect(clearExpiredSession).not.toHaveBeenCalled();
});

test('로그인의 429 응답은 재시도 없이 보존한다', async () => {
  mockAdapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
    throw new AxiosError('Too Many Requests', 'ERR_BAD_REQUEST', config, undefined,
      response(config, 429, { code: 'TOO_MANY_REQUESTS' }));
  });

  await expect(api.post('/auth/login', { username: 'example', password: 'invalid-example' }))
    .rejects.toMatchObject({ response: { status: 429 } });

  expect(mockAdapter).toHaveBeenCalledTimes(1);
  expect(clearExpiredSession).not.toHaveBeenCalled();
});

test('보호된 요청의 만료 토큰은 갱신 후 새 토큰으로 한 번만 재시도한다', async () => {
  mockAdapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
    if (config.url === '/auth/token/refresh') {
      return response(config, 200, { accessToken: 'renewed-access-token' });
    }
    if (config.headers.get('Authorization') === 'Bearer expired-access-token') {
      throw unauthorized(config);
    }
    return response(config, 200, { id: 1 });
  });

  await expect(api.get('/users/me')).resolves.toMatchObject({ status: 200, data: { id: 1 } });

  expect(mockAdapter.mock.calls.map(([config]) => config.url)).toEqual([
    '/users/me', '/auth/token/refresh', '/users/me',
  ]);
  expect(mockAdapter.mock.calls[2][0].headers.get('Authorization')).toBe('Bearer renewed-access-token');
  expect(persistTokens).toHaveBeenCalledWith({ accessToken: 'renewed-access-token' });
  expect(clearExpiredSession).not.toHaveBeenCalled();
});

test('갱신 후에도 보호된 요청이 401이면 세션을 정리하고 추가 요청을 멈춘다', async () => {
  mockAdapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
    if (config.url === '/auth/token/refresh') {
      return response(config, 200, { accessToken: 'renewed-access-token' });
    }
    throw unauthorized(config);
  });

  await expect(api.get('/users/me')).rejects.toMatchObject({ response: { status: 401 } });

  expect(mockAdapter).toHaveBeenCalledTimes(3);
  expect(clearExpiredSession).toHaveBeenCalledTimes(1);
});

test.each(['SIGNATURE_REQUIRED', 'INVALID_SIGNATURE', 'REQUEST_TIMESTAMP_OUT_OF_RANGE', 'SIGNING_KEY_EXPIRED'])('%s does not refresh or clear the session', async code => {
  mockAdapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
    throw new AxiosError('private proxy diagnostic', 'ERR_BAD_REQUEST', config, undefined,
      response(config, 401, { code }));
  });
  await expect(api.get('/users/me')).rejects.toMatchObject({ response: { data: { code } } });
  expect(mockAdapter).toHaveBeenCalledTimes(1);
  expect(clearExpiredSession).not.toHaveBeenCalled();
});


test('HTML proxy 401 does not refresh or clear the session', async () => {
  mockAdapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
    throw new AxiosError('private proxy diagnostic', 'ERR_BAD_REQUEST', config, undefined,
      response(config, 401, '<html>proxy authentication</html>'));
  });
  await expect(api.get('/users/me')).rejects.toMatchObject({ response: { status: 401 } });
  expect(mockAdapter).toHaveBeenCalledTimes(1);
  expect(clearExpiredSession).not.toHaveBeenCalled();
});
