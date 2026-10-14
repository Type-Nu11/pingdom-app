import { NavigationContext } from '@react-navigation/native';
import VoiceAssistantScreen from '../../screens/VoiceAssistantScreen';
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
const command: VoiceCommandViewState = { phase: 'result', result: { schemaVersion: 1, id: 'result', commandId: 'search', source: 'app', kind: 'command_result', command: 'searchNearbyReservablePlaces', outcome: { status: 'succeeded', data: { places: [place], coverage: 'bounded_candidates' } } } };
function Harness({ account = '101', commandState = command, composer = false, onFinalInput = jest.fn(async () => 'accepted' as const) }: { account?: string | null; commandState?: VoiceCommandViewState; composer?: boolean; onFinalInput?: import('../../model/voiceInput').OnFinalInput }) {
  const flow = useVoiceReservation(account, 'America/Los_Angeles', commandState);
  return <><VoiceCommandResults state={commandState} onSelectReservationPlace={value => { void flow.selectPlace(value); }} /><>{composer ? <NavigationContext.Provider value={{ isFocused: () => true, addListener: () => () => {} } as never}><VoiceAssistantScreen reservationFlow={flow} onClose={jest.fn()} onFinalInput={onFinalInput} /></NavigationContext.Provider> : <VoiceReservationPanel flow={flow} />}</></>;
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
  await waitFor(() => expect(screen.getByTestId('voice-picker-quantity')).toBeTruthy());
  await waitFor(() => expect(screen.getByRole('button', { name: '선택 확인' })).toBeEnabled());
  await fireEvent.press(screen.getByRole('button', { name: '선택 확인' }));
  expect(screen.getByRole('button', { name: '2026-11-12' })).toBeDisabled();
  await fireEvent.press(screen.getByRole('button', { name: '2026-11-11' }));
  expect(quoteCalls).toBe(0);
  await fireEvent.press(screen.getByRole('button', { name: '선택 확인' }));
  expect(screen.getByTestId('voice-time-wheel')).toBeTruthy();
  expect(screen.queryByTestId('voice-reservation-slot-10')).toBeNull();
  expect(screen.getByRole('button', { name: '선택 확인' })).toHaveTextContent('오후 2시 확인');
  expect(quoteCalls).toBe(0);
  await fireEvent.press(screen.getByRole('button', { name: '선택 확인' }));
  await waitFor(() => expect(screen.getByTestId('voice-reservation-confirm')).toBeTruthy());
}
async function fillBooker() {
  await fireEvent.changeText(screen.getByTestId('voice-reservation-bookerName'), ' Test ');
  await fireEvent.changeText(screen.getByTestId('voice-reservation-bookerPhone'), ' +82 1012345678 ');
}

test('actual published date/time → booker → explicit confirmation → server PENDING result, with zero requests before confirmation', async () => {
  await renderWithProviders(<Harness />); await chooseSchedule();
  expect(requests).toHaveLength(0); expect(screen.queryByTestId('voice-confirmation-total')).toBeNull();
  expect(screen.queryByText(/2050|별도의 결제|환불 금액|취소 수수료/)).toBeNull();
  await fireEvent.press(screen.getByTestId('voice-reservation-confirm'));
  expect(requests).toHaveLength(0); expect(screen.getByText('연락처를 입력해 주세요.')).toBeTruthy();
  await fillBooker(); await fireEvent.press(screen.getByTestId('voice-reservation-confirm'));
  await waitFor(() => expect(screen.getByTestId('voice-reservation-success')).toBeTruthy());
  expect(screen.getByText('예약 요청이 접수되었습니다')).toBeTruthy(); expect(screen.getByText('예약번호: 901')).toBeTruthy();
  expect(screen.getByText('상태: 대기')).toBeTruthy();
  expect(screen.getByText('가게 승인 후 예약이 확정됩니다. 예약함에서 상태를 확인해 주세요.')).toBeTruthy();
  expect(screen.queryByText(/별도의 결제/)).toBeNull();
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
test('editing quantity discards the previous quote and reveals lower-capacity published dates', async () => {
  await renderWithProviders(<Harness />); await chooseSchedule();
  await fireEvent.press(screen.getByRole('button', { name: '2명 · 수정' }));
  await fireEvent.press(screen.getByRole('button', { name: '1명' }));
  await fireEvent.press(screen.getByRole('button', { name: '선택 확인' }));
  expect(screen.getByRole('button', { name: '2026-11-12' })).toBeEnabled();
  expect(screen.queryByTestId('voice-reservation-confirm')).toBeNull();
  expect(requests).toHaveLength(0);
});

test.each(['LIGHT', 'DARK'] as const)('%s final review shows editable facts, booker fields and a white primary label', async appearancePreference => {
  await renderWithProviders(<Harness />, { appearancePreference }); await chooseSchedule();
  expect(screen.getByTestId('voice-reservation-summary')).toHaveTextContent(/Cafe/);
  expect(screen.getByRole('button', { name: '2명 · 수정' })).toBeTruthy();
  expect(screen.getByRole('button', { name: '오후 2시 · 수정' })).toBeTruthy();
  expect(screen.getByTestId('voice-reservation-bookerName')).toHaveProp('placeholder', '예약자 이름');
  expect(screen.getByTestId('voice-reservation-bookerPhone')).toHaveProp('placeholder', '전화번호');
  expect(screen.getByTestId('voice-reservation-requestNote')).toHaveProp('multiline', true);
  expect(screen.getByText('예약 요청 확정')).toHaveStyle({ color: '#FFFFFF' });
  expect(screen.queryByText(/2026-11-11T05:00/)).toBeNull();
  expect(requests).toHaveLength(0);
});

test('new AI availability result updates an already open reservation without retaining the previous quote', async () => {
  const view = await renderWithProviders(<Harness />); await chooseSchedule();
  const next: VoiceCommandViewState = { phase: 'result', result: { schemaVersion: 1, id: 'updated-slots', commandId: 'changed-quantity', source: 'app',
    kind: 'command_result', command: 'getAvailabilities', outcome: { status: 'succeeded', data: { placeId: 1, date: '2026-11-12', quantity: 1, availabilities: [] } } } };
  await view.rerender(<Harness commandState={next} />);
  await waitFor(() => expect(screen.getByRole('button', { name: '1명 · 수정' })).toBeTruthy());
  expect(screen.getByRole('button', { name: '11월 12일 (목) · 수정' })).toBeTruthy();
  expect(screen.queryByTestId('voice-reservation-confirm')).toBeNull();
  expect(requests).toHaveLength(0);
});

test('same starting time requires choosing the actual server slot instead of silently selecting the first one', async () => {
  jest.mocked(apiClient.get).mockImplementation(async path => {
    if (path === '/places/1/availabilities') return [slot, { ...slot, id: 12, endsAt: '2026-11-11T07:00:00Z' }] as never;
    return [] as never;
  });
  await renderWithProviders(<Harness />);
  await fireEvent.press(screen.getByTestId('voice-reserve-place-1'));
  await waitFor(() => expect(screen.getByRole('button', { name: '선택 확인' })).toBeEnabled());
  await fireEvent.press(screen.getByRole('button', { name: '선택 확인' }));
  await fireEvent.press(screen.getByRole('button', { name: '2026-11-11' }));
  await fireEvent.press(screen.getByRole('button', { name: '선택 확인' }));
  expect(screen.getByTestId('voice-reservation-slot-10')).toHaveTextContent(/오후 2:00 – 오후 3:00/);
  expect(screen.getByTestId('voice-reservation-slot-12')).toHaveTextContent(/오후 2:00 – 오후 4:00/);
  expect(screen.getByRole('button', { name: '선택 확인' })).toBeDisabled();
  await fireEvent.press(screen.getByTestId('voice-reservation-slot-12'));
  expect(screen.getByTestId('voice-reservation-slot-12').props.accessibilityState.selected).toBe(true);
  expect(screen.getByTestId('voice-reservation-slot-10').props.accessibilityState.selected).toBe(false);
  expect(screen.queryByTestId('voice-reservation-confirm')).toBeNull();
  expect(requests).toHaveLength(0);
});

test('AI availability result preserves requested group size and preselects only a real published date', async () => {
  const commandState: VoiceCommandViewState = { phase: 'result', result: { schemaVersion: 1, id: 'slots-result', commandId: 'slots', source: 'app', kind: 'command_result', command: 'getAvailabilities', outcome: { status: 'succeeded', data: { placeId: 1, date: '2026-11-12', quantity: 1, availabilities: [] } } } };
  await renderWithProviders(<Harness commandState={commandState} />);
  await waitFor(() => expect(screen.getByTestId('voice-reservation-times')).toBeTruthy());
  expect(screen.getByRole('button', { name: '11월 12일 (목) · 수정' })).toBeTruthy();
  expect(screen.getByRole('button', { name: '1명 · 수정' })).toBeTruthy();
  expect(screen.getByTestId('voice-time-wheel')).toBeTruthy();
  expect(screen.getByRole('button', { name: '선택 확인' })).toBeEnabled();
  expect(requests).toHaveLength(0);
});

function bookerCommand(fields: { bookerName?: string; bookerPhone?: string; requestNote?: string }, placeId = 1): VoiceCommandViewState {
  return { phase: 'result', result: { schemaVersion: 1, id: 'booker-result', commandId: 'booker', source: 'app', kind: 'command_result', command: 'updateReservationBooker', outcome: { status: 'succeeded', data: { placeId, fields } } } };
}
test('AI booker fields fill review, preserve manual changes and do not submit until final confirmation', async () => {
  const view = await renderWithProviders(<Harness />); await chooseSchedule();
  const before = quoteCalls;
  await view.rerender(<Harness commandState={bookerCommand({ bookerName: '김테스트', bookerPhone: '010-1234-5678', requestNote: '창가 자리 부탁드립니다' })} />);
  expect(screen.getByTestId('voice-reservation-bookerName')).toHaveDisplayValue('김테스트');
  expect(screen.getByTestId('voice-reservation-bookerPhone')).toHaveDisplayValue('010-1234-5678');
  expect(screen.getByTestId('voice-reservation-requestNote')).toHaveDisplayValue('창가 자리 부탁드립니다');
  expect(quoteCalls).toBe(before); expect(requests).toHaveLength(0);
  await fireEvent.changeText(screen.getByTestId('voice-reservation-bookerName'), '직접수정');
  await view.rerender(<Harness commandState={bookerCommand({ requestNote: '' })} />);
  expect(screen.getByTestId('voice-reservation-bookerName')).toHaveDisplayValue('직접수정');
  expect(screen.getByTestId('voice-reservation-bookerPhone')).toHaveDisplayValue('010-1234-5678');
  expect(screen.getByTestId('voice-reservation-requestNote')).toHaveDisplayValue('');
  await fireEvent.press(screen.getByTestId('voice-reservation-confirm'));
  await waitFor(() => expect(screen.getByTestId('voice-reservation-success')).toBeTruthy());
  expect(requests[0]).toMatchObject({ bookerName: '직접수정', bookerPhone: '010-1234-5678' });
});
test('booker update for another place cannot overwrite the active reservation', async () => {
  const view = await renderWithProviders(<Harness />); await chooseSchedule(); await fillBooker();
  await view.rerender(<Harness commandState={bookerCommand({ bookerName: '다른사람' }, 999)} />);
  expect(screen.getByTestId('voice-reservation-bookerName')).toHaveDisplayValue(' Test ');
  expect(requests).toHaveLength(0);
});

test('typed final submission validates booker information and creates one pending reservation through the existing controller', async () => {
  const transport = jest.fn(async () => 'accepted' as const);
  await renderWithProviders(<Harness composer onFinalInput={transport} />); await chooseSchedule();
  await fireEvent.changeText(screen.getByLabelText('요청 내용'), '확정해줘');
  await fireEvent(screen.getByLabelText('요청 내용'), 'submitEditing');
  expect(screen.getByText('연락처를 입력해 주세요.')).toBeTruthy();
  expect(requests).toHaveLength(0); expect(transport).not.toHaveBeenCalled();
  await fillBooker();
  await fireEvent.changeText(screen.getByLabelText('요청 내용'), '이대로 예약 신청해주세요');
  await fireEvent(screen.getByLabelText('요청 내용'), 'submitEditing');
  await waitFor(() => expect(screen.getByTestId('voice-reservation-success')).toBeTruthy());
  expect(requests).toHaveLength(1); expect(rows).toHaveLength(1);
  expect(screen.getByText('상태: 대기')).toBeTruthy();
  expect(screen.getByText('가게 승인 후 예약이 확정됩니다. 예약함에서 상태를 확인해 주세요.')).toBeTruthy();
  expect(transport).not.toHaveBeenCalled();
});
