import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { TranslationAttributionBadge } from './TranslationAttributionBadge';

type AttributionGroup = {
  report: (id: symbol, translated: boolean) => void;
  hasTranslations: boolean;
};
const Context = createContext<AttributionGroup | null>(null);

/** A visible collection shares one attribution beside its results, outside individual cards. */
export function TranslationAttributionGroup({ children }: { children: React.ReactNode }) {
  const [translated, setTranslated] = useState<ReadonlySet<symbol>>(() => new Set());
  const report = useCallback((id: symbol, visible: boolean) => {
    setTranslated(current => {
      if (current.has(id) === visible) return current;
      const next = new Set(current);
      if (visible) next.add(id); else next.delete(id);
      return next;
    });
  }, []);
  const hasTranslations = translated.size > 0;
  const value = useMemo(() => ({ report, hasTranslations }), [report, hasTranslations]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useGroupedTranslationAttribution(translated: boolean) {
  const group = useContext(Context);
  const report = group?.report;
  const id = useRef(Symbol('translated-content')).current;
  useEffect(() => {
    report?.(id, translated);
    return () => { report?.(id, false); };
  }, [id, report, translated]);
  return group !== null;
}

export function TranslationAttributionNotice() {
  const group = useContext(Context);
  if (!group?.hasTranslations) return null;
  return <View testID="translation-attribution-notice" style={{ alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 4 }}>
    <TranslationAttributionBadge />
  </View>;
}
