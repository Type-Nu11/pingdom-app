import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../../app/testing/testProviders';
import { WalkRouteResult } from '../components/WalkRouteResult';
import { TransitRouteDetails } from '../components/TransitRouteResult';
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

test('transit detail fixed footer shares or returns to the selected map route without requesting a new route', async () => {
  const onShare = jest.fn(); const onBack = jest.fn();
  const { user } = await renderWithProviders(<TransitRouteDetails itinerary={mapTransitRouteResponse(transitResponse).itineraries[0]}
    originName="출발" destinationName="도착" originAddress="출발 주소" destinationAddress="도착 주소"
    topInset={62} bottomInset={34} onBack={onBack} onClose={jest.fn()} onShare={onShare} />, { language: 'ko' });
  expect(screen.getByText('대중교통 · 추천 경로')).toBeVisible();
  expect(screen.getByText('출발 주소')).toBeVisible();
  expect(screen.getByText('도착 주소')).toBeVisible();
  await user.press(screen.getByRole('button', { name: '장소 공유' }));
  expect(onShare).toHaveBeenCalledTimes(1);
  await user.press(screen.getByRole('button', { name: '지도에서 경로 보기' }));
  expect(onBack).toHaveBeenCalledTimes(1);
});
