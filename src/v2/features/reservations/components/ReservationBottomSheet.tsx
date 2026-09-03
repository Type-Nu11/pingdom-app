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

import MapAsset from '../../../../assets/v2/icons/place/maping_svg.svg';
import MyPlaceAsset from '../../../../assets/v2/icons/place/my_place.svg';
import type { BottomSheetSnapPoint } from '../../map/hooks/useBottomSheet';
import MapSheetBottomNavigation from '../../map/components/MapSheetBottomNavigation';
import {
  RecommendationFeaturedCard,
  type DecisionPlace,
} from '../../map/components/MapBottomSheet';
import { usePlacePreviewImages } from '../../map/hooks/usePlacePreviewImages';
import { normalizePlaceCategory } from '../../map/utils/placeCategory';
import { usePlaceExplorationMediaList } from '../../place-exploration';
import * as GlassStyles from '../../map/styles/BottomSheetGlass.styles';
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
  isNearbyLoading?: boolean;
  mediumTranslateY: number;
  nearbyPlaces: DecisionPlace[];
  reservationPlaceByAvailabilityId: Record<string, DecisionPlace>;
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
            <Text accessibilityLabel={place.name} ellipsizeMode="tail" numberOfLines={1} style={styles.savedPlaceName}>{place.name}</Text>
            <Text ellipsizeMode="tail" numberOfLines={1} style={styles.savedPlaceCategory}>
              {t(`map.categories.${category}`, { defaultValue: place.category })}
            </Text>
          </View>
          <Text accessibilityLabel={`${formatDistance(place, i18n.language)} · ${place.address}`} ellipsizeMode="tail" numberOfLines={1} style={styles.savedPlaceMeta}>
            {formatDistance(place, i18n.language)} · {place.address}
          </Text>
        </View>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.savedMoreButton}>
          <Text style={styles.savedMoreText}>⋮</Text>
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
  const { imageUrlsByPlaceId: inlineImageUrlsByPlaceId } = usePlacePreviewImages(places);
  const explorationImageUrlsByPlaceId = usePlaceExplorationMediaList(
    places.map((place) => place.id),
    { enabled: places.length > 0 },
  );

  if (isLoading && places.length === 0) {
    return (
      <View style={styles.nearbyEmpty} testID="nearby-reservations-loading">
        <ActivityIndicator color="#FF1956" />
        <Text style={styles.nearbyEmptyText}>{t('reservation.list.nearbyLoading')}</Text>
      </View>
    );
  }

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
                isLoading={isNearbyLoading}
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
                  ) : reservationPlaces.length === 0 ? (
                    <View style={styles.state} testID="reservations-empty">
                      <Text style={styles.stateMark}>R</Text>
                      <Text style={styles.stateTitle}>{t('reservation.list.emptyTitle')}</Text>
                      <Text style={styles.stateBody}>{t('reservation.list.emptyDescription')}</Text>
                    </View>
                  ) : reservationPlaces.map(({ place, reservation }, index) => (
                    <View key={reservation.id} style={index < reservationPlaces.length - 1 ? styles.reservationCardItem : undefined}>
                      <ReservationPlaceCard
                        imageUrls={reservationImageUrlsByPlaceId[String(place.id)] ?? []}
                        onPress={() => onOpenReservation(reservation.id)}
                        place={place}
                        reservationId={reservation.id}
                      />
                    </View>
                  ))}
                </>
              ) : null}
            </ScrollView>
          </View>
        </Animated.View>
      </GlassStyles.SheetInner>
      <MapSheetBottomNavigation
        activeTab="reservations"
        onOpenFavorites={onOpenFavorites}
        onOpenMap={onOpenMap}
        onOpenRecommendations={onOpenRecommendations}
        sheetTranslateY={sheetTranslateY}
      />
    </GlassStyles.BottomSheetContainer>
  );
}

const styles: Record<string, object> = {
  content: { flex: 1 },
  handle: { backgroundColor: 'rgba(80,83,91,0.34)', borderRadius: 3, height: 5, width: 56 },
  handleArea: { alignItems: 'center', height: 36, justifyContent: 'center' },
  handleButton: { alignItems: 'center', height: 36, justifyContent: 'center', width: 96 },
  listContent: { paddingBottom: 120, paddingHorizontal: 16, paddingTop: 2 },
  listViewport: { flex: 1, marginBottom: 92, overflow: 'hidden' },
  listViewportMedium: { flex: 0, height: 250, marginBottom: 0 },
  nearbyEmpty: { alignItems: 'center', minHeight: 72, justifyContent: 'center' },
  nearbyEmptyText: { color: '#777982', fontSize: 12, fontWeight: '600' },
  nearbyRail: { gap: 16, paddingBottom: 4, paddingTop: 2 },
  pressed: { opacity: 0.72 },
  reservationCardItem: { marginBottom: 4 },
  retryButton: { backgroundColor: '#FF1956', borderRadius: 18, marginTop: 14, paddingHorizontal: 18, paddingVertical: 9 },
  retryLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  savedImage: { borderRightColor: 'rgba(255,255,255,0.9)', borderRightWidth: 1, flex: 1, height: '100%' },
  savedImageFallback: { alignItems: 'center', backgroundColor: '#E7E7EA', justifyContent: 'center' },
  savedImageRow: { borderRadius: 12, flexDirection: 'row', height: 114, overflow: 'hidden' },
  savedMoreButton: { alignItems: 'center', height: 28, justifyContent: 'center', width: 18 },
  savedMoreText: { color: '#3B3B40', fontSize: 21, lineHeight: 22 },
  savedNameRow: { alignItems: 'baseline', flexDirection: 'row', gap: 4, minWidth: 0 },
  savedPlaceCard: { borderBottomColor: '#E4E4E5', borderBottomWidth: 1, gap: 8, paddingBottom: 6, paddingTop: 6 },
  savedPlaceCategory: { color: '#5E5E66', flexShrink: 1, fontSize: 12, fontWeight: '500', includeFontPadding: false, lineHeight: 16, minWidth: 0 },
  savedPlaceHeading: { alignItems: 'flex-start', flexDirection: 'row' },
  savedPlaceMeta: { color: '#5E5E66', flexShrink: 1, fontSize: 13, includeFontPadding: false, lineHeight: 18, marginTop: 2, minWidth: 0 },
  savedPlaceName: { color: '#3B3B40', flexShrink: 1, fontSize: 16, fontWeight: '800', includeFontPadding: false, lineHeight: 21, minWidth: 0 },
  savedPlaceText: { flex: 1, minWidth: 0 },
  savedTitle: { color: '#000000', fontSize: 20, fontWeight: '800', marginBottom: 2, marginTop: 0 },
  state: { alignItems: 'center', paddingTop: 34 },
  stateBody: { color: '#777982', fontSize: 11, marginTop: 4 },
  stateMark: { color: '#FF1956', fontSize: 20, fontWeight: '900' },
  stateTitle: { color: '#27292F', fontSize: 14, fontWeight: '800', marginTop: 6 },
  subtitle: { color: '#5E5E66', fontSize: 14, marginTop: 2, paddingHorizontal: 16 },
  title: { color: '#000000', fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
};
