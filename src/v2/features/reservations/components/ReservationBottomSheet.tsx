import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  GestureResponderHandlers,
  Pressable,
  ScrollView,
  Text as NativeText,
  type TextProps,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import MapAsset from '../../../../assets/v2/icons/place/maping_svg.svg';
import PlaceRecommendAsset from '../../../../assets/v2/icons/place/placerecommend.svg';
import StarAsset from '../../../../assets/v2/icons/place/star_svg.svg';
import type { BottomSheetSnapPoint } from '../../map/hooks/useBottomSheet';
import FrostedSurface from '../../map/components/FrostedSurface';
import {
  RecommendationFeaturedCard,
  type DecisionPlace,
} from '../../map/components/MapBottomSheet';
import { usePlacePreviewImages } from '../../map/hooks/usePlacePreviewImages';
import * as GlassStyles from '../../map/styles/BottomSheetGlass.styles';
import type { StatusTone } from '../../../shared/model';
import { getReservationStatusView } from '../model/reservationPresentation';
import type { Reservation } from '..';
import { useReservations } from '..';

const SHEET_RESTING_GAP = 8;
const SHEET_BOTTOM_RADIUS = 48;

const Text = (props: TextProps) => <NativeText maxFontSizeMultiplier={1} {...props} />;

type ReservationBottomSheetProps = {
  bookmarkedPlaceIds: Record<string, boolean>;
  bookmarkPendingPlaceIds: Record<string, boolean>;
  collapsedTranslateY: number;
  height: number;
  isBookmarkStateLoading: boolean;
  mediumTranslateY: number;
  nearbyPlaces: DecisionPlace[];
  onHandlePress: () => void;
  onOpenFavorites: () => void;
  onOpenMap: () => void;
  onOpenRecommendations: () => void;
  onOpenReservation: (reservationId: number) => void;
  onPlacePress: (place: DecisionPlace) => void;
  onToggleBookmark: (place: DecisionPlace, nextBookmarked: boolean) => Promise<void>;
  panHandlers: GestureResponderHandlers;
  sheetChromeBottom: Animated.Value;
  sheetTranslateY: Animated.Value;
  snapPoint: BottomSheetSnapPoint;
};

const ActiveReservationIcon = () => (
  <Svg height={23} viewBox="0 0 24 24" width={23}>
    <Path d="M3 10.2 12 2l9 8.2v8.3A2.5 2.5 0 0 1 18.5 21h-13A2.5 2.5 0 0 1 3 18.5Z" fill="#FF1956" />
    <Path d="m8.2 12.4 2.4 2.4 5.2-5.2" fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
  </Svg>
);


// Label and tone come from the shared reservation selector; only the sheet's own
// palette lives here, so the status vocabulary is not restated per screen.
const STATUS_TONE_COLORS: Record<StatusTone, string> = {
  error: '#B42318',
  neutral: '#73757D',
  success: '#157F3D',
  warning: '#FF1956',
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
  const status = getReservationStatusView(reservation.status);
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
        <Text style={[styles.status, { color: STATUS_TONE_COLORS[status.tone] }]}>
          {`${status.symbol} ${statusLabel}`}
        </Text>
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

function NearbyReservationRail({
  bookmarkedPlaceIds,
  bookmarkPendingPlaceIds,
  isBookmarkStateLoading,
  onPlacePress,
  onToggleBookmark,
  places,
}: {
  bookmarkedPlaceIds: Record<string, boolean>;
  bookmarkPendingPlaceIds: Record<string, boolean>;
  isBookmarkStateLoading: boolean;
  onPlacePress: (place: DecisionPlace) => void;
  onToggleBookmark: (place: DecisionPlace, nextBookmarked: boolean) => Promise<void>;
  places: DecisionPlace[];
}) {
  const { t } = useTranslation();
  const { imageUrlsByPlaceId } = usePlacePreviewImages(places);

  if (places.length === 0) {
    return (
      <View style={styles.nearbyEmpty} testID="nearby-reservations-empty">
        <Text style={styles.nearbyEmptyText}>{t('reservation.list.nearbyEmpty')}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.nearbyRail} horizontal showsHorizontalScrollIndicator={false}>
      {places.map((place) => (
        <RecommendationFeaturedCard
          bookmarked={Boolean(bookmarkedPlaceIds[String(place.id)])}
          imageUrl={imageUrlsByPlaceId[String(place.id)]}
          key={place.id}
          onPress={() => onPlacePress(place)}
          onToggleBookmark={() => void onToggleBookmark(
            place,
            !bookmarkedPlaceIds[String(place.id)],
          )}
          pending={isBookmarkStateLoading || Boolean(bookmarkPendingPlaceIds[String(place.id)])}
          place={place}
        />
      ))}
    </ScrollView>
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
  bookmarkedPlaceIds,
  bookmarkPendingPlaceIds,
  collapsedTranslateY,
  height,
  isBookmarkStateLoading,
  mediumTranslateY,
  nearbyPlaces,
  onHandlePress,
  onOpenFavorites,
  onOpenMap,
  onOpenRecommendations,
  onOpenReservation,
  onPlacePress,
  onToggleBookmark,
  panHandlers,
  sheetChromeBottom,
  sheetTranslateY,
  snapPoint,
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
              <NearbyReservationRail
                bookmarkedPlaceIds={bookmarkedPlaceIds}
                bookmarkPendingPlaceIds={bookmarkPendingPlaceIds}
                isBookmarkStateLoading={isBookmarkStateLoading}
                onPlacePress={onPlacePress}
                onToggleBookmark={onToggleBookmark}
                places={nearbyPlaces}
              />
              {snapPoint === 'expanded' ? (
                <>
                  <Text style={styles.savedTitle}>{t('reservation.list.savedTitle')}</Text>
                  {reservations.isLoading ? (
                    <View style={styles.state} testID="reservations-loading"><Text style={styles.stateTitle}>{t('reservation.list.loading')}</Text></View>
                  ) : reservations.isError ? (
                    <View style={styles.state} testID="reservations-error">
                      <Text style={styles.stateTitle}>{t('reservation.list.error')}</Text>
                      <Pressable accessibilityRole="button" onPress={() => void reservations.refetch()} style={styles.retryButton}><Text style={styles.retryLabel}>{t('reservation.list.retry')}</Text></Pressable>
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
                </>
              ) : null}
            </ScrollView>
          </View>
        </Animated.View>
      </GlassStyles.SheetInner>
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

const styles: Record<string, object> = {
  card: { backgroundColor: '#FFFFFF', borderColor: '#ECEDEF', borderRadius: 17, borderWidth: 1, gap: 8, marginBottom: 11, padding: 14 },
  cardEyebrow: { color: '#8A8C93', fontSize: 10, fontWeight: '600' },
  cardHeading: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  cardIcon: { alignItems: 'center', backgroundColor: '#FFF0F4', borderRadius: 10, height: 36, justifyContent: 'center', width: 36 },
  cardIconText: { color: '#FF1956', fontSize: 15, fontWeight: '900' },
  cardTitle: { color: '#1E1F23', fontSize: 14, fontWeight: '800' },
  cardTitleCopy: { flex: 1, gap: 2 },
  content: { flex: 1 },
  detailLink: { alignSelf: 'flex-end', color: '#EC245B', fontSize: 11, fontWeight: '800' },
  divider: { backgroundColor: '#ECEDEF', height: 1 },
  handle: { backgroundColor: 'rgba(80,83,91,0.34)', borderRadius: 3, height: 5, width: 56 },
  handleArea: { alignItems: 'center', height: 36, justifyContent: 'center' },
  handleButton: { alignItems: 'center', height: 36, justifyContent: 'center', width: 96 },
  listContent: { paddingBottom: 120, paddingHorizontal: 16, paddingTop: 2 },
  listViewport: { flex: 1, marginBottom: 92, overflow: 'hidden' },
  listViewportMedium: { flex: 0, height: 250, marginBottom: 0 },
  metaLabel: { color: '#8A8C93', fontSize: 11 },
  metaRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  metaValue: { color: '#3B3B40', fontSize: 11, fontWeight: '700' },
  nearbyEmpty: { alignItems: 'center', minHeight: 72, justifyContent: 'center' },
  nearbyEmptyText: { color: '#777982', fontSize: 12, fontWeight: '600' },
  nearbyRail: { gap: 12, paddingBottom: 4, paddingTop: 2 },
  navItem: { alignItems: 'center', flex: 1, gap: 3, justifyContent: 'center' },
  navItemActive: { backgroundColor: '#F7F7F8' },
  navItemSurface: { alignItems: 'center', borderRadius: 28, gap: 3, height: 54, justifyContent: 'center', width: 80 },
  navLabel: { color: '#3B3B40', fontSize: 11, fontWeight: '600' },
  navLabelActive: { color: '#FF245B', fontWeight: '700' },
  navigationBar: { borderRadius: 32, flex: 1, flexDirection: 'row', height: 64, overflow: 'hidden', padding: 5 },
  navigationRow: { flexDirection: 'row', gap: 12, left: 24, position: 'absolute', right: 24 },
  navigationShadow: { backgroundColor: '#FFFFFF', borderRadius: 32, flex: 1 },
  pressed: { opacity: 0.72 },
  retryButton: { backgroundColor: '#FF1956', borderRadius: 18, marginTop: 14, paddingHorizontal: 18, paddingVertical: 9 },
  retryLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  savedTitle: { color: '#1D1E22', fontSize: 17, fontWeight: '900', marginBottom: 8, marginTop: 0 },
  sendButton: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 32, height: 64, justifyContent: 'center', width: 64 },
  sendButtonGlass: { alignItems: 'center', borderRadius: 32, height: 64, justifyContent: 'center', overflow: 'hidden', width: 64 },
  state: { alignItems: 'center', paddingTop: 34 },
  stateBody: { color: '#777982', fontSize: 11, marginTop: 4 },
  stateMark: { color: '#FF1956', fontSize: 20, fontWeight: '900' },
  stateTitle: { color: '#27292F', fontSize: 14, fontWeight: '800', marginTop: 6 },
  status: { fontSize: 11, fontWeight: '800' },
  subtitle: { color: '#777982', fontSize: 13, marginTop: 2, paddingHorizontal: 16 },
  title: { color: '#111217', fontSize: 25, fontWeight: '900', letterSpacing: -0.7 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
};
