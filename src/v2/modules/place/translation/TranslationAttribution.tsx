import { useCallback, useState } from 'react';
import React from 'react';
import { View } from 'react-native';
import { TranslationAttributionBadge } from '../../../shared/translation/TranslationAttributionBadge';
export { TranslationAttributionBadge } from '../../../shared/translation/TranslationAttributionBadge';

export type TranslationDisplayState = { original: string; translated: boolean };

export function useTranslationAttribution(original: string) {
  const [state, setState] = useState<TranslationDisplayState | null>(null);
  const onTranslationChange = useCallback((next: TranslationDisplayState) => {
    setState(previous => previous?.original === next.original && previous.translated === next.translated ? previous : next);
  }, []);
  return { visible: state?.original === original && state.translated, onTranslationChange };
}

/** Reserve the footer while translating so photos do not move when attribution appears. */
export default function TranslationAttribution({ visible, testID }: { visible: boolean; testID?: string }) {
  return <View testID={testID} style={{ minHeight: 24, alignItems: 'center', paddingBottom: 8 }}>
    {visible ? <TranslationAttributionBadge /> : null}
  </View>;
}
