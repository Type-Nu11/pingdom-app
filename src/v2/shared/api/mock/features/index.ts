import { accountMockHandlers } from './account/handlers';
import { notificationMockHandlers } from './notifications/handlers';
import { travelPurposeMockHandlers } from './travel-purposes/handlers';

/** Register each feature's handlers here; feature fixtures stay beside their handlers. */
export const featureMockHandlers = [
  ...accountMockHandlers,
  ...notificationMockHandlers,
  ...travelPurposeMockHandlers,
];
