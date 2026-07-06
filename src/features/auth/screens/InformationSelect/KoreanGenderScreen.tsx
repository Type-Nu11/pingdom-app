import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import KoreanOnboardingScaffold from './KoreanOnboardingScaffold';
import type { KoreanOnboardingState } from './types';

const CHECK_SVG = `<svg width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.25 1.25L6.25 11.25L1.25 6.25" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const getMaleSvg = (fill: string) =>
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.5 0H16.5C15.675 0 15 0.675 15 1.5C15 2.325 15.675 3 16.5 3H18.87L12.915 8.955C11.595 8.04 9.99 7.5 8.25 7.5C3.69 7.5 0 11.19 0 15.75C0 20.31 3.69 24 8.25 24C12.81 24 16.5 20.31 16.5 15.75C16.5 14.01 15.96 12.405 15.045 11.07L21 5.13V7.5C21 8.325 21.675 9 22.5 9C23.325 9 24 8.325 24 7.5V1.5C24 0.675 23.325 0 22.5 0ZM8.25 21C5.355 21 3 18.645 3 15.75C3 12.855 5.355 10.5 8.25 10.5C11.145 10.5 13.5 12.855 13.5 15.75C13.5 18.645 11.145 21 8.25 21Z" fill="${fill}"/></svg>`;

const getFemaleSvg = (fill: string) =>
  `<svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.82353C10.8073 2.82353 13.0909 5.04 13.0909 7.76471C13.0909 10.4894 10.8073 12.7059 8 12.7059C5.19273 12.7059 2.90909 10.4894 2.90909 7.76471C2.90909 5.04 5.19273 2.82353 8 2.82353ZM9.45455 15.4024C11.2932 15.0724 12.9547 14.1277 14.1504 12.7325C15.3462 11.3372 16.0006 9.57954 16 7.76471C16 3.47294 12.4218 0 8 0C3.57818 0 0 3.47294 0 7.76471C-0.000568411 9.57954 0.653846 11.3372 1.84957 12.7325C3.0453 14.1277 4.70679 15.0724 6.54545 15.4024V18.3529H5.09091C4.29091 18.3529 3.63636 18.9882 3.63636 19.7647C3.63636 20.5412 4.29091 21.1765 5.09091 21.1765H6.54545V22.5882C6.54545 23.3647 7.2 24 8 24C8.8 24 9.45455 23.3647 9.45455 22.5882V21.1765H10.9091C11.7091 21.1765 12.3636 20.5412 12.3636 19.7647C12.3636 18.9882 11.7091 18.3529 10.9091 18.3529H9.45455V15.4024Z" fill="${fill}"/></svg>`;

const getPreferSvg = (fill: string) =>
  `<svg width="24" height="3" viewBox="0 0 24 3" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="3" rx="1.5" fill="${fill}"/></svg>`;

const GENDER_OPTIONS: Array<{
  value: KoreanOnboardingState['gender'];
  label: string;
  getSvg: (fill: string) => string;
  svgWidth: number;
  svgHeight: number;
}> = [
  { value: 'male', label: 'Male', getSvg: getMaleSvg, svgWidth: 22, svgHeight: 22 },
  { value: 'female', label: 'Female', getSvg: getFemaleSvg, svgWidth: 14, svgHeight: 22 },
  { value: 'undisclosed', label: 'Prefer not to say', getSvg: getPreferSvg, svgWidth: 20, svgHeight: 3 },
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
      footerLabel="Continue"
      onBack={onBack}
      onFooterPress={onNext}
      step={5}
      subtitle="We'll tell you the best route!"
      title="Select gender"
    >
      <View>
        {GENDER_OPTIONS.map((option) => {
          const selected = option.value === value;
          const iconFill = selected ? '#FFFFFF' : '#1A1A1A';

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
                  <SvgXml
                    xml={option.getSvg(iconFill)}
                    width={option.svgWidth}
                    height={option.svgHeight}
                  />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </View>

              <View style={[styles.trailingCircle, selected && styles.trailingCircleSelected]}>
                {selected ? <SvgXml xml={CHECK_SVG} width={15} height={10} /> : null}
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
    backgroundColor: '#EBEBEB',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    minHeight: 82,
    paddingHorizontal: 18,
  },
  optionRowSelected: {
    backgroundColor: '#FFD6E5',
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
    height: 44,
    justifyContent: 'center',
    marginRight: 14,
    width: 44,
  },
  iconCircleSelected: {
    backgroundColor: '#FF1F5C',
  },
  optionLabel: {
    color: '#1A1A1A',
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
  pressed: {
    opacity: 0.86,
  },
});
