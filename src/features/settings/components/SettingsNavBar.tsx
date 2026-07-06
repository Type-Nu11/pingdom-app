import { Pressable, StyleSheet, Text, View } from 'react-native';

type SettingsNavBarProps = {
  onBack: () => void;
  title: string;
};

const SettingsNavBar = ({ onBack, title }: SettingsNavBarProps) => (
  <View style={styles.bar}>
    <Pressable
      accessibilityLabel="뒤로 가기"
      accessibilityRole="button"
      hitSlop={12}
      style={styles.backButton}
      onPress={onBack}
    >
      <Text style={styles.backIcon}>‹</Text>
    </Pressable>
    <Text style={styles.title}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backIcon: {
    color: '#000000',
    fontSize: 30,
    fontWeight: '300',
  },
  bar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  title: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SettingsNavBar;
