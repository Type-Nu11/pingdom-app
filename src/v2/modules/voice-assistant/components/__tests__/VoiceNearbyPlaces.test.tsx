import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { Share } from 'react-native';
import { renderWithProviders } from '../../../../app/testing/testProviders';
import { VoiceCommandResults } from '../VoiceCommandResults';
import type { AppCommandResult } from '../../model/voiceAssistantCommand.types';
import { usePlaceExplorationMediaList } from '../../../place/exploration';

jest.mock('../../../place/exploration', () => ({
  ...jest.requireActual('../../../place/exploration'),
  usePlaceExplorationMediaList: jest.fn(() => ({})),
}));
beforeEach(() => jest.mocked(usePlaceExplorationMediaList).mockReturnValue({}));

test('general discovery renders returned place cards without date, time, people or reservation confirmation prompts', async () => {
  const result: AppCommandResult = { schemaVersion: 1, kind: 'command_result', source: 'app', id: 'app-result-general',
    commandId: 'general', command: 'searchNearbyPlaces', outcome: { status: 'succeeded', data: { coverage: 'nearest_places',
      places: [1, 2, 3].map(id => ({ id, name: `실제 장소 ${id}`, address: `서울 주소 ${id}`, touristCategories: ['CAFE'], operatingStatus: 'OPERATING' })) } } };
  await renderWithProviders(<VoiceCommandResults state={{ phase: 'result', result }} />);
  for (const id of [1, 2, 3]) expect(screen.getByText(`실제 장소 ${id}`)).toBeVisible();
  expect(screen.queryByText(/며칠에|몇 시쯤|몇 분이|예약 확정/)).toBeNull();
  expect(screen.queryByTestId('voice-reservation-draft')).toBeNull();
});

test('Figma cards use server media and distance, and sharing is an explicit user action', async () => {
  jest.mocked(usePlaceExplorationMediaList).mockReturnValue({ '1': ['https://cdn.example.com/place-1.jpg'] });
  const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });
  const result: AppCommandResult = { schemaVersion: 1, kind: 'command_result', source: 'app', id: 'media-result',
    commandId: 'media', command: 'searchNearbyPlaces', outcome: { status: 'succeeded', data: { coverage: 'nearest_places',
      places: [{ id: 1, name: '조회한 카페', address: '서울 실제 주소', touristCategories: ['CAFE'], operatingStatus: 'OPERATING', distanceMeters: 1230 }] } } };
  await renderWithProviders(<VoiceCommandResults state={{ phase: 'result', result }} />);
  expect(JSON.stringify(screen.toJSON())).toContain('https://cdn.example.com/place-1.jpg');
  expect(screen.getByText('여기서 1.23km')).toBeVisible();
  expect(screen.queryByText('예시 이미지')).toBeNull();
  expect(share).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole('button', { name: '공유' }));
  expect(share).toHaveBeenCalledWith({ message: '조회한 카페\n서울 실제 주소' });
  share.mockRestore();
});
