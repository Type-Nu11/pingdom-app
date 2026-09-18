import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';

import GlassSurface from '../GlassSurface';
import MapGlassBackdrop from '../MapGlassBackdrop';
import { renderWithProviders } from '../../../../../../shared/testing/testProviders';

jest.mock('expo-glass-effect', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    GlassView: (props: object) => React.createElement(View, { ...props, testID: 'native-glass' }),
    isGlassEffectAPIAvailable: jest.fn(),
    isLiquidGlassAvailable: jest.fn(),
  };
});

jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    BlurView: (props: object) => React.createElement(View, { ...props, testID: 'glass-blur' }),
    BlurTargetView: View,
  };
});

jest.mock('../../../../../../shared/native/MapGlassBackdropNativeView', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: (props: object) => React.createElement(View, { ...props, testID: 'native-map-capture' }),
  };
});

beforeEach(() => {
  jest.mocked(isGlassEffectAPIAvailable).mockReturnValue(true);
  jest.mocked(isLiquidGlassAvailable).mockReturnValue(true);
});

test('지원하는 iOS에서는 네이티브 Liquid Glass와 내부 버튼 동작을 유지한다', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  const onPress = jest.fn();

  await render(
    <GlassSurface glassEffectStyle="regular" interactive accessibilityLabel="지도 도구">
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Text>현재 위치</Text>
      </Pressable>
    </GlassSurface>,
  );

  expect(screen.getByTestId('native-glass').props).toMatchObject({
    accessibilityLabel: '지도 도구',
    glassEffectStyle: 'regular',
    isInteractive: true,
    tintColor: 'rgba(255, 255, 255, 0.18)',
  });
  expect(screen.queryByTestId('glass-blur')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: '현재 위치' }));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test.each([
  { apiAvailable: false, liquidGlassAvailable: true },
  { apiAvailable: true, liquidGlassAvailable: false },
])('iOS 지원 조건을 충족하지 않으면 기본 블러를 사용한다: %o', async ({ apiAvailable, liquidGlassAvailable }) => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  jest.mocked(isGlassEffectAPIAvailable).mockReturnValue(apiAvailable);
  jest.mocked(isLiquidGlassAvailable).mockReturnValue(liquidGlassAvailable);

  await render(<GlassSurface><Text>주변 장소</Text></GlassSurface>);

  expect(screen.queryByTestId('native-glass')).toBeNull();
  expect(screen.getByTestId('glass-blur').props.blurMethod).toBe('none');
  expect(screen.getByText('주변 장소')).toBeVisible();
});

test('Android 유리 표면들이 같은 지도 배경만 흐리고 내부 버튼은 계속 누를 수 있다', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const onPress = jest.fn();

  await render(
    <MapGlassBackdrop active>
      <View testID="live-map" />
      <GlassSurface>
        <Pressable accessibilityRole="button" onPress={onPress}>
          <Text>현재 위치</Text>
        </Pressable>
      </GlassSurface>
      <GlassSurface><Text>주변 장소</Text></GlassSurface>
    </MapGlassBackdrop>,
  );

  const [firstBlur, secondBlur] = screen.getAllByTestId('glass-blur');
  expect(firstBlur.props.blurTarget).toBeDefined();
  expect(secondBlur.props.blurTarget).toBe(firstBlur.props.blurTarget);
  for (const blur of [firstBlur, secondBlur]) {
    expect(blur.props.blurMethod).toBe('dimezisBlurView');
    expect(blur.props.tint).toBe('systemUltraThinMaterialLight');
    expect(blur.props.intensity).toBe(56);
    expect(blur.props.pointerEvents).toBe('none');
    expect(blur.children).toHaveLength(0);
  }
  expect(screen.getByTestId('map-glass-backdrop', { includeHiddenElements: true }).props).toMatchObject({
    accessibilityElementsHidden: true,
    importantForAccessibility: 'no-hide-descendants',
    pointerEvents: 'none',
  });
  expect(screen.getByTestId('native-map-capture', { includeHiddenElements: true }).props.captureEnabled).toBe(true);
  expect(screen.getByTestId('live-map')).toBeVisible();
  expect(screen.queryByTestId('native-glass')).toBeNull();
  expect(isGlassEffectAPIAvailable).not.toHaveBeenCalled();
  expect(isLiquidGlassAvailable).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: '현재 위치' }));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test.each([
  { platform: 'android' as const, hasTarget: true, nativeGlass: false, expectedTint: 'rgba(255,255,255,0.2582)' },
  { platform: 'android' as const, hasTarget: false, nativeGlass: false, expectedTint: 'rgba(255,255,255,0.36)' },
  { platform: 'ios' as const, hasTarget: true, nativeGlass: false, expectedTint: 'rgba(255,255,255,0.36)' },
  { platform: 'ios' as const, hasTarget: true, nativeGlass: true, expectedTint: 'rgba(255,255,255,0.36)' },
])('Android 틴트 보정은 실제 지도 블러에만 적용한다: %o', async ({
  platform, hasTarget, nativeGlass, expectedTint,
}) => {
  jest.replaceProperty(Platform, 'OS', platform);
  jest.mocked(isLiquidGlassAvailable).mockReturnValue(nativeGlass);
  const surface = (
    <GlassSurface
      androidTintColor="rgba(255,255,255,0.2582)"
      blurTint="default"
      intensity={32}
      testID="tinted-glass"
      tintColor="rgba(255,255,255,0.36)"
    />
  );

  await render(hasTarget ? <MapGlassBackdrop active>{surface}</MapGlassBackdrop> : surface);

  if (nativeGlass) {
    expect(screen.getByTestId('native-glass').props.tintColor).toBe(expectedTint);
    expect(screen.getByTestId('native-glass').props.androidTintColor).toBeUndefined();
    expect(screen.getByTestId('native-glass').props.blurTint).toBeUndefined();
  } else {
    const tintLayer = screen.getByTestId('tinted-glass').children.at(-1);
    expect(tintLayer).toHaveStyle({ backgroundColor: expectedTint });
    if (platform === 'ios' || hasTarget) {
      expect(screen.getByTestId('glass-blur').props.tint).toBe('default');
    } else {
      expect(screen.queryByTestId('glass-blur')).toBeNull();
    }
  }
});

test('Android 배경 target이 없어도 콘텐츠를 표시하고 버튼 입력을 처리한다', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const onPress = jest.fn();

  await render(
    <GlassSurface>
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Text>현재 위치</Text>
      </Pressable>
    </GlassSurface>,
  );

  expect(screen.queryByTestId('glass-blur')).toBeNull();
  expect(screen.queryByTestId('native-glass')).toBeNull();
  expect(screen.getByText('현재 위치')).toBeVisible();
  fireEvent.press(screen.getByRole('button', { name: '현재 위치' }));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('지도를 비활성화하면 공유 배경 캡처도 비활성화한다', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const { rerender } = await render(
    <MapGlassBackdrop active><Text>지도 콘텐츠</Text></MapGlassBackdrop>,
  );

  await rerender(
    <MapGlassBackdrop active={false}><Text>지도 콘텐츠</Text></MapGlassBackdrop>,
  );

  expect(screen.getByTestId('native-map-capture', { includeHiddenElements: true }).props.captureEnabled).toBe(false);
  expect(screen.getByText('지도 콘텐츠')).toBeVisible();
});

test('dark theme synchronizes native glass, blur, and opaque fallback defaults', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  await renderWithProviders(<GlassSurface testID="dark-glass" />, {
    appearancePreference: 'DARK',
    colorScheme: 'light',
  });
  expect(screen.getByTestId('native-glass').props).toMatchObject({
    colorScheme: 'dark',
    tintColor: 'rgba(27, 27, 32, 0.72)',
  });

  jest.mocked(isLiquidGlassAvailable).mockReturnValue(false);
  await renderWithProviders(<GlassSurface testID="dark-blur" />, {
    appearancePreference: 'DARK',
  });
  expect(screen.getByTestId('glass-blur').props.tint).toBe('systemUltraThinMaterialDark');
  expect(screen.getByTestId('dark-blur').children.at(-1)).toHaveStyle({
    backgroundColor: 'rgba(27, 27, 32, 0.96)',
  });
});
