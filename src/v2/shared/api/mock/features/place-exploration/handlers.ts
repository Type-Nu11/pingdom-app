import type { MockHandler } from '../../handlers';
import {
  emptyPlaceExplorationFixtures,
  explorationMediaFixture,
  livePlaceDetailFixture,
  mapViewportFixture,
  operatingNoticesFixture,
  placeAutocompleteFixture,
  placeCardFixture,
  placeReviewPageFixture,
  placeReviewFixture,
  recommendationExplanationFixture,
  verificationMediaFixture,
  visitDecisionFixture,
} from './fixtures';

export const placeExplorationMockHandlers = [
  {
    method: 'GET',
    path: /^\/places\/\d+$/,
    resolve: () => livePlaceDetailFixture,
  },
  {
    method: 'GET',
    path: /^\/places\/\d+\/media\/exploration$/,
    resolve: ({ scenario }) => scenario === 'empty'
      ? emptyPlaceExplorationFixtures.explorationMedia
      : explorationMediaFixture,
  },
  {
    method: 'GET',
    path: '/places/autocomplete',
    resolve: ({ scenario }) => scenario === 'empty'
      ? emptyPlaceExplorationFixtures.autocomplete
      : placeAutocompleteFixture,
  },
  {
    method: 'GET',
    path: '/places/map',
    resolve: ({ scenario }) =>
      scenario === 'empty' ? emptyPlaceExplorationFixtures.mapViewport : mapViewportFixture,
  },
  {
    method: 'GET',
    path: /^\/places\/\d+\/card$/,
    resolve: () => placeCardFixture,
  },
  {
    method: 'GET',
    path: /^\/places\/\d+\/visit-decision$/,
    resolve: ({ scenario }) =>
      scenario === 'empty' ? emptyPlaceExplorationFixtures.visitDecision : visitDecisionFixture,
  },
  {
    method: 'GET',
    path: /^\/places\/\d+\/operating-notices$/,
    resolve: ({ scenario }) => scenario === 'empty'
      ? emptyPlaceExplorationFixtures.operatingNotices
      : operatingNoticesFixture,
  },
  {
    method: 'GET',
    path: /^\/places\/\d+\/media\/verification$/,
    resolve: ({ scenario }) => scenario === 'empty'
      ? emptyPlaceExplorationFixtures.verificationMedia
      : verificationMediaFixture,
  },
  {
    method: 'GET',
    path: /^\/places\/recommendations\/[^/]+\/explanation$/,
    resolve: ({ scenario }) => scenario === 'empty'
      ? emptyPlaceExplorationFixtures.recommendationExplanation
      : recommendationExplanationFixture,
  },
  {
    method: 'GET',
    path: /^\/places\/\d+\/reviews$/,
    resolve: ({ scenario }) => scenario === 'empty'
      ? emptyPlaceExplorationFixtures.reviewPage
      : placeReviewPageFixture,
  },
  {
    method: 'POST',
    path: /^\/places\/\d+\/reviews$/,
    resolve: ({ body }) => ({ ...placeReviewFixture, ...(body as object) }),
  },
  {
    method: 'POST',
    path: /^\/places\/\d+\/map-link-conversions$/,
    resolve: () => undefined,
  },
] satisfies readonly MockHandler[];
