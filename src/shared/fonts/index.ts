import * as React from 'react';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { StyleSheet, Text, TextInput } from 'react-native';

export const PRETENDARD_FONT_FAMILY = 'Pretendard';

const styles = StyleSheet.create({
  text: {
    fontFamily: PRETENDARD_FONT_FAMILY,
  },
});

let hasConfiguredGlobalFont = false;

function appendStyle(existingStyle: unknown) {
  if (!existingStyle) {
    return styles.text;
  }

  return [existingStyle, styles.text];
}

// Text/TextInput are function components under React 19 + RN 0.83, so
// defaultProps mutation is a no-op there. Patch createElement instead so the
// font style is injected regardless of component implementation.
export function configureGlobalFontFamily() {
  if (hasConfiguredGlobalFont) return;

  const originalCreateElement = React.createElement as (...args: unknown[]) => unknown;

  (React as { createElement: unknown }).createElement = (
    type: unknown,
    props: Record<string, unknown> | null,
    ...children: unknown[]
  ) => {
    if (type === Text || type === TextInput) {
      const nextProps = { ...props, style: appendStyle(props?.style) };
      return originalCreateElement(type, nextProps, ...children);
    }

    return originalCreateElement(type, props, ...children);
  };

  hasConfiguredGlobalFont = true;
}

export function usePretendardFont() {
  const [fontsLoaded] = useFonts({
    [PRETENDARD_FONT_FAMILY]: require('./PretendardVariable.ttf'),
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    configureGlobalFontFamily();
  }, [fontsLoaded]);

  return fontsLoaded;
}
