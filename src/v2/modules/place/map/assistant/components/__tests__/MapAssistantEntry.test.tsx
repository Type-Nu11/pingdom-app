import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animated, AppState } from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import { act, fireEvent, screen } from '@testing-library/react-native';
import * as SafeArea from 'react-native-safe-area-context';
import { renderWithProviders } from '../../../../../../app/testing/testProviders';
import { darkColors, lightColors } from '../../../../../../shared/theme';
import { MAP_ASSISTANT_INTRO_SEEN_KEY, useMapAssistantEntry } from '../../hooks/useMapAssistantEntry';
import MapTopOverlay from '../../../presentation/components/MapTopOverlay';
import MapAssistantModal from '../MapAssistantModal';
import MapAssistantIntro from '../MapAssistantIntro';

const navigation = { isFocused: () => true, addListener: () => () => undefined };
const locate = jest.fn();
const sheetTop = new Animated.Value(400);
const overlayProps = {
  activeCategory: 'all' as const, onCategoryChange: jest.fn(), onLocatePress: locate,
  onQueryChange: jest.fn(), onSearchFocus: jest.fn(), onSubmitSearch: jest.fn(), query: '',
};
function Harness({ enabled = true, focused = true, expanded = false, searching = false }) {
  const entry = useMapAssistantEntry(enabled, focused);
  return <NavigationContext.Provider value={navigation as never}>
    <MapTopOverlay {...overlayProps} showCategories={!expanded}
      onAssistantPress={entry.enabled && !searching ? entry.open : undefined}
      assistantDisabled={entry.isBusy} assistantSheetTop={sheetTop} assistantRestingTop={400} />
    <MapAssistantModal visible={entry.isOpen} onClose={entry.close} />
    <MapAssistantIntro visible={entry.isNoticeOpen} onClose={entry.close}
      onContinue={entry.continueToAssistant} />
  </NavigationContext.Provider>;
}
const layout = async (height = 270) => {
  await fireEvent(screen.getByTestId('map-top-safe-overlay'), 'layout', { nativeEvent: { layout: { height, width: 390, x: 0, y: 0 } } });
};
const originalState = AppState.currentState;
beforeEach(async () => {
  (AppState as { currentState: string }).currentState = 'active';
  sheetTop.setValue(400);
  await AsyncStorage.setItem(MAP_ASSISTANT_INTRO_SEEN_KEY, '1');
});
afterEach(() => { (AppState as { currentState: string }).currentState = originalState; });

test('flag off has no FAB or session; location remains usable', async () => {
  await renderWithProviders(<Harness enabled={false} />);
  await layout();
  expect(screen.queryByTestId('map-assistant-fab')).toBeNull();
  expect(screen.queryByTestId('voice-assistant-screen')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: '내 위치' }));
  expect(locate).toHaveBeenCalledTimes(1);
});

test('FAB opens one existing input screen; close discards text and permits reopening', async () => {
  const view = await renderWithProviders(<Harness />);
  await layout();
  const fab = screen.getByRole('button', { name: 'AI 어시스턴트 열기' });
  await fireEvent.press(fab);
  await fireEvent.press(fab);
  await fireEvent.press(fab);
  expect(screen.getAllByTestId('voice-assistant-screen')).toHaveLength(1);
  expect(screen.getAllByTestId('map-assistant-modal')).toHaveLength(1);
  expect(screen.getByTestId('map-assistant-modal')).toHaveStyle({ position: 'absolute', top: 0, bottom: 0 });
  await fireEvent.changeText(screen.getByLabelText('요청 내용'), 'private draft');
  await fireEvent.press(screen.getByRole('button', { name: '어시스턴트 닫기' }));
  expect(screen.queryByTestId('voice-assistant-screen')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'AI 어시스턴트 열기' }));
  expect(screen.getByLabelText('요청 내용')).toHaveDisplayValue('');
  await fireEvent(screen.getByTestId('map-assistant-modal'), 'accessibilityEscape');
  expect(screen.queryByTestId('voice-assistant-screen')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: '내 위치' }));
  expect(locate).toHaveBeenCalledTimes(1);
});

test('first AI press shows the liquid intro once, then opens the assistant', async () => {
  await AsyncStorage.removeItem(MAP_ASSISTANT_INTRO_SEEN_KEY);
  await renderWithProviders(<Harness />);
  await layout();
  await fireEvent.press(screen.getByRole('button', { name: 'AI 어시스턴트 열기' }));
  expect(await screen.findByTestId('map-assistant-intro')).toBeVisible();
  expect(screen.getByText('음성 입력은 5초 동안 말하지 않으면 인식된 내용을 AI 서버에 자동 전송합니다. 텍스트 입력은 보내기를 누르면 전송합니다. 정확한 현재 좌표는 기존 장소 조회에만 사용합니다.')).toBeVisible();
  expect(screen.queryByTestId('voice-assistant-screen')).toBeNull();
  expect(await AsyncStorage.getItem(MAP_ASSISTANT_INTRO_SEEN_KEY)).toBe('1');
  await fireEvent.press(screen.getByRole('button', { name: '확인하고 시작하기' }));
  expect(screen.getByTestId('voice-assistant-screen')).toBeVisible();
  expect(screen.queryByTestId('map-assistant-intro')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: '어시스턴트 닫기' }));
  await fireEvent.press(screen.getByRole('button', { name: 'AI 어시스턴트 열기' }));
  expect(await screen.findByTestId('voice-assistant-screen')).toBeVisible();
  expect(screen.queryByTestId('map-assistant-intro')).toBeNull();
});

test('closing the first-use intro still makes the next AI press go straight to input', async () => {
  await AsyncStorage.removeItem(MAP_ASSISTANT_INTRO_SEEN_KEY);
  await renderWithProviders(<Harness />);
  await layout();
  await fireEvent.press(screen.getByRole('button', { name: 'AI 어시스턴트 열기' }));
  expect(await screen.findByTestId('map-assistant-intro-card')).toHaveStyle({ borderRadius: 36 });
  await fireEvent.press(screen.getByRole('button', { name: '닫기' }));
  expect(screen.queryByTestId('map-assistant-intro')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'AI 어시스턴트 열기' }));
  expect(await screen.findByTestId('voice-assistant-screen')).toBeVisible();
});

test('a previous manual-send notice does not hide the new automatic voice-send notice', async () => {
  await AsyncStorage.setItem('@pingdom/map-assistant-intro-seen/v1', '1');
  await AsyncStorage.removeItem(MAP_ASSISTANT_INTRO_SEEN_KEY);
  await renderWithProviders(<Harness />);
  await layout();
  await fireEvent.press(screen.getByRole('button', { name: 'AI 어시스턴트 열기' }));
  expect(await screen.findByTestId('map-assistant-intro')).toBeVisible();
  expect(screen.queryByTestId('voice-assistant-screen')).toBeNull();
});

test('first-use intro stays dismissed after the map remounts', async () => {
  await AsyncStorage.removeItem(MAP_ASSISTANT_INTRO_SEEN_KEY);
  const first = await renderWithProviders(<Harness />);
  await layout();
  await fireEvent.press(screen.getByRole('button', { name: 'AI 어시스턴트 열기' }));
  expect(await screen.findByTestId('map-assistant-intro')).toBeVisible();
  await first.unmount();
  await renderWithProviders(<Harness />);
  await layout();
  await fireEvent.press(screen.getByRole('button', { name: 'AI 어시스턴트 열기' }));
  expect(await screen.findByTestId('voice-assistant-screen')).toBeVisible();
  expect(screen.queryByTestId('map-assistant-intro')).toBeNull();
});

test('leaving the map during first-use lookup cannot show a late intro', async () => {
  await AsyncStorage.removeItem(MAP_ASSISTANT_INTRO_SEEN_KEY);
  const originalGet = AsyncStorage.getItem.bind(AsyncStorage);
  let finish!: (value: string | null) => void;
  const read = jest.spyOn(AsyncStorage, 'getItem').mockImplementation(key => key === MAP_ASSISTANT_INTRO_SEEN_KEY
    ? new Promise(resolve => { finish = resolve; }) : originalGet(key));
  try {
    const view = await renderWithProviders(<Harness />);
    await layout();
    await fireEvent.press(screen.getByRole('button', { name: 'AI 어시스턴트 열기' }));
    await view.rerender(<Harness focused={false} />);
    await act(async () => finish(null));
    expect(screen.queryByTestId('map-assistant-intro')).toBeNull();
    expect(screen.queryByTestId('voice-assistant-screen')).toBeNull();
  } finally { read.mockRestore(); }
});

test.each(['LIGHT', 'DARK'] as const)('%s FAB uses theme, 48 dp target and separate vertical slot below locate', async appearancePreference => {
  const colors = appearancePreference === 'LIGHT' ? lightColors : darkColors;
  await renderWithProviders(<Harness />, { appearancePreference });
  await layout();
  expect(screen.getByTestId('map-assistant-fab')).toHaveStyle({ height: 48, width: 48, backgroundColor: colors.surfaceElevated, borderColor: colors.borderEmphasis });
  expect(screen.getByText('AI')).toHaveStyle({ color: colors.textStrong, fontFamily: 'Pretendard' });
  expect(screen.getByTestId('map-assistant-slot')).toHaveStyle({ marginTop: 8 });
  expect(screen.getByTestId('map-locate-button')).toHaveStyle({ width: 44, height: 44 });
  const text = JSON.stringify(screen.toJSON());
  expect(text.indexOf('map-locate-button')).toBeLessThan(text.indexOf('map-assistant-fab'));
  await fireEvent.press(screen.getByRole('button', { name: '내 위치' }));
  await fireEvent.press(screen.getByRole('button', { name: '내 위치' }));
  expect(locate).toHaveBeenCalledTimes(2);
  expect(screen.queryByTestId('voice-assistant-screen')).toBeNull();
});

test('English FAB has a translated accessibility label', async () => {
  await renderWithProviders(<Harness />, { language: 'en' });
  await layout();
  expect(screen.getByRole('button', { name: 'Open AI assistant' })).toBeEnabled();
});

test('sheet drag hides FAB visually and from touch/accessibility before overlap; restores afterward', async () => {
  await renderWithProviders(<Harness />);
  await layout(270);
  expect(screen.getByRole('button', { name: 'AI 어시스턴트 열기' })).toBeEnabled();
  await act(() => sheetTop.setValue(277));
  expect(screen.queryByRole('button', { name: 'AI 어시스턴트 열기' })).toBeNull();
  expect(screen.getByTestId('map-assistant-slot', { includeHiddenElements: true }).props.pointerEvents).toBe('none');
  expect(screen.getByTestId('map-assistant-fab', { includeHiddenElements: true })).toBeDisabled();
  await act(() => sheetTop.setValue(400));
  expect(screen.getByRole('button', { name: 'AI 어시스턴트 열기' })).toBeEnabled();
});

test('Safe Area is part of measured overlay; large bottom inset cannot expose an offscreen FAB', async () => {
  jest.spyOn(require('react-native-safe-area-context') as typeof SafeArea, 'useSafeAreaInsets').mockReturnValue({ top: 50, bottom: 60, left: 20, right: 20 });
  jest.spyOn(require('react-native') as typeof import('react-native'), 'useWindowDimensions').mockReturnValue({ height: 360, width: 390, fontScale: 1, scale: 3 });
  await renderWithProviders(<Harness />);
  expect(screen.getByTestId('map-top-safe-overlay').props.edges).toEqual(['top', 'left', 'right']);
  await layout(270);
  expect(screen.getByRole('button', { name: 'AI 어시스턴트 열기' })).toBeEnabled();
  await layout(320);
  expect(screen.queryByRole('button', { name: 'AI 어시스턴트 열기' })).toBeNull();
});

test.each([{ expanded: true }, { searching: true }, { focused: false }])('covered/inactive map removes FAB: %j', async props => {
  await renderWithProviders(<Harness {...props} />);
  expect(screen.queryByTestId('map-assistant-fab')).toBeNull();
});

test.each(['flag', 'focus'] as const)('%s loss closes the modal and releases the open lock', async reason => {
  const view = await renderWithProviders(<Harness />);
  await layout();
  await fireEvent.press(screen.getByRole('button', { name: 'AI 어시스턴트 열기' }));
  await view.rerender(<Harness enabled={reason !== 'flag'} focused={reason !== 'focus'} />);
  expect(screen.queryByTestId('voice-assistant-screen')).toBeNull();
  await view.rerender(<Harness />);
  await layout();
  await fireEvent.press(screen.getByRole('button', { name: 'AI 어시스턴트 열기' }));
  expect(screen.getByTestId('voice-assistant-screen')).toBeVisible();
});

test('unmount detaches the sheet listener', async () => {
  const remove = jest.spyOn(sheetTop, 'removeListener');
  const view = await renderWithProviders(<Harness />);
  await layout();
  remove.mockClear();
  await view.unmount();
  expect(remove).toHaveBeenCalledTimes(1);
});
