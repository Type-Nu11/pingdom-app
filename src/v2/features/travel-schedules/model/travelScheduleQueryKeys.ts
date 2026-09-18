import { userQueryKeys } from '../../../modules/travel';

export const travelScheduleQueryKeys = {
  all: [...userQueryKeys.me(), 'travel-schedules'] as const,
  list: () => [...travelScheduleQueryKeys.all, 'list'] as const,
};
