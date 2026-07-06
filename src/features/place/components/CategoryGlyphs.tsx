import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';

const PINK = '#FF4A75';

export const FoodGlyph = (props: SvgProps) => (
  <Svg viewBox="0 0 15 18" fill="none" {...props}>
    <Line x1="2" y1="1.2" x2="2" y2="8" stroke={PINK} strokeWidth="1.8" strokeLinecap="round" />
    <Line x1="5" y1="1.2" x2="5" y2="8" stroke={PINK} strokeWidth="1.8" strokeLinecap="round" />
    <Line x1="8" y1="1.2" x2="8" y2="8" stroke={PINK} strokeWidth="1.8" strokeLinecap="round" />
    <Line x1="2" y1="8" x2="8" y2="8" stroke={PINK} strokeWidth="1.8" strokeLinecap="round" />
    <Line x1="5" y1="8" x2="5" y2="17" stroke={PINK} strokeWidth="1.8" strokeLinecap="round" />
    <Path
      d="M12.5 1C10.5 3 10.2 6.5 12.3 8.4V17"
      stroke={PINK}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const MusicGlyph = (props: SvgProps) => (
  <Svg viewBox="0 0 13 17" fill="none" {...props}>
    <Path
      d="M5.57 9.95V0H13V2.83H7.43V13.22C7.43 14.05 7.16 14.86 6.66 15.52C6.16 16.18 5.46 16.66 4.68 16.87C3.89 17.09 3.05 17.03 2.29 16.71C1.54 16.39.91 15.83.5 15.11C.09 14.39-.07 13.55.03 12.73C.14 11.9.51 11.14 1.09 10.55C1.67 9.96 2.42 9.58 3.23 9.48C4.04 9.37 4.86 9.53 5.57 9.95Z"
      fill={PINK}
    />
  </Svg>
);

export const FashionGlyph = (props: SvgProps) => (
  <Svg viewBox="0 0 24 18" fill="none" {...props}>
    <Path
      d="M12 2C14.2 2 14.2 5.2 12 5.2V8M12 8L3 15H21L12 8Z"
      stroke={PINK}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const GameGlyph = (props: SvgProps) => (
  <Svg viewBox="0 0 22 19" fill="none" {...props}>
    <Rect x="1.5" y="4.8" width="19" height="12.2" rx="6.1" stroke={PINK} strokeWidth="2.4" />
    <Line x1="7" y1="8.4" x2="7" y2="13.4" stroke={PINK} strokeWidth="2" strokeLinecap="round" />
    <Line x1="4.5" y1="10.9" x2="9.5" y2="10.9" stroke={PINK} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="15" cy="9" r="1.5" fill={PINK} />
    <Circle cx="17.5" cy="13" r="1.5" fill={PINK} />
  </Svg>
);
