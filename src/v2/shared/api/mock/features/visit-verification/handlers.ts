import type { MockHandler } from '../../handlers';
import {
  visitVerificationCompletedFixture,
  visitVerificationExistingFixture,
  visitVerificationExpiredFixture,
  visitVerificationProgressFixture,
  visitVerificationProximityLostFixture,
  visitVerificationRejectedFixture,
  visitVerificationStartedFixture,
} from './fixtures';

let observationCount = 0;

export const visitVerificationMockHandlers = [
  {
    method: 'POST',
    path: '/visit-verification-sessions',
    resolve: ({ scenario }) => {
      observationCount = 0;
      if (scenario === 'empty') return visitVerificationExistingFixture;
      return visitVerificationStartedFixture;
    },
  },
  {
    method: 'POST',
    path: /^\/visit-verification-sessions\/\d+\/observations$/,
    resolve: ({ scenario }) => {
      if (scenario === 'empty') return visitVerificationProximityLostFixture;
      if (scenario === 'expired') return visitVerificationExpiredFixture;
      if (scenario === 'forbidden') return visitVerificationRejectedFixture;
      observationCount += 1;
      return observationCount === 1
        ? visitVerificationProgressFixture
        : visitVerificationCompletedFixture;
    },
  },
] satisfies readonly MockHandler[];
