import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { NavigationContext } from '@react-navigation/native';
import { renderWithProviders } from '../../../../app/testing/testProviders';
import VoiceCommandScreen from '../VoiceCommandScreen';
import type { VoiceCommandContext } from '../../hooks/useVoiceCommands';

jest.mock('../../hooks/useVoiceCommands', () => ({ useVoiceCommands: () => ({
  commandState: { phase: 'result', result: { schemaVersion: 1, kind: 'command_result', source: 'app', id: 'result',
    commandId: 'nearby', command: 'searchNearbyPlaces', outcome: { status: 'succeeded', data: { coverage: 'nearest_places',
      places: [{ id: 42, name: '추천 장소', address: '서울', touristCategories: ['CAFE'], operatingStatus: 'OPERATING' }] } } } },
  onFinalInput: jest.fn(), cancel: jest.fn(), dismissFeedback: jest.fn(), bookerUpdate: null,
}) }));
jest.mock('../../adapters/expoSpeechInputAdapter', () => ({ expoSpeechInputAdapter: {
  available: true, getPermission: async () => 'granted', requestPermission: async () => 'granted',
  createSession: () => ({ start: jest.fn(), stop: jest.fn(), cancel: jest.fn() }),
} }));
jest.mock('../../../place/exploration', () => ({
  ...jest.requireActual('../../../place/exploration'), usePlaceExplorationMediaList: () => ({}),
}));
const navigation = { isFocused: () => true, addListener: () => () => undefined };
const baseContext: VoiceCommandContext = { accountRevision: null, location: null, locationPermission: 'denied',
  radiusKm: 5, timezone: 'Asia/Seoul', placeListEnabled: true };

test.each(['detail', 'map'] as const)('추천 결과의 %s 동작이 화면 이동을 요청하고 AI를 닫는다', async destination => {
  const navigateToPage = jest.fn(() => true); const showPlaceOnMap = jest.fn(() => true); const onClose = jest.fn();
  await renderWithProviders(<NavigationContext.Provider value={navigation as never}>
    <VoiceCommandScreen onClose={onClose} context={{ ...baseContext, navigateToPage, showPlaceOnMap }} />
  </NavigationContext.Provider>);
  await fireEvent.press(screen.getByRole('button', { name: destination === 'detail' ? '추천 장소' : '지도에서 보기' }));
  if (destination === 'detail') expect(navigateToPage).toHaveBeenCalledWith({ page: 'placeDetail', placeId: 42 });
  else expect(showPlaceOnMap).toHaveBeenCalledWith(42);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('이동 요청을 처리하지 못하면 AI 화면을 닫지 않는다', async () => {
  const onClose = jest.fn();
  await renderWithProviders(<NavigationContext.Provider value={navigation as never}>
    <VoiceCommandScreen onClose={onClose} context={{ ...baseContext, navigateToPage: () => false }} />
  </NavigationContext.Provider>);
  await fireEvent.press(screen.getByRole('button', { name: '추천 장소' }));
  expect(onClose).not.toHaveBeenCalled();
});
