import React from 'react';
import { NativeModules } from 'react-native';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../app/testing/testProviders';
import PostCard from '../PostCard';

const previousBridge = NativeModules.MLKitTranslation;
afterEach(() => { NativeModules.MLKitTranslation = previousBridge; });

test('외국어 제목과 미리보기를 한국어로 번역하고 원문으로 돌아가며 글을 열지 않는다', async () => {
  const translate = jest.fn(async (text: string) => ({ translatedText: text === '大邱旅行' ? '대구 여행' : '즐거운 여행이었습니다.' }));
  NativeModules.MLKitTranslation = {
    getTranslationPlan: jest.fn(async () => ({ sourceLanguage: 'zh', targetLanguage: 'ko', shouldTranslate: true })),
    getOfflineModels: jest.fn(async () => ['zh', 'ko']),
    translate,
  };
  const onPress = jest.fn();
  const { user } = await renderWithProviders(<PostCard now={new Date()} onOpenOverflow={jest.fn()} onPress={onPress}
    post={{ postId: 901, title: '大邱旅行', contentPreview: '这是一次愉快的旅行。' }} />, { language: 'ko' });
  expect(screen.queryByRole('button', { name: '번역하기' })).toBeNull();
  await user.longPress(screen.getByRole('button', { name: '大邱旅行' }));
  await user.press(screen.getByRole('button', { name: '번역하기' }));
  expect(await screen.findByText('대구 여행')).toBeVisible();
  expect(screen.getByText('즐거운 여행이었습니다.')).toBeVisible();
  expect(translate).toHaveBeenCalledWith('大邱旅行', 'zh', 'ko', false);
  expect(screen.getByLabelText('Translated by Google')).toBeVisible();
  await user.longPress(screen.getByRole('button', { name: '대구 여행' }));
  await user.press(screen.getByRole('button', { name: '원문 보기' }));
  expect(screen.getByText('大邱旅行')).toBeVisible();
  expect(screen.getByText('这是一次愉快的旅行。')).toBeVisible();
  expect(onPress).not.toHaveBeenCalled();
});
