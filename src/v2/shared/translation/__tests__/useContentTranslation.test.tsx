import React from 'react';
import { NativeModules, Text } from 'react-native';
import { act, renderHook, screen, waitFor } from '@testing-library/react-native';
import { createTestWrapper, renderWithProviders } from '../../../app/testing/testProviders';
import { nativeTranslation } from '../service';
import { useContentTranslation } from '../useContentTranslation';
import TranslatedPlaceName from '../TranslatedPlaceName';
import { TranslationAttributionGroup, TranslationAttributionNotice } from '../TranslationAttributionGroup';

const previousBridge = NativeModules.MLKitTranslation;
afterEach(() => { NativeModules.MLKitTranslation = previousBridge; });
function bridge(models = ['ko', 'ja']) {
  const installed = new Set(models);
  const native = {
    getTranslationPlan: jest.fn(async (_text: string, target: string) => ({ sourceLanguage: 'en', targetLanguage: target, shouldTranslate: target !== 'en' })),
    getOfflineModels: jest.fn(async () => [...installed]),
    downloadOfflineModel: jest.fn(async (code: string) => { installed.add(code); }),
    translateOffline: jest.fn(async (text: string, target: string) => `${target}:${text}`),
    translate: jest.fn(async (text: string, _source: string, target: string) => ({ translatedText: `${target}:${text}` })),
  };
  NativeModules.MLKitTranslation = native;
  return native;
}

test('원문 보기는 같은 글의 새 배열·재렌더에 유지되고 앱 언어 변경은 자동 반영한다', async () => {
  const native = bridge();
  const { wrapper, i18n } = await createTestWrapper();
  const view = await renderHook(({ texts }: { texts: string[] }) => useContentTranslation('stable', texts), { wrapper, initialProps: { texts: ['Stable original choice'] } });
  await waitFor(() => expect(view.result.current.texts).toEqual(['ko:Stable original choice']));
  await act(() => view.result.current.onPress());
  await view.rerender({ texts: ['Stable original choice'] });
  expect(view.result.current.texts).toEqual(['Stable original choice']);
  expect(native.translate).toHaveBeenCalledTimes(1);
  await act(() => i18n.changeLanguage('ja'));
  await waitFor(() => expect(view.result.current.texts).toEqual(['ja:Stable original choice']));
  expect(native.translate).toHaveBeenLastCalledWith('Stable original choice', 'en', 'ja', false);
});

test('다른 화면에서 언어팩을 받으면 원문으로 대기하던 콘텐츠가 자동 번역된다', async () => {
  const native = bridge([]);
  const { wrapper } = await createTestWrapper();
  const view = await renderHook(() => useContentTranslation('download-watch', ['Pack completion original']), { wrapper });
  await waitFor(() => expect(view.result.current.phase).toBe('needsDownload'));
  expect(view.result.current.texts).toEqual(['Pack completion original']);
  expect(native.downloadOfflineModel).not.toHaveBeenCalled();
  await act(() => nativeTranslation.downloadModels(['ko']));
  await waitFor(() => expect(view.result.current.texts).toEqual(['ko:Pack completion original']));
  expect(native.downloadOfflineModel).toHaveBeenCalledTimes(1);
});

test('동일 언어·빈 본문·미지원 브리지는 번역 요청 없이 원문을 유지한다', async () => {
  const native = bridge();
  const { wrapper } = await createTestWrapper({ language: 'en' });
  const view = await renderHook(({ text }: { text: string }) => useContentTranslation('same-or-empty', [text]), { wrapper, initialProps: { text: 'Same language original' } });
  await waitFor(() => expect(view.result.current.phase).toBe('sameLanguage'));
  expect(view.result.current.texts).toEqual(['Same language original']);
  await view.rerender({ text: ' ' });
  expect(native.translate).not.toHaveBeenCalled();
  expect(native.downloadOfflineModel).not.toHaveBeenCalled();
  NativeModules.MLKitTranslation = undefined;
  await view.rerender({ text: 'Unavailable bridge original' });
  await waitFor(() => expect(view.result.current.phase).toBe('unavailable'));
  expect(view.result.current.texts).toEqual(['Unavailable bridge original']);
});

test('같은 항목의 원문이 수정되면 이전 번역을 지우고 새 원문만 자동 번역한다', async () => {
  const native = bridge();
  let finish!: (value: { translatedText: string }) => void;
  native.translate.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const { wrapper } = await createTestWrapper();
  const view = await renderHook(({ text }: { text: string }) => useContentTranslation('edited-post', [text]), { wrapper, initialProps: { text: 'Slow original before edit' } });
  await waitFor(() => expect(native.translate).toHaveBeenCalled());
  await view.rerender({ text: 'New edited original' });
  await waitFor(() => expect(view.result.current.texts).toEqual(['ko:New edited original']));
  await act(() => finish({ translatedText: 'Stale edit result' }));
  expect(view.result.current.texts).toEqual(['ko:New edited original']);
});

test('짧은 한국어 장소명은 언어 감지 실패에 영향받지 않고 앱 언어로 번역한다', async () => {
  const native = bridge();
  native.getTranslationPlan.mockRejectedValue(new Error('UNSUPPORTED_LANGUAGE'));
  const view = await renderWithProviders(<TranslatedPlaceName name="용짬뽕">{(name, actions) => <Text {...actions}>{name}</Text>}</TranslatedPlaceName>, { language: 'ja' });
  expect(await screen.findByText('ja:용짬뽕')).toBeVisible();
  expect(native.getTranslationPlan).not.toHaveBeenCalled();
  expect(native.translateOffline).toHaveBeenCalledWith('용짬뽕', 'ja');
  await view.user.longPress(screen.getByText('ja:용짬뽕'));
  await view.user.press(screen.getByRole('button', { name: '原文を表示' }));
  expect(screen.getByText('용짬뽕')).toBeVisible();
});

test('한국어로 전환하면 장소명은 원문으로 돌아가고 공통 Google 표시도 사라진다', async () => {
  const native = bridge();
  const view = await renderWithProviders(<TranslationAttributionGroup>
    <TranslationAttributionNotice />
    <TranslatedPlaceName name="한국어 전환 장소">{(name, actions) => <Text {...actions}>{name}</Text>}</TranslatedPlaceName>
    <TranslatedPlaceName name="Original brand">{(name, actions) => <Text {...actions}>{name}</Text>}</TranslatedPlaceName>
  </TranslationAttributionGroup>, { language: 'en' });
  expect(await screen.findByText('en:한국어 전환 장소')).toBeVisible();
  expect(screen.getAllByLabelText('Translated by Google')).toHaveLength(1);
  const planCalls = native.getTranslationPlan.mock.calls.length;
  await act(() => view.i18n.changeLanguage('ko'));
  expect(screen.getByText('한국어 전환 장소')).toBeVisible();
  expect(screen.getByText('Original brand')).toBeVisible();
  await waitFor(() => expect(screen.queryByTestId('translation-attribution-notice')).toBeNull());
  expect(native.getTranslationPlan).toHaveBeenCalledTimes(planCalls);
  expect(native.translate).not.toHaveBeenCalled();
  expect(native.translateOffline).toHaveBeenCalledTimes(1);
});
