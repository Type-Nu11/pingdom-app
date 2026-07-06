import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Slider from '@react-native-community/slider';
import SubmitButton from '../components/SubmitButton';
import { colors } from '../../../styles/colors';
import { spacing } from '../../../styles/spacing';

type LanguageGateScreenProps = {
  onSubmit?: () => void;
};

export default function LanguageGateScreen({ onSubmit }: LanguageGateScreenProps) {
  const [language, setLanguage] = useState('ko');
  const [country, setCountry] = useState('kr');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState(50);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>최선의 경로를{'\n'}추천해드려요!</Text>

      <Text style={styles.label}>언어</Text>
      <Dropdown
        style={styles.dropdown}
        selectedTextStyle={styles.dropdownText}
        data={[
          { label: 'Korean', value: 'ko' },
          { label: 'English', value: 'en' },
        ]}
        labelField="label"
        valueField="value"
        value={language}
        onChange={(item) => setLanguage(item.value)}
      />

      <Text style={styles.label}>국적</Text>
      <Dropdown
        style={styles.dropdown}
        selectedTextStyle={styles.dropdownText}
        data={[
          { label: '🇰🇷 South Korea', value: 'kr' },
          { label: '🇺🇸 United States', value: 'us' },
        ]}
        labelField="label"
        valueField="value"
        value={country}
        onChange={(item) => setCountry(item.value)}
      />

      <Text style={styles.label}>성별</Text>
      <View style={styles.radioRow}>
        <Pressable style={styles.radioItem} onPress={() => setGender('male')}>
          <View style={[styles.radio, gender === 'male' && styles.radioActive]} />
          <Text style={gender === 'male' ? styles.activeText : styles.inactiveText}>남성</Text>
        </Pressable>

        <Pressable style={styles.radioItem} onPress={() => setGender('female')}>
          <View style={[styles.radio, gender === 'female' && styles.radioActive]} />
          <Text style={gender === 'female' ? styles.activeText : styles.inactiveText}>여성</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>나이</Text>
      <View style={styles.ageValue}>
        <Text>{age}</Text>
      </View>
      <View style={styles.sliderRow}>
        <Text>0</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={age}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.accent}
          onValueChange={setAge}
        />
        <Text>100+</Text>
      </View>
      <SubmitButton onPress={onSubmit}></SubmitButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg + spacing.xs,
    paddingTop: spacing.xl * 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.border,
    marginBottom: spacing.xl + spacing.md - spacing.xs + 2,
  },
  label: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.border,
    marginBottom: spacing.sm + spacing.xs + 2,
  },
  dropdown: {
    width: 220,
    height: 38,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    marginBottom: spacing.xl + spacing.md - spacing.xs,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.border,
  },
  radioRow: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: spacing.xl + spacing.md - spacing.xs,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radio: {
    width: 15,
    height: 15,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.textMuted,
  },
  radioActive: {
    borderWidth: 4,
    borderColor: colors.accent,
  },
  activeText: {
    color: colors.accent,
    fontSize: 14,
  },
  inactiveText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  ageValue: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl * 2 + spacing.md,
  },
  slider: {
    flex: 1,
    height: 30,
  },
  submitText: {
    fontSize: 15,
    color: colors.border,
  },
});
