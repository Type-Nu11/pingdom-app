import type { MockHandler } from '../../handlers';
import {
  googleLinkStartFixture,
  googleUnlinkedFixture,
  userDataExportFixture,
} from './fixtures';

export const accountMockHandlers = [
  {
    method: 'POST',
    path: /^\/auth\/(?:password-reset\/(?:request|confirm)|email\/resend|logout)$/,
    resolve: () => undefined,
  },
  {
    method: 'POST',
    path: '/users/me/oauth-accounts/google/link',
    resolve: () => googleLinkStartFixture,
  },
  {
    method: 'DELETE',
    path: '/users/me/oauth-accounts/google',
    resolve: () => googleUnlinkedFixture,
  },
  {
    method: 'GET',
    path: '/users/me/export',
    resolve: () => userDataExportFixture,
  },
] satisfies readonly MockHandler[];
