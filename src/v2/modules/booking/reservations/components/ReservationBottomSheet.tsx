import { ApiErrorState } from '../../../../shared/components';
import ReservationRecordCard from './ReservationRecordCard';
import { Text as AppText } from '../../../../shared/components/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Animated,
  GestureResponderHandlers,
  Image,
  Pressable,
  ScrollView,
  Text as NativeText,
  type TextProps,
  View,
} from 'react-native';

import MapAsset from '../../../../../assets/v2/icons/place/maping_svg.svg';
import MyPlaceAsset from '../../../../../assets/v2/icons/place/my_place.svg';
import type { MapReservationSheetProps } from '../../../place/map/sheet';
import { MapSheetBottomNavigation } from '../../../place/map/sheet';
import {
  RecommendationFeaturedCard,
  type DecisionPlace,
} from '../../../place/map/sheet';
import { usePlacePreviewImages } from '../../../place/map/sheet';
import { normalizePlaceCategory } from '../../../place/map/sheet';
import { usePlaceExplorationMediaList } from '../../../place/exploration';
import * as GlassStyles from '../../../place/map/sheet';
import { useReservations } from '..';
import { liquidGlass } from '../../../../shared/theme/liquidGlass';
import { useTheme } from 'styled-components/native';
import type { AppTheme } from '../../../../shared/theme';

const SHEET_RESTING_GAP = 8;
const SHEET_BOTTOM_RADIUS = liquidGlass.sheet.bottomRadius;

const Text = (props: TextProps) => <NativeText maxFontSizeMultiplier={1} {...props} />;

const useReservationStyles = () => {
  const { colors } = useTheme();
  return React.useMemo(() => createStyles(colors), [colors]);
};



function formatDistance(place: DecisionPlace, language: string) {
  if (typeof place.distanceMeters !== 'number') return place.distance || '';
  if (place.distanceMeters < 1000) return language.startsWith('en')
    ? `${Math.round(place.distanceMeters)} m away`
    : `여기서 ${(place.distanceMeters / 1000).toFixed(1)}km`;
  const km = (place.distanceMeters / 1000).toFixed(1);
  return language.startsWith('en') ? `${km} km away` : `여기서 ${km}km`;
}

function ReservationPlaceImage({ uri }: { uri?: string }) {
  const [failed, setFailed] = React.useState(false);
  const styles = useReservationStyles();
  React.useEffect(() => setFailed(false), [uri]);

  if (!uri || failed) {
    return <View style={[styles.savedImage, styles.savedImageFallback]}><MyPlaceAsset height={30} width={30} /></View>;
  }
  return <Image onError={() => setFailed(true)} resizeMode="cover" source={{ uri }} style={styles.savedImage} />;
}

function ReservationPlaceCard({
  imageUrls,
  onPress,
  place,
  reservationId,
}: {
  imageUrls: string[];
  onPress: () => void;
  place: DecisionPlace;
  reservationId: number;
}) {
  const { i18n, t } = useTranslation();
  const styles = useReservationStyles();
  const category = normalizePlaceCategory(place.category);
  const firstImage = imageUrls[0];
  const secondImage = imageUrls[1] ?? firstImage;

  return (
    <Pressable
      accessibilityLabel={`${place.name}, ${formatDistance(place, i18n.language)}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.savedPlaceCard, pressed && styles.pressed]}
      testID={`reservation-place-card-${reservationId}`}
    >
      <View style={styles.savedPlaceHeading}>
        <View style={styles.savedPlaceText}>
          <View style={styles.savedNameRow}>
            <AppText accessibilityLabel={place.name} ellipsizeMode="tail" numberOfLines={1} style={styles.savedPlaceName}>{place.name}</AppText>
            <AppText ellipsizeMode="tail" numberOfLines={1} style={styles.savedPlaceCategory}>
              {t(`map.categories.${category}`, { defaultValue: place.category })}
            </AppText>
          </View>
          <AppText accessibilityLabel={`${formatDistance(place, i18n.language)} · ${place.address}`} ellipsizeMode="tail" numberOfLines={1} style={styles.savedPlaceMeta}>
            {formatDistance(place, i18n.language)} · {place.address}
          </AppText>
        </View>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.savedMoreButton}>
          <AppText style={styles.savedMoreText}>⋮</AppText>
        </View>
      </View>
      <View style={styles.savedImageRow}>
        <ReservationPlaceImage uri={firstImage} />
        <ReservationPlaceImage uri={secondImage} />
      </View>
    </Pressable>
  );
}

function NearbyReservationRail({
  bookmarkedPlaceIds,
  bookmarkPendingPlaceIds,
  isBookmarkStateLoading,
  isLoading,
  onPlacePress,
  onToggleBookmark,
  places,
}: {
  bookmarkedPlaceIds: Record<string, boolean>;
  bookmarkPendingPlaceIds: Record<string, boolean>;
  isBookmarkStateLoading: boolean;
  isLoading: boolean;
  onPlacePress: (place: DecisionPlace) => void;
  onToggleBookmark: (place: DecisionPlace, nextBookmarked: boolean) => Promise<void>;
  places: DecisionPlace[];
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useReservationStyles();
  const { imageUrlsByPlaceId: inlineImageUrlsByPlaceId } = usePlacePreviewImages(places);
  const explorationImageUrlsByPlaceId = usePlaceExplorationMediaList(
    places.map((place) => place.id),
    { enabled: places.length > 0 },
  );

  if (isLoading && places.length === 0) {
    return (
      <View style={styles.nearbyEmpty} testID="nearby-reservations-loading">
        <ActivityIndicator color={colors.primary} />
        <AppText style={styles.nearbyEmptyText}>{t('reservation.list.nearbyLoading')}</AppText>
      </View>
    );
  }

  if (places.length === 0) {
    return (
      <View style={styles.nearbyEmpty} testID="nearby-reservations-empty">
        <AppText style={styles.nearbyEmptyText}>{t('reservation.list.nearbyEmpty')}</AppText>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.nearbyRail} horizontal showsHorizontalScrollIndicator={false}>
      {places.map((place) => (
        <RecommendationFeaturedCard
          bookmarked={Boolean(bookmarkedPlaceIds[String(place.id)])}
          designSize="reservation"
          imageUrl={explorationImageUrlsByPlaceId[String(place.id)]?.[0]
            ?? inlineImageUrlsByPlaceId[String(place.id)]}
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

export default function ReservationBottomSheet({
  bookmarkedPlaceIds,
  bookmarkPendingPlaceIds,
  collapsedTranslateY,
  height,
  isBookmarkStateLoading,
  isNearbyLoading = false,
  mediumTranslateY,
  nearbyPlaces,
  reservationPlaceByAvailabilityId,
  onHandlePress,
  onOpenCommunity,
  onOpenFavorites,
  onOpenMap,
  onOpenRecommendations,
  onOpenReservation,
  nearbyError, nearbyBusy, onRetryNearby,
  onPlacePress,
  onToggleBookmark,
  panHandlers,
  sheetChromeBottom,
  sheetTranslateY,
  snapPoint,
}: MapReservationSheetProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, liquidGlass: themedGlass } = theme;
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const reservations = useReservations({ limit: 20, page: 1 });
  const items = reservations.data?.reservations ?? [];
  const reservationPlaces = items.flatMap((reservation) => {
    const place = reservationPlaceByAvailabilityId[String(reservation.availabilityId)];
    return place ? [{ place, reservation }] : [];
  });
  const reservationImageUrlsByPlaceId = usePlaceExplorationMediaList(
    reservationPlaces.map(({ place }) => place.id),
    { enabled: snapPoint === 'expanded' && reservationPlaces.length > 0 },
  );
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
        style={{ boxShadow: themedGlass.sheet.shadow, bottom: chromeBottomInset, left: chromeGap, right: chromeGap }}
      >
        <GlassStyles.SheetChrome
          $borderColor={themedGlass.sheet.rim}
          style={{ borderBottomLeftRadius: chromeBottomRadius, borderBottomRightRadius: chromeBottomRadius }}
        >
          <GlassStyles.SheetGlass
            cornerRadius={themedGlass.sheet.topRadius}
            glassEffectStyle="regular"
            highlightHeight={40}
            highlightOpacity={themedGlass.sheet.highlightOpacity}
            rimColor={themedGlass.sheet.rim}
            tintColor={themedGlass.sheet.tint}
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
            <MapAsset color={colors.primary} height={20} width={18} />
            <AppText accessibilityRole="header" style={styles.title}>{t('reservation.list.nearbyTitle')}</AppText>
          </View>
          <AppText style={styles.subtitle}>{t('reservation.list.nearbySubtitle')}</AppText>
          <View style={[styles.listViewport, snapPoint === 'medium' && styles.listViewportMedium]}>
            <ScrollView contentContainerStyle={styles.listContent} nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {nearbyError ? <ApiErrorState error={nearbyError} busy={nearbyBusy} onRetry={onRetryNearby} /> : null}
              {nearbyPlaces.length > 0 || !nearbyError ? <NearbyReservationRail
                bookmarkedPlaceIds={bookmarkedPlaceIds}
                bookmarkPendingPlaceIds={bookmarkPendingPlaceIds}
                isBookmarkStateLoading={isBookmarkStateLoading}
                isLoading={isNearbyLoading}
                onPlacePress={onPlacePress}
                onToggleBookmark={onToggleBookmark}
                places={nearbyPlaces}
              /> : null}
              {snapPoint === 'expanded' ? (
                <>
                  <AppText style={styles.savedTitle}>{t('reservation.list.savedTitle')}</AppText>
                  {reservations.isError && reservations.data ? <ApiErrorState error={reservations.error} busy={reservations.isFetching} onRetry={() => reservations.refetch({ cancelRefetch: false })} /> : null}
                  {reservations.isLoading ? (
                    <View style={styles.state} testID="reservations-loading"><AppText style={styles.stateTitle}>{t('reservation.list.loading')}</AppText></View>
                  ) : reservations.isError && !reservations.data ? (
                    <View style={styles.state} testID="reservations-error">
                      <ApiErrorState error={reservations.error} busy={reservations.isFetching} onRetry={() => reservations.refetch({ cancelRefetch: false })} />
                    </View>
                  ) : items.length === 0 ? (
                    <View style={styles.state} testID="reservations-empty">
                      <MapAsset color={colors.primary} height={32} width={32} />
                      <AppText style={styles.stateTitle}>{t('reservation.list.emptyTitle')}</AppText>
                      <AppText style={styles.stateBody}>{t('reservation.list.emptyDescription')}</AppText>
                    </View>
                  ) : items.map((reservation, index) => {
                    const place = reservationPlaceByAvailabilityId[String(reservation.availabilityId)];
                    if (!place) return <ReservationRecordCard key={reservation.id} reservation={reservation} onPress={() => onOpenReservation(reservation.id)} />;
                    return (
                    <View key={reservation.id} style={index < reservationPlaces.length - 1 ? styles.reservationCardItem : undefined}>
                      <ReservationPlaceCard
                        imageUrls={reservationImageUrlsByPlaceId[String(place.id)] ?? []}
                        onPress={() => onOpenReservation(reservation.id)}
                        place={place}
                        reservationId={reservation.id}
                      />
                    </View>
                  ); })}
                </>
              ) : null}
            </ScrollView>
          </View>
        </Animated.View>
      </GlassStyles.SheetInner>
      <MapSheetBottomNavigation
        activeTab="reservations"
        onOpenCommunity={onOpenCommunity}
        onOpenFavorites={onOpenFavorites}
        onOpenMap={onOpenMap}
        onOpenRecommendations={onOpenRecommendations}
        sheetTranslateY={sheetTranslateY}
      />
    </GlassStyles.BottomSheetContainer>
  );
}

const createStyles = (colors: AppTheme['colors']): Record<string, object> => ({
  content: { flex: 1 },
  handle: { backgroundColor: colors.borderEmphasis, borderRadius: 3, height: 5, width: 56 },
  handleArea: { alignItems: 'center', height: 36, justifyContent: 'center' },
  handleButton: { alignItems: 'center', height: 36, justifyContent: 'center', width: 96 },
  listContent: { paddingBottom: 120, paddingHorizontal: 16, paddingTop: 2 },
  listViewport: { flex: 1, marginBottom: 92, overflow: 'hidden' },
  listViewportMedium: { flex: 0, height: 250, marginBottom: 0 },
  nearbyEmpty: { alignItems: 'center', minHeight: 72, justifyContent: 'center' },
  nearbyEmptyText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  nearbyRail: { gap: 16, paddingBottom: 4, paddingTop: 2 },
  pressed: { opacity: 0.72 },
  reservationCardItem: { marginBottom: 4 },
  retryButton: { backgroundColor: colors.primary, borderRadius: 18, marginTop: 14, paddingHorizontal: 18, paddingVertical: 9 },
  retryLabel: { color: colors.onPrimary, fontSize: 12, fontWeight: '800' },
  savedImage: { borderRightColor: colors.borderEmphasis, borderRightWidth: 1, flex: 1, height: '100%' },
  savedImageFallback: { alignItems: 'center', backgroundColor: colors.surfaceMuted, justifyContent: 'center' },
  savedImageRow: { borderRadius: 12, flexDirection: 'row', height: 114, overflow: 'hidden' },
  savedMoreButton: { alignItems: 'center', height: 28, justifyContent: 'center', width: 18 },
  savedMoreText: { color: colors.text, fontSize: 21, lineHeight: 22 },
  savedNameRow: { alignItems: 'baseline', flexDirection: 'row', gap: 4, minWidth: 0 },
  savedPlaceCard: { borderBottomColor: colors.border, borderBottomWidth: 1, gap: 8, paddingBottom: 6, paddingTop: 6 },
  savedPlaceCategory: { color: colors.textSecondary, flexShrink: 1, fontSize: 12, fontWeight: '500', includeFontPadding: false, lineHeight: 16, minWidth: 0 },
  savedPlaceHeading: { alignItems: 'flex-start', flexDirection: 'row' },
  savedPlaceMeta: { color: colors.textSecondary, flexShrink: 1, fontSize: 13, includeFontPadding: false, lineHeight: 18, marginTop: 2, minWidth: 0 },
  savedPlaceName: { color: colors.text, flexShrink: 1, fontSize: 16, fontWeight: '800', includeFontPadding: false, lineHeight: 21, minWidth: 0 },
  savedPlaceText: { flex: 1, minWidth: 0 },
  savedTitle: { color: colors.textStrong, fontSize: 20, fontWeight: '800', marginBottom: 2, marginTop: 0 },
  state: { alignItems: 'center', paddingTop: 34 },
  stateBody: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  stateMark: { color: colors.primary, fontSize: 20, fontWeight: '900' },
  stateTitle: { color: colors.textStrong, fontSize: 14, fontWeight: '800', marginTop: 6 },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 2, paddingHorizontal: 16 },
  title: { color: colors.textStrong, fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
});
