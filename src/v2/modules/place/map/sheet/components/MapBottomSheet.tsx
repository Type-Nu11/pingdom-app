import { TranslationAttributionGroup, TranslationAttributionNotice } from '../../../../../shared/translation/TranslationAttributionGroup';
import { SheetMotionView, clampSheetValue, useSheetMotionStyle } from '../hooks/useSheetMotionStyle';
import { useSheetScrollHandoff } from '../hooks/useSheetScrollHandoff';
import { useContentDeletion } from '../../../../../shared/components/useContentDeletion';
import { useDeletePlaceReview } from '../../../visit-verification';
import { ReviewReasonIcon } from '../../../../../shared/components/ReviewReasonIcon';
import OwnerContentActions from '../../../../../shared/components/OwnerContentActions';
import TranslationAttribution, { useTranslationAttribution } from '../../../translation/TranslationAttribution';
import { liquidGlass } from '../../../../../shared/theme/liquidGlass';
import PlaceNameTranslation from '../../../translation/PlaceNameTranslation';
import TranslatedPlaceName from '../../../../../shared/translation/TranslatedPlaceName';
import { useContentTranslation } from '../../../../../shared/translation/useContentTranslation';
import ContentTranslationActions from '../../../../../shared/translation/ContentTranslationActions';
import Skeleton, { SkeletonGroup, SkeletonBlock } from '../../../../../shared/components/Skeleton';
import DetailBackAsset from '../../../../../../assets/v2/icons/place/detail-back.svg';
import DetailBookmarkAsset from '../../../../../../assets/v2/icons/place/detail-bookmark.svg';
import DetailShareAsset from '../../../../../../assets/v2/icons/place/detail-share.svg';
import DetailReservationAsset from '../../../../../../assets/v2/icons/place/detail-reservation.svg';
import DetailDirectionsAsset from '../../../../../../assets/v2/icons/place/detail-directions.svg';
import DetailPinAsset from '../../../../../../assets/v2/icons/place/detail-pin.svg';
import DetailClockAsset from '../../../../../../assets/v2/icons/place/detail-clock.svg';
import DetailCallAsset from '../../../../../../assets/v2/icons/place/detail-call.svg';
import DetailGlobeBaseAsset from '../../../../../../assets/v2/icons/place/detail-globe-base.svg';
import DetailGlobeLinesAsset from '../../../../../../assets/v2/icons/place/detail-globe-lines.svg';
import DetailParkingAsset from '../../../../../../assets/v2/icons/place/detail-parking.svg';
import DetailTicketAsset from '../../../../../../assets/v2/icons/place/detail-ticket.svg';
import DetailDownloadAsset from '../../../../../../assets/v2/icons/place/detail-download.svg';
import DetailReviewPhotoAsset from '../../../../../../assets/v2/icons/place/detail-review-photo.svg';
import DetailReviewCleanAsset from '../../../../../../assets/v2/icons/place/detail-review-clean.svg';
import DetailReviewMultilingualBaseAsset from '../../../../../../assets/v2/icons/place/detail-review-multilingual-base.svg';
import DetailReviewMultilingualLinesAsset from '../../../../../../assets/v2/icons/place/detail-review-multilingual-lines.svg';
import DetailReviewKindAsset from '../../../../../../assets/v2/icons/place/detail-review-kind.svg';
import DetailReviewDeliciousAsset from '../../../../../../assets/v2/icons/place/detail-review-delicious.svg';
import { REASON_CODES, reviewReasonLabelKey, type ReviewReasonKey } from '../../../../../shared/api/reviewReasons';
import { ApiErrorState, LoadingState, ReviewFeatureTags, UnavailableStateIcon } from '../../../../../shared/components';
import { Text as AppText } from '../../../../../shared/components/Typography';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, FlatList, GestureResponderHandlers, Image, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GroupAsset from '../../../../../../assets/v2/icons/place/Group.svg';
import ParkAsset from '../../../../../../assets/v2/icons/place/Park.svg';
import CloseMediumAsset from '../../../../../../assets/v2/icons/community/close-medium.svg';
import type { BottomSheetSnapPoint } from '../hooks/useBottomSheet';
import { usePlacePreviewImages } from '../../../detail';
import * as GlassStyles from '../styles/BottomSheetGlass.styles';
import MapSheetSurface from './MapSheetSurface';
import { lightColors } from '../../../../../shared/theme/colors';
import { useTheme } from 'styled-components/native';
import type { MapHomeCategory } from '../../../search/model/mapHomeCategory';
import { normalizePlaceCategory } from '../../../core/placeCategory';
import { hasValidCoordinates } from '../../actions/services/placeActions';
import { getExternalPlaceKey, type ExternalMapPlace } from '../../selection/model/externalPlace';
import { PlacePhotoViewer } from '../../../detail';
import { PlaceMenuSection } from '../../../menus';
import MapSheetBottomNavigation, { getMapSheetNavigationBottom } from './MapSheetBottomNavigation';
import type { RankedPlaceFeed, RankedPlaceViewModel } from '../../../home-feeds';
import { BookmarkStar, formatDistance } from './MapFeedPlaceCards';
import { EmptyCard, ExpandedHomeContent, RecommendationContent } from './MapHomeFeeds';
import type { BottomSheetContent, DecisionPlace, MapPreviewFallbackContent, VisitFilter } from './mapSheetTypes';
import { HOME_SHEET_HANDLE_HEIGHT, useMapSheetStyles } from '../styles/MapBottomSheet.styles';

export { ExpandedPlaceCard, getMapGridCardSize, RecommendationFeaturedCard } from './MapFeedPlaceCards';
export type { BottomSheetContent, DecisionPlace, MapPreviewFallbackContent, VisitFilter } from './mapSheetTypes';

export function selectPlaceDetailAddress(
  placeAddress: string,
  fallbackContent?: Pick<MapPreviewFallbackContent, 'jibunAddress' | 'roadAddress'>,
): string {
  const candidates = [
    fallbackContent?.roadAddress,
    placeAddress,
    fallbackContent?.jibunAddress,
  ];

  return candidates.find((candidate) => candidate?.trim())?.trim() ?? '';
}

type MapBottomSheetProps = {
  activeFilters: VisitFilter[];
  bookmarkedPlaceIds: Record<string, boolean>;
  bookmarkPendingPlaceIds?: Record<string, boolean>;
  isBookmarkStateLoading?: boolean;
  collapsedTranslateY: number;
  /** Snap offset of the raised sheet; the chrome reaches full width there (Figma *-Up frames). */
  expandedTranslateY?: number;
  content: BottomSheetContent;
  couponContent?: React.ReactNode;
  height: number;
  mediumTranslateY: number;
  onBackHome: () => void;
  onCreateReservation?: (place: DecisionPlace, imageUrl?: string) => void;
  onOpenRecommendations?: () => void;
  onDetailPress: (place: DecisionPlace) => void;
  onDeparturePress?: (place: DecisionPlace) => void;
  onDirectionsPress?: (place: DecisionPlace) => void;
  onExternalDeparturePress?: (place: ExternalMapPlace) => void;
  onExternalDirectionsPress?: (place: ExternalMapPlace) => void;
  onExternalPlaceLayout?: (height: number) => void;
  onFilterPress: (filter: VisitFilter) => void;
  onGoNowPress: (place: DecisionPlace) => void;
  onHandlePress: () => void;
  onOpenCommunity?: () => void;
  onOpenLikedPlaces?: () => void;
  onOpenSavedPlaces?: () => void;
  onStartVisitVerification?: (place: DecisionPlace) => void;
  onPlacePress: (place: DecisionPlace) => void;
  onProfilePress?: () => void;
  onQueryChange: (query: string) => void;
  onSearchFocus: () => void;
  onSharePlace?: (place: DecisionPlace) => void;
  onSubmitSearch: () => void;
  onToggleBookmark: (place: DecisionPlace, nextBookmarked: boolean) => Promise<void>;
  onRankedPlacePress?: (place: RankedPlaceViewModel) => void;
  onToggleRankedBookmark?: (
    place: RankedPlaceViewModel,
    nextBookmarked: boolean,
  ) => Promise<void>;
  panHandlers: GestureResponderHandlers;
  placeActionBusy?: 'directions' | 'share' | null;
  places: DecisionPlace[];
  localFeed?: RankedPlaceFeed;
  nationalFeed?: RankedPlaceFeed;
  previewFallbackContentByPlaceId?: Record<string, MapPreviewFallbackContent>;
  explorationImageUrlsByPlaceId?: Record<string, string>;
  recommendationContext?: string | null;
  recommendationLimitMessage?: string | null;
  recommendationPlaces: DecisionPlace[];
  recommendationsState: 'empty' | 'error' | 'loading' | 'ready';
  onRetryRecommendations: () => void;
  onRetryAvailability?: () => void;
  onRetryMedia?: () => void;
  onRetryReviews?: () => void;
  detailError?: unknown;
  detailBusy?: boolean;
  onRetryDetail?: () => unknown;
  resultsError?: unknown;
  resultsLoading?: boolean;
  resultsBusy?: boolean;
  onRetryResults?: () => unknown;
  selectedPlace: DecisionPlace | null;
  sheetChromeBottom: Animated.Value;
  parentOwnsMotion?: boolean;
  sheetTranslateY: Animated.Value;
  snapPoint: BottomSheetSnapPoint;
  userName?: string;
};
const HOME_SHEET_VISIBLE_HEIGHT = 386;
const RESERVATION_NAVIGATION_LOCK_MS = 500;

// Figma's resting chrome is 378 dp high, followed by an 8 dp screen-edge gap.
// Keep those content dimensions on narrow phones; only constrain short viewports.
export const getMapHomeSheetVisibleHeight = (viewportHeight: number, expandedSheetTop: number) => (
  Math.min(HOME_SHEET_VISIBLE_HEIGHT, Math.max(0, viewportHeight - expandedSheetTop - 24))
);

const formatPreviewLocation = (place: DecisionPlace, language: string) => {
  const distance = formatDistance(place, language).trim();
  const address = place.address.trim();

  return [distance, address].filter(Boolean).join(' · ');
};

const PreviewArtwork = ({ imageUrl, onLoadError }: { imageUrl?: string; onLoadError?: () => void }) => {
  const { t } = useTranslation();
  const styles = useMapSheetStyles();
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  if (!imageUrl || hasImageError) {
    const fallbackMessage = t(hasImageError ? 'map.sheet.imageError' : 'map.sheet.imageMissing');

    return (
      <View accessibilityLabel={fallbackMessage} style={styles.previewArtworkFallback}>
        <UnavailableStateIcon size={88} />
        <AppText style={styles.previewArtworkFallbackText}>{fallbackMessage}</AppText>
      </View>
    );
  }

  return (
    <Image
      accessibilityLabel={t('map.sheet.image')}
      onError={() => { if (onLoadError) onLoadError(); else setHasImageError(true); }}
      resizeMethod="resize"
      resizeMode="cover"
      fadeDuration={0}
      source={{ uri: imageUrl }}
      style={styles.previewArtwork}
    />
  );
};

// Failed gallery entries disappear instead of becoming another photo-shaped error card.
function useVisiblePlacePhotos(placeId: number | string, sources: readonly (string | undefined)[]) {
  const urls = [...new Set(sources.filter((url): url is string => Boolean(url?.trim())))];
  const key = JSON.stringify([placeId, urls]);
  const currentKey = useRef(key);
  currentKey.current = key;
  const [failed, setFailed] = useState<{ key: string; urls: string[] }>({ key, urls: [] });
  const failedUrls = failed.key === key ? failed.urls : [];
  return {
    urls: urls.filter(url => !failedUrls.includes(url)),
    remove: (url: string) => {
      if (currentKey.current !== key) return;
      setFailed(previous => ({ key, urls: [...new Set([...(previous.key === key ? previous.urls : []), url])] }));
    },
  };
}

const ResultRow = ({
  onPress,
  place,
}: {
  onPress: () => void;
  place: DecisionPlace;
}) => {
  const { i18n } = useTranslation();
  const styles = useMapSheetStyles();
  return (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.resultRow, pressed && styles.pressed]}>
    <View style={styles.resultThumbnail}><UnavailableStateIcon size={40} /></View>
    <View style={styles.resultTextBody}>
      <TranslatedPlaceName name={place.name}>{(name, actions) => <AppText {...actions} numberOfLines={1} style={styles.resultName}>{name}</AppText>}</TranslatedPlaceName>
      <AppText numberOfLines={1} style={styles.resultAddress}>{place.address}</AppText>
    </View>
    <AppText style={styles.resultDistance}>{formatDistance(place, i18n.language)}</AppText>
  </Pressable>
  );
};

const TopReviewFeatures = ({ content }: { content: MapPreviewFallbackContent }) => {
  const { t } = useTranslation();
  const styles = useMapSheetStyles();
  return <View testID="place-top-review-features">
    <ReviewFeatureTags reasons={content.topReviewReasons?.slice(0, 2) ?? []} variant="full" appearance="placeDetail" testID="place-top-review-tags" />
    {!content.reviewHighlightsComplete && (content.reviewSampleSize ?? 0) > 0
      ? <AppText style={styles.detailReviewCount}>{t('placeReviewSummary.partialBasis', { count: content.reviewSampleSize })}</AppText> : null}
  </View>;
};

const PreviewAmenity = ({ type, expanded = false }: { type: 'english' | 'parking'; expanded?: boolean }) => {
  const { t } = useTranslation();
  const styles = useMapSheetStyles();
  return (
  <View testID={`place-preview-amenity-${type}`} style={expanded ? styles.detailAmenity : styles.previewAmenityChip}>
    {expanded ? <View style={styles.detailAmenityIcon} testID={`map-detail-amenity-${type}`}>
      {type === 'english' ? <View style={styles.detailGlobeLayers}><DetailGlobeBaseAsset /><DetailGlobeLinesAsset style={styles.detailGlobeLines} /></View> : <DetailParkingAsset />}
    </View> : type === 'english'
      ? <GroupAsset height={16} width={16} />
      : <ParkAsset height={16} width={16} />}
    <AppText style={expanded ? styles.detailAmenityText : styles.previewAmenityText}>{t(type === 'english' ? 'map.detail.amenityEnglish' : 'map.detail.amenityParking')}</AppText>
  </View>
  );
};

const ReviewHighlightIcon = ({ label, reason: explicitReason }: { label: string; reason?: ReviewReasonKey }) => {
  const { t } = useTranslation();
  const reason = explicitReason ?? (Object.keys(REASON_CODES) as ReviewReasonKey[]).find(key => t(reviewReasonLabelKey(key)) === label);
  if (reason === 'photoSpot') return <DetailReviewPhotoAsset />;
  if (reason === 'clean') return <DetailReviewCleanAsset />;
  if (reason === 'multilingual') return <View style={{ width: 18, height: 18 }}><DetailReviewMultilingualBaseAsset /><DetailReviewMultilingualLinesAsset style={{ position: 'absolute', left: 0.35, top: 0 }} /></View>;
  if (reason === 'kind') return <DetailReviewKindAsset />;
  if (reason === 'delicious') return <DetailReviewDeliciousAsset />;
  if (reason) return <ReviewReasonIcon reason={reason} height={18} />;
  return null;
};

const ReviewerAvatar = ({ name, url }: { name: string; url?: string }) => {
  const [hasError, setHasError] = useState(false);
  const styles = useMapSheetStyles();

  if (!url || hasError) {
    return (
      <View style={styles.detailReviewerAvatar}>
        <AppText style={styles.detailReviewerInitial}>{name.slice(0, 1)}</AppText>
      </View>
    );
  }

  return (
    <Image
      onError={() => setHasError(true)}
      resizeMethod="resize"
      resizeMode="cover"
      fadeDuration={0}
      source={{ uri: url }}
      style={styles.detailReviewerAvatarImage}
    />
  );
};

type PreviewActionKind = 'arrival' | 'departure' | 'directions' | 'reservation' | 'share';

const PreviewActionIcon = ({ kind, expanded = false }: { kind: PreviewActionKind; expanded?: boolean }) => {
  const color = (useTheme().colors ?? lightColors).textAlternative;
  if (expanded) {
    if (kind === 'share') return <DetailShareAsset />;
    if (kind === 'reservation') return <DetailReservationAsset />;
    if (kind === 'directions') return <DetailDirectionsAsset />;
    return null;
  }
  if (kind === 'share') {
    return (
      <Svg height={12} viewBox="0 0 16 16" width={12}>
        <Path d="M6 3H3.8A1.8 1.8 0 0 0 2 4.8v7.4A1.8 1.8 0 0 0 3.8 14h7.4a1.8 1.8 0 0 0 1.8-1.8V10M8 2h6v6M14 2 7.5 8.5" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} />
      </Svg>
    );
  }
  if (kind === 'reservation') {
    return (
      <Svg height={12} viewBox="0 0 16 16" width={12}>
        <Path d="M3 4.2A1.7 1.7 0 0 1 4.7 2.5h6.6A1.7 1.7 0 0 1 13 4.2v7.1a1.7 1.7 0 0 1-1.7 1.7H4.7A1.7 1.7 0 0 1 3 11.3V4.2Z" fill="none" stroke={color} strokeWidth={1.4} />
        <Path d="m6 8 1.3 1.3L10.4 6" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} />
      </Svg>
    );
  }
  if (kind === 'directions') {
    return (
      <Svg height={12} viewBox="0 0 16 16" width={12}>
        <Path d="m2.2 2.7 11.6 4.7-5 1.2-1.4 4.7-5.2-10.6Z" fill="none" stroke={color} strokeLinejoin="round" strokeWidth={1.4} />
      </Svg>
    );
  }
  return null;
};

const PreviewActionChip = ({ accessibilityHint, active = false, busy = false, disabled = false, expanded = false, kind, label, onPress }: { expanded?: boolean; accessibilityHint?: string; active?: boolean; busy?: boolean; disabled?: boolean; kind: PreviewActionKind; label: string; onPress?: () => void }) => {
  const styles = useMapSheetStyles();
  return <Pressable
    hitSlop={expanded ? undefined : { top: 5, bottom: 5 }}
    accessibilityHint={accessibilityHint}
    accessibilityLabel={label}
    accessibilityRole={onPress && !disabled ? 'button' : undefined}
    accessibilityState={{ busy, disabled, selected: active }}
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      expanded ? styles.detailActionChip : styles.previewActionChip,
      active && styles.previewActionChipActive,
      pressed && styles.pressed,
      disabled && { opacity: 0.45 },
    ]}
  >
    <PreviewActionIcon kind={kind} expanded={expanded} />
    <AppText style={[expanded ? styles.detailActionText : styles.previewActionText, active && styles.previewActionTextActive]}>{label}</AppText>
  </Pressable>;
};

const formatPreviewCategory = (category: string) => {
  const normalized = normalizePlaceCategory(category);
  return normalized === 'game' ? 'popup' : normalized;
};

// Figma draws the preview icon buttons at 32px; the slop keeps a 44px touch target.
const PREVIEW_ICON_BUTTON_HIT_SLOP = 6;

const PreviewContent = ({
  activeAction,
  bookmarked,
  fallbackContent,
  imageUrl,
  onBack,
  onDetail,
  onDeparture,
  onDirections,
  onOpenImages,
  onReserve,
  onShare,
  onRetryAvailability,
  onRetryMedia,
  onSelectAction,
  onToggleBookmark,
  pending,
  placeActionBusy,
  place,
  sheetPanHandlers,
}: {
  activeAction: PreviewActionKind | null;
  bookmarked: boolean;
  fallbackContent?: MapPreviewFallbackContent;
  imageUrl?: string;
  onBack: () => void;
  onDetail: () => void;
  onDeparture?: () => void;
  onDirections?: () => void;
  onOpenImages?: (imageUrls: string[], initialIndex: number) => void;
  onReserve: () => void;
  onShare?: () => void;
  onRetryAvailability?: () => void;
  onRetryMedia?: () => void;
  onSelectAction: (action: PreviewActionKind) => void;
  onToggleBookmark: () => void;
  pending: boolean;
  placeActionBusy?: 'directions' | 'share' | null;
  place: DecisionPlace;
  sheetPanHandlers: GestureResponderHandlers;
}) => {
  const { i18n, t } = useTranslation();
  const styles = useMapSheetStyles();
  const translationAttribution = useTranslationAttribution(place.name);
  const sheetColors = useTheme().colors ?? lightColors;
  const { width: windowWidth } = useWindowDimensions();
  const photos = useVisiblePlacePhotos(place.id, fallbackContent?.imageUrls.length
    ? fallbackContent.imageUrls
    : [imageUrl]);
  const validImageUrls = photos.urls;
  const contentWidth = Math.min(windowWidth, 480) - 32;
  const primaryImageWidth = Math.min(242, contentWidth);
  const imageHeight = primaryImageWidth * 182 / 242;

  const reservation = fallbackContent?.reservation ?? {
    kind: 'loading', disabled: true,
  };
  const reservationPress = reservation.kind === 'error' ? onRetryAvailability : onReserve;
  const selectAction = (action: PreviewActionKind, callback?: () => void) => {
    onSelectAction(action);
    callback?.();
  };
  const verificationSummary = typeof fallbackContent?.reviewParticipantCount === 'number'
    ? [t('map.detail.verifiedCount', { count: fallbackContent.reviewParticipantCount }),
      !fallbackContent.reviewHighlightsComplete && (fallbackContent.reviewSampleSize ?? 0) > 0
        ? t('placeReviewSummary.partialBasis', { count: fallbackContent.reviewSampleSize }) : null,
    ].filter(Boolean).join(' · ')
    : fallbackContent?.statusDescription;

  return (
    <View style={[styles.previewContent, styles.placePreviewContent]} testID="place-preview-content">
      <View {...sheetPanHandlers} style={styles.previewHeader} testID="place-preview-drag-header">
        <View style={styles.previewSummary}>
          <PlaceNameTranslation
            attributionPlacement="photos"
            onTranslationChange={translationAttribution.onTranslationChange}
            original={place.name}
            maxNameLength={10}
            inlineCategory
            nameStyle={styles.previewName}
            onNamePress={onDetail}
            category={<AppText ellipsizeMode="tail" numberOfLines={1} style={styles.previewCategory}>{t(`map.categories.${formatPreviewCategory(place.category)}`)}</AppText>}
          />
          <Pressable accessibilityLabel={t('map.detail.preview', { name: place.name })} accessibilityRole="button" onPress={onDetail}>
            {fallbackContent && (verificationSummary || fallbackContent.statusEmphasis) ? (
              <View style={styles.previewStatusRow}>
                {verificationSummary ? (
                  <AppText numberOfLines={1} style={styles.previewStatus}>
                    {verificationSummary}
                  </AppText>
                ) : null}
                {fallbackContent.statusEmphasis ? (
                <AppText style={styles.previewStatusTail}>
                  {verificationSummary ? <AppText style={styles.previewStatusSeparator}>{' · '}</AppText> : null}
                  <AppText style={[
                    styles.previewStatusEmphasis,
                    fallbackContent.operatingSummary?.tone === 'positive'
                      ? styles.detailOperatingPositive
                      : fallbackContent.operatingSummary?.tone === 'negative'
                        ? styles.detailOperatingNegative
                        : fallbackContent.operatingSummary?.tone === 'warning'
                          ? styles.detailOperatingWarning
                          : styles.detailOperatingNeutral,
                  ]}>
                    {fallbackContent.statusEmphasis}
                  </AppText>
                </AppText>
                ) : null}
              </View>
            ) : null}
            <AppText accessibilityLabel={formatPreviewLocation(place, i18n.language)} ellipsizeMode="tail" numberOfLines={1} style={styles.previewAddress}>
              {formatPreviewLocation(place, i18n.language)}
            </AppText>
          </Pressable>
        </View>
        <Pressable
          accessibilityLabel={t(bookmarked ? 'map.sheet.bookmarkRemove' : 'map.sheet.bookmark')}
          accessibilityRole="button"
          accessibilityState={{ busy: pending, disabled: pending, selected: bookmarked }}
          disabled={pending}
          hitSlop={PREVIEW_ICON_BUTTON_HIT_SLOP}
          onPress={onToggleBookmark}
          style={({ pressed }) => [styles.previewBookmarkButton, pressed && styles.pressed]}
          testID="place-preview-bookmark"
        >
          <BookmarkStar selected={bookmarked} size={16} />
        </Pressable>
        <Pressable
          accessibilityLabel={t('map.card.dismiss')}
          accessibilityRole="button"
          hitSlop={PREVIEW_ICON_BUTTON_HIT_SLOP}
          onPress={onBack}
          style={({ pressed }) => [styles.previewCloseButton, pressed && styles.pressed]}
          testID="place-preview-close"
        >
          <CloseMediumAsset color={sheetColors.textAlternative} height={19} width={19} />
        </Pressable>
      </View>
      <View style={styles.previewControls}>
      {fallbackContent?.topReviewReasons?.length ? (
        <TopReviewFeatures content={fallbackContent} />
      ) : fallbackContent?.amenities.length ? (
        <View style={styles.previewAmenityRow}>
          {fallbackContent.amenities.map((amenity) => <PreviewAmenity key={amenity} type={amenity} />)}
        </View>
      ) : null}
      <ScrollView
        contentContainerStyle={[styles.previewActionRow, styles.previewControlsActionRow]}
        style={styles.previewActionViewport}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <PreviewActionChip
          active={activeAction === 'departure'}
          disabled={!onDeparture || placeActionBusy != null}
          kind="departure"
          label={t('map.card.actions.start')}
          onPress={() => selectAction('departure', onDeparture)}
        />
        <PreviewActionChip
          active={activeAction === 'arrival'}
          disabled={!onDirections || placeActionBusy != null}
          kind="arrival"
          label={t('map.card.actions.arrive')}
          onPress={() => selectAction('arrival', onDirections)}
        />
        <PreviewActionChip
          busy={placeActionBusy === 'share'}
          disabled={!onShare || placeActionBusy != null}
          kind="share"
          label={t('map.card.actions.share')}
          onPress={onShare}
        />
        <PreviewActionChip
          active={activeAction === 'reservation'}
          disabled={reservation.disabled && reservation.kind !== 'error'}
          kind="reservation"
          label={t(reservation.kind === 'error' ? 'map.detail.reservation.retry' : 'map.card.actions.reserve')}
          onPress={() => selectAction('reservation', reservationPress)}
        />
        <PreviewActionChip
          busy={placeActionBusy === 'directions'}
          disabled={!onDirections || placeActionBusy != null}
          kind="directions"
          label={t('map.card.actions.directions')}
          onPress={onDirections}
        />
      </ScrollView>
      {fallbackContent?.imageState === 'error' ? (
        <Pressable accessibilityRole="button" onPress={onRetryMedia}>
          <AppText style={styles.detailEmptyText}>{t('map.detail.imageError')}</AppText>
        </Pressable>
      ) : null}
      </View>
      <View style={{ gap: 8 }} testID="place-preview-photos-section">
      <ScrollView
        contentContainerStyle={styles.previewImageRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {fallbackContent?.imageState === 'loading' && validImageUrls.length === 0 ? (
          <SkeletonGroup accessibilityLabel={t('placeDetail.loading')}>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <SkeletonBlock width={primaryImageWidth} height={imageHeight} radius={16} />
              <SkeletonBlock width={primaryImageWidth} height={imageHeight} radius={16} />
            </View>
          </SkeletonGroup>
        ) : validImageUrls.map((url, index) => (
          <Pressable
            accessibilityLabel={t('map.detail.imageDetail', { count: index + 1, name: place.name })}
            accessibilityRole="button"
            key={`${url ?? 'missing'}-${index}`}
            onPress={() => {
              if (url && onOpenImages) {
                onOpenImages(validImageUrls, validImageUrls.indexOf(url));
                return;
              }
              onDetail();
            }}
            style={[
              styles.previewImagePanel,
              { height: imageHeight, width: primaryImageWidth },
            ]}
          >
            <PreviewArtwork imageUrl={url} onLoadError={() => photos.remove(url)} />
          </Pressable>
        ))}
      </ScrollView>
      <TranslationAttribution visible={translationAttribution.visible} testID="place-preview-translation-attribution" />
      </View>
    </View>
  );
};

// An external search result has no PingDom record, so it offers location actions only:
// no reservation, bookmark, share, or detail entry.
const ExternalPlaceContent = ({
  activeAction,
  onBack,
  onDeparture,
  onDirections,
  onLayout,
  onSelectAction,
  place,
}: {
  activeAction: PreviewActionKind | null;
  onBack: () => void;
  onDeparture?: () => void;
  onDirections?: () => void;
  onLayout?: (height: number) => void;
  onSelectAction: (action: PreviewActionKind) => void;
  place: ExternalMapPlace;
}) => {
  const { t } = useTranslation();
  const styles = useMapSheetStyles();
  const sheetColors = useTheme().colors ?? lightColors;
  const selectAction = (action: PreviewActionKind, callback?: () => void) => {
    onSelectAction(action);
    callback?.();
  };

  return (
    <View
      onLayout={onLayout ? (event) => onLayout(event.nativeEvent.layout.height) : undefined}
      style={styles.previewContent}
      testID="external-place-card"
    >
      <View style={styles.externalHeader}>
        <View style={styles.previewSummary}>
          <PlaceNameTranslation original={place.name} maxNameLength={10} nameStyle={styles.previewName} />
          <View style={styles.externalBadge}>
            <AppText numberOfLines={1} style={styles.externalBadgeText}>{t('map.externalPlace.badge')}</AppText>
          </View>
          {place.address ? (
            <AppText accessibilityLabel={place.address} ellipsizeMode="tail" numberOfLines={1} style={styles.previewAddress}>
              {place.address}
            </AppText>
          ) : null}
          <AppText numberOfLines={1} style={styles.externalSource}>{t('map.externalPlace.sourceKakao')}</AppText>
        </View>
        <Pressable
          accessibilityLabel={t('map.card.dismiss')}
          accessibilityRole="button"
          hitSlop={PREVIEW_ICON_BUTTON_HIT_SLOP}
          onPress={onBack}
          style={({ pressed }) => [styles.previewCloseButton, pressed && styles.pressed]}
          testID="external-place-close"
        >
          <CloseMediumAsset color={sheetColors.textAlternative} height={19} width={19} />
        </Pressable>
      </View>
      <View style={styles.externalNotice}>
        <AppText style={styles.externalNoticeText}>{t('map.externalPlace.reservationUnknown')}</AppText>
        {!place.coordinate ? (
          <AppText accessibilityRole="alert" style={styles.externalNoticeText} testID="external-place-location-unavailable">
            {t('map.externalPlace.locationUnavailable')}
          </AppText>
        ) : null}
      </View>
      <ScrollView
        contentContainerStyle={styles.previewActionRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <PreviewActionChip
          active={activeAction === 'departure'}
          disabled={!onDeparture}
          kind="departure"
          label={t('map.card.actions.start')}
          onPress={() => selectAction('departure', onDeparture)}
        />
        <PreviewActionChip
          active={activeAction === 'arrival'}
          disabled={!onDirections}
          kind="arrival"
          label={t('map.card.actions.arrive')}
          onPress={() => selectAction('arrival', onDirections)}
        />
        <PreviewActionChip
          disabled={!onDirections}
          kind="directions"
          label={t('map.card.actions.directions')}
          onPress={onDirections}
        />
      </ScrollView>
    </View>
  );
};

type DetailReview = NonNullable<MapPreviewFallbackContent['reviews']>[number];

const DetailReviewItem = ({ onOpenImages, placeName, review, variant }: {
  onOpenImages?: (urls: string[], index: number) => void;
  placeName: string;
  review: DetailReview;
  variant: 'full' | 'summary';
}) => {
  const { t } = useTranslation();
  const styles = useMapSheetStyles();
  const translation = useContentTranslation(`place-review:${review.placeId}:${review.reviewId ?? review.createdAt}`, [review.text]);

  const deletion = useDeletePlaceReview(review.placeId, review.reviewId);
  const deleteAction = useContentDeletion(() => deletion.mutateAsync(), undefined, `${review.placeId}:${review.reviewId}`);
  return (
    <View style={styles.detailReviewItem}>
      <View style={styles.detailReviewerRow}>
        <ReviewerAvatar name={review.author} url={review.avatarUrl} />
        <View style={styles.detailReviewBody}>
          <AppText style={styles.detailReviewerName}>{review.author}</AppText>
          <AppText style={styles.detailReviewMeta}>{review.createdAt}</AppText>
        </View>
        {review.isOwnReview ? <OwnerContentActions busy={deleteAction.busy} onDelete={review.placeId && review.reviewId ? deleteAction.confirm : undefined} key={`${placeName}-${review.reviewId ?? review.createdAt}-${review.text}`} onEdit={review.onEdit} /> : null}
      </View>
      <AppText
        {...translation.textActions}
        ellipsizeMode="tail"
        numberOfLines={variant === 'summary' ? 2 : undefined}
        style={styles.detailReviewText}
      >
        {translation.texts[0]}
      </AppText>
      <ContentTranslationActions translation={translation} />
      {review.imageUrls?.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.detailReviewImageStrip} contentContainerStyle={styles.detailReviewImageGrid}>
          {review.imageUrls.map((url, photoIndex) => (
            <Pressable
              accessibilityLabel={t('map.detail.imageDetail', { count: photoIndex + 1, name: placeName })}
              accessibilityRole="button"
              key={`${url}-${photoIndex}`}
              onPress={onOpenImages
                ? () => onOpenImages(review.imageUrls ?? [], photoIndex)
                : undefined}
              style={styles.detailReviewImageCell}
            >
              <PreviewArtwork imageUrl={url} />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      {review.reasons.length > 0 ? (
        <View style={styles.detailReviewTags}>
          <ReviewFeatureTags reasons={review.reasons} variant={variant} appearance="placeDetail" />
        </View>
      ) : null}
    </View>
  );
};

const REVIEW_SUMMARY_COUNT = 3;

/** Info-tab review preview; "view all" expands the full reviews in place instead of navigating. */
const DetailReviewSummary = ({ count, onOpenImages, placeName, reviews }: {
  count: number;
  onOpenImages?: (urls: string[], index: number) => void;
  placeName: string;
  reviews: readonly DetailReview[];
}) => {
  const { t } = useTranslation();
  const styles = useMapSheetStyles();
  const [isExpanded, setIsExpanded] = useState(false);
  if (reviews.length === 0) return null;
  const visibleReviews = isExpanded ? reviews : reviews.slice(0, REVIEW_SUMMARY_COUNT);
  const label = t(isExpanded ? 'map.detail.collapseReviews' : 'map.detail.viewAllReviews');

  return (
    <View style={styles.detailReviewSection} testID="map-detail-review-summary">
      <AppText style={styles.detailSectionTitle}>{t('map.detail.reviewCount', { count })}</AppText>
      {visibleReviews.map((review, index) => (
        <DetailReviewItem
          key={`${review.author}-${review.createdAt}-${index}`}
          onOpenImages={onOpenImages}
          placeName={placeName}
          review={review}
          variant={isExpanded ? 'full' : 'summary'}
        />
      ))}
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        onPress={() => setIsExpanded((current) => !current)}
        style={({ pressed }) => [styles.detailReviewMore, pressed && styles.pressed]}
        testID="map-detail-review-more"
      >
        <AppText style={styles.detailReviewMoreText}>{label}</AppText>
      </Pressable>
    </View>
  );
};

type PlaceDetailTab = 'info' | 'reviews';

const ExpandedPlaceContent = ({
  activeAction,
  activeTab,
  bookmarked,
  couponContent,
  fallbackContent,
  imageUrl,
  onBack,
  onDeparture,
  onDirections,
  onOpenImages,
  onReserve,
  onShare,
  onRetryAvailability,
  onRetryMedia,
  onRetryReviews,
  onSelectAction,
  onTabChange,
  onToggleBookmark,
  pending,
  placeActionBusy,
  place,
  sheetPanHandlers,
}: {
  activeAction: PreviewActionKind | null;
  activeTab: PlaceDetailTab;
  bookmarked: boolean;
  couponContent?: React.ReactNode;
  fallbackContent?: MapPreviewFallbackContent;
  imageUrl?: string;
  onBack: () => void;
  onDeparture?: () => void;
  onDirections?: () => void;
  onOpenImages?: (imageUrls: string[], initialIndex: number) => void;
  onReserve: () => void;
  onShare?: () => void;
  onRetryAvailability?: () => void;
  onRetryMedia?: () => void;
  onRetryReviews?: () => void;
  onSelectAction: (action: PreviewActionKind) => void;
  onTabChange: (tab: PlaceDetailTab) => void;
  onToggleBookmark: () => void;
  pending: boolean;
  placeActionBusy?: 'directions' | 'share' | null;
  place: DecisionPlace;
  sheetPanHandlers: GestureResponderHandlers;
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useMapSheetStyles();
  const translationAttribution = useTranslationAttribution(place.name);
  const photos = useVisiblePlacePhotos(place.id, fallbackContent?.imageUrls.length
    ? fallbackContent.imageUrls
    : [imageUrl]);
  const validImageUrls = photos.urls;
  const reservation = fallbackContent?.reservation ?? {
    kind: 'loading', disabled: true,
  };
  const reservationPress = reservation.kind === 'error' ? onRetryAvailability : onReserve;
  const selectAction = (action: PreviewActionKind, callback?: () => void) => {
    onSelectAction(action);
    callback?.();
  };
  const insets = useSafeAreaInsets();
  const reviewImageUrls = (fallbackContent?.reviews ?? [])
    .flatMap((review) => review.imageUrls ?? []);
  const detailAddress = selectPlaceDetailAddress(place.address, fallbackContent);
  const verificationSummary = typeof fallbackContent?.reviewParticipantCount === 'number'
    ? [t('map.detail.verifiedCount', { count: fallbackContent.reviewParticipantCount }),
      !fallbackContent.reviewHighlightsComplete && (fallbackContent.reviewSampleSize ?? 0) > 0
        ? t('placeReviewSummary.partialBasis', { count: fallbackContent.reviewSampleSize }) : null,
    ].filter(Boolean).join(' · ')
    : fallbackContent?.statusDescription || fallbackContent?.englishName;
  const scrollHandoff = useSheetScrollHandoff(sheetPanHandlers);

  return (
    <View style={[styles.sheetContent, { paddingTop: insets.top }]}>
      <View style={styles.detailTopBar} testID="map-detail-top-bar">
        <Pressable
          accessibilityLabel={t('map.detail.back')}
          accessibilityRole="button"
          hitSlop={12}
          onPress={onBack}
          style={styles.detailRoundButton}
          testID="map-detail-back"
        >
          <DetailBackAsset style={styles.detailRoundArtwork} />
        </Pressable>
        <View
          {...sheetPanHandlers}
          style={styles.detailHeaderDragSpace}
          testID="map-detail-header-drag"
        />
        <Pressable
          accessibilityLabel={t(bookmarked ? 'map.sheet.bookmarkRemove' : 'map.sheet.bookmark')}
          accessibilityRole="button"
          accessibilityState={{ busy: pending, disabled: pending, selected: bookmarked }}
          disabled={pending}
          hitSlop={12}
          onPress={onToggleBookmark}
          style={[styles.detailRoundButton, !bookmarked && styles.detailRoundUnselected]}
        >
          <>{bookmarked ? <DetailBookmarkAsset style={styles.detailRoundArtwork} /> : <BookmarkStar selected={false} size={22} />}</>
        </Pressable>
      </View>

    <TranslationAttributionNotice />
    <View {...scrollHandoff.panHandlers} style={styles.sheetContent} testID="map-expanded-place-drag">
    <GlassStyles.ExpandedPlaceScroll
      bounces={false}
      contentContainerStyle={[styles.detailContent]}
      onScroll={scrollHandoff.onScroll}
      overScrollMode="never"
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      testID="map-expanded-place-scroll"
    >
      <View style={styles.detailHeading} testID="place-detail-drag-heading">
        <PlaceNameTranslation
            attributionPlacement="photos"
            onTranslationChange={translationAttribution.onTranslationChange}
          original={place.name}
          nameStyle={styles.detailTitle}
          inlineCategory
          titleMinHeight={31.2}
          category={<AppText ellipsizeMode="tail" numberOfLines={1} style={styles.detailCategory}>{t(`map.categories.${formatPreviewCategory(place.category)}`)}</AppText>}
        />
        {verificationSummary ? (
          <AppText style={styles.detailVerified}>{verificationSummary}</AppText>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.detailActionRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <PreviewActionChip expanded
          active={activeAction === 'departure'}
          disabled={!onDeparture || placeActionBusy != null}
          kind="departure"
          label={t('map.card.actions.start')}
          onPress={() => selectAction('departure', onDeparture)}
        />
        <PreviewActionChip expanded
          active={activeAction === 'arrival'}
          disabled={!onDirections || placeActionBusy != null}
          kind="arrival"
          label={t('map.card.actions.arrive')}
          onPress={() => selectAction('arrival', onDirections)}
        />
        <PreviewActionChip expanded
          busy={placeActionBusy === 'share'}
          disabled={!onShare || placeActionBusy != null}
          kind="share"
          label={t('map.card.actions.share')}
          onPress={onShare}
        />
        <PreviewActionChip expanded
          active={activeAction === 'reservation'}
          disabled={reservation.disabled && reservation.kind !== 'error'}
          kind="reservation"
          label={t(reservation.kind === 'error' ? 'map.detail.reservation.retry' : 'map.card.actions.reserve')}
          onPress={() => selectAction('reservation', reservationPress)}
        />
        <PreviewActionChip expanded
          busy={placeActionBusy === 'directions'}
          disabled={!onDirections || placeActionBusy != null}
          kind="directions"
          label={t('map.card.actions.directions')}
          onPress={onDirections}
        />
      </ScrollView>
      {fallbackContent?.imageState === 'error' ? (
        <Pressable accessibilityRole="button" onPress={onRetryMedia}>
          <AppText style={styles.detailEmptyText}>{t('map.detail.imageError')}</AppText>
        </Pressable>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.detailPhotoRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {fallbackContent?.imageState === 'loading' && validImageUrls.length === 0 ? (
          <SkeletonGroup accessibilityLabel={t('placeDetail.loading')}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <SkeletonBlock width={242} height={182} radius={16} />
              <SkeletonBlock width={184} height={182} radius={16} />
            </View>
          </SkeletonGroup>
        ) : validImageUrls.map((url, index) => (
          <Pressable
            accessibilityLabel={url
              ? t('map.detail.imageDetail', { count: index + 1, name: place.name })
              : undefined}
            accessibilityRole={url ? 'button' : undefined}
            key={`${url ?? 'missing'}-${index}`}
            onPress={url && onOpenImages
              ? () => onOpenImages(validImageUrls, validImageUrls.indexOf(url))
              : undefined}
            style={[styles.detailPhoto, index === 0 && styles.detailPhotoPrimary]}
          >
            <PreviewArtwork imageUrl={url} onLoadError={() => photos.remove(url)} />
          </Pressable>
        ))}
      </ScrollView>

      <TranslationAttribution visible={translationAttribution.visible} testID="place-detail-translation-attribution" />

      <View style={styles.detailTabs}>
        {(['info', 'reviews'] as const).map((tab) => (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
            key={tab}
            onPress={() => onTabChange(tab)}
            style={styles.detailTab}
          >
            <AppText style={[styles.detailTabText, activeTab === tab && styles.detailTabTextActive]}>
              {t(tab === 'info' ? 'map.detail.info' : 'map.detail.reviews')}
            </AppText>
            {activeTab === tab ? (
              <View style={styles.detailTabIndicator} testID="map-detail-active-tab-indicator" />
            ) : null}
          </Pressable>
        ))}
      </View>

      {activeTab === 'info' ? (
        <View>
          <View style={styles.detailInfoBlock}>
            <View style={styles.detailInfoRow}>
              <DetailPinAsset />
              <AppText style={styles.detailInfoText}>{detailAddress}</AppText>
            </View>
            {fallbackContent ? (
              <>
                <View style={styles.detailInfoRow}>
                  <DetailClockAsset />
                  <AppText numberOfLines={2} style={styles.detailInfoText}>
                    <AppText style={[
                      styles.detailOperatingStatus,
                      fallbackContent.operatingSummary?.tone === 'positive'
                        ? styles.detailOperatingPositive
                        : fallbackContent.operatingSummary?.tone === 'negative'
                          ? styles.detailOperatingNegative
                          : fallbackContent.operatingSummary?.tone === 'warning'
                            ? styles.detailOperatingWarning
                            : styles.detailOperatingNeutral,
                    ]}>
                      {fallbackContent.operatingSummary?.statusText
                        ?? fallbackContent.statusEmphasis}
                    </AppText>
                    {fallbackContent.operatingSummary?.detailText
                      ? ` · ${fallbackContent.operatingSummary.detailText}` : ''}
                  </AppText>
                </View>
                {fallbackContent.phone ? (
                  <View style={styles.detailInfoRow}>
                    <DetailCallAsset />
                    <AppText style={styles.detailInfoText}>{fallbackContent.phone}</AppText>
                  </View>
                ) : null}
              </>
            ) : null}
            {fallbackContent?.topReviewReasons?.length ? (
              <TopReviewFeatures content={fallbackContent} />
            ) : fallbackContent?.amenities.length ? (
              <View style={styles.detailAmenityRow}>
                {fallbackContent.amenities.map((amenity) => (
                  <PreviewAmenity key={amenity} type={amenity} expanded />
                ))}
              </View>
            ) : null}
          </View>

          {fallbackContent?.notice ? (
            <View style={styles.detailSection}>
              <AppText style={styles.detailSectionTitle}>{t('map.detail.notice')}</AppText>
              <AppText style={styles.detailInfoText}>{fallbackContent.notice}</AppText>
            </View>
          ) : null}

          {fallbackContent?.summary ? (
            <View style={styles.detailSection}>
              <AppText style={styles.detailSectionTitle}>{t('map.detail.description')}</AppText>
              <AppText style={styles.detailInfoText}>{fallbackContent.summary}</AppText>
            </View>
          ) : null}

          {couponContent ?? (fallbackContent?.coupons?.length ? (
            <View style={styles.detailSection}>
              <AppText style={styles.detailSectionTitle}>{t('map.detail.coupon')}</AppText>
              {fallbackContent.coupons.map((coupon, index) => (
                <View key={`${coupon.title}-${index}`} style={styles.detailCouponRow}>
                  <View style={styles.detailCouponIcon}><DetailTicketAsset /></View>
                  <View style={styles.detailCouponBody}>
                    <AppText style={styles.detailCouponTitle}>{coupon.title}</AppText>
                    <AppText style={styles.detailCouponPeriod}>{coupon.period}</AppText>
                  </View>
                  <DetailDownloadAsset />
                </View>
              ))}
            </View>
          ) : null)}

          <PlaceMenuSection placeId={place.id} presentation="mapDetail" onOpenImages={onOpenImages} />

          {fallbackContent?.events?.length ? (
            <View style={styles.detailSection}>
              <AppText style={styles.detailSectionTitle}>{t('map.detail.events')}</AppText>
              {fallbackContent.events.map((event, index) => (
                <View key={`${event.title}-${index}`} style={styles.detailCouponRow}>
                  <View style={styles.detailCouponBody}>
                    <AppText style={styles.detailCouponTitle}>{event.title}</AppText>
                    {event.period ? <AppText style={styles.detailCouponPeriod}>{event.period}</AppText> : null}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {fallbackContent?.reviewState === 'ready' && fallbackContent.reviews?.length ? (
            <DetailReviewSummary
              count={fallbackContent.reviewCount ?? fallbackContent.reviews.length}
              onOpenImages={onOpenImages}
              placeName={place.name}
              reviews={fallbackContent.reviews}
            />
          ) : null}
        </View>
      ) : (
        <View>
          <View style={styles.detailReviewSection} testID="place-review-highlights">
            <AppText style={styles.detailReviewTitle}>
              {t('map.detail.reviewHighlights')}
              {fallbackContent?.reviewParticipantCount !== undefined && fallbackContent?.reviewState !== 'error' && fallbackContent?.reviewState !== 'loading' ? (
                <AppText style={styles.detailReviewCount}> {t('map.detail.participantCount', { count: fallbackContent.reviewParticipantCount })}</AppText>
              ) : null}
            </AppText>
            {fallbackContent?.reviewState !== 'error' && fallbackContent?.reviewState !== 'loading'
              && (fallbackContent?.reviewSampleSize ?? 0) > 0
              && (!fallbackContent?.reviewHighlightsComplete || fallbackContent?.reviewParticipantCount === undefined) ? (
              <AppText style={styles.detailReviewCount} testID="place-review-highlights-basis">
                {t(fallbackContent?.reviewHighlightsComplete ? 'placeReviewSummary.reviewBasis' : 'placeReviewSummary.partialBasis', { count: fallbackContent?.reviewSampleSize })}
              </AppText>
            ) : null}
            {fallbackContent?.reviewState === 'loading' ? (
              <Skeleton variant="comments" accessibilityLabel={t('placeReviewSummary.loading')} />
            ) : fallbackContent?.reviewState === 'error' ? (
              <Pressable accessibilityRole="button" onPress={onRetryReviews}><AppText style={styles.detailEmptyText}>{t('placeReviewSummary.error')}</AppText></Pressable>
            ) : fallbackContent?.reviewHighlights?.length ? fallbackContent.reviewHighlights.map((highlight, index, items) => {
              const maxCount = Math.max(...items.map((item) => item.count), 1);
              const scoreRatio = Math.min(1, Math.max(0, highlight.count / maxCount));
              const strongest = index === 0;
              return (
                <View key={highlight.reason ?? highlight.label} style={styles.detailHighlightRow} accessible
                  testID={`place-review-highlight-${highlight.reason ?? index}`} accessibilityRole="progressbar"
                  accessibilityLabel={highlight.label} accessibilityValue={{ min: 0, max: maxCount, now: highlight.count }}>
                  <View
                    testID={`place-review-highlight-fill-${highlight.reason ?? index}`}
                    style={[
                      styles.detailHighlightFill,
                      {
                        backgroundColor: strongest ? colors.primaryAlternative : index === 1 ? colors.primaryAssistive : colors.primaryAssistiveSoft,
                        width: `${scoreRatio * 100}%`,
                      },
                    ]}
                  />
                  <View style={styles.detailHighlightLabelRow}>
                    <ReviewHighlightIcon label={highlight.label} reason={highlight.reason} />
                    <AppText style={[styles.detailHighlightLabel, strongest && styles.detailHighlightCountOnStrong]}>{highlight.label}</AppText>
                  </View>
                  <AppText
                    style={[
                      styles.detailHighlightCount,
                      strongest && styles.detailHighlightCountOnStrong,
                    ]}
                  >
                    {highlight.count}
                  </AppText>
                </View>
              );
            }) : <AppText style={styles.detailEmptyText}>{t('placeReviewSummary.empty')}</AppText>}
          </View>

          {reviewImageUrls.length ? (
            <View style={styles.detailReviewSection}>
              <AppText style={styles.detailSectionTitle}>{t('map.detail.photoReviews')}</AppText>
              <FlatList
                contentContainerStyle={styles.detailReviewPhotos}
                data={reviewImageUrls}
                horizontal
                initialNumToRender={6}
                keyExtractor={(url, index) => `${url ?? 'missing'}-review-${index}`}
                maxToRenderPerBatch={6}
                renderItem={({ item: url, index }) => (
                  <Pressable
                    accessibilityLabel={t('map.detail.imageDetail', {
                      count: index + 1,
                      name: place.name,
                    })}
                    accessibilityRole="button"
                    onPress={onOpenImages ? () => onOpenImages(reviewImageUrls, index) : undefined}
                    style={styles.detailReviewPhoto}
                  >
                    <PreviewArtwork imageUrl={url} />
                  </Pressable>
                )}
                showsHorizontalScrollIndicator={false}
                windowSize={3}
              />
            </View>
          ) : null}

          <View style={styles.detailReviewSection}>
            <AppText style={styles.detailSectionTitle}>{t('map.detail.reviewCount', { count: fallbackContent?.reviewCount ?? 0 })}</AppText>
            {fallbackContent?.reviewState === 'error' ? (
              <Pressable accessibilityRole="button" onPress={onRetryReviews}>
                <AppText style={styles.detailEmptyText}>{t('map.detail.reviewError')}</AppText>
              </Pressable>
            ) : fallbackContent?.reviewState === 'loading' ? (
              <Skeleton variant="comments" accessibilityLabel={t('map.detail.reviewLoading')} />
            ) : fallbackContent?.reviews?.length ? fallbackContent.reviews.map((review, index) => (
              <DetailReviewItem
                key={`${review.author}-${review.createdAt}-${index}`}
                onOpenImages={onOpenImages}
                placeName={place.name}
                review={review}
                variant="full"
              />
            )) : (
                <AppText style={styles.detailEmptyText}>{t('map.detail.reviewEmpty')}</AppText>
              )}
          </View>
        </View>
      )}
    </GlassStyles.ExpandedPlaceScroll>
    </View>
    </View>
  );
};

const DISABLED_RANKED_FEED: RankedPlaceFeed = {
  hasNext: false,
  places: [],
  retry: () => undefined,
  status: 'disabled',
};

export default function MapBottomSheet({
  bookmarkPendingPlaceIds = {},
  bookmarkedPlaceIds,
  collapsedTranslateY,
  expandedTranslateY = 0,
  content,
  couponContent,
  height,
  isBookmarkStateLoading = false,
  mediumTranslateY,
  onBackHome,
  onCreateReservation,
  onDetailPress,
  onDeparturePress,
  onDirectionsPress,
  onExternalDeparturePress,
  onExternalDirectionsPress,
  onExternalPlaceLayout,
  onHandlePress,
  onOpenCommunity,
  onOpenLikedPlaces,
  onOpenRecommendations,
  onOpenSavedPlaces,
  onPlacePress,
  onRankedPlacePress = () => undefined,
  onRetryAvailability,
  onRetryMedia,
  onRetryRecommendations,
  onRetryReviews,
  onSharePlace,
  onToggleBookmark,
  onToggleRankedBookmark = async () => undefined,
  panHandlers,
  placeActionBusy = null,
  places,
  localFeed = DISABLED_RANKED_FEED,
  nationalFeed = DISABLED_RANKED_FEED,
  previewFallbackContentByPlaceId,
  explorationImageUrlsByPlaceId = {},
  recommendationPlaces,
  recommendationsState,
  selectedPlace,
  detailError, detailBusy, onRetryDetail, resultsError, resultsLoading, resultsBusy, onRetryResults,
  sheetChromeBottom,
  parentOwnsMotion = false,
  sheetTranslateY,
  snapPoint,
  userName,
}: MapBottomSheetProps) {
  const activeTheme = useTheme();
  const themedColors = activeTheme.colors;
  const styles = useMapSheetStyles();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [feed, setFeed] = useState<'local' | 'national'>('local');
  const [localCategory, setLocalCategory] = useState<MapHomeCategory>('all');
  const [nationalCategory, setNationalCategory] = useState<MapHomeCategory>('all');
  const [activePlaceDetailTab, setActivePlaceDetailTab] = useState<PlaceDetailTab>('info');
  const [activePreviewAction, setActivePreviewAction] = useState<PreviewActionKind | null>(null);
  const [photoViewer, setPhotoViewer] = useState<{
    imageUrls: string[];
    initialIndex: number;
    placeName: string;
  } | null>(null);
  const reservationNavigationLock = useRef(false);
  const reservationUnlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const externalPlace = content.type === 'external-place' ? content.place : null;
  const externalPlaceKey = externalPlace ? getExternalPlaceKey(externalPlace) : null;
  useEffect(() => {
    setActivePlaceDetailTab('info');
    setActivePreviewAction(null);
    setPhotoViewer(null);
    reservationNavigationLock.current = false;
    if (reservationUnlockTimer.current) clearTimeout(reservationUnlockTimer.current);
    reservationUnlockTimer.current = null;

    return () => {
      if (reservationUnlockTimer.current) clearTimeout(reservationUnlockTimer.current);
    };
  }, [externalPlaceKey, selectedPlace?.id]);
  const query = content.type === 'search' || content.type === 'results' ? content.query.trim() : '';
  const isSearchMode = content.type === 'search' || content.type === 'results';
  const selectedFeed = feed === 'local' ? localFeed : nationalFeed;
  const activeCategory = feed === 'local' ? localCategory : nationalCategory;
  const setActiveCategory = feed === 'local' ? setLocalCategory : setNationalCategory;
  const previewPlaces = useMemo(() => {
    const seenPlaceIds = new Set<number>();

    return [...places, ...recommendationPlaces].filter((place) => {
      if (seenPlaceIds.has(place.id)) return false;
      seenPlaceIds.add(place.id);
      return true;
    });
  }, [places, recommendationPlaces]);
  const { imageUrlsByPlaceId: previewImageUrlsByPlaceId } = usePlacePreviewImages(previewPlaces);
  const imageUrlsByPlaceId = useMemo(() => ({
    ...explorationImageUrlsByPlaceId,
    ...previewImageUrlsByPlaceId,
  }), [explorationImageUrlsByPlaceId, previewImageUrlsByPlaceId]);
  const isExpandedPlaceDetail = content.type === 'place-preview' && snapPoint === 'expanded';
  const isHomeFeed = content.type === 'home' || content.type === 'recommendations';
  const restingScrollEnabled = isHomeFeed
    && snapPoint === 'medium'
    && height - mediumTranslateY < HOME_SHEET_VISIBLE_HEIGHT;
  const compactContentHeight = Math.max(
    0,
    height - mediumTranslateY - HOME_SHEET_HANDLE_HEIGHT
      - getMapSheetNavigationBottom(insets.bottom) - 64 - 8,
  );
  const handleCreateReservation = () => {
    if (!selectedPlace || !onCreateReservation || reservationNavigationLock.current) return;
    reservationNavigationLock.current = true;
    onCreateReservation(
      selectedPlace,
      previewFallbackContentByPlaceId?.[String(selectedPlace.id)]?.imageUrls[0]
        ?? imageUrlsByPlaceId[String(selectedPlace.id)],
    );
    reservationUnlockTimer.current = setTimeout(() => {
      reservationNavigationLock.current = false;
      reservationUnlockTimer.current = null;
    }, RESERVATION_NAVIGATION_LOCK_MS);
  };
  const contentFadeStart = mediumTranslateY
    + ((collapsedTranslateY - mediumTranslateY) * 0.42);
  const contentOpacity = sheetTranslateY.interpolate({
    extrapolate: 'clamp',
    inputRange: [mediumTranslateY, contentFadeStart, collapsedTranslateY],
    outputRange: [1, 0.78, 0],
  });
  const contentTranslateY = sheetTranslateY.interpolate({
    extrapolate: 'clamp',
    inputRange: [mediumTranslateY, collapsedTranslateY],
    outputRange: [0, 22],
  });
  const expandedOnlyOpacity = sheetTranslateY.interpolate({
    extrapolate: 'clamp',
    inputRange: [Math.max(0, mediumTranslateY - 96), mediumTranslateY],
    outputRange: [1, 0],
  });
  const movingContentStyle = useSheetMotionStyle(position => {
    'worklet';
    return {
      opacity: clampSheetValue(position, [mediumTranslateY, contentFadeStart, collapsedTranslateY], [1, 0.78, 0]),
      transform: [{ translateY: clampSheetValue(position, [mediumTranslateY, collapsedTranslateY], [0, 22]) }],
    };
  }, { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] });
  return (
    <TranslationAttributionGroup><GlassStyles.BottomSheetContainer
      style={{ height, transform: parentOwnsMotion ? undefined : [{ translateY: sheetTranslateY }] }}
    >
      <MapSheetSurface sheetChromeBottom={sheetChromeBottom} expandedTranslateY={expandedTranslateY} mediumTranslateY={mediumTranslateY} opaque={isExpandedPlaceDetail} expandsToFullScreen={content.type === 'place-preview'} contentInset={content.type === 'place-preview' || content.type === 'external-place' ? 0 : 8} testID="map-sheet">
      {!isExpandedPlaceDetail ? (
        <View
          {...panHandlers}
          style={[styles.handleArea, isHomeFeed && styles.homeHandleArea]}
          testID="map-sheet-handle-target"
        >
          <Pressable
            accessibilityLabel={t('map.sheet.adjust')}
            accessibilityRole="adjustable"
            onPress={onHandlePress}
            style={[styles.handleButton, isHomeFeed && styles.homeHandleButton]}
          >
            <View pointerEvents="none" style={styles.handle} />
          </Pressable>
        </View>
      ) : null}

      <SheetMotionView
        {...(snapPoint === 'expanded' || restingScrollEnabled ? {} : panHandlers)}
        pointerEvents={snapPoint === 'collapsed' ? 'none' : 'auto'}
        style={[
          styles.sheetContent,
          restingScrollEnabled && { flex: 0, height: compactContentHeight },
          movingContentStyle,
        ]}
        testID="map-sheet-content"
      >
      {/* Keep loaded place data available when an offline refresh fails. */}
      {!isExpandedPlaceDetail && content.type !== 'home' ? <TranslationAttributionNotice /> : null}
      {content.type === 'place-preview' && detailError && !selectedPlace ? <ApiErrorState error={detailError} busy={detailBusy} onRetry={onRetryDetail} onBack={onBackHome} /> : null}
      {content.type === 'place-preview' && !selectedPlace ? (detailError ? null : <LoadingState variant="place" description={t('placeDetail.loading')} />) : content.type === 'place-preview' && selectedPlace ? (
        snapPoint === 'expanded' ? (
          <ExpandedPlaceContent
            sheetPanHandlers={panHandlers}
            activeAction={activePreviewAction}
            activeTab={activePlaceDetailTab}
            bookmarked={Boolean(bookmarkedPlaceIds[String(selectedPlace.id)])}
            couponContent={couponContent}
            fallbackContent={previewFallbackContentByPlaceId?.[String(selectedPlace.id)]}
            imageUrl={imageUrlsByPlaceId[String(selectedPlace.id)]}
            onBack={onBackHome}
            onDeparture={onDeparturePress && hasValidCoordinates({
              latitude: selectedPlace.latitude,
              longitude: selectedPlace.longitude,
            }) ? () => onDeparturePress(selectedPlace) : undefined}
            onDirections={onDirectionsPress && hasValidCoordinates({
              latitude: selectedPlace.latitude,
              longitude: selectedPlace.longitude,
            })
              ? () => onDirectionsPress(selectedPlace)
              : undefined}
            onOpenImages={(nextImageUrls, initialIndex) => setPhotoViewer({
              imageUrls: nextImageUrls,
              initialIndex,
              placeName: selectedPlace.name,
            })}
            onReserve={handleCreateReservation}
            onShare={onSharePlace ? () => onSharePlace(selectedPlace) : undefined}
            onRetryAvailability={onRetryAvailability}
            onRetryMedia={onRetryMedia}
            onRetryReviews={onRetryReviews}
            onSelectAction={setActivePreviewAction}
            onTabChange={setActivePlaceDetailTab}
            onToggleBookmark={() => void onToggleBookmark(
              selectedPlace,
              !bookmarkedPlaceIds[String(selectedPlace.id)],
            )}
            pending={isBookmarkStateLoading || Boolean(bookmarkPendingPlaceIds[String(selectedPlace.id)])}
            placeActionBusy={placeActionBusy}
            place={selectedPlace}
          />
        ) : (
          <PreviewContent
            sheetPanHandlers={panHandlers}
            activeAction={activePreviewAction}
            bookmarked={Boolean(bookmarkedPlaceIds[String(selectedPlace.id)])}
            fallbackContent={previewFallbackContentByPlaceId?.[String(selectedPlace.id)]}
            imageUrl={imageUrlsByPlaceId[String(selectedPlace.id)]}
            onBack={onBackHome}
            onDetail={() => onDetailPress(selectedPlace)}
            onDeparture={onDeparturePress && hasValidCoordinates({
              latitude: selectedPlace.latitude,
              longitude: selectedPlace.longitude,
            }) ? () => onDeparturePress(selectedPlace) : undefined}
            onDirections={onDirectionsPress && hasValidCoordinates({
              latitude: selectedPlace.latitude,
              longitude: selectedPlace.longitude,
            })
              ? () => onDirectionsPress(selectedPlace)
              : undefined}
            onOpenImages={(nextImageUrls, initialIndex) => setPhotoViewer({
              imageUrls: nextImageUrls,
              initialIndex,
              placeName: selectedPlace.name,
            })}
            onReserve={handleCreateReservation}
            onShare={onSharePlace ? () => onSharePlace(selectedPlace) : undefined}
            onRetryAvailability={onRetryAvailability}
            onRetryMedia={onRetryMedia}
            onSelectAction={setActivePreviewAction}
            onToggleBookmark={() => void onToggleBookmark(
              selectedPlace,
              !bookmarkedPlaceIds[String(selectedPlace.id)],
            )}
            pending={isBookmarkStateLoading || Boolean(bookmarkPendingPlaceIds[String(selectedPlace.id)])}
            placeActionBusy={placeActionBusy}
            place={selectedPlace}
          />
        )
      ) : externalPlace ? (
        <ExternalPlaceContent
          activeAction={activePreviewAction}
          onBack={onBackHome}
          onDeparture={onExternalDeparturePress && externalPlace.coordinate
            ? () => onExternalDeparturePress(externalPlace)
            : undefined}
          onDirections={onExternalDirectionsPress && externalPlace.coordinate
            ? () => onExternalDirectionsPress(externalPlace)
            : undefined}
          onLayout={onExternalPlaceLayout}
          onSelectAction={setActivePreviewAction}
          place={externalPlace}
        />
      ) : isSearchMode ? (
        <ScrollView
          contentContainerStyle={styles.resultsContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultsTitleRow}>
            <AppText style={styles.resultsTitle}>{query ? t('map.sheet.resultsFor', { query }) : t('map.sheet.aroundMe')}</AppText>
            <AppText style={styles.resultsCount}>{places.length}</AppText>
          </View>
          {resultsError ? <ApiErrorState error={resultsError} busy={resultsBusy} onRetry={onRetryResults} /> : null}
          {places.length > 0 ? places.map((place) => (
            <ResultRow key={place.id} onPress={() => onPlacePress(place)} place={place} />
          )) : resultsLoading ? <LoadingState variant="place" description={t('placeDetail.loading')} /> : resultsError ? null : <EmptyCard />}
        </ScrollView>
      ) : content.type === 'recommendations' ? (
        <RecommendationContent
          bookmarkedPlaceIds={bookmarkedPlaceIds}
          bookmarkPendingPlaceIds={bookmarkPendingPlaceIds}
          expandedInteractionsEnabled={snapPoint === 'expanded'}
          expandedOnlyOpacity={expandedOnlyOpacity}
          imageUrlsByPlaceId={imageUrlsByPlaceId}
          isBookmarkStateLoading={isBookmarkStateLoading}
          onPlacePress={onPlacePress}
          onRetry={onRetryRecommendations}
          onToggleBookmark={onToggleBookmark}
          places={recommendationPlaces}
          restingScrollEnabled={restingScrollEnabled}
          state={recommendationsState}
          userName={userName?.trim() || 'user'}
        />
      ) : (
        <ExpandedHomeContent
          sheetPanHandlers={panHandlers}
          activeCategory={activeCategory}
          bookmarkPendingPlaceIds={bookmarkPendingPlaceIds}
          expandedInteractionsEnabled={snapPoint === 'expanded'}
          expandedOnlyOpacity={expandedOnlyOpacity}
          feed={feed}
          onCategoryChange={setActiveCategory}
          onFeedChange={setFeed}
          onPlacePress={onRankedPlacePress}
          onRetry={selectedFeed.retry}
          onToggleBookmark={onToggleRankedBookmark}
          places={selectedFeed.places}
          restingScrollEnabled={restingScrollEnabled}
          state={selectedFeed.status}
          title={selectedFeed.title}
          userName={userName?.trim() || 'user'}
        />
      )}
      </SheetMotionView>
      </MapSheetSurface>

      {content.type !== 'place-preview' && content.type !== 'external-place' ? (
        <MapSheetBottomNavigation
          activeTab={content.type === 'recommendations' ? 'recommendations' : 'map'}
          onOpenCommunity={onOpenCommunity}
          onOpenFavorites={onOpenLikedPlaces}
          onOpenMap={onBackHome}
          onOpenRecommendations={onOpenRecommendations}
          onOpenReservations={onOpenSavedPlaces}
          sheetTranslateY={sheetTranslateY}
        />
      ) : null}
      <PlacePhotoViewer
        imageUrls={photoViewer?.imageUrls ?? []}
        initialIndex={photoViewer?.initialIndex ?? 0}
        onClose={() => setPhotoViewer(null)}
        placeName={photoViewer?.placeName ?? ''}
        visible={photoViewer !== null}
      />
    </GlassStyles.BottomSheetContainer></TranslationAttributionGroup>
  );
}
