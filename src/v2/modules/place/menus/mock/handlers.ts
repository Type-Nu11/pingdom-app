import type { MockHandler } from '../../../../shared/api/mock/handlers';
import { placeMenuFixture } from './fixtures';

export const placeMenuMockHandlers = [{
  method: 'GET',
  path: /^\/places\/\d+\/menus$/,
  resolve: ({ scenario }) => scenario === 'empty' ? [] : placeMenuFixture,
}] satisfies readonly MockHandler[];
