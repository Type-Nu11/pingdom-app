import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import KoreanOnboardingScaffold from './KoreanOnboardingScaffold';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type KoreanWelcomeScreenProps = {
  onStart: () => void;
  onBack?: () => void;
};

export default function KoreanWelcomeScreen({ onStart, onBack }: KoreanWelcomeScreenProps) {
  return (
    <View style={styles.root}>
      <Svg
        height={SCREEN_HEIGHT}
        style={StyleSheet.absoluteFill}
        width={SCREEN_WIDTH}
      >
        <Defs>
          <RadialGradient
            cx={SCREEN_WIDTH / 2}
            cy={SCREEN_HEIGHT * 0.38}
            gradientUnits="userSpaceOnUse"
            id="bg"
            r={SCREEN_WIDTH * 0.78}
          >
            <Stop offset="0" stopColor="#FF4D76" stopOpacity="0.28" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect fill="white" height={SCREEN_HEIGHT} width={SCREEN_WIDTH} />
        <Rect fill="url(#bg)" height={SCREEN_HEIGHT} width={SCREEN_WIDTH} />
      </Svg>

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
            source={require('../../../../assets/v2/images/pingDomLogo.png')}
            style={styles.logo}
          />
          <Text style={styles.headline}>Only Pingdom</Text>
          <Text style={styles.caption}>{"Let's find hidden\nplaces in Korea!"}</Text>
        </View>
      </KoreanOnboardingScaffold>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  container: {
    backgroundColor: 'transparent',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
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
