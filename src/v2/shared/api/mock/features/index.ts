import { accountMockHandlers } from './account/handlers';
import { travelPurposeMockHandlers } from './travel-purposes/handlers';
import { travelScheduleMockHandlers } from './travel-schedules/handlers';

/** Register each feature's handlers here; feature fixtures stay beside their handlers. */
export const featureMockHandlers = [
  ...accountMockHandlers,
  ...travelPurposeMockHandlers,
  ...travelScheduleMockHandlers,
];
