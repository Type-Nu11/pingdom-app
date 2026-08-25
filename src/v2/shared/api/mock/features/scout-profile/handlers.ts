import { ApiError } from '../../../ApiError';
import type { components } from '../../../generated/scoutProfile';
import type { MockHandler } from '../../handlers';
import { pendingScoutProfileFixture, scoutProfileFixture } from './fixtures';

type ScoutProfileRequest = components['schemas']['ScoutProfileRequest'];

const SCOUT_PROFILE_PATH = '/users/me/scout-profile';

function notFound(): never {
  throw new ApiError('Scout 프로필을 찾을 수 없습니다.', {
    code: 'SCOUT_PROFILE_NOT_FOUND',
    status: 404,
  });
}

function responseWithBody(body: ScoutProfileRequest) {
  return {
    ...pendingScoutProfileFixture,
    displayName: body.displayName,
    introduction: body.introduction ?? null,
  };
}

export const scoutProfileMockHandlers = [
  {
    method: 'GET',
    path: SCOUT_PROFILE_PATH,
    resolve: ({ scenario }) => scenario === 'empty' ? notFound() : scoutProfileFixture,
  },
  {
    method: 'POST',
    path: SCOUT_PROFILE_PATH,
    resolve: ({ body }) => responseWithBody(body as ScoutProfileRequest),
  },
  {
    method: 'PUT',
    path: SCOUT_PROFILE_PATH,
    resolve: ({ body, scenario }) => scenario === 'empty'
      ? notFound()
      : {
          ...scoutProfileFixture,
          displayName: (body as ScoutProfileRequest).displayName,
          introduction: (body as ScoutProfileRequest).introduction ?? null,
        },
  },
] satisfies readonly MockHandler[];
