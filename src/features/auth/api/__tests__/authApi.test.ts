import { toLoginResponse } from '../authApi';

describe('login response contract', () => {
  test('accepts the live response containing only an access token', () => {
    expect(toLoginResponse({ accessToken: 'access-token' })).toEqual({
      accessToken: 'access-token',
    });
  });

  test('keeps compatibility with a wrapped response', () => {
    expect(toLoginResponse({ data: { accessToken: 'wrapped-access-token' } })).toEqual({
      accessToken: 'wrapped-access-token',
    });
  });

  test('rejects a response without an access token', () => {
    expect(() => toLoginResponse({})).toThrow('로그인 응답에 accessToken이 없습니다.');
  });
});
