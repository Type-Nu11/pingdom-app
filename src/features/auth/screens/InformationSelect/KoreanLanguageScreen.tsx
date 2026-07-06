import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import KoreanOnboardingScaffold from './KoreanOnboardingScaffold';

const LANGUAGES = ['한국어', 'English', '日本語', '中国人'];

const SEARCH_SVG = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.0002 19.0002L14.6572 14.6572M14.6572 14.6572C15.4001 13.9143 15.9894 13.0324 16.3914 12.0618C16.7935 11.0911 17.0004 10.0508 17.0004 9.00021C17.0004 7.9496 16.7935 6.90929 16.3914 5.93866C15.9894 4.96803 15.4001 4.08609 14.6572 3.34321C13.9143 2.60032 13.0324 2.01103 12.0618 1.60898C11.0911 1.20693 10.0508 1 9.00021 1C7.9496 1 6.90929 1.20693 5.93866 1.60898C4.96803 2.01103 4.08609 2.60032 3.34321 3.34321C1.84288 4.84354 1 6.87842 1 9.00021C1 11.122 1.84288 13.1569 3.34321 14.6572C4.84354 16.1575 6.87842 17.0004 9.00021 17.0004C11.122 17.0004 13.1569 16.1575 14.6572 14.6572Z" stroke="#767680" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const CHECK_SVG = `<svg width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.25 1.25L6.25 11.25L1.25 6.25" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

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
      footerLabel="Continue"
      onBack={onBack}
      onFooterPress={onNext}
      step={3}
      subtitle="We'll tell you the best route!"
      title="Select Language"
    >
      <View style={styles.searchBar}>
        <SvgXml style={styles.searchIcon} xml={SEARCH_SVG} width={20} height={20} />
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
                {selected ? <SvgXml xml={CHECK_SVG} width={14} height={10} /> : null}
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
    backgroundColor: '#EBEBEB',
    borderRadius: 15,
    flexDirection: 'row',
    marginBottom: 14,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 10,
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
    marginBottom: 4,
    minHeight: 56,
    paddingHorizontal: 15,
  },
  listItemSelected: {
    backgroundColor: '#FFE7EE',
    borderColor: '#FF4476',
  
  },
  listItemLabel: {
    color: '#1A1A1A',
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
  pressed: {
    opacity: 0.86,
  },
});
