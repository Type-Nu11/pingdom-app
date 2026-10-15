import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../../app/testing/testProviders';
import { WalkRouteResult } from '../components/WalkRouteResult';
import { TransitRouteResult } from '../components/TransitRouteResult';
import { mapTransitRouteResponse } from '../api/transitRoutesApi';
import { transitResponse } from './transitFixture';

test('walk design renders supplied presentation facts and its start action', async () => {
  const onStart = jest.fn();
  const { user } = await renderWithProviders(<WalkRouteResult summary={{ duration: '2시간 51분', arrival: '17:13 도착',
    distance: '12.3km', steps: '약 17,400걸음', slope: '오르막 적음',
    tags: [{ label: '도보 거리가 길어요', warning: true }, { label: '계단 없음' }] }} onStart={onStart} />, { language: 'ko' });
  expect(screen.getByText('2시간 51분')).toBeVisible();
  expect(screen.getByText('약 17,400걸음 · 오르막 적음')).toBeVisible();
  expect(screen.getByText('도보 거리가 길어요')).toBeVisible();
  await user.press(screen.getByRole('button', { name: '앱에서 경로 따라가기' }));
  expect(onStart).toHaveBeenCalledTimes(1);
});

test('walk UI with no route data does not fabricate steps, stairs, timing or a working start action', async () => {
  await renderWithProviders(<WalkRouteResult />, { language: 'ko' });
  expect(screen.queryByText(/17,400|계단 없음|오르막 적음|2시간 51분/)).toBeNull();
  expect(screen.getByRole('button', { name: '앱에서 경로 따라가기' })).toBeDisabled();
  expect(screen.getByText('도보 경로를 조회하세요.')).toBeVisible();
});

test('transit starts the selected route directly without a details action', async () => {
  const onStart = jest.fn();
  const { user } = await renderWithProviders(<TransitRouteResult itinerary={mapTransitRouteResponse(transitResponse).itineraries[0]}
    index={0} count={1} onSelect={jest.fn()} onStart={onStart} />, { language: 'en' });
  expect(screen.queryByRole('button', { name: 'Route details' })).toBeNull();
  await user.press(screen.getByRole('button', { name: 'Follow route in app' }));
  expect(onStart).toHaveBeenCalledTimes(1);
});
