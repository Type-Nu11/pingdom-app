import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import CheckIcon from '../../assets/v2/icons/check.svg';
import EscapeIcon from '../../assets/v2/icons/escape.svg';
import SearchIcon from '../../assets/v2/icons/search.svg';
import ProgressBar from './components/ProgressBar';
import type { Language } from './types';
import { colors } from '../../styles/colors';

const PINK = colors.primaryNormal;
const BG = colors.bgAssistive;

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'th', label: 'แบบไทย' },
];

type Props = {
  onBack: () => void;
  onNext: (language: Language) => void;
};

export default function SelectLanguageScreen({ onBack, onNext }: Props) {
  const [selected, setSelected] = useState<Language>('en');
  const [query, setQuery] = useState('');
  const { t } = useTranslation();
  const tr = {
    title: t('selectLanguage.title'),
    subtitle: t('selectLanguage.subtitle'),
    button: t('selectLanguage.button'),
    search: t('selectLanguage.search'),
  };

  const filtered = LANGUAGES.filter((l) =>
    l.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.headerSide}>
          <EscapeIcon width={12} height={21} />
        </Pressable>
        <ProgressBar current={1} />
        <View style={styles.headerSide} />
      </View>

      <View style={styles.body}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{tr.title}</Text>
          <Text style={styles.subtitle}>{tr.subtitle}</Text>
        </View>

        <View style={styles.searchBox}>
          <SearchIcon width={18} height={18} />
          <TextInput
            style={styles.searchInput}
            placeholder={tr.search}
            placeholderTextColor={colors.labelAssistive}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <Pressable
                key={lang.code}
                style={({ pressed }) => [styles.item, isSelected && styles.itemSelected]}
                onPress={() => setSelected(lang.code)}
              >
                <Text style={styles.itemText}>{lang.label}</Text>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <CheckIcon width={14} height={10} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable style={[styles.button, styles.buttonSpacing]} onPress={() => onNext(selected)}>
          <Text style={styles.buttonText}>{tr.button}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    height: 105,
    paddingTop: 80,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerSide: { width: 40, alignItems: 'flex-start' },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 52,
  },
  titleGroup: { gap: 0, marginBottom: 18 },
  title: { fontSize: 32, fontWeight: '700', color: colors.labelBlack, lineHeight: 41.6 },
  subtitle: { fontSize: 16, fontWeight: '500', color: colors.labelAlternative, lineHeight: 20.8 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.fillAlternative,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 18,
  },
  searchInput: { flex: 1, fontSize: 20, fontWeight: '500', color: colors.labelStrong, padding: 0 },
  list: { flex: 1 },
  listContent: { gap: 26 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  itemSelected: { backgroundColor: colors.primarySoft },
  itemText: { fontSize: 20, fontWeight: '700', color: colors.labelNeutral },
  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: PINK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 64,
    backgroundColor: PINK,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSpacing: { marginTop: 12 },
  buttonText: { fontSize: 20, fontWeight: '700', color: colors.white },
});
