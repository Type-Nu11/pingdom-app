import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';

import { createAccountApi } from '../../../features/account/api/accountApi.ts';
import {
  createGoogleLinkMutationOptions,
  createGoogleUnlinkMutationOptions,
  createUserDataExportQueryOptions,
  refreshOAuthAccountQueries,
  shouldRefreshAfterOAuthReturn,
} from '../../../features/account/hooks/useAccount.ts';
import {
  accountUserQueryKeys,
  oauthAccountQueryKeys,
} from '../../../features/account/model/accountQueryKeys.ts';
import {
  openGoogleAuthorization,
  resolveGoogleAuthorizationUrl,
} from '../../../features/account/services/googleOAuth.ts';
import {
  createUserDataExportFileName,
  serializeUserDataExport,
  writeUserDataExport,
  writeUserDataExportForPlatform,
} from '../../../features/account/services/userDataExport.ts';
import { createAuthApi } from '../../../features/auth/api/authApi.ts';
import {
  createEmailResendMutationOptions,
  createPasswordResetConfirmMutationOptions,
  createPasswordResetRequestMutationOptions,
  logoutAndClearSession,
} from '../../../features/auth/hooks/useAccountAuth.ts';

test('account and auth API modules keep the seven server operation contracts', async () => {
  const calls = [];
  const response = { contract: true };
  const client = {
    delete: async (path, body, options) => {
      calls.push({ body, method: 'DELETE', options, path });
      return response;
    },
    get: async (path, options) => {
      calls.push({ method: 'GET', options, path });
      return response;
    },
    patch: async () => response,
    post: async (path, body, options) => {
      calls.push({ body, method: 'POST', options, path });
      return response;
    },
    put: async () => response,
  };
  const auth = createAuthApi(client);
  const account = createAccountApi(client);
  const signal = new AbortController().signal;
  const resetRequest = { email: 'user@example.com' };
  const resetConfirm = {
    confirmPassword: 'new-password',
    email: 'user@example.com',
    newPassword: 'new-password',
    token: 'server-token',
  };
  const unlink = { currentPassword: 'current-password' };

  await auth.requestPasswordReset(resetRequest, signal);
  await auth.confirmPasswordReset(resetConfirm, signal);
  await auth.logout(signal);
  await auth.resendVerificationEmail(resetRequest, signal);
  await account.startGoogleLink(signal);
  await account.unlinkGoogle(unlink, signal);
  await account.getUserDataExport(signal);

  assert.deepEqual(calls.map(({ method, path }) => `${method} ${path}`), [
    'POST /auth/password-reset/request',
    'POST /auth/password-reset/confirm',
    'POST /auth/logout',
    'POST /auth/email/resend',
    'POST /users/me/oauth-accounts/google/link',
    'DELETE /users/me/oauth-accounts/google',
    'GET /users/me/export',
  ]);
  assert.equal(calls[0].body, resetRequest);
  assert.equal(calls[1].body, resetConfirm);
  assert.equal(calls[5].body, unlink);
  assert.ok(calls.every(({ options }) => options.signal === signal));
});

test('auth mutation options forward OpenAPI request bodies unchanged', async () => {
  const calls = [];
  const requestBody = { email: 'user@example.com' };
  const confirmBody = {
    confirmPassword: 'password-2',
    email: 'user@example.com',
    newPassword: 'password-2',
    token: 'reset-token',
  };
  const api = {
    confirmPasswordReset: async (body) => { calls.push(['confirm', body]); },
    requestPasswordReset: async (body) => { calls.push(['request', body]); },
    resendVerificationEmail: async (body) => { calls.push(['resend', body]); },
  };

  await createPasswordResetRequestMutationOptions(api).mutationFn(requestBody);
  await createPasswordResetConfirmMutationOptions(api).mutationFn(confirmBody);
  await createEmailResendMutationOptions(api).mutationFn(requestBody);

  assert.deepEqual(calls, [
    ['request', requestBody],
    ['confirm', confirmBody],
    ['resend', requestBody],
  ]);
});

test('logout always cancels queries, clears secure session, then removes query cache', async () => {
  for (const shouldFail of [false, true]) {
    const calls = [];
    const serverError = new Error('server logout failed');
    const operation = logoutAndClearSession({
      api: { logout: async () => {
        calls.push('server');
        if (shouldFail) throw serverError;
      } },
      queryClient: {
        cancelQueries: async () => { calls.push('cancel'); },
        removeQueries: () => { calls.push('remove'); },
      },
      tokenSession: { clear: async () => { calls.push('tokens'); } },
    });

    if (shouldFail) {
      await assert.rejects(operation, (error) => error === serverError);
    } else {
      await operation;
    }
    assert.deepEqual(calls, ['server', 'cancel', 'tokens', 'remove']);
  }
});

test('Google OAuth opens only the server authorizationUrl resolved against API base URL', async () => {
  assert.equal(
    resolveGoogleAuthorizationUrl('/oauth2/authorization/google', 'https://api.example.com/api/v1'),
    'https://api.example.com/api/v1/oauth2/authorization/google',
  );
  assert.equal(
    resolveGoogleAuthorizationUrl('https://accounts.google.com/o/oauth2/auth', 'https://api.example.com'),
    'https://accounts.google.com/o/oauth2/auth',
  );
  assert.throws(
    () => resolveGoogleAuthorizationUrl('pingdom://oauth', 'https://api.example.com'),
    /Unsupported.*protocol/,
  );

  const opened = [];
  const response = { authorizationUrl: '/oauth2/authorization/google', provider: 'GOOGLE' };
  assert.equal(
    await openGoogleAuthorization(response, async (url) => { opened.push(url); }, 'https://api.example.com/api/v1'),
    'https://api.example.com/api/v1/oauth2/authorization/google',
  );
  assert.deepEqual(opened, ['https://api.example.com/api/v1/oauth2/authorization/google']);

  const result = await createGoogleLinkMutationOptions(
    { startGoogleLink: async () => response },
    async () => undefined,
  ).mutationFn();
  assert.equal(result.response, response);
});

test('OAuth return and unlink refresh account query keys without inventing a callback query', async () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(accountUserQueryKeys.me(), { id: 1 });
  queryClient.setQueryData(oauthAccountQueryKeys.google(), { linked: false });

  await refreshOAuthAccountQueries(queryClient);

  assert.equal(queryClient.getQueryState(accountUserQueryKeys.me()).isInvalidated, true);
  assert.equal(queryClient.getQueryState(oauthAccountQueryKeys.google()).isInvalidated, true);
  assert.equal(shouldRefreshAfterOAuthReturn('background', 'active', true), true);
  assert.equal(shouldRefreshAfterOAuthReturn('active', 'active', true), false);

  const unlinkBody = { currentPassword: null };
  let receivedBody;
  const unlinkResponse = { linked: false, provider: 'GOOGLE' };
  const options = createGoogleUnlinkMutationOptions({
    unlinkGoogle: async (body) => { receivedBody = body; return unlinkResponse; },
  });
  assert.equal(await options.mutationFn(unlinkBody), unlinkResponse);
  assert.equal(receivedBody, unlinkBody);
});

test('export query forwards AbortSignal and platform writers receive a JSON file', async () => {
  const signal = new AbortController().signal;
  const data = { likedMapImageIds: [10], user: { id: 1, username: 'pingdom' } };
  let receivedSignal;
  const query = createUserDataExportQueryOptions({
    getUserDataExport: async (value) => { receivedSignal = value; return data; },
  });

  assert.equal(await query.queryFn({ signal }), data);
  assert.equal(receivedSignal, signal);
  assert.deepEqual(query.queryKey, ['v2', 'users', 'me', 'export']);

  const writes = [];
  const artifact = await writeUserDataExport(
    data,
    async (json, fileName) => {
      writes.push({ fileName, json });
      return { fileName, uri: `file:///cache/${fileName}` };
    },
    new Date('2026-08-11T01:02:03.456Z'),
  );
  assert.equal(artifact.fileName, 'pingdom-user-data-2026-08-11T01-02-03-456Z.json');
  assert.equal(JSON.parse(writes[0].json).user.username, 'pingdom');
  assert.equal(serializeUserDataExport(data).endsWith('\n'), true);
  assert.match(createUserDataExportFileName(new Date('2026-08-11T00:00:00Z')), /\.json$/);

  const platformCalls = [];
  const writers = {
    native: async () => { platformCalls.push('native'); return artifact; },
    web: async () => { platformCalls.push('web'); return artifact; },
  };
  await writeUserDataExportForPlatform('web', '{}', 'export.json', writers);
  await writeUserDataExportForPlatform('native', '{}', 'export.json', writers);
  assert.deepEqual(platformCalls, ['web', 'native']);
});
