import React from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

type KoreanOnboardingScaffoldProps = {
  step: number;
  totalSteps?: number;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footerLabel: string;
  onFooterPress: () => void;
  onBack?: () => void;
  footerDisabled?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  safeAreaStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  footerStyle?: StyleProp<ViewStyle>;
  footerLabelStyle?: StyleProp<TextStyle>;
};

export default function KoreanOnboardingScaffold({
  step,
  totalSteps = 5,
  title,
  subtitle,
  children,
  footerLabel,
  onFooterPress,
  onBack,
  footerDisabled = false,
  contentStyle,
  safeAreaStyle,
  containerStyle,
  footerStyle,
  footerLabelStyle,
}: KoreanOnboardingScaffoldProps) {
  return (
    <SafeAreaView style={[styles.safeArea, safeAreaStyle]}>
      <View style={[styles.container, containerStyle]}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            disabled={!onBack}
            hitSlop={12}
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && onBack ? styles.pressed : null]}
          >
            <Text style={[styles.backIcon, !onBack && styles.backIconDisabled]}>‹</Text>
          </Pressable>

          <View style={styles.progressTrack}>
            {Array.from({ length: totalSteps }, (_, index) => {
              const itemStep = index + 1;
              const isActive = itemStep === step;
              const isPast = itemStep < step;

              return (
                <View
                  key={itemStep}
                  style={[
                    styles.progressDot,
                    isPast && styles.progressDotPast,
                    isActive && styles.progressDotActive,
                  ]}
                />
              );
            })}
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.content, contentStyle]}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {children}
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={footerDisabled}
          onPress={onFooterPress}
          style={({ pressed }) => [
            styles.footerButton,
            footerStyle,
            footerDisabled && styles.footerButtonDisabled,
            pressed && !footerDisabled ? styles.pressed : null,
          ]}
        >
          <Text style={[styles.footerButtonLabel, footerLabelStyle]}>{footerLabel}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 52,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 80,
    minHeight: 32,
  },
  backButton: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  backIcon: {
    color: '#131313',
    fontSize: 33,
    fontWeight: '300',
    lineHeight: 33,
  },
  backIconDisabled: {
    opacity: 0.45,
  },
  progressTrack: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  progressDot: {
    backgroundColor: '#D8D8DE',
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  progressDotPast: {
    backgroundColor: '#FF1F5C',
  },
  progressDotActive: {
    backgroundColor: '#FF1F5C',
    width: 24,
  },
  headerSpacer: {
    width: 28,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#111111',
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  subtitle: {
    color: '#7D7D84',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 18,
  },
  footerButton: {
    alignItems: 'center',
    backgroundColor: '#FF1F5C',
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 64,
  },
  footerButtonDisabled: {
    opacity: 0.45,
  },
  footerButtonLabel: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.88,
  },
});
