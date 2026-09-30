import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../../../app/testing/testProviders';
import RoutePlannerScreen from '../RoutePlannerScreen';
import { env } from '../../../../../../shared/config';
import MapCanvas from '../../../native/components/MapCanvas';
import { openNaverRoute } from '../../services/openNaverRoute';

jest.mock('../../../../../../shared/config', () => ({ ...jest.requireActual('../../../../../../shared/config'), env: { ...jest.requireActual('../../../../../../shared/config').env } }));
jest.mock('../../../native/components/MapCanvas', () => ({ __esModule: true, default: jest.fn(() => null) }));
jest.mock('../../services/openNaverRoute', () => ({ openNaverRoute: jest.fn(async () => 'opened') }));
jest.mock('../../../location/hooks/useCurrentLocation', () => ({ useCurrentLocation: () => ({ status: 'denied', coordinate: null, refresh: jest.fn() }) }));
jest.mock('../../components/RoutePlacePicker', () => ({ __esModule: true, default: ({ onSelect }: any) => {
  const { Pressable, Text } = require('react-native');
  return <Pressable onPress={() => onSelect({ placeId: 11, name: '선택 출발지', latitude: 37.56, longitude: 126.97 })}><Text>pick-origin</Text></Pressable>;
} }));
const destination = { placeId: 22, name: '목적지', latitude: 37.57, longitude: 126.98 };
const canvas = () => (MapCanvas as jest.Mock).mock.calls.at(-1)[0];
async function renderScreen() {
  return renderWithProviders(<RoutePlannerScreen navigation={{ goBack: jest.fn() }} route={{ params: { destination } }} />, { language: 'ko' });
}
test('manual start works without location permission and swap preserves both coordinates', async () => {
  const { user } = await renderScreen();
  await user.press(screen.getAllByText('출발')[0]);
  await user.press(screen.getByText('pick-origin'));
  expect(screen.queryByTestId('route-location-denied')).toBeNull();
  await user.press(screen.getAllByRole('button', { name: '출발지와 도착지 바꾸기' })[0]);
  await user.press(screen.getByText('네이버 지도에서 길찾기'));
  expect(openNaverRoute).toHaveBeenCalledWith(expect.objectContaining({ placeId: 11, latitude: 37.56 }), destination, 'transit');
});
test('sample route uses fixed endpoints, clears on empty result, and restores actual destination on exit', async () => {
  const { user } = await renderScreen();
  expect(screen.queryByText('예시 경로 보기')).toBeNull();
  await user.longPress(screen.getByRole('header', { name: '경로' }));
  await user.press(screen.getByText('예시 경로 보기'));
  await waitFor(() => expect(canvas().routeCoordinates).toHaveLength(5));
  expect(screen.queryByText('네이버 지도에서 길찾기')).toBeNull();
  await user.press(screen.getByText('예시: 경로 없음'));
  await waitFor(() => expect(canvas().routeCoordinates).toEqual([]));
  await user.press(screen.getByText('예시 종료'));
  expect(screen.getByText('목적지')).toBeTruthy();
  expect(canvas().routeCoordinates).toEqual([]);
});
test('production environment never exposes development route controls', async () => {
  const oldEnvironment = env.appEnvironment;
  (env as any).appEnvironment = 'production';
  try {
    await renderScreen();
    expect(screen.queryByText('예시 경로 보기')).toBeNull();
    expect(canvas().routeCoordinates).toEqual([]);
  } finally { (env as any).appEnvironment = oldEnvironment; }
});
