import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { placeExplorationApi, type MapViewport } from '../../../exploration';
import { usePlaceMap } from '../usePlaceSearch';

test('moving the map retains previous markers until the new viewport resolves', async () => {
  const previous: MapViewport = {
    mode: 'MARKERS', zoom: 17, truncated: false, clusters: [],
    markers: [{ placeId: 17, name: 'Place', category: 'CAFE', imageUrl: null, latitude: 37.5, longitude: 127, photoCount: 0 }],
  };
  let finishRequest!: (value: MapViewport) => void;
  jest.spyOn(placeExplorationApi, 'getMapViewport')
    .mockResolvedValueOnce(previous)
    .mockImplementationOnce(() => new Promise(resolve => { finishRequest = resolve; }));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const viewport = { west: 126.9, south: 37.4, east: 127.1, north: 37.6, zoom: 17 };
  const view = await renderHook(({ west }: { west: number }) => usePlaceMap({ ...viewport, west }), { initialProps: { west: 126.9 }, wrapper });
  await waitFor(() => expect(view.result.current.data).toEqual(previous));
  await view.rerender({ west: 126.91 });
  expect(view.result.current.isFetching).toBe(true);
  expect(view.result.current.data).toEqual(previous);
  const next: MapViewport = { mode: 'MARKERS', zoom: 17, truncated: false, markers: [], clusters: [] };
  await act(async () => { finishRequest(next); });
  await waitFor(() => expect(view.result.current.data).toEqual(next));
  await view.unmount();
  client.clear();
});
