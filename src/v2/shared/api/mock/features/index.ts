import { accountMockHandlers } from './account/handlers';
import { currentActivityIntentMockHandlers } from './current-activity-intent/handlers';
import { placeExplorationMockHandlers } from './place-exploration/handlers';
import { notificationMockHandlers } from './notifications/handlers';
import { travelPurposeMockHandlers } from './travel-purposes/handlers';
import { travelScheduleMockHandlers } from './travel-schedules/handlers';
import { visitorVerificationReportMockHandlers } from './visitor-verification-reports/handlers';

/** Register each feature's handlers here; feature fixtures stay beside their handlers. */
export const featureMockHandlers = [
  ...accountMockHandlers,
  ...currentActivityIntentMockHandlers,
  ...notificationMockHandlers,
  ...travelPurposeMockHandlers,
  ...placeExplorationMockHandlers,
  ...travelScheduleMockHandlers,
  ...visitorVerificationReportMockHandlers,
];
