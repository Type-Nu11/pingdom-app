import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import CheckGenderIcon from '../../assets/icons/checkgender.svg';
import EscapeIcon from '../../assets/icons/escape.svg';
import FemaleIcon from '../../assets/icons/female.svg';
import MaleIcon from '../../assets/icons/male.svg';
import OtherIcon from '../../assets/icons/other.svg';
import ProgressBar from './components/ProgressBar';
import { t } from './i18n';
import type { Gender, Language } from './types';

const BG = '#F8F8F8';

type Props = {
  language: Language;
  onBack: () => void;
  onNext: (gender: Gender) => void;
};

export default function SelectGenderScreen({ language, onBack, onNext }: Props) {
  const [selected, setSelected] = useState<Gender>('male');
  const tr = t(language).selectGender;

  const GENDERS: { code: Gender; label: string }[] = [
    { code: 'male', label: tr.male },
    { code: 'female', label: tr.female },
    { code: 'other', label: tr.other },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.headerSide}>
          <EscapeIcon width={12} height={21} />
        </Pressable>
        <ProgressBar current={4} />
        <View style={styles.headerSide} />
      </View>

      <View style={styles.body}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{tr.title}</Text>
          <Text style={styles.subtitle}>{tr.subtitle}</Text>
        </View>

        <View style={styles.options}>
          {GENDERS.map(({ code, label }) => {
            const isSelected = selected === code;
            return (
              <Pressable
                key={code}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelected(code)}
              >
                <View style={styles.cardLeft}>
                  <GenderIcon code={code} isSelected={isSelected} />
                  <Text style={[styles.cardText, isSelected && styles.cardTextSelected]}>
                    {label}
                  </Text>
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <CheckGenderIcon width={16} height={11} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <Pressable style={styles.button} onPress={() => onNext(selected)}>
          <Text style={styles.buttonText}>{tr.button}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function GenderIcon({ code, isSelected }: { code: Gender; isSelected: boolean }) {
  if (code === 'male') {
    return (
      <View style={[styles.iconCircle, { backgroundColor: isSelected ? '#FF1956' : '#FFFFFF' }]}>
        <MaleIcon width={22} height={22} color={isSelected ? '#FFFFFF' : '#3B3B40'} />
      </View>
    );
  }
  if (code === 'female') {
    return (
      <View style={[styles.iconCircle, { backgroundColor: '#FFFFFF' }]}>
        <FemaleIcon width={15} height={22} color={isSelected ? '#000000' : '#3B3B40'} />
      </View>
    );
  }
  return (
    <View style={[styles.iconCircle, { backgroundColor: '#FFFFFF' }]}>
      <OtherIcon width={22} height={3} color={isSelected ? '#000000' : '#3B3B40'} />
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
  titleGroup: { gap: 2, marginBottom: 18 },
  title: { fontSize: 32, fontWeight: '700', color: '#000000', lineHeight: 41.6 },
  subtitle: { fontSize: 16, fontWeight: '500', color: '#5E5E66', lineHeight: 20.8 },
  options: { gap: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F3',
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 18,
  },
  cardSelected: {
    backgroundColor: 'rgba(255, 74, 117, 0.36)',
    borderWidth: 2,
    borderColor: '#FF4A75',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { fontSize: 20, fontWeight: '700', color: '#0C0C0D' },
  cardTextSelected: { color: '#FFFFFF' },
  checkbox: {
    width: 34,
    height: 34,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#BFC1C1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#FF1956',
    borderColor: '#FF1956',
  },
  spacer: { flex: 1 },
  button: {
    height: 64,
    backgroundColor: '#FF1956',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
});
