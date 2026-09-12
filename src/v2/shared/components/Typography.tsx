import React, { forwardRef } from 'react';
import {
  Text as NativeText,
  TextInput as NativeTextInput,
  type TextInputProps,
  type TextProps,
} from 'react-native';

import { useAppFontFamily } from '../fonts';

export const Text = forwardRef<NativeText, TextProps>(function Text(
  { style, ...props },
  ref,
) {
  const fontFamily = useAppFontFamily();

  return <NativeText {...props} ref={ref} style={[{ fontFamily }, style]} />;
});

export const TextInput = forwardRef<NativeTextInput, TextInputProps>(function TextInput(
  { style, ...props },
  ref,
) {
  const fontFamily = useAppFontFamily();

  return <NativeTextInput {...props} ref={ref} style={[{ fontFamily }, style]} />;
});
