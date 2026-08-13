import type { ApiSchema } from '../../../contract';
import type { MockHandler } from '../../handlers';
import { travelScheduleFixture, travelScheduleListFixture } from './fixtures';

const TRAVEL_SCHEDULES_PATH = '/users/me/travel-schedules';

function scheduleWithPeriod(body: unknown) {
  const period = body as
    | ApiSchema<'TravelScheduleCreateRequest'>
    | ApiSchema<'TravelScheduleUpdateRequest'>;

  return {
    ...travelScheduleFixture,
    endDate: period.endDate,
    startDate: period.startDate,
  };
}

export const travelScheduleMockHandlers = [
  {
    method: 'GET',
    path: TRAVEL_SCHEDULES_PATH,
    resolve: ({ scenario }) => scenario === 'empty'
      ? { schedules: [] }
      : travelScheduleListFixture,
  },
  {
    method: 'POST',
    path: TRAVEL_SCHEDULES_PATH,
    resolve: ({ body }) => scheduleWithPeriod(body),
  },
  {
    method: 'PATCH',
    path: /^\/users\/me\/travel-schedules\/\d+$/,
    resolve: ({ body }) => scheduleWithPeriod(body),
  },
  {
    method: 'POST',
    path: /^\/users\/me\/travel-schedules\/\d+\/cancel$/,
    resolve: () => ({ ...travelScheduleFixture, status: 'CANCELLED' }),
  },
] satisfies readonly MockHandler[];
