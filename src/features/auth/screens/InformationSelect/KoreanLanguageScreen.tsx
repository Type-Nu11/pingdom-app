import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import KoreanOnboardingScaffold from './KoreanOnboardingScaffold';

const LANGUAGES = ['한국어', 'English', '日本語', '中国人'];

type KoreanLanguageScreenProps = {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function KoreanLanguageScreen({
  value,
  onChange,
  onBack,
  onNext,
}: KoreanLanguageScreenProps) {
  const [query, setQuery] = useState('');

  const filteredLanguages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return LANGUAGES;

    return LANGUAGES.filter((language) => language.toLowerCase().includes(normalizedQuery));
  }, [query]);

  return (
    <KoreanOnboardingScaffold
      footerLabel="계속하기"
      onBack={onBack}
      onFooterPress={onNext}
      step={3}
      subtitle="최고의 장소를 알려주세요!"
      title="언어 선택"
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
        {filteredLanguages.map((language) => {
          const selected = language === value;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={language}
              onPress={() => onChange(language)}
              style={({ pressed }) => [
                styles.listItem,
                selected && styles.listItemSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.listItemLabel}>{language}</Text>

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
