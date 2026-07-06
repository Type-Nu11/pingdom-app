import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useMyReports } from '../../record/hooks/useMyReports';
import type { Report } from '../../record/model/record.types';
import SettingsDivider from './SettingsDivider';
import SettingsNavBar from './SettingsNavBar';

const PAGE_SIZE = 20;

type ReportHistoryViewProps = {
  onBack: () => void;
};

const ReportHistoryView = ({ onBack }: ReportHistoryViewProps) => {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Report[]>([]);
  const { hasNext, isError, isLoading, reports } = useMyReports({ limit: PAGE_SIZE, page });

  useEffect(() => {
    setItems((prev) => (page === 1 ? reports : [...prev, ...reports]));
  }, [page, reports]);

  const handleEndReached = () => {
    if (!isLoading && hasNext) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <View style={styles.screen}>
      <SettingsNavBar title="신고 내역" onBack={onBack} />
      {isError && items.length === 0 ? (
        <Text style={styles.emptyText}>신고 내역을 불러오지 못했습니다.</Text>
      ) : !isLoading && items.length === 0 ? (
        <Text style={styles.emptyText}>신고한 내역이 없습니다.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.reportId)}
          ItemSeparatorComponent={SettingsDivider}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={isLoading ? <ActivityIndicator style={styles.footerSpinner} /> : null}
          renderItem={({ item }) => {
            const isDone = item.status !== 'PENDING';
            return (
              <View style={styles.row}>
                <View style={styles.texts}>
                  <Text style={styles.name}>{item.title}</Text>
                  <Text style={styles.sub}>{item.reason}</Text>
                </View>
                <View style={[styles.badge, isDone ? styles.badgeDone : styles.badgePending]}>
                  <Text style={isDone ? styles.badgeTextDone : styles.badgeTextPending}>
                    {isDone ? '처리 완료' : '처리중'}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

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
  emptyText: {
    color: '#5e5e66',
    fontSize: 14,
    padding: 20,
    textAlign: 'center',
  },
  footerSpinner: {
    paddingVertical: 16,
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
