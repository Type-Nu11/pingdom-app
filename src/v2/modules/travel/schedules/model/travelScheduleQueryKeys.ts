import { userQueryKeys } from '../../purposes/model/travelPurposeQueryKeys';

export const travelScheduleQueryKeys = {
  all: [...userQueryKeys.me(), 'travel-schedules'] as const,
  list: () => [...travelScheduleQueryKeys.all, 'list'] as const,
};
