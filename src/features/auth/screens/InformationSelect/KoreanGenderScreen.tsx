import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import KoreanOnboardingScaffold from './KoreanOnboardingScaffold';
import type { KoreanOnboardingState } from './types';

const GENDER_OPTIONS: Array<{
  value: KoreanOnboardingState['gender'];
  label: string;
  icon: string;
}> = [
  { value: 'male', label: '남성', icon: '♂' },
  { value: 'female', label: '여성', icon: '♀' },
  { value: 'undisclosed', label: '밝히지 않음', icon: '−' },
];

type KoreanGenderScreenProps = {
  value: KoreanOnboardingState['gender'];
  onChange: (value: KoreanOnboardingState['gender']) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function KoreanGenderScreen({
  value,
  onChange,
  onBack,
  onNext,
}: KoreanGenderScreenProps) {
  return (
    <KoreanOnboardingScaffold
      footerLabel="계속하기"
      onBack={onBack}
      onFooterPress={onNext}
      step={5}
      subtitle="최고의 장소를 알려주세요!"
      title="성별 선택"
    >
      <View>
        {GENDER_OPTIONS.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.optionRow,
                selected && styles.optionRowSelected,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconCircle, selected && styles.iconCircleSelected]}>
                  <Text style={[styles.iconText, selected && styles.iconTextSelected]}>{option.icon}</Text>
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </View>

              <View style={[styles.trailingCircle, selected && styles.trailingCircleSelected]}>
                {selected ? <Text style={styles.checkText}>✓</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </KoreanOnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  optionRow: {
    alignItems: 'center',
    backgroundColor: '#F8F8F9',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    minHeight: 82,
    paddingHorizontal: 18,
  },
  optionRowSelected: {
    backgroundColor: '#FFDFE9',
    borderColor: '#FF4476',
    borderWidth: 1.6,
  },
  optionLeft: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    marginRight: 14,
    width: 34,
  },
  iconCircleSelected: {
    backgroundColor: '#FF1F5C',
  },
  iconText: {
    color: '#31313A',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  iconTextSelected: {
    color: '#FFFFFF',
  },
  optionLabel: {
    color: '#42424C',
    fontSize: 18,
    fontWeight: '700',
  },
  trailingCircle: {
    alignItems: 'center',
    borderColor: '#C9C9CF',
    borderRadius: 999,
    borderWidth: 1.6,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  trailingCircleSelected: {
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
