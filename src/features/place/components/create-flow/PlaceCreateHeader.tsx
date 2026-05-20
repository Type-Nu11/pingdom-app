import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PlaceCreateStep } from './types';

type PlaceCreateHeaderProps = {
  onBack: () => void;
  onNext?: () => void;
  step: PlaceCreateStep;
};

const PlaceCreateHeader = ({ onBack, onNext, step }: PlaceCreateHeaderProps) => (
  <View style={styles.header}>
    <Pressable accessibilityRole="button" accessibilityLabel="뒤로가기" hitSlop={12} onPress={onBack}>
      <Text style={styles.backText}>{'<'}</Text>
    </Pressable>
    <ProgressDots step={step} />
    {onNext ? (
      <Pressable accessibilityRole="button" accessibilityLabel="다음" hitSlop={12} onPress={onNext}>
        <Text style={styles.nextText}>다음</Text>
      </Pressable>
    ) : (
      <View style={styles.headerSpacer} />
    )}
  </View>
);

const ProgressDots = ({ step }: { step: PlaceCreateStep }) => (
  <View style={styles.progressRow}>
    {[1, 2, 3].map((item) => (
      <View
        key={item}
        style={[
          styles.progressDot,
          item === step && styles.progressActive,
          item < step && styles.progressDone,
        ]}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 72,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 14,
  },
  backText: {
    color: '#050505',
    fontSize: 36,
    fontWeight: '400',
    lineHeight: 38,
  },
  nextText: {
    color: '#ff1956',
    fontSize: 21,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 36,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  progressDot: {
    backgroundColor: '#dedfe4',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  progressActive: {
    backgroundColor: '#ff1956',
    width: 28,
  },
  progressDone: {
    backgroundColor: '#ff1956',
  },
});

export default PlaceCreateHeader;
