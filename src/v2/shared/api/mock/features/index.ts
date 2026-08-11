import { placeExplorationMockHandlers } from './place-exploration/handlers';
import { travelPurposeMockHandlers } from './travel-purposes/handlers';

/** Register each feature's handlers here; feature fixtures stay beside their handlers. */
export const featureMockHandlers = [
  ...travelPurposeMockHandlers,
  ...placeExplorationMockHandlers,
];
