import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { renderWithProviders } from '../../../../../app/testing/testProviders';
import { ApiError } from '../../../../../shared/api/ApiError';
import CarRoutePreview from '../components/CarRoutePreview';
import { findCarRoute } from '../api/routesApi';
import { openNaverRoute } from '../services/openNaverRoute';
import type { NaverMapAdapterProps } from '../../native/components/NaverMapAdapter';

let mockMapProps: NaverMapAdapterProps;
const mockSaved = { places: [{ id: 2, name: 'Saved cafe', address: 'Cafe street', category: 'CAFE', latitude: 37.7, longitude: 127.2 }], isLoading: false, isError: false, hasNextPage: false, isFetchingNextPage: false, refetch: jest.fn(), fetchNextPage: jest.fn() };
jest.mock('../../../exploration', () => ({
  ...jest.requireActual('../../../exploration'),
  useBookmarkedPlaces: () => mockSaved,
  usePlaceAutocomplete: ({ keyword }: { keyword: string }) => ({
    data: { places: keyword === 'New place' ? [{ id: 3, name: 'New place', address: 'New street', category: 'FOOD', latitude: 37.9, longitude: 127.4 }] : [] },
    isLoading: false, isError: false, refetch: jest.fn(),
  }),
}));
jest.mock('../../native/components/NaverMapAdapter', () => ({ __esModule: true, default: (props: NaverMapAdapterProps) => {
  mockMapProps = props;
  const { View } = require('react-native');
  return <View testID="route-map" />;
} }));
jest.mock('../api/routesApi', () => ({ findCarRoute: jest.fn() }));
jest.mock('../services/openNaverRoute', () => ({ openNaverRoute: jest.fn(async () => 'opened') }));
const destination = { placeId: 1, name: '목적지', latitude: 37.6, longitude: 127.1 };
const location = { status: 'granted' as const, canAskAgain: true as const, coordinate: { lat: 37.5, lng: 127 } };
const route = { path: [{ lat: 37.501, lng: 127.001 }, { lat: 37.8, lng: 127.3 }, { lat: 37.601, lng: 127.101 }], distanceMeters: 12500, durationSeconds: 1800 };
const props = { destination, location, onClose: jest.fn(), onRefreshLocation: jest.fn() };

beforeEach(() => { jest.mocked(findCarRoute).mockReset(); jest.mocked(openNaverRoute).mockClear(); });

test.each(['ko', 'en'] as const)('shows full server path, endpoints and real summary in %s', async language => {
  jest.mocked(findCarRoute).mockResolvedValue(route);
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language });
  expect(findCarRoute).not.toHaveBeenCalled();
  await fireEvent(screen.getByTestId('route-map').parent!, 'layout', { nativeEvent: { layout: { width: 390, height: 400 } } });
  await user.press(screen.getByTestId('route-request'));
  await waitFor(() => expect(mockMapProps.routeCoordinates).toEqual(route.path));
  expect(mockMapProps.markers.map(p => p.id)).toEqual(['route-destination']);
  expect(mockMapProps.userCoordinate).toEqual(location.coordinate);
  expect(screen.getByLabelText(language === 'ko' ? '12.5 km · 예상 30분' : '12.5 km · Estimated 30 min')).toBeVisible();
  expect(mockMapProps.zoomLevel).toBeLessThan(14);
  const firstRevision = mockMapProps.cameraRevision!;
  await act(() => mockMapProps.onCameraGesture?.());
  await user.press(screen.getByRole('button', { name: language === 'ko' ? '전체 경로 보기' : 'Show entire route' }));
  expect(mockMapProps.cameraRevision).toBeGreaterThan(firstRevision);
});

test('gesture during a pending request prevents camera jump and cancellation clears route', async () => {
  let resolve!: (value: typeof route) => void;
  jest.mocked(findCarRoute).mockImplementation(() => new Promise(yes => { resolve = yes; }));
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await fireEvent(screen.getByTestId('route-map').parent!, 'layout', { nativeEvent: { layout: { width: 390, height: 400 } } });
  await user.press(screen.getByTestId('route-request'));
  const previous = mockMapProps.center;
  await act(() => mockMapProps.onCameraGesture?.());
  await act(async () => resolve(route));
  expect(mockMapProps.routeCoordinates).toEqual(route.path);
  expect(mockMapProps.center).toEqual(previous);
  await user.press(screen.getByRole('tab', { name: 'Walk' }));
  await user.press(screen.getByRole('tab', { name: 'Car' }));
  await user.press(screen.getByTestId('route-request'));
  expect(mockMapProps.routeCoordinates).toBeUndefined();
  await user.press(screen.getByRole('button', { name: 'Cancel request' }));
  const signal = jest.mocked(findCarRoute).mock.calls[1][2];
  expect(signal.aborted).toBe(true);
  await act(async () => resolve(route));
  expect(mockMapProps.routeCoordinates).toBeUndefined();
  expect(screen.getByText('Route request canceled.')).toBeVisible();
});

test('walk/transit use external navigation and never invoke car API', async () => {
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  for (const [label, mode] of [['Walk', 'walk'], ['Transit', 'transit']]) {
    await user.press(screen.getByRole('tab', { name: label }));
    expect(screen.getByText('Use the NAVER Map app for this travel mode.')).toBeVisible();
    expect(screen.queryByTestId('route-request')).toBeNull();
    await user.press(screen.getByTestId('route-external'));
    expect(openNaverRoute).toHaveBeenLastCalledWith(destination, expect.objectContaining({ latitude: 37.5, longitude: 127 }), mode);
  }
  expect(findCarRoute).not.toHaveBeenCalled();
});

test('permission denial allows external origin omission and settings recovery', async () => {
  const refresh = jest.fn();
  const { user } = await renderWithProviders(<CarRoutePreview {...props} onRefreshLocation={refresh}
    location={{ status: 'denied', coordinate: null, canAskAgain: false }} />, { language: 'en' });
  expect(screen.getByTestId('route-request')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Open location permission settings' })).toBeVisible();
  await user.press(screen.getByRole('button', { name: 'Check current location again' }));
  expect(refresh).toHaveBeenCalledTimes(1);
  await user.press(screen.getByTestId('route-external'));
  expect(openNaverRoute).toHaveBeenCalledWith(destination, null, 'car');
  expect(findCarRoute).not.toHaveBeenCalled();
});

test('missing destination prevents internal and external requests', async () => {
  await renderWithProviders(<CarRoutePreview {...props} destination={{ ...destination, latitude: undefined }} />, { language: 'en' });
  expect(screen.getByText('Destination coordinates are missing.')).toBeVisible();
  expect(screen.getByTestId('route-request')).toBeDisabled();
  expect(screen.getByTestId('route-external')).toBeDisabled();
});

test('503 is an unavailable state with no geometry or automatic retry; external remains usable', async () => {
  jest.mocked(findCarRoute).mockRejectedValue(new ApiError('private message', { status: 503 }));
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await user.press(screen.getByTestId('route-request'));
  await screen.findByText('Route service is currently unavailable. Use the NAVER Map app.');
  expect(screen.queryByText('private message')).toBeNull();
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  expect(mockMapProps.routeCoordinates).toBeUndefined();
  expect(screen.getByTestId('route-external')).toBeEnabled();
});

test('external app absence is separate from route lookup error', async () => {
  jest.mocked(openNaverRoute).mockResolvedValueOnce('not-installed');
  const alert = jest.spyOn(Alert, 'alert');
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await user.press(screen.getByTestId('route-external'));
  expect(alert).toHaveBeenCalledWith('Please install the NAVER Map app.');
  expect(findCarRoute).not.toHaveBeenCalled();
});

test('invalid live origin offers location recovery and never requests a route', async () => {
  const onRefreshLocation = jest.fn();
  const { user } = await renderWithProviders(<CarRoutePreview {...props} onRefreshLocation={onRefreshLocation}
    location={{ ...location, coordinate: { lat: NaN, lng: 127 } }} />, { language: 'en' });
  expect(screen.getByText('Could not get your current location. Try again.')).toBeVisible();
  expect(screen.getByTestId('route-request')).toBeDisabled();
  await user.press(screen.getByRole('button', { name: 'Check current location again' }));
  expect(onRefreshLocation).toHaveBeenCalledTimes(1);
  expect(mockMapProps.logoTopMargin).toBe(16);
  expect(findCarRoute).not.toHaveBeenCalled();
});


test.each(['light', 'dark'] as const)('Figma sheet uses icon tabs, real result values and a projected bubble in %s', async colorScheme => {
  jest.mocked(findCarRoute).mockResolvedValue(route);
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, {
    language: 'en', colorScheme, appearancePreference: colorScheme === 'dark' ? 'DARK' : 'LIGHT',
  });
  expect(screen.getAllByRole('tab').map(tab => tab.props.accessibilityLabel)).toEqual(['Transit', 'Walk', 'Car', 'Bicycle']);
  expect(screen.getByRole('tab', { name: 'Car' }).props.accessibilityState).toEqual({ selected: true });
  expect(screen.getByRole('header', { name: 'Route' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Share place' })).toBeVisible();
  expect(screen.getByTestId('route-planner-sheet')).toHaveStyle({ left: 8, right: 8 });
  await fireEvent(screen.getByTestId('route-map').parent!, 'layout', { nativeEvent: { layout: { width: 402, height: 874 } } });
  await user.press(screen.getByTestId('route-request'));
  await waitFor(() => expect(mockMapProps.routeCoordinates).toEqual(route.path));
  expect(screen.getByText('30 min')).toHaveStyle({ fontSize: 28 });
  expect(screen.getByText('Start opens the NAVER Map app')).toBeVisible();
  expect(screen.queryByText('Recommended', { includeHiddenElements: true })).toBeNull();
  await act(() => mockMapProps.onRouteAnchor?.({ x: 100, y: 250 }));
  expect(screen.getByText('Recommended', { includeHiddenElements: true })).toBeOnTheScreen();
  expect(screen.getAllByText('30 min', { includeHiddenElements: true })).toHaveLength(2);
  await act(() => mockMapProps.onCameraGesture?.());
  expect(screen.queryByText('Recommended', { includeHiddenElements: true })).toBeNull();
  await user.press(screen.getByTestId('route-external'));
  expect(openNaverRoute).toHaveBeenLastCalledWith(destination, expect.anything(), 'car');
  expect(findCarRoute).toHaveBeenCalledTimes(1);
});

test('swap clears pending geometry, drops late response and uses reversed endpoints in both route actions', async () => {
  let resolve!: (value: typeof route) => void;
  jest.mocked(findCarRoute).mockImplementationOnce(() => new Promise(yes => { resolve = yes; })).mockResolvedValue(route);
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await user.press(screen.getByTestId('route-request'));
  const firstSignal = jest.mocked(findCarRoute).mock.calls[0][2];
  await fireEvent(screen.getByTestId('route-destination-row'), 'accessibilityAction', { nativeEvent: { actionName: 'swap' } });
  expect(firstSignal.aborted).toBe(true);
  await act(async () => resolve(route));
  expect(mockMapProps.routeCoordinates).toBeUndefined();
  expect(mockMapProps.userCoordinate).toEqual(location.coordinate);
  await user.press(screen.getByTestId('route-request'));
  expect(findCarRoute).toHaveBeenLastCalledWith(destination, expect.objectContaining({ latitude: 37.5, longitude: 127 }), expect.anything());
  await screen.findByText('30 min');
  await user.press(screen.getByTestId('route-external'));
  expect(openNaverRoute).toHaveBeenLastCalledWith(expect.objectContaining({ latitude: 37.5, longitude: 127 }), destination, 'car');
});

test.each(['light', 'dark'] as const)('tap opens Figma place editor and saved selection changes the real destination in %s', async colorScheme => {
  jest.mocked(findCarRoute).mockResolvedValue(route);
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en', colorScheme, appearancePreference: colorScheme === 'dark' ? 'DARK' : 'LIGHT' });
  await user.press(screen.getByTestId('route-destination-row'));
  expect(screen.getByTestId('route-endpoint-editor')).toBeVisible();
  expect(screen.queryByRole('tab', { name: 'Car' })).toBeNull();
  expect(screen.getByLabelText('Search places')).toBeVisible();
  expect(screen.getByText('Saved places')).toBeVisible();
  expect(screen.getByText('Recent searches')).toBeVisible();
  await user.press(screen.getByRole('button', { name: 'Saved cafe' }));
  expect(screen.queryByTestId('route-endpoint-editor')).toBeNull();
  await user.press(screen.getByTestId('route-request'));
  expect(findCarRoute).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ placeId: 2, latitude: 37.7, longitude: 127.2 }), expect.anything());
});

test('search result edits origin, and changing both endpoints permits routes without GPS permission', async () => {
  jest.mocked(findCarRoute).mockResolvedValue(route);
  const { user } = await renderWithProviders(<CarRoutePreview {...props} location={{ status: 'denied', coordinate: null, canAskAgain: false }} />, { language: 'en' });
  await user.press(screen.getByTestId('route-origin-row'));
  await fireEvent.changeText(screen.getByTestId('route-endpoint-search'), 'New place');
  await user.press(await screen.findByText('New place'));
  expect(screen.getByTestId('route-request')).toBeEnabled();
  await user.press(screen.getByTestId('route-request'));
  expect(findCarRoute).toHaveBeenLastCalledWith(expect.objectContaining({ latitude: 37.9, longitude: 127.4 }), destination, expect.anything());
});

test('map confirmation uses the native camera coordinate and keeps user GPS separate', async () => {
  jest.mocked(findCarRoute).mockResolvedValue(route);
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await user.press(screen.getByTestId('route-origin-row'));
  await user.press(screen.getByRole('button', { name: 'Select on map' }));
  await act(() => mockMapProps.onCameraIdle?.({ lat: 36.9, lng: 126.9 }));
  await user.press(screen.getByTestId('route-map-confirm'));
  await user.press(screen.getByTestId('route-request'));
  expect(findCarRoute).toHaveBeenLastCalledWith(expect.objectContaining({ latitude: 36.9, longitude: 126.9 }), destination, expect.anything());
  expect(mockMapProps.userCoordinate).toEqual(location.coordinate);
});

test('long press without crossing a row does not edit or swap endpoints', async () => {
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await fireEvent(screen.getByTestId('route-origin-row'), 'longPress');
  await fireEvent.press(screen.getByTestId('route-origin-row'));
  expect(screen.queryByTestId('route-endpoint-editor')).toBeNull();
  await user.press(screen.getByTestId('route-external'));
  expect(openNaverRoute).toHaveBeenLastCalledWith(destination, expect.objectContaining({ latitude: 37.5, longitude: 127 }), 'car');
});
