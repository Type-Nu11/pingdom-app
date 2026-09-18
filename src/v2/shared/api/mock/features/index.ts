import { currentActivityIntentMockHandlers } from './current-activity-intent/handlers';
import { placeExplorationMockHandlers } from './place-exploration/handlers';
import { placeMenuMockHandlers } from './place-menus/handlers';
import { reservationMockHandlers } from './reservations/handlers';
import { reservationPaymentMockHandlers } from './reservation-payments/handlers';
import { travelPurposeMockHandlers } from './travel-purposes/handlers';
import { travelScheduleMockHandlers } from './travel-schedules/handlers';
import { visitorVerificationReportMockHandlers } from './visitor-verification-reports/handlers';
import { visitVerificationMockHandlers } from './visit-verification/handlers';

/** Remaining flat-feature handlers (#360). App injects migrated domain handlers via the registry. */
export const featureMockHandlers = [
  ...currentActivityIntentMockHandlers,
  ...reservationMockHandlers,
  ...reservationPaymentMockHandlers,
  ...travelPurposeMockHandlers,
  ...placeExplorationMockHandlers,
  ...placeMenuMockHandlers,
  ...travelScheduleMockHandlers,
  ...visitorVerificationReportMockHandlers,
  ...visitVerificationMockHandlers,
];
