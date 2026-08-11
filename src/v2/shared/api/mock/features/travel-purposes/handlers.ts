import type { MockHandler } from '../../handlers';
import { travelPurposePreferenceFixture } from './fixtures';

const TRAVEL_PURPOSES_PATH = '/users/me/travel-purposes';

export const travelPurposeMockHandlers = [
  {
    method: 'GET',
    path: TRAVEL_PURPOSES_PATH,
    resolve: () => travelPurposePreferenceFixture,
  },
  {
    method: 'PUT',
    path: TRAVEL_PURPOSES_PATH,
    resolve: () => travelPurposePreferenceFixture,
  },
] satisfies readonly MockHandler[];
