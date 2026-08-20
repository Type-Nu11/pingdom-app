import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MapAsset from '../../../assets/v2icon/maping_svg.svg';
import StarAsset from '../../../assets/v2icon/star_svg.svg';
import CheckInAsset from '../../../assets/v2icon/checkin_svg.svg';
import Button from '../../../shared/components/Button';
import type { Reservation } from '../../../v2/features/reservations';
import { useReservations } from '../../../v2/features/reservations';

type ReservationsScreenProps = {
  onOpenFavorites: () => void;
  onOpenMap: () => void;
  onOpenReservation: (reservationId: number) => void;
};

const STATUS_PRESENTATION: Record<Reservation['status'], { label: string; tone: string }> = {
  CANCELED: { label: '취소됨', tone: '#667085' },
  COMPLETED: { label: '이용 완료', tone: '#157F3D' },
  CONFIRMED: { label: '예약 확정', tone: '#157F3D' },
  EXPIRED: { label: '기간 만료', tone: '#667085' },
  NO_SHOW: { label: '미방문', tone: '#B54708' },
  PENDING: { label: '확정 대기', tone: '#EC245B' },
  UNKNOWN: { label: '상태 확인 필요', tone: '#B42318' },
};

function formatReservationDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function ReservationCard({
  onPress,
  reservation,
}: {
  onPress: () => void;
  reservation: Reservation;
}) {
  const status = STATUS_PRESENTATION[reservation.status] ?? STATUS_PRESENTATION.UNKNOWN;

  return (
    <Pressable
      accessibilityHint="예약 상세 화면으로 이동합니다"
      accessibilityLabel={`예약 ${reservation.id}, ${status.label}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      testID={`reservation-card-${reservation.id}`}
    >
      <View style={styles.cardHeader}>
        <View style={styles.reservationMark}><Text style={styles.reservationMarkText}>R</Text></View>
        <View style={styles.cardTitleCopy}>
          <Text style={styles.cardEyebrow}>내 예약</Text>
          <Text style={styles.cardTitle}>예약 번호 {reservation.id}</Text>
        </View>
        <Text style={[styles.status, { color: status.tone }]}>{status.label}</Text>
      </View>

      <View style={styles.divider} />
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>상품 유형</Text>
        <Text style={styles.metaValue}>{reservation.productType}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>예약 수량</Text>
        <Text style={styles.metaValue}>{reservation.quantity}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>접수 일시</Text>
        <Text style={styles.metaValue}>{formatReservationDate(reservation.createdAt)}</Text>
      </View>
      <Text style={styles.detailLink}>예약 상세 보기  ›</Text>
    </Pressable>
  );
}

function BottomNavigation({
  bottomInset,
  onOpenFavorites,
  onOpenMap,
}: {
  bottomInset: number;
  onOpenFavorites: () => void;
  onOpenMap: () => void;
}) {
  return (
    <View style={[styles.navigationWrap, { paddingBottom: Math.max(bottomInset, 12) }]}>
      <View style={styles.navigationBar}>
        <Pressable accessibilityLabel="지도" accessibilityRole="button" onPress={onOpenMap} style={styles.navItem}>
          <MapAsset color="#56575E" height={22} width={19} />
          <Text style={styles.navLabel}>지도</Text>
        </Pressable>
        <Pressable accessibilityLabel="즐겨찾기" accessibilityRole="button" onPress={onOpenFavorites} style={styles.navItem}>
          <StarAsset color="#3B3B40" height={21} width={22} />
          <Text style={styles.navLabel}>즐겨찾기</Text>
        </Pressable>
        <View accessible accessibilityLabel="예약" accessibilityRole="tab" accessibilityState={{ selected: true }} style={[styles.navItem, styles.navItemActive]}>
          <CheckInAsset height={22} width={21} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>예약</Text>
        </View>
      </View>
    </View>
  );
}

export default function ReservationsScreen({
  onOpenFavorites,
  onOpenMap,
  onOpenReservation,
}: ReservationsScreenProps) {
  const insets = useSafeAreaInsets();
  const reservations = useReservations({ page: 1, limit: 20 });
  const items = reservations.data?.reservations ?? [];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <Text accessibilityRole="header" style={styles.title}>내 예약</Text>
        <Text style={styles.subtitle}>예약 상태와 이용 내역을 확인해 보세요</Text>
      </View>

      {reservations.isLoading ? (
        <View accessibilityLiveRegion="polite" style={styles.state} testID="reservations-loading">
          <ActivityIndicator color="#FF1956" size="large" />
          <Text style={styles.stateTitle}>예약을 불러오고 있습니다</Text>
        </View>
      ) : reservations.isError ? (
        <View accessibilityLiveRegion="polite" style={styles.state} testID="reservations-error">
          <Text style={styles.stateSymbol}>!</Text>
          <Text style={styles.stateTitle}>예약을 불러오지 못했습니다</Text>
          <Text style={styles.stateDescription}>네트워크 상태를 확인한 뒤 다시 시도해 주세요.</Text>
          <Button label="다시 시도" onPress={() => void reservations.refetch()} style={styles.retryButton} />
        </View>
      ) : items.length === 0 ? (
        <View accessibilityLiveRegion="polite" style={styles.state} testID="reservations-empty">
          <Text style={styles.stateSymbol}>R</Text>
          <Text style={styles.stateTitle}>아직 예약 내역이 없습니다</Text>
          <Text style={styles.stateDescription}>지도에서 마음에 드는 장소를 찾아보세요.</Text>
          <Button label="장소 둘러보기" onPress={onOpenMap} style={styles.retryButton} />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ReservationCard
              onPress={() => onOpenReservation(item.id)}
              reservation={item}
            />
          )}
          showsVerticalScrollIndicator={false}
          testID="reservations-list"
        />
      )}

      <BottomNavigation
        bottomInset={insets.bottom}
        onOpenFavorites={onOpenFavorites}
        onOpenMap={onOpenMap}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderColor: '#ECEDEF', borderRadius: 18, borderWidth: 1, gap: 10, padding: 18, shadowColor: '#101828', shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.06, shadowRadius: 10 },
  cardEyebrow: { color: '#8A8C93', fontSize: 12, fontWeight: '600' },
  cardHeader: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  cardTitle: { color: '#1E1F23', fontSize: 17, fontWeight: '700' },
  cardTitleCopy: { flex: 1, gap: 3 },
  detailLink: { alignSelf: 'flex-end', color: '#EC245B', fontSize: 14, fontWeight: '700', marginTop: 4 },
  divider: { backgroundColor: '#ECEDEF', height: 1 },
  header: { backgroundColor: '#FFFFFF', borderBottomColor: '#F0F0F2', borderBottomWidth: 1, paddingBottom: 18, paddingHorizontal: 20 },
  list: { gap: 14, paddingBottom: 124, paddingHorizontal: 16, paddingTop: 18 },
  metaLabel: { color: '#8A8C93', fontSize: 13 },
  metaRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  metaValue: { color: '#3B3B40', flexShrink: 1, fontSize: 13, fontWeight: '600', textAlign: 'right' },
  navItem: { alignItems: 'center', borderRadius: 24, flex: 1, gap: 3, height: 50, justifyContent: 'center' },
  navItemActive: { backgroundColor: '#FFF0F4' },
  navLabel: { color: '#56575E', fontSize: 11, fontWeight: '600' },
  navLabelActive: { color: '#FF1956', fontWeight: '800' },
  navigationBar: { backgroundColor: '#FFFFFF', borderColor: '#ECEDEF', borderRadius: 29, borderWidth: 1, flexDirection: 'row', padding: 4, shadowColor: '#101828', shadowOffset: { height: 4, width: 0 }, shadowOpacity: 0.12, shadowRadius: 12 },
  navigationWrap: { bottom: 0, left: 16, position: 'absolute', right: 16 },
  pressed: { opacity: 0.72 },
  reservationMark: { alignItems: 'center', backgroundColor: '#FFF0F4', borderRadius: 12, height: 44, justifyContent: 'center', width: 44 },
  reservationMarkText: { color: '#FF1956', fontSize: 18, fontWeight: '900' },
  retryButton: { minWidth: 160 },
  screen: { backgroundColor: '#F7F7F8', flex: 1 },
  state: { alignItems: 'center', flex: 1, gap: 10, justifyContent: 'center', paddingBottom: 100, paddingHorizontal: 32 },
  stateDescription: { color: '#7A7C83', fontSize: 14, lineHeight: 21, marginBottom: 8, textAlign: 'center' },
  stateSymbol: { color: '#FF1956', fontSize: 30, fontWeight: '900' },
  stateTitle: { color: '#292A2E', fontSize: 18, fontWeight: '700' },
  status: { fontSize: 13, fontWeight: '800' },
  subtitle: { color: '#7A7C83', fontSize: 13, marginTop: 5 },
  title: { color: '#17181B', fontSize: 22, fontWeight: '800' },
});
