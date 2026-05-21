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

type DefaultStyleComponent = {
  defaultProps?: {
    style?: unknown;
  };
};

function appendStyle(existingStyle: unknown) {
  if (!existingStyle) {
    return styles.text;
  }

  return [existingStyle, styles.text];
}

export function configureGlobalFontFamily() {
  if (hasConfiguredGlobalFont) return;

  const textComponent = Text as unknown as DefaultStyleComponent;
  textComponent.defaultProps = textComponent.defaultProps ?? {};
  textComponent.defaultProps.style = appendStyle(textComponent.defaultProps.style);

  const textInputComponent = TextInput as unknown as DefaultStyleComponent;
  textInputComponent.defaultProps = textInputComponent.defaultProps ?? {};
  textInputComponent.defaultProps.style = appendStyle(textInputComponent.defaultProps.style);

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
