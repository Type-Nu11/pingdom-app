import React, { useId } from 'react';
import { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import GlassSurface from './GlassSurface';
import * as S from '../styles/FrostedSurface.styles';

type FrostedSurfaceProps = React.ComponentProps<typeof GlassSurface> & {
  bottomShade?: boolean;
  cornerRadius: number;
  highlightColor?: string;
  highlightHeight?: number;
  highlightOpacity?: number;
  rimColor?: string;
  topRimOnly?: boolean;
};

const FrostedSurface = ({
  bottomShade = true,
  children,
  cornerRadius,
  highlightColor = '#FFFFFF',
  highlightHeight,
  highlightOpacity = 0.12,
  rimColor = 'rgba(255,255,255,0.34)',
  topRimOnly = false,
  ...glassProps
}: FrostedSurfaceProps) => {
  const gradientId = `frosted-highlight-${useId().replace(/:/g, '')}`;

  return (
    <GlassSurface {...glassProps}>
      <S.HighlightGradient $height={highlightHeight} height={highlightHeight ?? '100%'} pointerEvents="none" width="100%">
        <Defs>
          <LinearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor={highlightColor} stopOpacity={highlightOpacity} />
            <Stop offset="0.45" stopColor={highlightColor} stopOpacity={highlightOpacity * 0.24} />
            <Stop offset="1" stopColor={highlightColor} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect fill={`url(#${gradientId})`} height="100%" rx={cornerRadius} width="100%" />
      </S.HighlightGradient>
      {topRimOnly ? (
        <S.TopRim $color={rimColor} pointerEvents="none" style={{ borderTopLeftRadius: cornerRadius, borderTopRightRadius: cornerRadius }} />
      ) : (
        <S.Rim $color={rimColor} pointerEvents="none" style={{ borderRadius: cornerRadius }} />
      )}
      {bottomShade ? (
        <S.BottomShade pointerEvents="none" style={{ borderBottomLeftRadius: cornerRadius, borderBottomRightRadius: cornerRadius }} />
      ) : null}
      {children}
    </GlassSurface>
  );
};

export default FrostedSurface;
