import React from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
import { screen, within } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../../../app/testing/testProviders';
import { darkColors, lightColors } from '../../../../../../shared/theme';
import MapSheetSurface from '../MapSheetSurface';
import { SheetMotionProvider } from '../../hooks/useSheetMotionStyle';
import { useSharedValue } from 'react-native-reanimated';

jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  interpolate: jest.requireActual('react-native-reanimated/src/interpolation').interpolate,
}));

test('UI motion continuously sizes the viewport while retaining fixed-height glass', async () => {
  function Sheet() {
    const position = useSharedValue(150);
    return <SheetMotionProvider value={{ position, mediumTranslateY: 300, height: 800, restingTranslateY: 150 }}>
      <MapSheetSurface testID="sheet" sheetChromeBottom={new Animated.Value(600)} mediumTranslateY={300}><View /></MapSheetSurface>
    </SheetMotionProvider>;
  }
  await renderWithProviders(<Sheet />);
  for (const id of ['sheet-background-viewport', 'sheet-content-viewport']) {
    expect(screen.getByTestId(id)).toHaveStyle({ bottom: 4, left: 4, right: 4, transform: [{ translateY: -150 }],
      borderBottomLeftRadius: 24, borderBottomRightRadius: 24 });
  }
  expect(screen.getByTestId('sheet-chrome')).toHaveStyle({ height: 800, width: '100%', transform: [{ translateY: 150 }] });
  expect(screen.getByTestId('sheet-content-position')).toHaveStyle({ height: 646, transform: [{ translateX: -4 }, { translateY: 150 }] });
  expect(screen.getByTestId('sheet-expanded-fill')).toHaveStyle({ opacity: 0.5 });
});

test.each([130, 215, 300, 600])('sheet chrome fits both inset edges without cropping either corner at offset %s', async offset => {
  function Sheet() {
    const position = useSharedValue(offset);
    return <SheetMotionProvider value={{ position, mediumTranslateY: 300, height: 800, restingTranslateY: offset }}>
      <MapSheetSurface testID="sheet" expandedTranslateY={130} sheetChromeBottom={new Animated.Value(offset)} mediumTranslateY={300}>
        <View />
      </MapSheetSurface>
    </SheetMotionProvider>;
  }
  await renderWithProviders(<Sheet />);
  const inset = Math.min(1, Math.max(0, (offset - 130) / 170)) * 8;
  expect(screen.getByTestId('sheet-background-viewport')).toHaveStyle({ left: inset, right: inset });
  // A full-window width plus negative X translation cuts both rounded edges.
  // Fit the decoration inside its actual parent; content retains stable width.
  expect(screen.getByTestId('sheet-chrome')).toHaveStyle({ width: '100%', transform: [{ translateY: offset }] });
  expect(screen.getByTestId('sheet-content-viewport').props.pointerEvents).toBe('box-none');
});

test.each(['ios', 'android'] as const)('%s: the full-screen clip passes empty-space touches through while sheet buttons remain active', async platform => {
  jest.replaceProperty(Platform, 'OS', platform);
  const onPress = jest.fn();
  function Sheet() {
    const position = useSharedValue(300);
    return <SheetMotionProvider value={{ position, mediumTranslateY: 300, height: 800, restingTranslateY: 300 }}>
      <MapSheetSurface testID="sheet" sheetChromeBottom={new Animated.Value(300)} mediumTranslateY={300}>
        <Pressable accessibilityRole="button" onPress={onPress}><Text>시트 버튼</Text></Pressable>
      </MapSheetSurface>
    </SheetMotionProvider>;
  }
  const view = await renderWithProviders(<Sheet />);
  expect(screen.getByTestId('sheet-content-viewport').props.pointerEvents).toBe('box-none');
  expect(screen.getByTestId('sheet-background-viewport').props.pointerEvents).toBe('none');
  await view.user.press(screen.getByRole('button', { name: '시트 버튼' }));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('settled snap changes do not resize a sheet at the same finger position', async () => {
  function Sheet({ resting }: { resting: number }) {
    const position = useSharedValue(215);
    return <SheetMotionProvider value={{ position, mediumTranslateY: 300, height: 800, restingTranslateY: resting }}>
      <MapSheetSurface testID="sheet" expandedTranslateY={130} sheetChromeBottom={new Animated.Value(300)} mediumTranslateY={300}><View /></MapSheetSurface>
    </SheetMotionProvider>;
  }
  const view = await renderWithProviders(<Sheet resting={300} />);
  const expected = { bottom: 4, left: 4, right: 4 };
  expect(screen.getByTestId('sheet-content-viewport')).toHaveStyle(expected);
  expect(screen.getByTestId('sheet-content-position')).toHaveStyle({ height: 581 });
  await view.rerender(<Sheet resting={130} />);
  expect(screen.getByTestId('sheet-content-viewport')).toHaveStyle(expected);
  expect(screen.getByTestId('sheet-content-position')).toHaveStyle({ height: 581 });
});

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
    expect(screen.getByTestId('sheet-expanded-fill')).toHaveStyle({
      opacity: 1 - Math.min(bottom / 300, 1),
      backgroundColor: (appearancePreference === 'DARK' ? darkColors : lightColors).backgroundAssistive,
    });
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

test.each([[130, 0], [131, 1], [300, 1]] as const)('불투명 배경에 덮인 큰 블러는 %s 위치에서 opacity %s로 합성한다', async (offset, opacity) => {
  await renderWithProviders(<MapSheetSurface testID="sheet" expandedTranslateY={130} mediumTranslateY={300} sheetChromeBottom={new Animated.Value(offset)}><View /></MapSheetSurface>);
  expect(screen.getByTestId('sheet-background-glass')).toHaveStyle({ opacity });
});
