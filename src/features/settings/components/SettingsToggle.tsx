import { Pressable, StyleSheet, View } from 'react-native';

type SettingsToggleProps = {
  onChange: (next: boolean) => void;
  value: boolean;
};

const SettingsToggle = ({ onChange, value }: SettingsToggleProps) => (
  <Pressable
    accessibilityRole="switch"
    accessibilityState={{ checked: value }}
    hitSlop={8}
    style={[styles.track, value && styles.trackOn]}
    onPress={() => onChange(!value)}
  >
    <View style={[styles.thumb, value && styles.thumbOn]} />
  </Pressable>
);

const styles = StyleSheet.create({
  thumb: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    height: 27,
    width: 27,
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
  track: {
    backgroundColor: '#d1d4d5',
    borderRadius: 16,
    height: 31,
    justifyContent: 'center',
    padding: 2,
    width: 51,
  },
  trackOn: {
    backgroundColor: '#ff1956',
  },
});

export default SettingsToggle;
