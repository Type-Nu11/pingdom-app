import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ReservationDetailScreenProps = {
  onBack: () => void;
  reservationId: number;
};

export default function ReservationDetailScreen({
  onBack,
  reservationId,
}: ReservationDetailScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <Pressable accessibilityLabel="뒤로 가기" accessibilityRole="button" hitSlop={12} onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>예약 상세</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>예약 식별자</Text>
          <Text style={styles.reservationId}>{reservationId}</Text>
          <View style={styles.divider} />
          <Text style={styles.noticeTitle}>상세·결제 내역 준비 중</Text>
          <Text style={styles.notice}>
            서버의 예약 상세 및 결제 조회 계약이 연결되면 이 예약 식별자로 정보를 불러옵니다.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  backText: { color: '#292A2E', fontSize: 34, lineHeight: 36 },
  card: { backgroundColor: '#FFFFFF', borderColor: '#ECEDEF', borderRadius: 18, borderWidth: 1, gap: 12, padding: 20 },
  content: { padding: 16 },
  divider: { backgroundColor: '#ECEDEF', height: 1, marginVertical: 4 },
  eyebrow: { color: '#8A8C93', fontSize: 13 },
  header: { alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomColor: '#ECEDEF', borderBottomWidth: 1, flexDirection: 'row', paddingBottom: 8, paddingHorizontal: 8 },
  headerSpacer: { width: 40 },
  notice: { color: '#7A7C83', fontSize: 14, lineHeight: 21 },
  noticeTitle: { color: '#292A2E', fontSize: 16, fontWeight: '700' },
  reservationId: { color: '#FF1956', fontSize: 24, fontWeight: '900' },
  screen: { backgroundColor: '#F7F7F8', flex: 1 },
  title: { color: '#17181B', flex: 1, fontSize: 17, fontWeight: '800', textAlign: 'center' },
});
