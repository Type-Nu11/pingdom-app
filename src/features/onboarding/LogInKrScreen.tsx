import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SvgXml } from 'react-native-svg';
import { colors } from '../../styles/colors';

const PINK = colors.primaryNormal;

const BACK_SVG = `<svg width="9" height="18" viewBox="0 0 9 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1L1 9L8 17" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

type Props = {
  onBack: () => void;
  onSignup: () => void;
  onLogin: () => void;
};

export default function LogInKrScreen({ onBack, onSignup, onLogin }: Props) {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/v2/images/pingDomBackGround.png')}
        style={[styles.background, { width, height }]}
        resizeMode="stretch"
      />

      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.headerSide}>
          <SvgXml xml={BACK_SVG} width={9} height={18} />
        </Pressable>
        <View style={styles.headerSide} />
      </View>

      <View style={styles.body}>
        <View style={styles.centerGroup}>
          <Image
            source={require('../../assets/v2/images/pingDomLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.textGroup}>
            <Text style={styles.title}>{t('auth.koreanEntry.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.koreanEntry.subtitle')}</Text>
          </View>
        </View>

        <View style={styles.bottomGroup}>
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>{t('auth.koreanEntry.existingAccount')}</Text>
            <Pressable onPress={onLogin}>
              <Text style={styles.loginLink}>{t('auth.koreanEntry.login')}</Text>
            </Pressable>
          </View>
          <Pressable style={styles.button} onPress={onSignup}>
            <Text style={styles.buttonText}>{t('auth.koreanEntry.start')}</Text>
          </Pressable>
        </View>
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
    alignItems: 'flex-start',
  },
  body: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 58,
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
  bottomGroup: {
    width: '100%',
    gap: 18,
    alignItems: 'center',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.labelNeutral,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '500',
    color: PINK,
    textDecorationLine: 'underline',
  },
  button: {
    width: '100%',
    height: 64,
    backgroundColor: PINK,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
});
