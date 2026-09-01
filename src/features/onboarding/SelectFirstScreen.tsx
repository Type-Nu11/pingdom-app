import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import ProgressBar from './components/ProgressBar';
import { colors } from '../../styles/colors';

const PINK = colors.primaryNormal;

const BACK_SVG_PATH = 'M8 1L1 9L8 17';

type Props = { onNext: () => void };

export default function SelectFirstScreen({ onNext }: Props) {
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/v2/images/pingDomBackGround.png')}
        style={[styles.background, { width, height }]}
        resizeMode="stretch"
      />

      <View style={styles.header}>
        <View style={styles.headerSide} />
        <ProgressBar current={0} />
        <View style={styles.headerSide} />
      </View>

      <View style={styles.body}>
        <View style={styles.centerGroup}>
          <Image
            accessibilityLabel={t('selectLanguage.logoAccessibilityLabel')}
            source={require('../../assets/v2/images/pingDomLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.textGroup}>
            <Text style={styles.title}>{t('loginForeign.title')}</Text>
            <Text style={styles.subtitle}>{t('loginForeign.subtitle')}</Text>
          </View>
        </View>

        <Pressable style={styles.button} onPress={onNext}>
          <Text style={styles.buttonText}>{t('loginForeign.button')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgAssistive,
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    height: 105,
    paddingTop: 80,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerSide: {
    width: 40,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 36,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerGroup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  logo: {
    width: 247,
    height: 144,
  },
  textGroup: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.labelStrong,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.labelAlternative,
    textAlign: 'center',
    lineHeight: 20.8,
  },
  button: {
    width: '100%',
    height: 64,
    backgroundColor: PINK,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
});
