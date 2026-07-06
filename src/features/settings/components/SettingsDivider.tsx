import { StyleSheet, View } from 'react-native';

const SettingsDivider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  divider: {
    backgroundColor: '#e4e4e5',
    height: 1,
    marginHorizontal: 20,
  },
});

export default SettingsDivider;
