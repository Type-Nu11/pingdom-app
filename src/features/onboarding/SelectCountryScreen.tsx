import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import CheckIcon from '../../assets/icons/check.svg';
import EscapeIcon from '../../assets/icons/escape.svg';
import SearchIcon from '../../assets/icons/search.svg';
import FlagCN from '../../assets/flags/cn.svg';
import FlagJP from '../../assets/flags/jp.svg';
import FlagKR from '../../assets/flags/kr.svg';
import FlagTH from '../../assets/flags/th.svg';
import FlagUS from '../../assets/flags/us.svg';
import FlagVN from '../../assets/flags/vn.svg';
import ProgressBar from './components/ProgressBar';
import { useTranslation } from 'react-i18next';
import type { Country } from './types';

const PINK = '#FF1956';
const BG = '#F8F8F8';

type FlagComponent = React.FC<{ width?: number; height?: number }>;

const COUNTRIES: { code: Country; Flag: FlagComponent; countryKey: string }[] = [
  { code: 'US', Flag: FlagUS, countryKey: 'us' },
  { code: 'CN', Flag: FlagCN, countryKey: 'cn' },
  { code: 'JP', Flag: FlagJP, countryKey: 'jp' },
  { code: 'TH', Flag: FlagTH, countryKey: 'th' },
  { code: 'VN', Flag: FlagVN, countryKey: 'vn' },
  { code: 'KR', Flag: FlagKR, countryKey: 'kr' },
];

type Props = {
  onBack: () => void;
  onNext: (country: Country) => void;
};

export default function SelectCountryScreen({ onBack, onNext }: Props) {
  const [selected, setSelected] = useState<Country>('US');
  const [query, setQuery] = useState('');
  const { t } = useTranslation();
  const tr = {
    title: t('selectCountry.title'),
    subtitle: t('selectCountry.subtitle'),
    button: t('selectCountry.button'),
    search: t('selectCountry.search'),
  };

  const countries = COUNTRIES.map((c) => ({ ...c, label: t(`countries.${c.countryKey}`) }));
  const filtered = countries.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.headerSide}>
          <EscapeIcon width={12} height={21} />
        </Pressable>
        <ProgressBar current={2} />
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
            placeholderTextColor="#767680"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map(({ code, Flag, label }) => {
            const isSelected = selected === code;
            return (
              <Pressable
                key={code}
                style={[styles.item, isSelected && styles.itemSelected]}
                onPress={() => setSelected(code)}
              >
                <View style={styles.itemLeft}>
                  <Flag width={32} height={32} />
                  <Text style={styles.itemText}>{label}</Text>
                </View>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <CheckIcon width={14} height={10} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable style={styles.button} onPress={() => onNext(selected)}>
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
    gap: 18,
  },
  titleGroup: { gap: 2 },
  title: { fontSize: 32, fontWeight: '700', color: '#000000', lineHeight: 41.6 },
  subtitle: { fontSize: 16, fontWeight: '500', color: '#5E5E66', lineHeight: 20.8 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: '#E4E4E5',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  searchInput: { flex: 1, fontSize: 20, fontWeight: '500', color: '#0C0C0D', padding: 0 },
  list: { flex: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 18,
  },
  itemSelected: { backgroundColor: 'rgba(255, 25, 86, 0.08)' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  itemText: { fontSize: 20, fontWeight: '700', color: '#3B3B40' },
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
  buttonText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
});
