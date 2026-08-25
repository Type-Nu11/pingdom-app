import { renderHook } from '@testing-library/react-native';

import { usePlaceList } from '../../../../v2/features/place-exploration';
import { usePlaces } from '../usePlaces';

jest.mock('../../../../v2/features/place-exploration', () => ({
  ...jest.requireActual('../../../../v2/features/place-exploration'),
  usePlaceList: jest.fn(),
}));

const query = (overrides: Record<string, unknown> = {}) => ({
  data: undefined,
  error: null,
  isError: false,
  isLoading: false,
  refetch: jest.fn(),
  ...overrides,
}) as never;

describe('usePlaces migration adapter', () => {
  test('disabled runtime state reaches the V2 query without issuing fallback places', async () => {
    jest.mocked(usePlaceList).mockReturnValue(query());

    const { result } = await renderHook(() => usePlaces({}, false));

    expect(usePlaceList).toHaveBeenLastCalledWith(
      { limit: 100, page: 1 },
      { enabled: false },
    );
    expect(result.current).toMatchObject({
      enabled: false,
      markers: [],
      places: [],
      status: 'disabled',
    });
  });

  test('normal GET /places response is mapped into the existing map adapter state', async () => {
    jest.mocked(usePlaceList).mockReturnValue(query({
      data: {
        places: [{
          address: '서울 테스트로 17',
          category: 'CAFE',
          distanceMeters: 120,
          id: 17,
          latitude: 37.5,
          longitude: 127,
          name: '서버 카페',
        }],
      },
    }));

    const { result } = await renderHook(() => usePlaces({ keyword: ' cafe ' }, true));

    expect(usePlaceList).toHaveBeenLastCalledWith(
      { keyword: ' cafe ', limit: 100, page: 1 },
      { enabled: true },
    );
    expect(result.current.status).toBe('ready');
    expect(result.current.places[0]).toMatchObject({ id: 17, name: '서버 카페' });
    expect(result.current.markers[0]).toMatchObject({ id: '17', lat: 37.5, lng: 127 });
  });
});
