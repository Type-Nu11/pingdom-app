import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../app/testing/testProviders';
import { VoiceCommandResults } from '../VoiceCommandResults';
import { prepareVoiceReservationDraft } from '../../model/reservationDraft';
import { draftQuote } from '../../model/__tests__/reservationDraft.fixture';
import type { VoiceAvailabilityFacts } from '../../model/voiceAssistantCommand.types';

const now = Date.parse('2026-09-20T00:00:00Z');
const selection = {
  place: { id: 1, name: 'Cafe', address: 'Seoul', touristCategories: ['CAFE' as const], operatingStatus: 'OPERATING' as const },
  availability: { id: 10, placeId: 1, productType: 'GENERAL', productId: null, productName: null,
    startsAt: '2026-09-20T05:00:00Z', endsAt: '2026-09-20T06:00:00Z', remainingCapacity: 3, status: 'ACTIVE' } as VoiceAvailabilityFacts,
  date: '2026-09-20', timezone: 'Asia/Seoul', quantity: 2, availabilityDataUpdatedAt: now,
};

test.each(['ko', 'en', 'ja'] as const)('%s draft displays exact server facts and has no reservation/payment submit action', async language => {
  const draft = prepareVoiceReservationDraft(draftQuote({ currency: 'USD', currencyFractionDigits: 2 }), selection, now);
  await renderWithProviders(<VoiceCommandResults onRetry={jest.fn()} state={{ phase: 'result', result: {
    schemaVersion: 1, kind: 'command_result', source: 'app', id: 'app-result-test', commandId: 'prepare',
    command: 'prepareReservation', outcome: { status: 'succeeded', data: { draft } },
  } }} />, { language });
  expect(screen.getByTestId('voice-reservation-draft')).toBeTruthy();
  expect(screen.getByTestId('voice-reservation-draft-total')).toHaveTextContent(/USD 20\.50/);
  expect(screen.getByText('Cafe')).toBeTruthy();
  expect(screen.getByText('2026-09-20T05:00:00Z – 2026-09-20T06:00:00Z (Asia/Seoul)')).toBeTruthy();
  expect(screen.getByTestId('voice-reservation-draft-not-submitted')).toBeTruthy();
  expect(screen.queryAllByRole('button')).toHaveLength(0);
  expect(screen.queryByText(/00000000-0000/)).toBeNull();
});

test('missing policy is a recoverable failure and does not display a default free price or draft', async () => {
  await renderWithProviders(<VoiceCommandResults onRetry={jest.fn()} state={{ phase: 'result', result: {
    schemaVersion: 1, kind: 'command_result', source: 'app', id: 'app-result-test', commandId: 'prepare',
    command: 'prepareReservation', outcome: { status: 'rejected', code: 'QUOTE_TERMS_UNAVAILABLE' },
  } }} />, { language: 'ko' });
  expect(screen.getByRole('alert')).toHaveTextContent(/가격과 취소 조건이 서버에 설정되지 않았습니다/);
  expect(screen.queryByTestId('voice-reservation-draft')).toBeNull();
});
