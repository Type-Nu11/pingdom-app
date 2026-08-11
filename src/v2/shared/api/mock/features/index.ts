import { notificationMockHandlers } from './notifications/handlers';
import { travelPurposeMockHandlers } from './travel-purposes/handlers';

/** Register each feature's handlers here; feature fixtures stay beside their handlers. */
export const featureMockHandlers = [
  ...notificationMockHandlers,
  ...travelPurposeMockHandlers,
];
