import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import ProgressBar from './components/ProgressBar';

const PINK = '#FF1956';

const BACK_SVG_PATH = 'M8 1L1 9L8 17';

type Props = { onNext: () => void };

export default function SelectFirstScreen({ onNext }: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/bg_ellipse_top.png')}
        style={styles.blobTop}
        resizeMode="contain"
      />
      <Image
        source={require('../../assets/images/bg_ellipse_bottom.png')}
        style={styles.blobBottom}
        resizeMode="contain"
      />

      <View style={styles.header}>
        <View style={styles.headerSide} />
        <ProgressBar current={0} />
        <View style={styles.headerSide} />
      </View>

      <View style={styles.body}>
        <View style={styles.centerGroup}>
          <Image
            source={require('../../assets/images/pingDomLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.textGroup}>
            <Text style={styles.title}>Only Pingdom</Text>
            <Text style={styles.subtitle}>{`Let's find hidden\nplaces in Korea!`}</Text>
          </View>
        </View>

        <Pressable style={styles.button} onPress={onNext}>
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    overflow: 'hidden',
  },
  blobTop: {
    position: 'absolute',
    width: 489,
    height: 227,
    left: -142,
    top: 133,
  },
  blobBottom: {
    position: 'absolute',
    width: 528,
    height: 212,
    left: -3,
    top: 483,
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
    paddingHorizontal: 28,
    paddingBottom: 52,
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
    color: '#0C0C0D',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5E5E66',
    textAlign: 'center',
    lineHeight: 20.8,
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
    color: '#FFFFFF',
  },
});
