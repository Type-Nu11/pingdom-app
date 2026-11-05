import React from 'react';
import { NativeModules, Text } from 'react-native';
import { act, screen, waitFor } from '@testing-library/react-native';
import { createTestI18n, renderWithProviders } from '../../../../app/testing/testProviders';
import { useCommunityTranslation } from '../../hooks/useCommunityTranslation';
import CommunityTranslationActions from '../CommunityTranslationActions';

const previousBridge = NativeModules.MLKitTranslation;
afterEach(() => { NativeModules.MLKitTranslation = previousBridge; });
function TextContent({ id = 'test', texts }: { id?: string; texts: string[] }) {
  const translation = useCommunityTranslation(id, texts);
  return <><Text {...translation.textActions}>{translation.texts.join('\n\n')}</Text><CommunityTranslationActions translation={translation} /></>;
}
function setup(models: string[] = ['ko']) {
  const installed = new Set(models);
  const bridge = {
    getTranslationPlan: jest.fn(async (_text: string, target: string) => ({ sourceLanguage: 'en', targetLanguage: target, shouldTranslate: target !== 'en' })),
    getOfflineModels: jest.fn(async () => [...installed]),
    downloadOfflineModel: jest.fn(async (code: string) => { installed.add(code); }),
    translate: jest.fn(async (text: string) => ({ translatedText: `한국어:${text}` })),
  };
  NativeModules.MLKitTranslation = bridge;
  return bridge;
}
test('언어팩이 없으면 원문을 유지하고 다운로드 버튼을 누른 뒤에만 다운로드한다', async () => {
  const bridge = setup([]);
  const { user } = await renderWithProviders(<TextContent texts={['Missing pack post']} />);
  await user.longPress(screen.getByText('Missing pack post'));
  await user.press(screen.getByRole('button', { name: '번역하기' }));
  expect(await screen.findByRole('button', { name: '언어팩 다운로드 후 번역' })).toBeVisible();
  expect(screen.getByText('Missing pack post')).toBeVisible();
  expect(bridge.downloadOfflineModel).not.toHaveBeenCalled();
  await user.press(screen.getByRole('button', { name: '언어팩 다운로드 후 번역' }));
  expect(await screen.findByText('한국어:Missing pack post')).toBeVisible();
  expect(bridge.downloadOfflineModel).toHaveBeenCalledWith('ko');
});
test('제목이나 본문 하나가 실패하면 일부 번역을 섞지 않고 두 원문을 보존한다', async () => {
  const bridge = setup();
  bridge.translate.mockRejectedValueOnce(new Error('Failed'));
  const { user } = await renderWithProviders(<TextContent texts={['Atomic title', 'Atomic body\n\nSecond paragraph']} />);
  await user.longPress(screen.getByText('Atomic title\n\nAtomic body\n\nSecond paragraph'));
  await user.press(screen.getByRole('button', { name: '번역하기' }));
  expect(await screen.findByText('번역하지 못했습니다. 원문을 표시합니다.')).toBeVisible();
  expect(screen.getByText('Atomic title\n\nAtomic body\n\nSecond paragraph')).toBeVisible();
});
test('다른 글로 바뀌면 이전 글의 늦은 번역 결과를 표시하지 않는다', async () => {
  const bridge = setup();
  let finish!: (value: { translatedText: string }) => void;
  bridge.translate.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const result = await renderWithProviders(<TextContent id="old" texts={['Old slow post']} />);
  await result.user.longPress(screen.getByText('Old slow post'));
  await result.user.press(screen.getByRole('button', { name: '번역하기' }));
  await waitFor(() => expect(bridge.translate).toHaveBeenCalled());
  await result.rerender(<TextContent id="new" texts={['New post']} />);
  await act(() => finish({ translatedText: '오래된 결과' }));
  expect(screen.getByText('New post')).toBeVisible();
  expect(screen.queryByText('오래된 결과')).toBeNull();
});
test('앱 언어를 바꾸면 표시 중인 번역을 원문으로 되돌리고 새로운 목표 언어를 사용한다', async () => {
  const bridge = setup(['ko', 'ja']);
  const i18n = await createTestI18n('ko');
  const { user } = await renderWithProviders(<TextContent texts={['Language change post']} />, { i18n });
  await user.longPress(screen.getByText('Language change post'));
  await user.press(screen.getByRole('button', { name: '번역하기' }));
  expect(await screen.findByText('한국어:Language change post')).toBeVisible();
  await act(() => i18n.changeLanguage('ja'));
  expect(screen.getByText('Language change post')).toBeVisible();
  await user.longPress(screen.getByText('Language change post'));
  await user.press(screen.getByRole('button', { name: '翻訳する' }));
  await waitFor(() => expect(bridge.translate).toHaveBeenLastCalledWith('Language change post', 'en', 'ja', false));
});
