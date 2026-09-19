import { placeExplorationMockHandlers, placeMenuMockHandlers, visitorVerificationReportMockHandlers, visitVerificationMockHandlers } from '../modules/place/mock';
import { currentActivityIntentMockHandlers, travelPurposeMockHandlers, travelScheduleMockHandlers } from '../modules/travel/mock';
import { bookingMockHandlers } from '../modules/booking/mock';
import { accountMockHandlers, notificationMockHandlers, scoutProfileMockHandlers } from '../modules/user/mock';
import { configureDomainMockHandlers } from '../shared/api/mock/registry';

configureDomainMockHandlers([
  ...bookingMockHandlers,
  ...accountMockHandlers,
  ...notificationMockHandlers,
  ...scoutProfileMockHandlers,
  ...currentActivityIntentMockHandlers,
  ...travelPurposeMockHandlers,
  ...placeExplorationMockHandlers,
  ...placeMenuMockHandlers,
  ...travelScheduleMockHandlers,
  ...visitorVerificationReportMockHandlers,
  ...visitVerificationMockHandlers,
]);
