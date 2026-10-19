import React from 'react';
import { Animated, View } from 'react-native';
import { screen, within } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../../../app/testing/testProviders';
import MapSheetSurface from '../MapSheetSurface';

test.each(['LIGHT', 'DARK'] as const)('%s shares chrome and content bounds through drag offsets', async appearancePreference => {
  for (const bottom of [0, 150, 300, 600]) {
    const view = await renderWithProviders(<MapSheetSurface testID="sheet" sheetChromeBottom={new Animated.Value(bottom)} mediumTranslateY={300}>
      <View testID="content" />
    </MapSheetSurface>, { appearancePreference });
    const gap = Math.min(bottom / 300, 1) * 8;
    const expected = { bottom: bottom + gap, left: gap, right: gap,
      borderBottomLeftRadius: Math.min(bottom / 300, 1) * 48,
      borderBottomRightRadius: Math.min(bottom / 300, 1) * 48 };
    expect(screen.getByTestId('sheet-chrome')).toHaveStyle(expected);
    const viewport = screen.getByTestId('sheet-content-viewport');
    expect(viewport).toHaveStyle({ ...expected, overflow: 'hidden', position: 'absolute' });
    expect(within(viewport).getByTestId('content')).toBeTruthy();
    await view.unmount();
  }
});

test('opaque detail retains the chrome instance and clips to the current drag offset', async () => {
  const offset = new Animated.Value(300);
  const tree = (opaque: boolean) => <MapSheetSurface testID="sheet" opaque={opaque}
    sheetChromeBottom={offset} mediumTranslateY={300}><View /></MapSheetSurface>;
  const view = await renderWithProviders(tree(false));
  const chrome = screen.getByTestId('sheet-chrome');
  await view.rerender(tree(true));
  expect(screen.getByTestId('sheet-chrome')).toBe(chrome);
  expect(chrome).toHaveStyle({ opacity: 0 });
  expect(screen.getByTestId('sheet-content-viewport')).toHaveStyle({ bottom: 300, left: 0, right: 0,
    borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 });
  expect(screen.getByTestId('sheet-inner')).toHaveStyle({ width: '100%', paddingLeft: 0, paddingRight: 0 });
  await view.rerender(tree(false));
  expect(screen.getByTestId('sheet-chrome')).toBe(chrome);
  expect(chrome).toHaveStyle({ opacity: 1 });
});

test('nonzero expanded offset keeps chrome and content on the same full-width boundary', async () => {
  for (const [bottom, gap] of [[130, 0], [215, 4], [300, 8]] as const) {
    const view = await renderWithProviders(<MapSheetSurface testID="sheet" expandedTranslateY={130}
      sheetChromeBottom={new Animated.Value(bottom)} mediumTranslateY={300}>
      <View testID="content" />
    </MapSheetSurface>);
    const expected = { bottom: bottom + gap, left: gap, right: gap,
      borderBottomLeftRadius: gap * 6, borderBottomRightRadius: gap * 6 };
    expect(screen.getByTestId('sheet-chrome')).toHaveStyle(expected);
    expect(screen.getByTestId('sheet-content-viewport')).toHaveStyle({ ...expected, overflow: 'hidden' });
    await view.unmount();
  }
});
