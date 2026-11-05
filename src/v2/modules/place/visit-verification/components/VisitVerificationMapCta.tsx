import { Text as AppText } from '../../../../shared/components/Typography';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import styled, { ThemeProvider, useTheme } from 'styled-components/native';

import VerificationIcon from '../../../../../assets/v2/icons/place/gamju.svg';
import { createTheme } from '../../../../shared/theme';

type Props = {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

const NAVIGATION_LOCK_MS = 500;

export default function VisitVerificationMapCta({ label, onPress, style }: Props) {
  const { typography } = useTheme();
  // Figma Component 24/ReviewButton (6002:29749) keeps its light values in dark mode too.
  const theme = useMemo(() => createTheme(typography.body.fontFamily, 'light'), [typography.body.fontFamily]);
  const navigationLocked = useRef(false);
  const [surfaceWidth, setSurfaceWidth] = useState(120);
  const gradientId = useId().replace(/:/g, '');
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (unlockTimer.current) clearTimeout(unlockTimer.current);
  }, []);

  return (
    <ThemeProvider theme={theme}>
    <Container
      onLayout={event => setSurfaceWidth(event.nativeEvent.layout.width)}
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={() => {
        if (navigationLocked.current) return;
        navigationLocked.current = true;
        unlockTimer.current = setTimeout(() => {
          navigationLocked.current = false;
          unlockTimer.current = null;
        }, NAVIGATION_LOCK_MS);
        onPress();
      }}
      style={[{ boxShadow: theme.liquidGlass.primaryCta.shadow }, style]}
      testID="visit-verification-map-cta"
    >
      <Surface
        pointerEvents="none"
        testID="visit-verification-map-cta-glass"
      >
        {/* Draw the inset shading explicitly so both native platforms keep the soft inner rim. */}
        <Svg pointerEvents="none" accessible={false} width={surfaceWidth} height={48} viewBox={`0 0 ${surfaceWidth} 48`}
          preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0 }}>
          <Defs>
            <RadialGradient id={`${gradientId}-inset`} cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0.5" stopColor="#780026" stopOpacity={0} />
              <Stop offset="1" stopColor="#780026" stopOpacity={0.045} />
            </RadialGradient>
            <LinearGradient id={`${gradientId}-top`} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0" stopColor="#780026" stopOpacity={0.035} />
              <Stop offset="0.3" stopColor="#780026" stopOpacity={0} />
              <Stop offset="0.8" stopColor="#780026" stopOpacity={0} />
              <Stop offset="1" stopColor="#780026" stopOpacity={0.02} />
            </LinearGradient>
            <LinearGradient id={`${gradientId}-rim`} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.35} />
              <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.04} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0.12} />
            </LinearGradient>
          </Defs>
          <Rect width={surfaceWidth} height="48" rx="24" fill={`url(#${gradientId}-inset)`} />
          <Rect width={surfaceWidth} height="48" rx="24" fill={`url(#${gradientId}-top)`} />
          <Rect x="0.5" y="0.5" width={Math.max(0, surfaceWidth - 1)} height="47" rx="23.5" fill="none"
            stroke={`url(#${gradientId}-rim)`} strokeWidth="1" />
        </Svg>
        <VerificationIcon height={24} width={24} />
        <Label>{label}</Label>
      </Surface>
    </Container>
    </ThemeProvider>
  );
}

const Container = styled.Pressable`
  height: 48px;
  min-width: 120px;
  border-radius: 24px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.primary};
`;
// Glass/PrimaryCTA over the Primary/Normal base, as layered in Figma. Native liquid glass
// re-tints the opaque pink base and renders it noticeably darker than #FF1956 on iOS 26.
const Surface = styled.View`
  background-color: ${({ theme }) => theme.liquidGlass.primaryCta.tint};
  height: 48px;
  min-width: 120px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 18px;
  border-radius: 24px;
`;
const Label = styled(AppText)`
  color: ${({ theme }) => theme.liquidGlass.primaryCta.foreground};
  font-size: 16px;
  font-weight: 600;
  line-height: 21px;
`;
