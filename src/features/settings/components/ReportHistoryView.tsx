import { FlatList, StyleSheet, Text, View } from 'react-native';
import { REPORT_HISTORY } from '../constants/legalContent';
import SettingsDivider from './SettingsDivider';
import SettingsNavBar from './SettingsNavBar';

type ReportHistoryViewProps = {
  onBack: () => void;
};

const ReportHistoryView = ({ onBack }: ReportHistoryViewProps) => (
  <View style={styles.screen}>
    <SettingsNavBar title="신고 내역" onBack={onBack} />
    <FlatList
      data={REPORT_HISTORY}
      keyExtractor={(item) => item.title}
      ItemSeparatorComponent={SettingsDivider}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={styles.texts}>
            <Text style={styles.name}>{item.title}</Text>
            <Text style={styles.sub}>{item.submittedAt}</Text>
          </View>
          <View style={[styles.badge, item.status === 'done' ? styles.badgeDone : styles.badgePending]}>
            <Text style={item.status === 'done' ? styles.badgeTextDone : styles.badgeTextPending}>
              {item.status === 'done' ? '처리 완료' : '처리중'}
            </Text>
          </View>
        </View>
      )}
    />
  </View>
);

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    flexShrink: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeDone: {
    backgroundColor: '#e8f4ea',
  },
  badgePending: {
    backgroundColor: '#fff4e0',
  },
  badgeTextDone: {
    color: '#1f7a3d',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextPending: {
    color: '#b06a00',
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '600',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
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
  texts: {
    flex: 1,
    gap: 2,
  },
});

export default ReportHistoryView;
