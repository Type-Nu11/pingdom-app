import React, { type PropsWithChildren } from 'react';
import { Animated, Platform, useWindowDimensions } from 'react-native';
import { useTheme } from 'styled-components/native';
import * as Styles from '../styles/BottomSheetGlass.styles';
import { clampSheetValue, SheetMotionView, useSheetMotionStyle, useSheetMotion } from '../hooks/useSheetMotionStyle';

type SurfaceProps = PropsWithChildren<{
  sheetChromeBottom: Animated.Value; expandedTranslateY?: number; mediumTranslateY: number;
  opaque?: boolean; expandsToFullScreen?: boolean; contentInset?: number; innerTestID?: string; testID: string;
}>;

export default function MapSheetSurface(props: SurfaceProps) {
  const motion = useSheetMotion();
  return motion ? <UiMapSheetSurface {...props} /> : <LegacyMapSheetSurface {...props} />;
}

function UiMapSheetSurface({ children, expandedTranslateY = 0, mediumTranslateY, opaque = false, expandsToFullScreen = false,
  contentInset = 0, innerTestID, testID }: SurfaceProps) {
  const { liquidGlass } = useTheme();
  const motion = useSheetMotion()!;
  const { height } = motion;
  const { width } = useWindowDimensions();
  const topRadius = opaque ? 0 : liquidGlass.sheet.topRadius;
  const sheetTopRadius = liquidGlass.sheet.topRadius;
  const bottomRadius = liquidGlass.sheet.bottomRadius;
  const end = Math.max(expandedTranslateY + 1, mediumTranslateY);
  const followsPosition = expandsToFullScreen || !opaque;
  // Keep the blur recording tall and stable, while the visible bounds and
  // scroll viewport follow the finger instead of jumping at spring completion.
  // Children keep the expanded width behind that clip: narrowing their parent
  // must not reflow every photo and text row on every animation frame.
  const viewportStyle = useSheetMotionStyle(position => {
    'worklet';
    const inset = followsPosition ? clampSheetValue(position, [expandedTranslateY, end], [0, 8]) : 0;
    return { bottom: inset, left: inset, right: inset, transform: [{ translateY: -position }],
      borderBottomLeftRadius: followsPosition ? clampSheetValue(position, [expandedTranslateY, end], [0, bottomRadius]) : 0,
      borderBottomRightRadius: followsPosition ? clampSheetValue(position, [expandedTranslateY, end], [0, bottomRadius]) : 0 };
  }, {});
  const movingCorners = useSheetMotionStyle(position => {
    'worklet';
    const radius = expandsToFullScreen
      ? clampSheetValue(position, [expandedTranslateY, end], [0, sheetTopRadius]) : topRadius;
    return { borderTopLeftRadius: radius, borderTopRightRadius: radius };
  }, {});
  const restorePosition = useSheetMotionStyle(position => {
    'worklet';
    return { transform: [{ translateY: position }] };
  }, {});
  const contentPosition = useSheetMotionStyle(position => {
    'worklet';
    const inset = followsPosition ? clampSheetValue(position, [expandedTranslateY, end], [0, 8]) : 0;
    return { height: Math.max(0, height - position - inset), transform: [{ translateX: -inset }, { translateY: position }] };
  }, {});
  const glassOpacity = useSheetMotionStyle(position => {
    'worklet';
    return { opacity: clampSheetValue(position, [expandedTranslateY, expandedTranslateY + 1], [0, 1]) };
  }, {});
  const fillOpacity = useSheetMotionStyle(position => {
    'worklet';
    return { opacity: clampSheetValue(position, [expandedTranslateY, end], [1, 0]) };
  }, {});
  const clipBounds = { top: 0 };
  const topCorners = { borderTopLeftRadius: topRadius, borderTopRightRadius: topRadius,
    borderBottomLeftRadius: 0, borderBottomRightRadius: 0 };
  return <>
    <Styles.SheetContentViewport pointerEvents="none" testID={`${testID}-background-viewport`} style={[clipBounds, viewportStyle]}>
      {/* Fit decoration to the inset viewport instead of clipping a full-window
          rounded surface. Content below retains its stable width during drag. */}
      <Styles.SheetChromeShadow testID={`${testID}-chrome`} style={[{ height, width: '100%', bottom: undefined,
        ...topCorners, opacity: opaque && !expandsToFullScreen ? 0 : 1, boxShadow: liquidGlass.sheet.shadow }, movingCorners, restorePosition]}>
        <Styles.SheetChrome $borderColor={liquidGlass.sheet.rim} style={[topCorners, movingCorners]}>
          <SheetMotionView pointerEvents="none" testID={`${testID}-background-glass`}
            style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, glassOpacity]}>
            <Styles.SheetGlass cornerRadius={topRadius} glassEffectStyle="regular" highlightHeight={40}
              material={Platform.OS === 'ios' ? 'frosted' : 'liquid'} backdropBlurEnabled={Platform.OS !== 'ios'}
              highlightOpacity={liquidGlass.sheet.highlightOpacity} rimColor={liquidGlass.sheet.rim}
              tintColor={liquidGlass.sheet.tint} topRimOnly />
          </SheetMotionView>
          <Styles.SheetExpandedFill pointerEvents="none" style={fillOpacity} testID="sheet-expanded-fill" />
        </Styles.SheetChrome>
      </Styles.SheetChromeShadow>
    </Styles.SheetContentViewport>
    {/* The inverse translation makes this clip cover the map above the sheet.
        Only its visible content may receive touches; the empty clip must pass
        them through to search, profile, categories and map controls on iOS. */}
    <Styles.SheetContentViewport pointerEvents="box-none" style={[clipBounds, viewportStyle]} testID={`${testID}-content-viewport`}>
      <SheetMotionView testID={`${testID}-content-position`} style={[{
        width, ...topCorners, overflow: 'hidden' }, movingCorners, contentPosition]}>
        <Styles.SheetInner $clipContent $inset={opaque ? 0 : contentInset} $opaque={opaque}
          testID={innerTestID ?? `${testID}-inner`} style={opaque ? { width: '100%' } : undefined}>
          {children}
        </Styles.SheetInner>
      </SheetMotionView>
    </Styles.SheetContentViewport>
  </>;
}

/** Standalone sheets retain the existing Animated contract. */
function LegacyMapSheetSurface({ children, sheetChromeBottom, expandedTranslateY = 0, mediumTranslateY, opaque = false, contentInset = 0, innerTestID, testID }: PropsWithChildren<{
  sheetChromeBottom: Animated.Value; expandedTranslateY?: number; mediumTranslateY: number; opaque?: boolean; contentInset?: number; innerTestID?: string; testID: string;
}>) {
  const { liquidGlass } = useTheme();
  // Expanded pages can stop below the status bar; chrome and clipping share that offset.
  const range = expandedTranslateY < mediumTranslateY
    ? [expandedTranslateY, mediumTranslateY]
    : [0, Math.max(mediumTranslateY, 1)];
  const gap = sheetChromeBottom.interpolate({ inputRange: range, outputRange: [0, 8], extrapolate: 'clamp' });
  const bottom = Animated.add(sheetChromeBottom, gap);
  const radius = sheetChromeBottom.interpolate({ inputRange: range, outputRange: [0, liquidGlass.sheet.bottomRadius], extrapolate: 'clamp' });
  const expandedFillOpacity = sheetChromeBottom.interpolate({ inputRange: range, outputRange: [1, 0], extrapolate: 'clamp' });
  const backgroundGlassOpacity = sheetChromeBottom.interpolate({
    inputRange: [expandedTranslateY, expandedTranslateY + 1], outputRange: [0, 1], extrapolate: 'clamp',
  });
  const corners = {
    borderTopLeftRadius: opaque ? 0 : liquidGlass.sheet.topRadius,
    borderTopRightRadius: opaque ? 0 : liquidGlass.sheet.topRadius,
    borderBottomLeftRadius: opaque ? 0 : radius, borderBottomRightRadius: opaque ? 0 : radius,
  };
  const bounds = opaque ? { bottom: sheetChromeBottom, left: 0, right: 0 } : { bottom, left: gap, right: gap };
  const topRadius = liquidGlass.sheet.topRadius;
  const bottomRadius = liquidGlass.sheet.bottomRadius;
  const inputStart = range[0];
  const inputEnd = range[1];
  const geometry = useSheetMotionStyle(position => {
    'worklet';
    const progress = clampSheetValue(position, [inputStart, inputEnd], [0, 1]);
    const inset = opaque ? 0 : progress * 8;
    const radiusValue = opaque ? 0 : progress * bottomRadius;
    return { bottom: position + inset, left: inset, right: inset,
      borderTopLeftRadius: opaque ? 0 : topRadius, borderTopRightRadius: opaque ? 0 : topRadius,
      borderBottomLeftRadius: radiusValue, borderBottomRightRadius: radiusValue };
  }, { ...bounds, ...corners });
  const chromeCorners = useSheetMotionStyle(position => {
    'worklet';
    const radiusValue = opaque ? 0 : clampSheetValue(position, [inputStart, inputEnd], [0, bottomRadius]);
    return { borderTopLeftRadius: opaque ? 0 : topRadius, borderTopRightRadius: opaque ? 0 : topRadius,
      borderBottomLeftRadius: radiusValue, borderBottomRightRadius: radiusValue };
  }, corners);
  const glassOpacity = useSheetMotionStyle(position => {
    'worklet';
    return { opacity: clampSheetValue(position, [expandedTranslateY, expandedTranslateY + 1], [0, 1]) };
  }, { opacity: backgroundGlassOpacity });
  const fillOpacity = useSheetMotionStyle(position => {
    'worklet';
    return { opacity: clampSheetValue(position, [inputStart, inputEnd], [1, 0]) };
  }, { opacity: expandedFillOpacity });
  return <>
    <Styles.SheetChromeShadow pointerEvents="none" testID={`${testID}-chrome`}
      style={[geometry, { opacity: opaque ? 0 : 1, boxShadow: liquidGlass.sheet.shadow }]}>
      <Styles.SheetChrome $borderColor={liquidGlass.sheet.rim} style={chromeCorners}>
        <SheetMotionView pointerEvents="none" testID={`${testID}-background-glass`}
          style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, glassOpacity]}>
        <Styles.SheetGlass cornerRadius={liquidGlass.sheet.topRadius} glassEffectStyle="regular"
          material={Platform.OS === 'ios' ? 'frosted' : 'liquid'} backdropBlurEnabled={Platform.OS !== 'ios'}
          highlightHeight={40} highlightOpacity={liquidGlass.sheet.highlightOpacity}
          rimColor={liquidGlass.sheet.rim} tintColor={liquidGlass.sheet.tint} topRimOnly />
        </SheetMotionView>
        <Styles.SheetExpandedFill pointerEvents="none" style={fillOpacity} testID="sheet-expanded-fill" />
      </Styles.SheetChrome>
    </Styles.SheetChromeShadow>
    <Styles.SheetContentViewport style={geometry} testID={`${testID}-content-viewport`}>
      <Styles.SheetInner $clipContent $inset={opaque ? 0 : contentInset} $opaque={opaque} testID={innerTestID ?? `${testID}-inner`}
        style={opaque ? { width: '100%' } : undefined}>
        {children}
      </Styles.SheetInner>
    </Styles.SheetContentViewport>
  </>;
}
