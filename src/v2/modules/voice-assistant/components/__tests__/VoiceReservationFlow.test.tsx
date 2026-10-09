import React from 'react';
import { AppState } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { apiClient, ApiError } from '../../../../shared/api';
import { renderWithProviders } from '../../../../app/testing/testProviders';
import { useVoiceReservation } from '../../hooks/useVoiceReservation';
import { VoiceReservationPanel } from '../VoiceReservationPanel';
import { VoiceCommandResults } from '../VoiceCommandResults';
import { draftQuote } from '../../model/__tests__/reservationDraft.fixture';
import type { AvailabilityList } from '../../../booking';
import type { VoiceCommandViewState } from '../../hooks/useVoiceCommands';

const now = Date.parse('2026-11-10T00:00:00Z');
const slot: AvailabilityList[number] = { id: 10, placeId: 1, productType: 'GENERAL', productId: null, productName: null,
  startsAt: '2026-11-11T05:00:00Z', endsAt: '2026-11-11T06:00:00Z', remainingCapacity: 3, totalCapacity: 3, status: 'ACTIVE', conditionsVersion: 1,
  reservationTerms: { timezone: 'Asia/Seoul', unitAmountMinor: 1000, additionalAmountMinor: 50, currency: 'KRW', cancellable: true, cancellationCutoffMinutes: 60 } };
const place = { id: 1, name: 'Cafe', address: 'Seoul', touristCategories: ['CAFE' as const], operatingStatus: 'OPERATING' as const };
const command: VoiceCommandViewState = { phase: 'result', result: { schemaVersion: 1, id: 'result', commandId: 'search', source: 'app', kind: 'command_result', command: 'getPlaceDetails', outcome: { status: 'succeeded', data: { place } } } };
function Harness({ account = '101', commandState = command }: { account?: string | null; commandState?: VoiceCommandViewState }) {
  const flow = useVoiceReservation(account, 'America/Los_Angeles', commandState);
  return <><VoiceCommandResults state={commandState} onSelectReservationPlace={value => { void flow.selectPlace(value); }} /><VoiceReservationPanel flow={flow} /></>;
}
let stored: string | null;
let requests: Record<string, unknown>[];
let rows: Record<string, unknown>[];
let loseFirstResponse = false;
let quoteCalls: number;
const originalState = AppState.currentState;
beforeEach(() => {
  AppState.currentState = 'active';
  jest.spyOn(Date, 'now').mockReturnValue(now);
  stored = null; requests = []; rows = []; quoteCalls = 0; loseFirstResponse = false;
  jest.mocked(Keychain.getGenericPassword).mockImplementation(async () => stored ? { username: 'intent', password: stored, service: 'test', storage: 'test' } as never : false);
  jest.mocked(Keychain.setGenericPassword).mockImplementation(async (_user, raw) => { stored = raw; return { service: 'test', storage: 'test' } as never; });
  jest.mocked(Keychain.resetGenericPassword).mockImplementation(async () => { stored = null; return true; });
  jest.spyOn(apiClient, 'get').mockImplementation(async path => {
    if (path.endsWith('/quote')) {
      quoteCalls++;
      return draftQuote({ startsAt: slot.startsAt, endsAt: slot.endsAt, cancellationDeadline: '2026-11-11T04:00:00Z', expiresAt: '2026-11-10T00:05:00Z' }) as never;
    }
    if (path === '/places/1') return place as never;
    if (path === '/places/1/availabilities') return [slot, { ...slot, id: 11, remainingCapacity: 1, startsAt: '2026-11-12T05:00:00Z', endsAt: '2026-11-12T06:00:00Z' }] as never;
    return [] as never;
  });
  jest.spyOn(apiClient, 'post').mockImplementation(async (path, body) => {
    expect(path).toBe('/reservations');
    const request = body as Record<string, unknown>; requests.push(request);
    const existing = rows.find(row => row.key === request.idempotencyKey);
    const result = existing ?? { key: request.idempotencyKey, id: 901, availabilityId: 10, productType: 'GENERAL', productId: null,
      quantity: 2, touristUserId: 101, status: 'PENDING', bookerName: request.bookerName, bookerPhone: request.bookerPhone, requestNote: request.requestNote ?? null,
      reservationStartsAt: slot.startsAt, reservationEndsAt: slot.endsAt, confirmation: JSON.parse(stored!).confirmation,
      createdAt: new Date(now).toISOString(), updatedAt: new Date(now).toISOString(), canceledAt: null, confirmedAt: null };
    if (!existing) rows.push(result);
    if (loseFirstResponse && requests.length === 1) throw new ApiError('response lost', { status: 503 });
    return result as never;
  });
});
afterAll(() => { AppState.currentState = originalState; });
async function chooseSchedule() {
  await waitFor(() => expect(screen.getByTestId('voice-reserve-place-1')).toBeTruthy());
  await fireEvent.press(screen.getByTestId('voice-reserve-place-1'));
  await waitFor(() => expect(screen.getByTestId('voice-reservation-date-2026-11-11')).toBeTruthy());
  expect(screen.queryByTestId('voice-reservation-date-2026-11-12')).toBeNull();
  await fireEvent.press(screen.getByTestId('voice-reservation-date-2026-11-11'));
  await fireEvent.press(screen.getByTestId('voice-reservation-slot-10'));
  await waitFor(() => expect(screen.getByTestId('voice-reservation-confirm')).toBeTruthy());
}
async function fillBooker() {
  await fireEvent.changeText(screen.getByTestId('voice-reservation-bookerName'), ' Test ');
  await fireEvent.changeText(screen.getByTestId('voice-reservation-bookerPhone'), ' +82 1012345678 ');
}

test('actual published date/time → booker → explicit confirmation → server PENDING result, with zero requests before confirmation', async () => {
  await renderWithProviders(<Harness />); await chooseSchedule();
  expect(requests).toHaveLength(0); expect(screen.getByTestId('voice-confirmation-total')).toHaveTextContent(/KRW 2050/);
  await fireEvent.press(screen.getByTestId('voice-reservation-confirm'));
  expect(requests).toHaveLength(0); expect(screen.getByText('연락처를 입력해 주세요.')).toBeTruthy();
  await fillBooker(); await fireEvent.press(screen.getByTestId('voice-reservation-confirm'));
  await waitFor(() => expect(screen.getByTestId('voice-reservation-success')).toBeTruthy());
  expect(screen.getByText('예약 요청이 접수되었습니다')).toBeTruthy(); expect(screen.getByText('예약번호: 901')).toBeTruthy();
  expect(screen.getByText('서버 처리 상태: 확정 대기')).toBeTruthy();
  expect(requests).toHaveLength(1); expect(rows).toHaveLength(1); expect(stored).toBeNull();
});
test('response loss → panel remount → explicit recovery returns one server reservation with identical key/token/body', async () => {
  loseFirstResponse = true;
  const view = await renderWithProviders(<Harness />); await chooseSchedule(); await fillBooker();
  await fireEvent.press(screen.getByTestId('voice-reservation-confirm'));
  await waitFor(() => expect(screen.getByTestId('voice-reservation-unknown')).toBeTruthy());
  const first = requests[0]; const count = quoteCalls; await view.unmount();
  await renderWithProviders(<Harness />);
  await waitFor(() => expect(screen.getByTestId('voice-reservation-recover')).toBeTruthy());
  expect(requests).toHaveLength(1); await fireEvent.press(screen.getByTestId('voice-reservation-recover'));
  await waitFor(() => expect(screen.getByTestId('voice-reservation-success')).toBeTruthy());
  expect(requests[1]).toEqual(first); expect(rows).toHaveLength(1); expect(quoteCalls).toBe(count);
});
test('cancel discards unsubmitted selection; lowering quantity reveals lower-capacity published dates', async () => {
  await renderWithProviders(<Harness />); await chooseSchedule();
  await fireEvent.press(screen.getByRole('button', { name: '인원 줄이기' }));
  expect(screen.getByTestId('voice-reservation-date-2026-11-12')).toBeTruthy();
  expect(screen.queryByTestId('voice-reservation-confirm')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: '선택 취소' })); expect(requests).toHaveLength(0);
});

test('AI availability result preserves requested group size and preselects only a real published date', async () => {
  const commandState: VoiceCommandViewState = { phase: 'result', result: { schemaVersion: 1, id: 'slots-result', commandId: 'slots', source: 'app', kind: 'command_result', command: 'getAvailabilities', outcome: { status: 'succeeded', data: { placeId: 1, date: '2026-11-12', quantity: 1, availabilities: [] } } } };
  await renderWithProviders(<Harness commandState={commandState} />);
  await waitFor(() => expect(screen.getByTestId('voice-reservation-date-2026-11-12')).toBeTruthy());
  expect(screen.getByTestId('voice-reservation-date-2026-11-12').props.accessibilityState.selected).toBe(true);
  expect(screen.getByTestId('voice-reservation-slot-11')).toBeTruthy(); expect(requests).toHaveLength(0);
});
