import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../../styles/colors';

const PINK = colors.primaryNormal;
const GRAY = colors.fillAlternative;

type ProgressBarProps = { total?: number; current: number };

export default function ProgressBar({ total = 7, current }: ProgressBarProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => {
        if (i === current) {
          return <View key={i} style={[styles.dot, styles.activeDot]} />;
        }
        if (i < current) {
          return <View key={i} style={[styles.dot, styles.prevDot]} />;
        }
        return <View key={i} style={[styles.dot, styles.inactiveDot]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 7,
    borderRadius: 100,
  },
  activeDot: {
    width: 26,
    backgroundColor: PINK,
  },
  prevDot: {
    width: 7,
    backgroundColor: PINK,
  },
  inactiveDot: {
    width: 7,
    backgroundColor: GRAY,
  },
});
