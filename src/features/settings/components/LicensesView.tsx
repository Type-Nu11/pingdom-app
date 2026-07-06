import { FlatList, StyleSheet, Text, View } from 'react-native';
import { OPEN_SOURCE_LICENSES } from '../constants/legalContent';
import SettingsDivider from './SettingsDivider';
import SettingsNavBar from './SettingsNavBar';

type LicensesViewProps = {
  onBack: () => void;
};

const LicensesView = ({ onBack }: LicensesViewProps) => (
  <View style={styles.screen}>
    <SettingsNavBar title="오픈소스 라이선스" onBack={onBack} />
    <FlatList
      data={OPEN_SOURCE_LICENSES}
      keyExtractor={(item) => item.name}
      ItemSeparatorComponent={SettingsDivider}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>{item.license}</Text>
        </View>
      )}
    />
  </View>
);

const styles = StyleSheet.create({
  name: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '600',
  },
  row: {
    gap: 2,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  screen: {
    flex: 1,
  },
  sub: {
    color: '#5e5e66',
    fontSize: 13,
  },
});

export default LicensesView;
