import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type StatusBadgeTone = 'neutral' | 'success' | 'warning' | 'error';

type StatusBadgeProps = {
  label: string;
  tone?: StatusBadgeTone;
};

const SYMBOLS: Record<StatusBadgeTone, string> = {
  neutral: '●',
  success: '✓',
  warning: '!',
  error: '×',
};

const StatusBadge = ({ label, tone = 'neutral' }: StatusBadgeProps) => (
  <View
    accessibilityLabel={label}
    accessibilityRole="text"
    style={[styles.badge, styles[`${tone}Badge`]]}
  >
    <Text accessibilityElementsHidden style={[styles.symbol, styles[`${tone}Text`]]}>
      {SYMBOLS[tone]}
    </Text>
    <Text style={[styles.label, styles[`${tone}Text`]]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    minHeight: 32,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  errorBadge: { backgroundColor: '#FEE4E2' },
  errorText: { color: '#B42318' },
  label: { flexShrink: 1, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  neutralBadge: { backgroundColor: '#EAECF0' },
  neutralText: { color: '#344054' },
  successBadge: { backgroundColor: '#D1FADF' },
  successText: { color: '#067647' },
  symbol: { fontSize: 14, fontWeight: '900' },
  warningBadge: { backgroundColor: '#FEF0C7' },
  warningText: { color: '#93370D' },
});

export default StatusBadge;
