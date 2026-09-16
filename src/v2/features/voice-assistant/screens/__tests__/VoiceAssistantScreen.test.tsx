import React from 'react';
import { AppState } from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { darkTheme, lightTheme } from '../../../../shared/theme';
import { voiceAssistantResources } from '../../i18n/voiceAssistantResources';
import VoiceAssistantScreen from '../VoiceAssistantScreen';
import SettingsScreen from '../../../settings/screens/SettingsScreen';
import { profileApi } from '../../../my-page/api/profileApi';
import { notificationApi } from '../../../notifications/api/notificationApi';
import type { SpeechEvent, SpeechInputAdapter } from '../../model/voiceInput';

function navigationWrapper(children: React.ReactNode) {
  const listeners = new Map<string, () => void>();
  const navigation = { isFocused: () => true, addListener: (event: string, callback: () => void) => { listeners.set(event, callback); return () => { listeners.delete(event); }; } };
  return { element: <NavigationContext.Provider value={navigation as never}>{children}</NavigationContext.Provider>, listeners };
}
const originalState = AppState.currentState;
beforeEach(() => { (AppState as { currentState: string }).currentState = 'active'; });
afterEach(() => { (AppState as { currentState: string }).currentState = originalState; });

function speech() {
  let emit!: (event: SpeechEvent) => void;
  const session = { start: jest.fn(), stop: jest.fn(), cancel: jest.fn() };
  const adapter: SpeechInputAdapter = { available: true, getPermission: async () => 'granted', requestPermission: async () => 'granted', createSession: options => { emit = options.onEvent; return session; } };
  return { adapter, session, emit: (event: SpeechEvent) => emit(event) };
}

test.each(['ko', 'en'] as const)('%s text preview has accessible controls and never implies network or booking success', async language => {
  const strings = voiceAssistantResources[language];
  const onClose = jest.fn();
  const { element } = navigationWrapper(<VoiceAssistantScreen onClose={onClose} />);
  await renderWithProviders(element, { language });
  expect(screen.getByRole('button', { name: strings.microphone })).toBeDisabled();
  expect(screen.getByRole('button', { name: strings.submit })).toBeDisabled();
  await fireEvent.changeText(screen.getByLabelText(strings.input), '   ');
  expect(screen.getByRole('button', { name: strings.submit })).toBeDisabled();
  await fireEvent.changeText(screen.getByLabelText(strings.input), '카페');
  await fireEvent.press(screen.getByRole('button', { name: strings.submit }));
  expect(screen.getByText(strings.localOnly)).toBeVisible();
  expect(screen.getByRole('button', { name: strings.submit })).toBeDisabled();
  await fireEvent.press(screen.getByRole('button', { name: strings.close }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test.each(['LIGHT', 'DARK'] as const)('%s theme applies to screen, typography and input', async appearancePreference => {
  const theme = appearancePreference === 'DARK' ? darkTheme : lightTheme;
  const { element } = navigationWrapper(<VoiceAssistantScreen onClose={jest.fn()} />);
  await renderWithProviders(element, { appearancePreference });
  expect(screen.getByTestId('voice-assistant-screen')).toHaveStyle({ backgroundColor: theme.colors.background });
  expect(screen.getByLabelText('요청 내용')).toHaveStyle({ color: theme.colors.text, backgroundColor: theme.colors.inputBackground, fontFamily: 'Pretendard' });
  expect(screen.getByRole('header', { name: 'AI 어시스턴트' })).toHaveStyle({ fontFamily: 'Pretendard' });
});

test('partial speech cannot submit; stop/final is reviewed and confirmed once', async () => {
  const x = speech();
  const submit = jest.fn(() => 'localOnly' as const);
  const { element } = navigationWrapper(<VoiceAssistantScreen adapter={x.adapter} onFinalInput={submit} submissionNotice="Local test preview" onClose={jest.fn()} />);
  await renderWithProviders(element);
  await fireEvent.press(screen.getByRole('button', { name: '마이크 시작' }));
  expect(x.session.start).toHaveBeenCalledTimes(1);
  await act(() => x.emit({ type: 'partial', text: '카페' }));
  expect(screen.getByTestId('voice-partial')).toBeVisible();
  expect(screen.getByRole('button', { name: '입력 확인' })).toBeDisabled();
  await fireEvent.press(screen.getByRole('button', { name: '중지하고 확인' }));
  expect(x.session.stop).toHaveBeenCalledTimes(1);
  await act(() => { x.emit({ type: 'final', text: '카페 검색' }); x.emit({ type: 'final', text: '중복' }); });
  expect(submit).not.toHaveBeenCalled();
  expect(screen.getByLabelText('요청 내용')).toHaveDisplayValue('카페 검색');
  await fireEvent.press(screen.getByRole('button', { name: '입력 확인' }));
  expect(submit).toHaveBeenCalledTimes(1);
});

test.each(['background', 'unmount', 'navigationBlur', 'androidBlur', 'close'] as const)('%s cancels capture, detaches lifecycle listeners and clears buffers', async reason => {
  const x = speech();
  const events = new Map<string, (state?: string) => void>();
  const removes: jest.Mock[] = [];
  jest.spyOn(AppState, 'addEventListener').mockImplementation((event, listener) => {
    events.set(event, listener as never);
    const remove = jest.fn(); removes.push(remove); return { remove };
  });
  const { element, listeners } = navigationWrapper(<VoiceAssistantScreen adapter={x.adapter} onClose={jest.fn()} />);
  const view = await renderWithProviders(element);
  await fireEvent.press(screen.getByRole('button', { name: '마이크 시작' }));
  await act(() => x.emit({ type: 'partial', text: 'private' }));
  if (reason === 'background') await act(() => events.get('change')?.('background'));
  if (reason === 'androidBlur') await act(() => events.get('blur')?.());
  if (reason === 'navigationBlur') await act(() => listeners.get('blur')?.());
  if (reason === 'close') await fireEvent.press(screen.getByRole('button', { name: '어시스턴트 닫기' }));
  if (reason === 'unmount') await view.unmount();
  expect(x.session.cancel).toHaveBeenCalledTimes(1);
  await act(() => x.emit({ type: 'final', text: 'late' }));
  if (reason !== 'unmount') {
    expect(screen.getByLabelText('요청 내용')).toHaveDisplayValue('');
    expect(screen.queryByTestId('voice-partial')).toBeNull();
    await view.unmount();
  }
  removes.forEach(remove => expect(remove).toHaveBeenCalled());
});

test('audio interruption preserves text fallback and close action', async () => {
  const x = speech(); const onClose = jest.fn();
  const { element } = navigationWrapper(<VoiceAssistantScreen adapter={x.adapter} onClose={onClose} />);
  await renderWithProviders(element);
  await fireEvent.press(screen.getByRole('button', { name: '마이크 시작' }));
  await act(() => x.emit({ type: 'error', reason: 'interrupted' }));
  expect(screen.getByRole('alert')).toHaveTextContent(voiceAssistantResources.ko.errors.interrupted);
  await fireEvent.changeText(screen.getByLabelText('요청 내용'), '텍스트 대체');
  await fireEvent.press(screen.getByRole('button', { name: '입력 확인' }));
  expect(screen.getByText(voiceAssistantResources.ko.localOnly)).toBeVisible();
  await fireEvent.press(screen.getByRole('button', { name: '어시스턴트 닫기' }));
  expect(onClose).toHaveBeenCalled();
});

test.each(['assistant', 'clarification', 'invalidResponse'] as const)('%s remains informational and uses translated labels', async kind => {
  const { element } = navigationWrapper(<VoiceAssistantScreen onClose={jest.fn()} guidance={{ kind, text: '예약 성공' }} />);
  await renderWithProviders(element);
  expect(screen.getByText(voiceAssistantResources.ko.advisory)).toBeVisible();
  if (kind !== 'assistant') expect(screen.getByText(voiceAssistantResources.ko[kind])).toBeVisible();
  if (kind !== 'invalidResponse') expect(screen.getByText('예약 성공')).toHaveStyle({ color: lightTheme.colors.text });
  expect(screen.queryByText(voiceAssistantResources.ko.accepted)).toBeNull();
});

test('settings has no assistant input entry and retains appearance preferences', async () => {
  jest.spyOn(profileApi, 'getProfile').mockResolvedValue({ id: 1, username: 'user', role: 'USER' } as never);
  jest.spyOn(notificationApi, 'getNotificationSettings').mockResolvedValue({ newHotplaceEnabled: false, newLikeEnabled: false, quietHoursEnabled: false });
  await renderWithProviders(<SettingsScreen onBack={jest.fn()} />);
  expect(screen.queryByRole('button', { name: 'AI 어시스턴트' })).toBeNull();
  expect(screen.queryByTestId('voice-assistant-screen')).toBeNull();
  await fireEvent.press(screen.getByText('화면 모드'));
  expect(screen.getByTestId('v2-appearance-settings-screen')).toBeVisible();
});

test('ko/en have matching keys and all voice states have translated text', () => {
  const leaves = (value: object, prefix = ''): string[] => Object.entries(value).flatMap(([key, child]) => typeof child === 'string' ? [`${prefix}${key}`] : leaves(child, `${prefix}${key}.`));
  expect(leaves(voiceAssistantResources.ko)).toEqual(leaves(voiceAssistantResources.en));
  expect(Object.keys(voiceAssistantResources.ko.phases)).toHaveLength(9);
});
