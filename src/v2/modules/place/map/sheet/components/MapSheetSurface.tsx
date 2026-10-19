import React, { type PropsWithChildren } from 'react';
import { Animated } from 'react-native';
import { useTheme } from 'styled-components/native';
import * as Styles from '../styles/BottomSheetGlass.styles';

/** Background and native clipping viewport must always share one geometry. */
export default function MapSheetSurface({ children, sheetChromeBottom, mediumTranslateY, opaque = false, testID }: PropsWithChildren<{
  sheetChromeBottom: Animated.Value; mediumTranslateY: number; opaque?: boolean; testID: string;
}>) {
  const { liquidGlass } = useTheme();
  const range = [0, Math.max(mediumTranslateY, 1)];
  const gap = sheetChromeBottom.interpolate({ inputRange: range, outputRange: [0, 8], extrapolate: 'clamp' });
  const bottom = Animated.add(sheetChromeBottom, gap);
  const radius = sheetChromeBottom.interpolate({ inputRange: range, outputRange: [0, liquidGlass.sheet.bottomRadius], extrapolate: 'clamp' });
  const corners = {
    borderTopLeftRadius: opaque ? 0 : liquidGlass.sheet.topRadius,
    borderTopRightRadius: opaque ? 0 : liquidGlass.sheet.topRadius,
    borderBottomLeftRadius: opaque ? 0 : radius, borderBottomRightRadius: opaque ? 0 : radius,
  };
  const bounds = opaque ? { bottom: 0, left: 0, right: 0 } : { bottom, left: gap, right: gap };
  return <>
    {!opaque && <Styles.SheetChromeShadow pointerEvents="none" testID={`${testID}-chrome`}
      style={{ ...bounds, ...corners, boxShadow: liquidGlass.sheet.shadow }}>
      <Styles.SheetChrome $borderColor={liquidGlass.sheet.rim} style={corners}>
        <Styles.SheetGlass cornerRadius={liquidGlass.sheet.topRadius} glassEffectStyle="regular"
          highlightHeight={40} highlightOpacity={liquidGlass.sheet.highlightOpacity}
          rimColor={liquidGlass.sheet.rim} tintColor={liquidGlass.sheet.tint} topRimOnly />
      </Styles.SheetChrome>
    </Styles.SheetChromeShadow>}
    <Styles.SheetContentViewport style={{ ...bounds, ...corners }} testID={`${testID}-content-viewport`}>
      <Styles.SheetInner $clipContent $inset={0} $opaque={opaque} testID={`${testID}-inner`}
        style={opaque ? { width: '100%' } : undefined}>
        {children}
      </Styles.SheetInner>
    </Styles.SheetContentViewport>
  </>;
}
