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

test('opaque detail is full bleed immediately even while the previous snap is animating', async () => {
  await renderWithProviders(<MapSheetSurface testID="sheet" opaque sheetChromeBottom={new Animated.Value(300)} mediumTranslateY={300}>
    <View />
  </MapSheetSurface>);
  expect(screen.queryByTestId('sheet-chrome')).toBeNull();
  expect(screen.getByTestId('sheet-content-viewport')).toHaveStyle({ bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 });
  expect(screen.getByTestId('sheet-inner')).toHaveStyle({ width: '100%', paddingLeft: 0, paddingRight: 0 });
});
