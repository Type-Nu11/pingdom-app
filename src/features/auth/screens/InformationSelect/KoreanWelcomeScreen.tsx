import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import KoreanOnboardingScaffold from './KoreanOnboardingScaffold';

type KoreanWelcomeScreenProps = {
  onStart: () => void;
  onBack?: () => void;
};

export default function KoreanWelcomeScreen({ onStart, onBack }: KoreanWelcomeScreenProps) {
  return (
    <KoreanOnboardingScaffold
      containerStyle={styles.container}
      contentStyle={styles.content}
      footerLabel="Get Started"
      footerLabelStyle={styles.footerLabel}
      onBack={onBack}
      onFooterPress={onStart}
      safeAreaStyle={styles.safeArea}
      step={1}
    >
      <View style={styles.centerContent}>
        <Image
          resizeMode="contain"
          source={require('../../../../assets/images/pingDomLogo.png')}
          style={styles.logo}
        />
        <Text style={styles.headline}>Only Pingdom</Text>
        <Text style={styles.caption}>{"Let's find hidden\nplaces in Korea!"}</Text>
      </View>
    </KoreanOnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8F8F8',
  },
  container: {
    backgroundColor: '#F8F8F8',
  },
  content: {
    justifyContent: 'center',
    paddingBottom: 56,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -34,
  },
  logo: {
    height: 144,
    marginBottom: 32,
    width: 247,
  },
  headline: {
    color: '#0C0C0D',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 8,
  },
  caption: {
    color: '#5E5E66',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 21,
    textAlign: 'center',
  },
  footerLabel: {
    fontSize: 20,
    fontWeight: '500',
  },
});
