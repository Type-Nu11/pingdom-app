import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import CheckGenderIcon from '../../assets/icons/checkgender.svg';
import EscapeIcon from '../../assets/icons/escape.svg';
import FemaleIcon from '../../assets/icons/female.svg';
import MaleIcon from '../../assets/icons/male.svg';
import OtherIcon from '../../assets/icons/other.svg';
import ProgressBar from './components/ProgressBar';
import { useTranslation } from 'react-i18next';
import type { Gender } from './types';
import { colors } from '../../styles/colors';

const BG = colors.bgAssistive;

type Props = {
  onBack: () => void;
  onNext: (gender: Gender) => void;
};

export default function SelectGenderScreen({ onBack, onNext }: Props) {
  const [selected, setSelected] = useState<Gender>('male');
  const { t } = useTranslation();
  const tr = { title: t('selectGender.title'), subtitle: t('selectGender.subtitle'), button: t('selectGender.button'), male: t('selectGender.male'), female: t('selectGender.female'), other: t('selectGender.other') };

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
  const bg = isSelected ? colors.primaryNormal : colors.white;
  const color = isSelected ? colors.white : colors.labelNeutral;

  if (code === 'male') {
    return (
      <View style={[styles.iconCircle, { backgroundColor: bg }]}>
        <MaleIcon width={22} height={22} color={color} />
      </View>
    );
  }
  if (code === 'female') {
    return (
      <View style={[styles.iconCircle, { backgroundColor: bg }]}>
        <FemaleIcon width={15} height={22} color={color} />
      </View>
    );
  }
  return (
    <View style={[styles.iconCircle, { backgroundColor: bg }]}>
      <OtherIcon width={22} height={3} color={color} />
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
  title: { fontSize: 32, fontWeight: '700', color: colors.labelBlack, lineHeight: 41.6 },
  subtitle: { fontSize: 16, fontWeight: '500', color: colors.labelAlternative, lineHeight: 20.8 },
  options: { gap: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.fillNeutral,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 28,
    paddingVertical: 18,
  },
  cardSelected: {
    backgroundColor: 'rgba(255, 74, 117, 0.36)',
    borderColor: colors.primaryLight,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { fontSize: 20, fontWeight: '700', color: colors.labelStrong },
  cardTextSelected: { color: colors.white },
  checkbox: {
    width: 34,
    height: 34,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primaryNormal,
    borderColor: colors.primaryNormal,
  },
  spacer: { flex: 1 },
  button: {
    height: 64,
    backgroundColor: colors.primaryNormal,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 20, fontWeight: '700', color: colors.white },
});
