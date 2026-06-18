import React from 'react';
import { StyleSheet, View } from 'react-native';

const PINK = '#FF1956';
const INACTIVE = '#E4E4E5';

type ProgressDotsProps = {
  total: number;
  current: number; // 0-based index
};

export default function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
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
  dotActive: {
    width: 26,
    backgroundColor: PINK,
  },
  dotInactive: {
    width: 7,
    backgroundColor: INACTIVE,
  },
});
