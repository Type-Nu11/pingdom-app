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

test('추천 장소 터치는 상세를 열고 지도로 보기는 첫 번째 추천 장소를 전달한다', async () => {
  const onOpenPlace = jest.fn(); const onShowMap = jest.fn();
  const result: AppCommandResult = { schemaVersion: 1, kind: 'command_result', source: 'app', id: 'navigation-result',
    commandId: 'navigation', command: 'searchNearbyPlaces', outcome: { status: 'succeeded', data: { coverage: 'nearest_places',
      places: [{ id: 42, name: '추천 카페', address: '서울', touristCategories: ['CAFE'], operatingStatus: 'OPERATING' }] } } };
  await renderWithProviders(<VoiceCommandResults state={{ phase: 'result', result }} onOpenPlace={onOpenPlace} onShowMap={onShowMap} />);
  await fireEvent.press(screen.getByRole('button', { name: '추천 카페' }));
  expect(onOpenPlace).toHaveBeenCalledWith(42);
  await fireEvent.press(screen.getByRole('button', { name: '지도에서 보기' }));
  expect(onShowMap).toHaveBeenCalledWith(42);
});

test.each([0, 1, 3])('general discovery renders %s API result cards without reservation prompts', async count => {
  const result: AppCommandResult = { schemaVersion: 1, kind: 'command_result', source: 'app', id: 'app-result-general',
    commandId: 'general', command: 'searchNearbyPlaces', outcome: { status: 'succeeded', data: { coverage: 'nearest_places',
      places: Array.from({ length: count }, (_, index) => ({ id: index + 1, name: `실제 장소 ${index + 1}`, address: `서울 주소 ${index + 1}`,
        distanceMeters: 1230 + index * 1000, touristCategories: ['CAFE'], operatingStatus: 'OPERATING' as const })) } } };
  await renderWithProviders(<VoiceCommandResults state={{ phase: 'result', result }} />);
  expect(screen.queryAllByTestId(/^voice-place-image-/)).toHaveLength(count);
  for (let id = 1; id <= count; id++) {
    expect(screen.getByText(`실제 장소 ${id}`)).toBeVisible();
    expect(screen.getByText(`서울 주소 ${id}`)).toHaveProp('numberOfLines', 1);
    expect(screen.getByText(`여기서 ${(1.23 + id - 1).toFixed(2)}km`)).toBeVisible();
  }
  if (count === 0) expect(screen.getByTestId('voice-command-empty')).toBeVisible();
  expect(screen.queryByText(/며칠에|몇 시쯤|몇 분이|예약 확정/)).toBeNull();
  expect(screen.queryByTestId('voice-reservation-draft')).toBeNull();
});

test('Figma cards use server media and distance, and sharing is an explicit user action', async () => {
  jest.mocked(usePlaceExplorationMediaList).mockReturnValue({ '1': ['https://cdn.example.com/place-1.jpg'] });
  const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });
  const selectReservationPlace = jest.fn();
  const result: AppCommandResult = { schemaVersion: 1, kind: 'command_result', source: 'app', id: 'media-result',
    commandId: 'media', command: 'searchNearbyPlaces', outcome: { status: 'succeeded', data: { coverage: 'nearest_places',
      places: [{ id: 1, name: '조회한 카페', address: '서울 실제 주소', touristCategories: ['CAFE'], operatingStatus: 'OPERATING', distanceMeters: 1230 }] } } };
  await renderWithProviders(<VoiceCommandResults state={{ phase: 'result', result, text: '조회된 카페를 지도에서 확인해 보세요.' }} onSelectReservationPlace={selectReservationPlace} />);
  expect(screen.getAllByText('조회된 카페를 지도에서 확인해 보세요.')).toHaveLength(1);
  expect(screen.getByText('조회된 카페를 지도에서 확인해 보세요.')).toHaveStyle({ color: '#0C0C0D', fontFamily: 'PretendardStdVariable-Bold' });
  expect(JSON.stringify(screen.toJSON())).toContain('https://cdn.example.com/place-1.jpg');
  expect(screen.getByText('여기서 1.23km')).toBeVisible();
  expect(screen.getByText('서울 실제 주소')).toBeVisible();
  expect(screen.queryByText('예시 이미지')).toBeNull();
  expect(share).not.toHaveBeenCalled();
  expect(selectReservationPlace).not.toHaveBeenCalled();
  expect(screen.queryByTestId('voice-reserve-place-1')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: '공유' }));
  expect(share).toHaveBeenCalledWith({ message: '조회한 카페\n서울 실제 주소' });
  share.mockRestore();
});

test('only reservation search cards offer the explicit reservation action', async () => {
  const onReserve = jest.fn();
  const place = { id: 1, name: '예약 가능한 카페', address: '서울', touristCategories: ['CAFE' as const], operatingStatus: 'OPERATING' as const };
  const result: AppCommandResult = { schemaVersion: 1, kind: 'command_result', source: 'app', id: 'booking-result', commandId: 'booking',
    command: 'searchNearbyReservablePlaces', outcome: { status: 'succeeded', data: { coverage: 'bounded_candidates', places: [place] } } };
  await renderWithProviders(<VoiceCommandResults state={{ phase: 'result', result }} onSelectReservationPlace={onReserve} />);
  await fireEvent.press(screen.getByTestId('voice-reserve-place-1'));
  expect(onReserve).toHaveBeenCalledWith(place);
});

test.each(['empty', 'failed'] as const)('the %s result shows app-owned copy instead of an unsupported AI database claim', async kind => {
  const result: AppCommandResult = { schemaVersion: 1, kind: 'command_result', source: 'app', id: 'safe-result',
    commandId: 'safe', command: 'searchNearbyPlaces', outcome: kind === 'empty'
      ? { status: 'succeeded', data: { coverage: 'nearest_places', places: [] } }
      : { status: 'rejected', code: 'INVALID_SERVER_RESPONSE' } };
  await renderWithProviders(<VoiceCommandResults state={{ phase: 'result', result, text: '데이터베이스에 없습니다.' }} />);
  expect(screen.queryByText('데이터베이스에 없습니다.')).toBeNull();
  if (kind === 'empty') {
    expect(screen.getByTestId('voice-command-empty')).toBeVisible();
    expect(screen.queryByTestId('voice-command-retry')).toBeNull();
  } else {
    expect(screen.getByText('서버 정보를 확인할 수 없습니다.')).toBeVisible();
    expect(screen.queryByTestId('voice-command-empty')).toBeNull();
  }
});
