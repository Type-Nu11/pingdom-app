import { currentActivityIntentMockHandlers } from './current-activity-intent/handlers';
import { accountMockHandlers } from './account/handlers';
import { placeExplorationMockHandlers } from './place-exploration/handlers';
import { notificationMockHandlers } from './notifications/handlers';
import { travelPurposeMockHandlers } from './travel-purposes/handlers';
import { travelScheduleMockHandlers } from './travel-schedules/handlers';

/** Register each feature's handlers here; feature fixtures stay beside their handlers. */
export const featureMockHandlers = [
  ...currentActivityIntentMockHandlers,
  ...accountMockHandlers,
  ...notificationMockHandlers,
  ...travelPurposeMockHandlers,
  ...placeExplorationMockHandlers,
  ...travelScheduleMockHandlers,
];
