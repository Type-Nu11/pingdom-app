import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const PINK = '#FF1956';

type SignUpWelcomeScreenProps = {
  onStart?: () => void;
  onLogin?: () => void;
};

export default function SignUpWelcomeScreen({
  onStart = () => {},
  onLogin = () => {},
}: SignUpWelcomeScreenProps) {
  return (
    <View style={styles.container}>
      {/* 배경 블롭 */}
      <Image
        source={require('../../../../assets/v2/images/bg_ellipse_top.png')}
        style={styles.blobTop}
        resizeMode="contain"
      />
      <Image
        source={require('../../../../assets/v2/images/bg_ellipse_bottom.png')}
        style={styles.blobBottom}
        resizeMode="contain"
      />

      {/* 상단 헤더 */}
      <View style={styles.header} />

      {/* 바디 */}
      <View style={styles.body}>
        <View style={styles.centerGroup}>
          <Image
            source={require('../../../../assets/v2/images/pingDomLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.textGroup}>
            <Text style={styles.title}>나만의 장소, 핑덤</Text>
            <Text style={styles.subtitle}>{'당신만의 장소를 \n외국인들에게 공유해주세요!'}</Text>
          </View>
        </View>

        <View style={styles.bottomGroup}>
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>이미 계정이 있으신가요? </Text>
            <Pressable onPress={onLogin}>
              <Text style={styles.loginLink}>로그인</Text>
            </Pressable>
          </View>
          <Pressable style={styles.startButton} onPress={onStart}>
            <Text style={styles.startButtonText}>시작하기</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  },
  body: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 58,
    justifyContent: 'space-between',
    alignItems: 'center',
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
    lineHeight: 21,
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
    color: '#3B3B40',
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '500',
    color: PINK,
    textDecorationLine: 'underline',
  },
  startButton: {
    width: '100%',
    height: 64,
    backgroundColor: PINK,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
