import React from 'react';
import type { AccessibilityActionEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useContentTranslation } from './useContentTranslation';
import ContentTranslationActions from './ContentTranslationActions';
import { normalizeSupportedLanguage } from '../i18n/language';

type TextActions = Partial<{
  onLongPress: () => void;
  accessibilityHint: string;
  accessibilityActions: { name: 'longpress'; label: string }[];
  onAccessibilityAction: (event: AccessibilityActionEvent) => void;
}>;
type Props = {
  name: string;
  children: (text: string, actions: TextActions) => React.ReactNode;
};

/** Translation changes presentation only. Place IDs, navigation and saved names keep their original values. */
export default function TranslatedPlaceName({ name, children }: Props) {
  const { i18n } = useTranslation();
  if (normalizeSupportedLanguage(i18n.resolvedLanguage ?? i18n.language) === 'ko') {
    return <>{children(name, {})}</>;
  }
  return <TranslatedName name={name}>{children}</TranslatedName>;
}

function TranslatedName({ name, children }: Props) {
  // Short Korean proper names are often too short for reliable language identification.
  const translation = useContentTranslation(`place-name:${name}`, [name], { sourceLanguage: /[가-힣]/u.test(name) ? 'ko' : undefined });
  return <>{children(translation.texts[0] ?? name, translation.textActions)}<ContentTranslationActions translation={translation} /></>;
}
