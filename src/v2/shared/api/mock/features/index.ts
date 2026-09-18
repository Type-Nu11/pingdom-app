import { placeExplorationMockHandlers } from './place-exploration/handlers';
import { placeMenuMockHandlers } from './place-menus/handlers';
import { visitorVerificationReportMockHandlers } from './visitor-verification-reports/handlers';
import { visitVerificationMockHandlers } from './visit-verification/handlers';

/** Remaining flat-feature handlers (#360). App injects migrated domain handlers via the registry. */
export const featureMockHandlers = [
  ...placeExplorationMockHandlers,
  ...placeMenuMockHandlers,
  ...visitorVerificationReportMockHandlers,
  ...visitVerificationMockHandlers,
];
