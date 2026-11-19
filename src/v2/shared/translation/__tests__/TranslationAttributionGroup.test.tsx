import React from 'react';
import { Text, View } from 'react-native';
import { screen, waitFor, within } from '@testing-library/react-native';
import { renderWithProviders } from '../../../app/testing/testProviders';
import { TranslationAttributionGroup, TranslationAttributionNotice } from '../TranslationAttributionGroup';
import ContentTranslationActions from '../ContentTranslationActions';
import type { useContentTranslation } from '../useContentTranslation';

function Result({ id, translated = true }: { id: string; translated?: boolean }) {
  const translation = {
    hasText: true, phase: translated ? 'translated' : 'original', busy: false,
    open: false, onClose: () => undefined, onPress: () => undefined,
  } as ReturnType<typeof useContentTranslation>;
  return <View testID={`result-${id}`}><Text>{id}</Text><ContentTranslationActions translation={translation} /></View>;
}

test('여러 번역 카드에서 배지를 빼고 목록 옆에 하나만 표시한다', async () => {
  await renderWithProviders(<TranslationAttributionGroup>
    <TranslationAttributionNotice /><Result id="first" /><Result id="second" /><Result id="third" />
  </TranslationAttributionGroup>);
  await waitFor(() => expect(screen.getAllByLabelText('Translated by Google')).toHaveLength(1));
  for (const id of ['first', 'second', 'third']) {
    expect(within(screen.getByTestId(`result-${id}`)).queryByLabelText('Translated by Google')).toBeNull();
  }
  expect(within(screen.getByTestId('translation-attribution-notice')).getByLabelText('Translated by Google')).toBeVisible();
});

test('모두 원문으로 전환하거나 번역된 카드를 제거하면 공통 표시도 없어진다', async () => {
  const renderList = (first: boolean, second: boolean, mounted = true) => <TranslationAttributionGroup>
    <TranslationAttributionNotice /><Result id="one" translated={first} />
    {mounted && <Result id="two" translated={second} />}
  </TranslationAttributionGroup>;
  const view = await renderWithProviders(renderList(true, true));
  await waitFor(() => expect(screen.getAllByLabelText('Translated by Google')).toHaveLength(1));
  await view.rerender(renderList(false, true));
  expect(screen.getAllByLabelText('Translated by Google')).toHaveLength(1);
  await view.rerender(renderList(false, false));
  await waitFor(() => expect(screen.queryByLabelText('Translated by Google')).toBeNull());
  await view.rerender(renderList(false, true));
  await waitFor(() => expect(screen.getAllByLabelText('Translated by Google')).toHaveLength(1));
  await view.rerender(renderList(false, true, false));
  await waitFor(() => expect(screen.queryByLabelText('Translated by Google')).toBeNull());
});

test('서로 다른 목록은 각자 번역 상태를 관리하고 단독 결과는 출처를 유지한다', async () => {
  await renderWithProviders(<>
    <TranslationAttributionGroup><TranslationAttributionNotice /><Result id="translated" /></TranslationAttributionGroup>
    <TranslationAttributionGroup><TranslationAttributionNotice /><Result id="original" translated={false} /></TranslationAttributionGroup>
    <Result id="standalone" />
  </>);
  await waitFor(() => expect(screen.getAllByLabelText('Translated by Google')).toHaveLength(2));
  expect(within(screen.getByTestId('result-standalone')).getByLabelText('Translated by Google')).toBeVisible();
});
