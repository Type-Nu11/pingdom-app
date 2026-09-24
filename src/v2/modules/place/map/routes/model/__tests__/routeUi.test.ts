import {
  hasRouteDestinationCoordinates,
  selectRouteUiState,
  type RouteDestination,
} from '../routeUi';

const destination: RouteDestination = {
  latitude: 35.677,
  longitude: 128.465,
  name: '대성반점',
  placeId: 17,
};

describe('route UI state', () => {
  test('missing and invalid destination coordinates are rejected before route state', () => {
    for (const coordinates of [
      { latitude: null, longitude: 128.465 },
      { latitude: Number.NaN, longitude: 128.465 },
      { latitude: 91, longitude: 128.465 },
      { latitude: 35.677, longitude: -181 },
    ]) {
      const invalid = { ...destination, ...coordinates };
      expect(hasRouteDestinationCoordinates(invalid)).toBe(false);
      expect(selectRouteUiState({ destination: invalid, location: { status: 'granted' } })).toEqual({ kind: 'missing-destination' });
    }
    expect(hasRouteDestinationCoordinates(destination)).toBe(true);
  });

  test('loading and denied location have explicit states', () => {
    expect(selectRouteUiState({ destination, location: { status: 'loading' } })).toEqual({ kind: 'loading' });
    expect(selectRouteUiState({ destination, location: { status: 'denied' } })).toEqual({ kind: 'location-denied' });
  });

  test('no route provider never creates an estimated time', () => {
    expect(selectRouteUiState({ destination, location: { status: 'granted' } })).toEqual({ kind: 'unavailable' });
    expect(selectRouteUiState({ destination, location: { status: 'failed' } })).toEqual({ kind: 'unavailable' });
  });

  test('only a supplied preview can show a ready route', () => {
    const preview = { arrival: '14:40', distance: '12km', duration: '38분', meta: '1회 환승' };
    expect(selectRouteUiState({ destination, location: { status: 'granted' }, preview })).toEqual({ kind: 'ready', preview });
    expect(selectRouteUiState({ destination, location: { status: 'denied' }, preview })).toEqual({ kind: 'location-denied' });
    expect(selectRouteUiState({ destination, location: { status: 'failed' }, preview })).toEqual({ kind: 'unavailable' });
  });
});
