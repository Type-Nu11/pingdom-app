import { ApiError } from '../../../../../shared/api/ApiError';
import { createTestI18n } from '../../../../../app/testing/testProviders';
import { supportedLanguages } from '../../../../../shared/i18n/resources';
import { getAuthErrorKey, type AuthOperation } from '../model/authErrorPresentation';

const transportError = (status?: number, data?: unknown, code?: string) => ({
  isAxiosError: true,
  message: `Request failed with status code ${status}`,
  code,
  ...(status ? { response: { status, data } } : {}),
});

test.each([
  ['login', transportError(401, { message: 'Unauthorized' }), 'authErrors.invalidCredentials'],
  ['login', transportError(401, { code: 'UNKNOWN_AUTH_CODE' }), 'authErrors.invalidCredentials'],
  ['login', new ApiError('Bad credentials', { code: 'INVALID_CREDENTIALS' }), 'authErrors.invalidCredentials'],
  ['signup', transportError(409, { message: 'Duplicate account' }), 'authErrors.signupConflict'],
  ['signup', transportError(400, { errors: { email: 'must be a valid email address' } }), 'common.apiError.validation.description'],
  ['passwordReset', transportError(400, { code: 'INVALID_PASSWORD_RESET_TOKEN', message: 'Token invalid' }), 'auth.passwordReset.invalidToken'],
  ['passwordReset', transportError(422, { fieldErrors: [{ field: 'password', reason: 'size must be between 8 and 100' }] }), 'common.apiError.validation.description'],
  ['login', transportError(undefined, undefined, 'ERR_NETWORK'), 'common.apiError.network.description'],
  ['login', transportError(undefined, undefined, 'ECONNABORTED'), 'common.apiError.timeout.description'],
  ['login', transportError(429, { message: 'Too Many Requests' }), 'common.apiError.rateLimited.description'],
  ['signup', transportError(503, { message: 'Service Unavailable' }), 'common.apiError.server.description'],
  ['login', transportError(403, { message: 'Forbidden' }), 'common.apiError.authorization.description'],
  ['login', transportError(401, '<html>Gateway authorization required</html>'), 'auth.login.unknownError'],
  ['signup', transportError(502, '<html>Bad Gateway</html>'), 'auth.signup.unknownError'],
  ['passwordReset', new Error('Secure storage failed with internal/path'), 'auth.passwordReset.unknownError'],
  ['signup', null, 'auth.signup.unknownError'],
] as const)('%s maps error to app-owned copy %s', (operation, error, expectedKey) => {
  expect(getAuthErrorKey(error, operation)).toBe(expectedKey);
});

test.each(supportedLanguages)('%s has its own copy for every auth error outcome', async (language) => {
  const i18n = await createTestI18n(language);
  const errors = [
    transportError(401), transportError(403), transportError(409), transportError(400),
    transportError(422), transportError(429), transportError(503),
    transportError(undefined, undefined, 'ERR_NETWORK'), transportError(undefined, undefined, 'ECONNABORTED'),
    transportError(400, { code: 'INVALID_PASSWORD_RESET_TOKEN' }), new Error('Raw internal failure'),
  ];
  for (const operation of ['login', 'signup', 'passwordReset'] satisfies AuthOperation[]) {
    for (const error of errors) {
      const key = getAuthErrorKey(error, operation);
      const ownCopy: unknown = i18n.getResource(language, 'translation', key);
      expect(typeof ownCopy).toBe('string');
      expect(i18n.t(key)).toBe(ownCopy);
      expect(i18n.t(key)).not.toMatch(/Request failed|Raw internal|<html>|401/);
    }
  }
});
