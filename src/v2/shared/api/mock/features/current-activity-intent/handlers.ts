import type { MockHandler } from '../../handlers';
import {
  currentActivityIntentFixture,
  emptyCurrentActivityIntentFixture,
} from './fixtures';

const CURRENT_ACTIVITY_INTENT_PATH = '/users/me/current-activity-intent';

export const currentActivityIntentMockHandlers = [
  {
    method: 'GET',
    path: CURRENT_ACTIVITY_INTENT_PATH,
    resolve: ({ scenario }) => scenario === 'empty'
      ? emptyCurrentActivityIntentFixture
      : currentActivityIntentFixture,
  },
  {
    method: 'PUT',
    path: CURRENT_ACTIVITY_INTENT_PATH,
    resolve: ({ body }) => ({
      expiresAt: currentActivityIntentFixture.expiresAt,
      intent: (body as { intent: typeof currentActivityIntentFixture.intent }).intent,
    }),
  },
  {
    method: 'DELETE',
    path: CURRENT_ACTIVITY_INTENT_PATH,
    resolve: () => undefined,
  },
] satisfies readonly MockHandler[];
