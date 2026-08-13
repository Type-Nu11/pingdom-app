import type { ApiSchema } from '../../../contract';

export const travelScheduleFixture = {
  endDate: '2026-08-14',
  id: 1,
  startDate: '2026-08-12',
  status: 'UPCOMING',
} satisfies ApiSchema<'TravelScheduleResponse'>;

export const travelScheduleListFixture = {
  schedules: [travelScheduleFixture],
} satisfies ApiSchema<'TravelScheduleListResponse'>;
