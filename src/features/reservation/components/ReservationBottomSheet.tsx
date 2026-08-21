import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  GestureResponderHandlers,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import MapAsset from '../../../assets/v2/icons/place/maping_svg.svg';
import PlaceRecommendAsset from '../../../assets/v2/icons/place/placerecommend.svg';
import StarAsset from '../../../assets/v2/icons/place/star_svg.svg';
import VerificationAsset from '../../../assets/v2/icons/place/gamju.svg';
import type { BottomSheetSnapPoint } from '../../place/hooks/useBottomSheet';
import FrostedSurface from '../../place/components/FrostedSurface';
import {
  RecommendationFeaturedCard,
  type DecisionPlace,
} from '../../place/components/MapBottomSheet';
import * as GlassStyles from '../../place/styles/BottomSheetGlass.styles';
import type { Reservation } from '../../../v2/features/reservations';
import { useReservations } from '../../../v2/features/reservations';

const SHEET_RESTING_GAP = 8;
const SHEET_BOTTOM_RADIUS = 48;

type ReservationBottomSheetProps = {
  collapsedTranslateY: number;
  height: number;
  mediumTranslateY: number;
  onHandlePress: () => void;
  onOpenFavorites: () => void;
  onOpenMap: () => void;
  onOpenRecommendations: () => void;
  onOpenReservation: (reservationId: number) => void;
  onOpenVerification: () => void;
  panHandlers: GestureResponderHandlers;
  sheetChromeBottom: Animated.Value;
  sheetTranslateY: Animated.Value;
  snapPoint: BottomSheetSnapPoint;
  showPreviewFixtures?: boolean;
};

const PREVIEW_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=85',
] as const;

const ActiveReservationIcon = () => (
  <Svg height={23} viewBox="0 0 24 24" width={23}>
    <Path d="M3 10.2 12 2l9 8.2v8.3A2.5 2.5 0 0 1 18.5 21h-13A2.5 2.5 0 0 1 3 18.5Z" fill="#FF1956" />
    <Path d="m8.2 12.4 2.4 2.4 5.2-5.2" fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
  </Svg>
);


const STATUS_PRESENTATION: Record<Reservation['status'], { labelKey: string; color: string }> = {
  CANCELED: { labelKey: 'reservation.list.statuses.canceled', color: '#73757D' },
  COMPLETED: { labelKey: 'reservation.list.statuses.completed', color: '#157F3D' },
  CONFIRMED: { labelKey: 'reservation.list.statuses.confirmed', color: '#157F3D' },
  EXPIRED: { labelKey: 'reservation.list.statuses.expired', color: '#73757D' },
  NO_SHOW: { labelKey: 'reservation.list.statuses.noShow', color: '#B54708' },
  PENDING: { labelKey: 'reservation.list.statuses.pending', color: '#FF1956' },
  UNKNOWN: { labelKey: 'reservation.list.statuses.unknown', color: '#B42318' },
};

function formatDate(value: string, language: string) {
  return new Intl.DateTimeFormat(language.startsWith('en') ? 'en-US' : 'ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function ReservationCard({ onPress, reservation }: {
  onPress: () => void;
  reservation: Reservation;
}) {
  const { i18n, t } = useTranslation();
  const status = STATUS_PRESENTATION[reservation.status] ?? STATUS_PRESENTATION.UNKNOWN;
  const statusLabel = t(status.labelKey);

  return (
    <Pressable
      accessibilityHint={t('reservation.list.card.hint')}
      accessibilityLabel={t('reservation.list.card.label', { id: reservation.id, status: statusLabel })}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      testID={`reservation-card-${reservation.id}`}
    >
      <View style={styles.cardHeading}>
        <View style={styles.cardIcon}><Text style={styles.cardIconText}>R</Text></View>
        <View style={styles.cardTitleCopy}>
          <Text style={styles.cardEyebrow}>{t('reservation.list.card.eyebrow')}</Text>
          <Text style={styles.cardTitle}>{t('reservation.list.card.number', { id: reservation.id })}</Text>
        </View>
        <Text style={[styles.status, { color: status.color }]}>{statusLabel}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{t('reservation.list.card.productType')}</Text>
        <Text style={styles.metaValue}>{reservation.productType}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{t('reservation.list.card.quantity')}</Text>
        <Text style={styles.metaValue}>{reservation.quantity}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{t('reservation.list.card.createdAt')}</Text>
        <Text style={styles.metaValue}>{formatDate(reservation.createdAt, i18n.resolvedLanguage ?? i18n.language)}</Text>
      </View>
      <Text style={styles.detailLink}>{t('reservation.list.card.detail')}</Text>
    </Pressable>
  );
}

function NearbyReservationRail() {
  const { t } = useTranslation();
  const previewPlaces = useMemo<DecisionPlace[]>(() => [
    { address: t('reservation.fixtures.daeseong.shortAddress'), category: 'POPUP', distance: '12.3km', id: 91001, latitude: 35.65, longitude: 128.41, name: t('reservation.fixtures.oasis.name'), recommendationReason: t('reservation.fixtures.reasons.english'), tags: ['Bookable'], verifiedAgo: 'recently', wait: t('reservation.list.available') },
    { address: t('reservation.fixtures.daeseong.shortAddress'), category: 'POPUP', distance: '1.23km', id: 91002, latitude: 35.65, longitude: 128.41, name: t('reservation.fixtures.oasis.name'), recommendationReason: t('reservation.fixtures.reasons.reviews'), tags: ['Bookable'], verifiedAgo: 'recently', wait: t('reservation.list.available') },
    { address: t('reservation.fixtures.daeseong.shortAddress'), category: 'CAFE', distance: '2.1km', id: 91003, latitude: 35.65, longitude: 128.41, name: t('reservation.fixtures.layered.name'), recommendationReason: t('reservation.fixtures.reasons.parking'), tags: ['Bookable'], verifiedAgo: 'recently', wait: t('reservation.list.available') },
  ], [t]);
  const [bookmarkedPlaceIds, setBookmarkedPlaceIds] = useState(
    () => new Set([91001, 91002, 91003]),
  );

  const toggleBookmark = (placeId: number) => {
    setBookmarkedPlaceIds((current) => {
      const next = new Set(current);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return next;
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.nearbyRail} horizontal showsHorizontalScrollIndicator={false}>
      {previewPlaces.map((place, index) => (
        <RecommendationFeaturedCard
          bookmarked={bookmarkedPlaceIds.has(place.id)}
          fontSizeOffset={3}
          imageUrl={PREVIEW_IMAGE_URLS[index % PREVIEW_IMAGE_URLS.length]}
          index={index}
          key={place.id}
          onPress={() => undefined}
          onToggleBookmark={() => toggleBookmark(place.id)}
          pending={false}
          place={place}
        />
      ))}
    </ScrollView>
  );
}

function PreviewReservationCard({ index }: { index: number }) {
  const { t } = useTranslation();
  const fixture = index === 0 ? 'goyang' : 'daeseong';
  const name = t(`reservation.fixtures.${fixture}.name`);
  return (
    <View accessible accessibilityLabel={t('reservation.list.previewLabel', { name })} style={styles.previewReservation}>
      <View style={styles.previewHeading}>
        <View>
          <Text style={styles.previewName}>{name} <Text style={styles.previewCategory}>{t(`reservation.fixtures.${fixture}.category`)}</Text></Text>
          <Text numberOfLines={1} style={styles.previewMeta}>{t(`reservation.fixtures.${fixture}.address`)}</Text>
        </View>
        <Text style={styles.more}>⋮</Text>
      </View>
      <View style={styles.previewImages}>
        <Image source={{ uri: PREVIEW_IMAGE_URLS[0] }} style={styles.previewImage} />
        <Image source={{ uri: PREVIEW_IMAGE_URLS[1] }} style={styles.previewImage} />
      </View>
    </View>
  );
}

function VerificationFloatingButton({
  bottomInset,
  onPress,
  opacity,
  sheetTranslateY,
}: {
  bottomInset: number;
  onPress: () => void;
  opacity: Animated.AnimatedInterpolation<number>;
  sheetTranslateY: Animated.Value;
}) {
  const { t } = useTranslation();
  return (
    <Animated.View
      style={[
        styles.verifyButtonWrap,
        {
          bottom: Math.max(24, bottomInset + 10) + 78,
          opacity,
          transform: [{ translateY: Animated.multiply(sheetTranslateY, -1) }],
        },
      ]}
    >
      <Pressable accessibilityLabel={t('reservation.common.verify')} accessibilityRole="button" onPress={onPress} style={styles.verifyButton}>
        <VerificationAsset height={21} width={21} />
        <Text style={styles.verifyLabel}>{t('reservation.common.verify')}</Text>
      </Pressable>
    </Animated.View>
  );
}

function BottomNavigation({
  bottomInset,
  onOpenFavorites,
  onOpenMap,
  onOpenRecommendations,
  sheetTranslateY,
}: {
  bottomInset: number;
  onOpenFavorites: () => void;
  onOpenMap: () => void;
  onOpenRecommendations: () => void;
  sheetTranslateY: Animated.Value;
}) {
  const { t } = useTranslation();
  return (
    <Animated.View
      style={[
        styles.navigationRow,
        {
          bottom: Math.max(24, bottomInset + 10),
          transform: [{ translateY: Animated.multiply(sheetTranslateY, -1) }],
        },
      ]}
    >
      <View style={styles.navigationShadow}>
        <FrostedSurface
          cornerRadius={32}
          glassEffectStyle="regular"
          highlightOpacity={0}
          rimColor="rgba(0,0,0,0.06)"
          style={styles.navigationBar}
          tintColor="#FFFFFF"
        >
          <Pressable accessibilityLabel={t('reservation.common.map')} accessibilityRole="button" onPress={onOpenMap} style={styles.navItem}>
            <MapAsset color="#3B3B40" height={22} width={19} />
            <Text style={styles.navLabel}>{t('reservation.common.map')}</Text>
          </Pressable>
          <Pressable accessibilityLabel={t('reservation.common.favorites')} accessibilityRole="button" onPress={onOpenFavorites} style={styles.navItem}>
            <StarAsset color="#3B3B40" height={21} width={22} />
            <Text style={styles.navLabel}>{t('reservation.common.favorites')}</Text>
          </Pressable>
          <View accessible accessibilityLabel={t('reservation.common.reservations')} accessibilityRole="tab" accessibilityState={{ selected: true }} style={styles.navItem}>
            <View style={[styles.navItemSurface, styles.navItemActive]}>
              <ActiveReservationIcon />
              <Text style={[styles.navLabel, styles.navLabelActive]}>{t('reservation.common.reservations')}</Text>
            </View>
          </View>
        </FrostedSurface>
      </View>
      <Pressable accessibilityLabel={t('reservation.common.recommendations')} accessibilityRole="button" onPress={onOpenRecommendations} style={styles.sendButton}>
        <FrostedSurface
          cornerRadius={32}
          glassEffectStyle="regular"
          highlightOpacity={0}
          pointerEvents="none"
          rimColor="rgba(0,0,0,0.06)"
          style={styles.sendButtonGlass}
          tintColor="#FFFFFF"
        >
          <PlaceRecommendAsset height={23} width={23} />
        </FrostedSurface>
      </Pressable>
    </Animated.View>
  );
}

export default function ReservationBottomSheet({
  collapsedTranslateY,
  height,
  mediumTranslateY,
  onHandlePress,
  onOpenFavorites,
  onOpenMap,
  onOpenRecommendations,
  onOpenReservation,
  onOpenVerification,
  panHandlers,
  sheetChromeBottom,
  sheetTranslateY,
  snapPoint,
  showPreviewFixtures = __DEV__,
}: ReservationBottomSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const reservations = useReservations({ limit: 20, page: 1 });
  const items = reservations.data?.reservations ?? [];
  const fadeStart = mediumTranslateY + ((collapsedTranslateY - mediumTranslateY) * 0.42);
  const opacity = sheetTranslateY.interpolate({
    extrapolate: 'clamp',
    inputRange: [mediumTranslateY, fadeStart, collapsedTranslateY],
    outputRange: [1, 0.78, 0],
  });
  const chromeGapRange = [0, Math.max(mediumTranslateY, 1)];
  const chromeGap = sheetChromeBottom.interpolate({
    extrapolate: 'clamp',
    inputRange: chromeGapRange,
    outputRange: [0, SHEET_RESTING_GAP],
  });
  const chromeBottomInset = Animated.add(sheetChromeBottom, chromeGap);
  const chromeBottomRadius = sheetChromeBottom.interpolate({
    extrapolate: 'clamp',
    inputRange: chromeGapRange,
    outputRange: [0, SHEET_BOTTOM_RADIUS],
  });

  return (
    <GlassStyles.BottomSheetContainer style={{ height, transform: [{ translateY: sheetTranslateY }] }}>
      <GlassStyles.SheetChromeShadow
        pointerEvents="none"
        style={{ bottom: chromeBottomInset, left: chromeGap, right: chromeGap }}
      >
        <GlassStyles.SheetChrome
          $borderColor="transparent"
          style={{ borderBottomLeftRadius: chromeBottomRadius, borderBottomRightRadius: chromeBottomRadius }}
        >
          <GlassStyles.SheetGlass
            cornerRadius={34}
            glassEffectStyle="regular"
            highlightHeight={40}
            highlightOpacity={0.10}
            rimColor="rgba(255,255,255,0.60)"
            tintColor="rgba(255,255,255,0.92)"
            topRimOnly
          />
        </GlassStyles.SheetChrome>
      </GlassStyles.SheetChromeShadow>

      <GlassStyles.SheetInner $clipContent $inset={SHEET_RESTING_GAP}>
        <View style={styles.handleArea} {...panHandlers}>
          <Pressable accessibilityLabel={t('reservation.list.panelAdjust')} accessibilityRole="adjustable" onPress={onHandlePress} style={styles.handleButton}>
            <View style={styles.handle} />
          </Pressable>
        </View>
        <Animated.View pointerEvents={snapPoint === 'collapsed' ? 'none' : 'auto'} style={[styles.content, { opacity }]}>
          <View style={styles.titleRow}>
            <MapAsset color="#FF1956" height={20} width={18} />
            <Text accessibilityRole="header" style={styles.title}>{t('reservation.list.nearbyTitle')}</Text>
          </View>
          <Text style={styles.subtitle}>{t('reservation.list.nearbySubtitle')}</Text>
          <View style={[styles.listViewport, snapPoint === 'medium' && styles.listViewportMedium]}>
            <ScrollView contentContainerStyle={styles.listContent} nestedScrollEnabled showsVerticalScrollIndicator={false}>
              <NearbyReservationRail />
              <Text style={styles.savedTitle}>{t('reservation.list.savedTitle')}</Text>
              {reservations.isLoading ? (
                <View style={styles.state} testID="reservations-loading"><Text style={styles.stateTitle}>{t('reservation.list.loading')}</Text></View>
              ) : reservations.isError ? (
                <View style={styles.state} testID="reservations-error">
                  <Text style={styles.stateTitle}>{t('reservation.list.error')}</Text>
                  <Pressable accessibilityRole="button" onPress={() => void reservations.refetch()} style={styles.retryButton}><Text style={styles.retryLabel}>{t('reservation.list.retry')}</Text></Pressable>
                </View>
              ) : items.length === 0 && showPreviewFixtures ? (
                <View testID="reservations-preview">
                  <PreviewReservationCard index={0} />
                  <PreviewReservationCard index={1} />
                </View>
              ) : items.length === 0 ? (
                <View style={styles.state} testID="reservations-empty">
                  <Text style={styles.stateMark}>R</Text>
                  <Text style={styles.stateTitle}>{t('reservation.list.emptyTitle')}</Text>
                  <Text style={styles.stateBody}>{t('reservation.list.emptyDescription')}</Text>
                </View>
              ) : items.map((reservation) => (
                <ReservationCard key={reservation.id} onPress={() => onOpenReservation(reservation.id)} reservation={reservation} />
              ))}
            </ScrollView>
          </View>
        </Animated.View>
      </GlassStyles.SheetInner>
      {snapPoint === 'expanded' && items.length === 0 && showPreviewFixtures && !reservations.isLoading && !reservations.isError ? (
        <VerificationFloatingButton
          bottomInset={insets.bottom}
          onPress={onOpenVerification}
          opacity={opacity}
          sheetTranslateY={sheetTranslateY}
        />
      ) : null}
      <BottomNavigation
        bottomInset={insets.bottom}
        onOpenFavorites={onOpenFavorites}
        onOpenMap={onOpenMap}
        onOpenRecommendations={onOpenRecommendations}
        sheetTranslateY={sheetTranslateY}
      />
    </GlassStyles.BottomSheetContainer>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderColor: '#ECEDEF', borderRadius: 17, borderWidth: 1, gap: 9, marginBottom: 13, padding: 16 },
  cardEyebrow: { color: '#8A8C93', fontSize: 11, fontWeight: '600' },
  cardHeading: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  cardIcon: { alignItems: 'center', backgroundColor: '#FFF0F4', borderRadius: 11, height: 40, justifyContent: 'center', width: 40 },
  cardIconText: { color: '#FF1956', fontSize: 17, fontWeight: '900' },
  cardTitle: { color: '#1E1F23', fontSize: 16, fontWeight: '800' },
  cardTitleCopy: { flex: 1, gap: 2 },
  content: { flex: 1 },
  detailLink: { alignSelf: 'flex-end', color: '#EC245B', fontSize: 13, fontWeight: '800' },
  divider: { backgroundColor: '#ECEDEF', height: 1 },
  handle: { backgroundColor: 'rgba(80,83,91,0.31)', borderRadius: 3, height: 5, width: 55 },
  handleArea: { alignItems: 'center', height: 23, justifyContent: 'center' },
  handleButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 80 },
  listContent: { paddingBottom: 120, paddingHorizontal: 16, paddingTop: 12 },
  listViewport: { flex: 1, marginBottom: 92, overflow: 'hidden' },
  listViewportMedium: { flex: 0, height: 250, marginBottom: 0 },
  metaLabel: { color: '#8A8C93', fontSize: 12 },
  metaRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  metaValue: { color: '#3B3B40', fontSize: 12, fontWeight: '700' },
  more: { color: '#3B3B40', fontSize: 22 },
  nearbyRail: { gap: 12, paddingBottom: 10, paddingTop: 12 },
  navItem: { alignItems: 'center', flex: 1, gap: 3, justifyContent: 'center' },
  navItemActive: { backgroundColor: '#F7F7F8' },
  navItemSurface: { alignItems: 'center', borderRadius: 28, gap: 3, height: 54, justifyContent: 'center', width: 80 },
  navLabel: { color: '#3B3B40', fontSize: 11, fontWeight: '600' },
  navLabelActive: { color: '#FF245B', fontWeight: '700' },
  navigationBar: { borderRadius: 32, flex: 1, flexDirection: 'row', height: 64, overflow: 'hidden', padding: 5 },
  navigationRow: { flexDirection: 'row', gap: 12, left: 24, position: 'absolute', right: 24 },
  navigationShadow: { backgroundColor: '#FFFFFF', borderRadius: 32, elevation: 4, flex: 1, shadowColor: '#11151B', shadowOffset: { height: 4, width: 0 }, shadowOpacity: 0.12, shadowRadius: 16 },
  pressed: { opacity: 0.72 },
  previewCategory: { color: '#73757D', fontSize: 11, fontWeight: '500' },
  previewHeading: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  previewImage: { flex: 1, height: '100%' },
  previewImages: { borderRadius: 13, flexDirection: 'row', gap: 2, height: 105, overflow: 'hidden' },
  previewMeta: { color: '#73757D', fontSize: 11, marginTop: 3, maxWidth: 300 },
  previewName: { color: '#2B2C31', fontSize: 16, fontWeight: '800' },
  previewReservation: { marginBottom: 15 },
  retryButton: { backgroundColor: '#FF1956', borderRadius: 18, marginTop: 14, paddingHorizontal: 18, paddingVertical: 9 },
  retryLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  savedTitle: { color: '#1D1E22', fontSize: 21, fontWeight: '900', marginBottom: 10, marginTop: 2 },
  sendButton: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 32, elevation: 4, height: 64, justifyContent: 'center', shadowColor: '#11151B', shadowOffset: { height: 4, width: 0 }, shadowOpacity: 0.12, shadowRadius: 16, width: 64 },
  sendButtonGlass: { alignItems: 'center', borderRadius: 32, height: 64, justifyContent: 'center', overflow: 'hidden', width: 64 },
  state: { alignItems: 'center', paddingTop: 34 },
  stateBody: { color: '#777982', fontSize: 13, marginTop: 5 },
  stateMark: { color: '#FF1956', fontSize: 24, fontWeight: '900' },
  stateTitle: { color: '#27292F', fontSize: 16, fontWeight: '800', marginTop: 8 },
  status: { fontSize: 12, fontWeight: '800' },
  subtitle: { color: '#777982', fontSize: 16, marginTop: 4, paddingHorizontal: 16 },
  title: { color: '#111217', fontSize: 25, fontWeight: '900' },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  verifyButton: { alignItems: 'center', backgroundColor: '#E91E55', borderRadius: 28, elevation: 4, flexDirection: 'row', gap: 6, paddingHorizontal: 17, paddingVertical: 11, shadowColor: '#101828', shadowOffset: { height: 4, width: 0 }, shadowOpacity: 0.18, shadowRadius: 8 },
  verifyButtonWrap: { position: 'absolute', right: 30, zIndex: 4 },
  verifyLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
});
