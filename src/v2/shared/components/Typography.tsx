import React, { forwardRef } from 'react';
import {
  Text as NativeText,
  TextInput as NativeTextInput,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { resolveFontFace, useAppFontFamily } from '../fonts';

// Reads the effective family and weight from a (possibly nested) style prop.
function readFontStyle(style: StyleProp<TextStyle>): Pick<TextStyle, 'fontFamily' | 'fontWeight'> {
  if (!style || typeof style !== 'object') return {};
  if (Array.isArray(style)) {
    return style.reduce<Pick<TextStyle, 'fontFamily' | 'fontWeight'>>(
      (merged, item) => ({ ...merged, ...readFontStyle(item as StyleProp<TextStyle>) }),
      {},
    );
  }
  const { fontFamily, fontWeight } = style as TextStyle;
  return {
    ...(fontFamily !== undefined ? { fontFamily } : {}),
    ...(fontWeight !== undefined ? { fontWeight } : {}),
  };
}

export const Text = forwardRef<NativeText, TextProps>(function Text(
  { style, ...props },
  ref,
) {
  const fontFamily = useAppFontFamily();
  const flattened = readFontStyle(style);

  return <NativeText {...props} ref={ref} style={[{ fontFamily }, style, resolveFontFace(flattened.fontFamily ?? fontFamily, flattened.fontWeight)]} />;
});

export const TextInput = forwardRef<NativeTextInput, TextInputProps>(function TextInput(
  { style, ...props },
  ref,
) {
  const fontFamily = useAppFontFamily();
  const flattened = readFontStyle(style);

  return <NativeTextInput {...props} ref={ref} style={[{ fontFamily }, style, resolveFontFace(flattened.fontFamily ?? fontFamily, flattened.fontWeight)]} />;
});
