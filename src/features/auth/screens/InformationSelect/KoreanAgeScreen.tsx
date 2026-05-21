import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import KoreanOnboardingScaffold from './KoreanOnboardingScaffold';

const YEARS = [2007, 2008, 2009, 2010, 2011];

type KoreanAgeScreenProps = {
  value: number;
  onChange: (value: number) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function KoreanAgeScreen({ value, onChange, onBack, onNext }: KoreanAgeScreenProps) {
  return (
    <KoreanOnboardingScaffold
      footerLabel="계속하기"
      onBack={onBack}
      onFooterPress={onNext}
      step={4}
      subtitle="최고의 장소를 알려주세요!"
      title="나이 선택"
    >
      <View style={styles.card}>
        {YEARS.map((year) => {
          const selected = year === value;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={year}
              onPress={() => onChange(year)}
              style={({ pressed }) => [
                styles.yearRow,
                selected && styles.yearRowSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.yearLabel, selected && styles.yearLabelSelected]}>{year}</Text>
            </Pressable>
          );
        })}
      </View>
    </KoreanOnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F6F6F7',
    borderRadius: 18,
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  yearRow: {
    alignItems: 'center',
    borderRadius: 15,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
  },
  yearRowSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FF3B6F',
    borderWidth: 2,
  },
  yearLabel: {
    color: '#6B6B75',
    fontSize: 20,
    fontWeight: '700',
  },
  yearLabelSelected: {
    color: '#FF1F5C',
    fontSize: 23,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.86,
  },
});
