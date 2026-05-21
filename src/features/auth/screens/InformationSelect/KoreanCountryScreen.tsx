import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import KoreanOnboardingScaffold from './KoreanOnboardingScaffold';

const COUNTRIES = [
  { code: 'KR', emoji: '🇰🇷', label: 'South Korea' },
  { code: 'US', emoji: '🇺🇸', label: '미국' },
  { code: 'JP', emoji: '🇯🇵', label: '일본' },
  { code: 'CN', emoji: '🇨🇳', label: '중국' },
  { code: 'FR', emoji: '🇫🇷', label: '프랑스' },
  { code: 'TH', emoji: '🇹🇭', label: '태국' },
];

type KoreanCountryScreenProps = {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function KoreanCountryScreen({
  value,
  onChange,
  onBack,
  onNext,
}: KoreanCountryScreenProps) {
  const [query, setQuery] = useState('');

  const filteredCountries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return COUNTRIES;

    return COUNTRIES.filter((country) =>
      `${country.label} ${country.code}`.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  return (
    <KoreanOnboardingScaffold
      footerLabel="계속하기"
      onBack={onBack}
      onFooterPress={onNext}
      step={2}
      subtitle="We'll tell you the best route!"
      title="Select Country"
    >
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          onChangeText={setQuery}
          placeholder="Search..."
          placeholderTextColor="#8C8C94"
          style={styles.searchInput}
          value={query}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {filteredCountries.map((country) => {
          const selected = country.label === value;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={country.code}
              onPress={() => onChange(country.label)}
              style={({ pressed }) => [
                styles.listItem,
                selected && styles.listItemSelected,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.listItemLeft}>
                <Text style={styles.flag}>{country.emoji}</Text>
                <Text style={styles.listItemLabel}>{country.label}</Text>
              </View>

              <View style={[styles.checkCircle, selected && styles.checkCircleSelected]}>
                {selected ? <Text style={styles.checkText}>✓</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </KoreanOnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    alignItems: 'center',
    backgroundColor: '#F1F1F4',
    borderRadius: 15,
    flexDirection: 'row',
    marginBottom: 14,
    minHeight: 46,
    paddingHorizontal: 14,
  },
  searchIcon: {
    color: '#808089',
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    color: '#191919',
    flex: 1,
    fontSize: 17,
    paddingVertical: 11,
  },
  listContent: {
    paddingBottom: 24,
  },
  listItem: {
    alignItems: 'center',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  listItemSelected: {
    backgroundColor: '#FFE7EE',
  },
  listItemLeft: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  flag: {
    fontSize: 20,
    marginRight: 12,
  },
  listItemLabel: {
    color: '#383840',
    fontSize: 17,
    fontWeight: '700',
  },
  checkCircle: {
    alignItems: 'center',
    borderColor: '#C9C9D0',
    borderRadius: 999,
    borderWidth: 1.5,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  checkCircleSelected: {
    backgroundColor: '#FF1F5C',
    borderColor: '#FF1F5C',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.86,
  },
});
