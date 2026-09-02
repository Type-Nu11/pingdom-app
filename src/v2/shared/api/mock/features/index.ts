import { accountMockHandlers } from './account/handlers';
import { currentActivityIntentMockHandlers } from './current-activity-intent/handlers';
import { placeExplorationMockHandlers } from './place-exploration/handlers';
import { notificationMockHandlers } from './notifications/handlers';
import { reservationPaymentMockHandlers } from './reservation-payments/handlers';
import { scoutProfileMockHandlers } from './scout-profile/handlers';
import { travelPurposeMockHandlers } from './travel-purposes/handlers';
import { travelScheduleMockHandlers } from './travel-schedules/handlers';
import { visitorVerificationReportMockHandlers } from './visitor-verification-reports/handlers';
import { visitVerificationMockHandlers } from './visit-verification/handlers';

/** Register each feature's handlers here; feature fixtures stay beside their handlers. */
export const featureMockHandlers = [
  ...accountMockHandlers,
  ...currentActivityIntentMockHandlers,
  ...notificationMockHandlers,
  ...reservationPaymentMockHandlers,
  ...scoutProfileMockHandlers,
  ...travelPurposeMockHandlers,
  ...placeExplorationMockHandlers,
  ...travelScheduleMockHandlers,
  ...visitorVerificationReportMockHandlers,
  ...visitVerificationMockHandlers,
];
