import { Pressable, StyleSheet, Text, View } from 'react-native';

import BackIcon from '../../../assets/v2/icons/header/back.svg';

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
      <BackIcon width={44} height={44} />
    </Pressable>
    <Text style={styles.title}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
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
