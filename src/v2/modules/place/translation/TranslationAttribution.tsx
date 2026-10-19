import { useCallback, useState } from 'react';
import React from 'react';
import { Image, View } from 'react-native';
import { useTheme } from 'styled-components/native';

export type TranslationDisplayState = { original: string; translated: boolean };

export function useTranslationAttribution(original: string) {
  const [state, setState] = useState<TranslationDisplayState | null>(null);
  const onTranslationChange = useCallback((next: TranslationDisplayState) => {
    setState(previous => previous?.original === next.original && previous.translated === next.translated ? previous : next);
  }, []);
  return { visible: state?.original === original && state.translated, onTranslationChange };
}

export function TranslationAttributionBadge() {
  const { colorScheme } = useTheme();
  return <Image accessibilityLabel="Translated by Google"
    source={colorScheme === 'dark' ? require('./assets/white-short.png') : require('./assets/color-short.png')}
    style={{ width: 122, height: 16 }} />;
}

/** Reserve the footer while translating so photos do not move when attribution appears. */
export default function TranslationAttribution({ visible, testID }: { visible: boolean; testID?: string }) {
  return <View testID={testID} style={{ minHeight: 24, alignItems: 'center', paddingBottom: 8 }}>
    {visible ? <TranslationAttributionBadge /> : null}
  </View>;
}
