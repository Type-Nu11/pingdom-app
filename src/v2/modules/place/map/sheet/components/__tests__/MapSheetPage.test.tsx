import React, { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../../../app/testing/testProviders';
import { MapSheetScrollToTopProvider, useMapSheetScrollToTop } from '../../hooks/useMapSheetScrollToTop';
import MapSheetPage from '../MapSheetPage';

test('visited pages retain local state and do not remount when returning from another tab', async () => {
  const mounted = jest.fn();
  const unmounted = jest.fn();
  function Content() {
    const [count, setCount] = useState(0);
    useEffect(() => { mounted(); return unmounted; }, []);
    return <Pressable accessibilityRole="button" accessibilityLabel="increment" onPress={() => setCount(value => value + 1)}><Text>{count}</Text></Pressable>;
  }
  const tree = (active: boolean) => <MapSheetPage active={active} testID="page"><Content /></MapSheetPage>;
  const view = await renderWithProviders(tree(false));
  expect(mounted).not.toHaveBeenCalled();
  await view.rerender(tree(true));
  await fireEvent.press(screen.getByRole('button', { name: 'increment' }));
  await view.rerender(tree(false));
  expect(screen.getByTestId('page', { includeHiddenElements: true })).toHaveStyle({ display: 'none' });
  expect(screen.queryByRole('button', { name: 'increment' })).toBeNull();
  await view.rerender(tree(true));
  expect(screen.getByText('1')).toBeVisible();
  expect(mounted).toHaveBeenCalledTimes(1);
  expect(unmounted).not.toHaveBeenCalled();
});

test('hidden pages skip parent prop updates until shown again', async () => {
  const rendered = jest.fn();
  function Content({ value }: { value: string }) { rendered(value); return <Text>{value}</Text>; }
  const tree = (active: boolean, value: string) => <MapSheetPage active={active} testID="page"><Content value={value} /></MapSheetPage>;
  const view = await renderWithProviders(tree(true, 'initial'));
  await view.rerender(tree(false, 'hidden'));
  rendered.mockClear();
  await view.rerender(tree(false, 'updated'));
  expect(rendered).not.toHaveBeenCalled();
  await view.rerender(tree(true, 'updated'));
  expect(screen.getByText('updated')).toBeVisible();
});

test('navbar double tap scrolls only the visible page and is not replayed on return', async () => {
  const scrollA = jest.fn();
  const scrollB = jest.fn();
  function Content({ onScroll }: { onScroll: () => void }) { useMapSheetScrollToTop(onScroll); return null; }
  const tree = (active: 'a' | 'b', request: number) => <MapSheetScrollToTopProvider value={request}>
    <MapSheetPage active={active === 'a'} testID="a"><Content onScroll={scrollA} /></MapSheetPage>
    <MapSheetPage active={active === 'b'} testID="b"><Content onScroll={scrollB} /></MapSheetPage>
  </MapSheetScrollToTopProvider>;
  const view = await renderWithProviders(tree('a', 0));
  await view.rerender(tree('b', 0));
  await view.rerender(tree('b', 1));
  expect(scrollA).not.toHaveBeenCalled();
  expect(scrollB).toHaveBeenCalledTimes(1);
  await view.rerender(tree('a', 1));
  expect(scrollA).not.toHaveBeenCalled();
  await view.rerender(tree('a', 2));
  expect(scrollA).toHaveBeenCalledTimes(1);
  expect(scrollB).toHaveBeenCalledTimes(1);
});
