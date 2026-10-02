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

function sentConfigs(): InternalAxiosRequestConfig[] {
  return mockAdapter.mock.calls.map(([config]) => config as InternalAxiosRequestConfig);
}

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.mocked(getCachedAccessToken).mockReturnValue('access-token');
  jest.mocked(persistTokens).mockImplementation(async tokens => {
    jest.mocked(getCachedAccessToken).mockReturnValue(tokens.accessToken);
  });
  mockAdapter.mockImplementation(async (config: InternalAxiosRequestConfig) => response(config, 200, { ok: true }));
});

test.each([
  ['get', () => api.get('/users/me')],
  ['post', () => api.post('/reviews', { a: 1 })],
  ['put', () => api.put('/users/me', { a: 1 })],
  ['patch', () => api.patch('/users/me', { a: 1 })],
  ['delete', () => api.delete('/users/me')],
])('%s 요청은 X-Client-Type: App과 기존 Authorization을 함께 보낸다', async (_method, send) => {
  await send();

  const [config] = sentConfigs();
  expect(config.headers.get('X-Client-Type')).toBe('App');
  expect(config.headers.get('Authorization')).toBe('Bearer access-token');
  expect(config.timeout).toBe(10000);
  expect(config.withCredentials).toBe(true);
});

test.each([
  '/auth/login',
  '/auth/signup',
  '/auth/password-reset/request',
  '/auth/email/resend',
])('인증 전 요청 %s도 X-Client-Type: App을 보내고 Authorization은 보내지 않는다', async path => {
  await api.post(path, { username: 'example' });

  const [config] = sentConfigs();
  expect(config.headers.get('X-Client-Type')).toBe('App');
  expect(config.headers.has('Authorization')).toBe(false);
});

test('호출자가 넘긴 헤더와 병합하되 X-Client-Type 값은 App으로 유지한다', async () => {
  await api.get('/users/me', { headers: { 'X-Client-Type': 'Web', 'X-Trace': 'trace-1' } });
  await api.post('/users/me/profile-image', new FormData(), {
    headers: { 'Content-Type': 'multipart/form-data', 'x-client-type': false as unknown as string },
  });

  const [first, second] = sentConfigs();
  expect(first.headers.get('X-Client-Type')).toBe('App');
  expect(first.headers.get('X-Trace')).toBe('trace-1');
  expect(second.headers.get('X-Client-Type')).toBe('App');
  expect(String(second.headers.get('Content-Type'))).toContain('multipart/form-data');
});

test('401 → 토큰 갱신 → 원요청 재시도 모두 X-Client-Type: App을 보낸다', async () => {
  jest.mocked(getCachedAccessToken).mockReturnValue('expired-access-token');
  mockAdapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
    if (config.url === '/auth/token/refresh') {
      return response(config, 200, { accessToken: 'renewed-access-token' });
    }
    if (config.headers.get('Authorization') === 'Bearer expired-access-token') {
      throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined,
        response(config, 401, { code: 'TOKEN_EXPIRED' }));
    }
    return response(config, 200, { id: 1 });
  });

  await expect(api.get('/users/me', { headers: { 'X-Client-Type': 'Web' } }))
    .resolves.toMatchObject({ status: 200, data: { id: 1 } });

  const configs = sentConfigs();
  expect(configs.map(config => config.url)).toEqual(['/users/me', '/auth/token/refresh', '/users/me']);
  for (const config of configs) {
    expect(config.headers.get('X-Client-Type')).toBe('App');
  }
  expect(configs[1].headers.has('Authorization')).toBe(false);
  expect(configs[2].headers.get('Authorization')).toBe('Bearer renewed-access-token');
  expect(clearExpiredSession).not.toHaveBeenCalled();
});

test('abort signal은 그대로 전달하고 취소된 요청은 갱신·재시도하지 않는다', async () => {
  const controller = new AbortController();
  mockAdapter.mockImplementation(async (config: InternalAxiosRequestConfig) => {
    expect(config.signal).toBe(controller.signal);
    expect(config.headers.get('X-Client-Type')).toBe('App');
    controller.abort();
    throw new axios.CanceledError(undefined, undefined, config);
  });

  await expect(api.get('/users/me', { signal: controller.signal })).rejects.toBeInstanceOf(axios.CanceledError);
  expect(mockAdapter).toHaveBeenCalledTimes(1);
  expect(clearExpiredSession).not.toHaveBeenCalled();
});

test('외부 절대 URL은 차단되어 X-Client-Type이 전송되지 않는다', async () => {
  await expect(api.get('https://api.frankfurter.dev/v2/rate/KRW/USD'))
    .rejects.toThrow('허용되지 않은 절대 URL 요청입니다.');
  await expect(api.get('https://dapi.kakao.com/v2/local/search/keyword.json'))
    .rejects.toThrow('허용되지 않은 절대 URL 요청입니다.');

  expect(mockAdapter).not.toHaveBeenCalled();
});
