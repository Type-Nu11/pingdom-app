import { UnavailableStateIcon } from '../../../../../shared/components';
import { Text as AppText } from '../../../../../shared/components/Typography';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Image, Platform, Pressable, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import { MOTION_DURATION, runTimingMotion, useReducedMotion } from '../../../../../shared/motion';
import { FavoriteIcon } from '../../../../../shared/components';
import { formatDistance as formatLocalizedDistance } from '../../../../../shared/i18n/formatters';
import { lightColors } from '../../../../../shared/theme/colors';
import { useTheme } from 'styled-components/native';
import type { RankedPlaceViewModel } from '../../../home-feeds';
import type { DecisionPlace } from './mapSheetTypes';
import { styles, useMapSheetStyles } from '../styles/MapBottomSheet.styles';

const RECOMMENDATION_NAVIGATION_LOCK_MS = 500;

const CardScrim = () => (
  <View pointerEvents="none" style={styles.cardScrim}>
    <Svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%">
      <Defs>
        <LinearGradient id="card-scrim" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor="#000000" stopOpacity="0" />
          <Stop offset="0.52" stopColor="#000000" stopOpacity="0.02" />
          <Stop offset="0.76" stopColor="#000000" stopOpacity="0.32" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0.82" />
        </LinearGradient>
      </Defs>
      <Rect fill="url(#card-scrim)" height="100" width="100" />
    </Svg>
  </View>
);

const RecommendationMetaIcon = () => {
  const themedColors = useTheme().colors ?? lightColors;
  return <Svg height={16} viewBox="0 0 18 18" width={16}>
    <Path d="M3 3.5h12v8H8l-3.5 3v-3H3z" fill={themedColors.surfaceMuted} stroke={themedColors.textMuted} strokeLinejoin="round" />
    <Circle cx="6.5" cy="7.5" fill={themedColors.textMuted} r=".8" />
    <Circle cx="9" cy="7.5" fill={themedColors.textMuted} r=".8" />
    <Circle cx="11.5" cy="7.5" fill={themedColors.textMuted} r=".8" />
  </Svg>
};

export const BookmarkStar = ({
  selected,
  size = 28,
  onPhoto = false,
}: {
  selected: boolean;
  size?: number;
  onPhoto?: boolean;
}) => <FavoriteIcon idleColor={onPhoto ? '#FFFFFF' : undefined} selected={selected} size={size} />;

export const formatDistance = (place: DecisionPlace, language: string) => {
  if (place.distanceMeters !== undefined) {
    return formatLocalizedDistance(place.distanceMeters, language);
  }

  return place.distance;
};

const PlaceArtwork = React.memo(({
  blurBottom = false,
  imageUrl,
  variant = 'trend',
}: {
  blurBottom?: boolean;
  imageUrl?: string;
  variant?: 'grid' | 'trend';
}) => {
  const { t } = useTranslation();
  const styles = useMapSheetStyles();
  const [hasImageError, setHasImageError] = useState(false);
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setHasImageError(false);
    imageOpacity.stopAnimation();
    imageOpacity.setValue(0);

    return () => imageOpacity.stopAnimation();
  }, [imageOpacity, imageUrl]);

  if (!imageUrl || hasImageError) {
    const fallbackMessage = t(hasImageError ? 'map.sheet.imageError' : 'map.sheet.imageMissing');

    return (
      <View
        accessibilityLabel={fallbackMessage}
        style={[styles.artwork, styles.artworkFallback, variant === 'grid' && styles.gridArtwork]}
      >
        <UnavailableStateIcon size={64} />
        <AppText style={styles.artworkFallbackText}>{fallbackMessage}</AppText>
      </View>
    );
  }

  const imageSource = { uri: imageUrl };
  const handleLoad = () => {
    runTimingMotion(imageOpacity, 1, {
      reduceMotion,
      useNativeDriver: true,
    });
  };

  return (
    <Animated.View
      style={[
        styles.artwork,
        variant === 'grid' && styles.gridArtwork,
        { opacity: imageOpacity },
      ]}
    >
      <Animated.Image
        onError={() => setHasImageError(true)}
        onLoad={handleLoad}
        resizeMethod="resize"
        resizeMode="cover"
        fadeDuration={0}
        source={imageSource}
        style={styles.artworkImage}
        testID={blurBottom ? 'recommendation-featured-image' : 'place-artwork-image'}
      />
      {blurBottom ? (
        <View pointerEvents="none" style={styles.artworkBlurClip}>
          <Image
            blurRadius={2}
            onError={() => setHasImageError(true)}
            resizeMethod="resize"
            resizeMode="cover"
            fadeDuration={0}
            source={imageSource}
            style={styles.artworkBlurImage}
            testID="recommendation-featured-blur-image"
          />
        </View>
      ) : null}
    </Animated.View>
  );
});

const RecommendationCardPressable = ({
  accessibilityLabel,
  children,
  onPress,
  style,
  testID,
}: {
  accessibilityLabel: string;
  children: React.ReactNode;
  onPress: () => void;
  style: object;
  testID: string;
}) => {
  const reduceMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const navigationLocked = useRef(false);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    scale.stopAnimation();
    if (unlockTimer.current) clearTimeout(unlockTimer.current);
  }, [scale]);

  const animateScale = (toValue: number) => {
    runTimingMotion(scale, toValue, {
      duration: MOTION_DURATION.press,
      reduceMotion,
      useNativeDriver: true,
    });
  };

  const handlePress = () => {
    if (navigationLocked.current) return;
    navigationLocked.current = true;
    onPress();
    unlockTimer.current = setTimeout(() => {
      navigationLocked.current = false;
      unlockTimer.current = null;
    }, RECOMMENDATION_NAVIGATION_LOCK_MS);
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={handlePress}
        onPressIn={() => animateScale(0.985)}
        onPressOut={() => animateScale(1)}
        style={style}
        testID={testID}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

const RecommendationBookmarkButton = ({
  bookmarked,
  onToggleBookmark,
  pending,
  size = 28,
  style,
}: {
  bookmarked: boolean;
  onToggleBookmark: () => Promise<void> | void;
  pending: boolean;
  size?: number;
  style: object;
}) => {
  const { t } = useTranslation();
  const styles = useMapSheetStyles();
  const reduceMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const mutationLocked = useRef(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    scale.stopAnimation();
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, [scale]);

  const handlePress = async () => {
    if (pending || mutationLocked.current) return;
    mutationLocked.current = true;

    if (!reduceMotion) {
      runTimingMotion(scale, 0.88, {
        duration: MOTION_DURATION.press,
        reduceMotion: false,
        useNativeDriver: true,
      });
      feedbackTimer.current = setTimeout(() => {
        runTimingMotion(scale, 1, {
          duration: MOTION_DURATION.press,
          reduceMotion: false,
          useNativeDriver: true,
        });
        feedbackTimer.current = null;
      }, MOTION_DURATION.press);
    }

    try {
      await onToggleBookmark();
    } finally {
      mutationLocked.current = false;
    }
  };

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <Pressable
        accessibilityLabel={t(bookmarked ? 'map.sheet.bookmarkRemove' : 'map.sheet.bookmark')}
        accessibilityRole="button"
        accessibilityState={{ busy: pending, disabled: pending, selected: bookmarked }}
        disabled={pending}
        hitSlop={10}
        onPress={(event) => {
          event.stopPropagation();
          void handlePress();
        }}
        style={({ pressed }) => reduceMotion && pressed ? styles.bookmarkPressed : undefined}
      >
        <BookmarkStar onPhoto selected={bookmarked} size={size} />
      </Pressable>
    </Animated.View>
  );
};

export const RecommendationFeaturedCard = ({
  bookmarked,
  designSize = 'default',
  imageUrl,
  onPress,
  onToggleBookmark,
  pending,
  place,
}: {
  bookmarked: boolean;
  designSize?: 'default' | 'recommendation' | 'reservation';
  imageUrl?: string;
  onPress: () => void;
  onToggleBookmark: () => Promise<void> | void;
  pending: boolean;
  place: DecisionPlace;
}) => {
  const { i18n, t } = useTranslation();
  const styles = useMapSheetStyles();
  const distance = formatDistance(place, i18n.language);
  // Figma Component 10 (5062:31880) is shared by the recommendation and reservation rows.
  const isFigmaCard = designSize !== 'default';
  const isRecommendation = designSize === 'recommendation';
  return (
    <RecommendationCardPressable
      accessibilityLabel={[place.name, place.recommendationReason, distance]
        .filter(Boolean)
        .join(', ')}
      onPress={onPress}
      style={[styles.placeCard, isFigmaCard && styles.reservationPlaceCard, isRecommendation && styles.recommendationPlaceCard]}
      testID={`recommendation-card-${place.id}`}
    >
      <View style={[styles.placeCardArtwork, isFigmaCard && styles.reservationPlaceCardArtwork]}>
        <PlaceArtwork blurBottom imageUrl={imageUrl} />
        <CardScrim />
        <RecommendationBookmarkButton
          bookmarked={bookmarked}
          onToggleBookmark={onToggleBookmark}
          pending={pending}
          style={styles.cardBookmarkStar}
        />
        <View style={styles.placeCardBody}>
          <AppText ellipsizeMode="tail" numberOfLines={2} style={[styles.placeCardName, isFigmaCard && styles.reservationPlaceCardName]}>
            {place.name || t('map.sheet.placeMissing')}
          </AppText>
        </View>
      </View>
      {place.recommendationReason && isRecommendation ? (
        <AppText ellipsizeMode="tail" numberOfLines={1} style={styles.recommendationCardReason}>
          {place.recommendationReason}
        </AppText>
      ) : place.recommendationReason ? (
        <View style={styles.recommendationMetaRow}>
          <RecommendationMetaIcon />
          <AppText ellipsizeMode="tail" numberOfLines={1} style={styles.recommendationReason}>
            {place.recommendationReason}
          </AppText>
        </View>
      ) : null}
      <AppText ellipsizeMode="tail" numberOfLines={1} style={[styles.placeCardDistance, isFigmaCard && styles.reservationPlaceCardDistance, isRecommendation && styles.recommendationCardDistance]}>
        {t('map.sheet.distanceAway', { distance })}
      </AppText>
    </RecommendationCardPressable>
  );
};

export const RecommendationGridCard = ({
  bookmarked,
  imageUrl,
  onPress,
  onToggleBookmark,
  pending,
  place,
}: {
  bookmarked: boolean;
  imageUrl?: string;
  onPress: () => void;
  onToggleBookmark: () => Promise<void> | void;
  pending: boolean;
  place: DecisionPlace;
}) => {
  const { i18n, t } = useTranslation();
  const styles = useMapSheetStyles();
  return (
    <RecommendationCardPressable
      accessibilityLabel={`${place.name}, ${formatDistance(place, i18n.language)}`}
      onPress={onPress}
      style={styles.gridCard}
      testID={`recommendation-grid-card-${place.id}`}
    >
      <PlaceArtwork blurBottom imageUrl={imageUrl} variant="grid" />
      <CardScrim />
      <RecommendationBookmarkButton
        bookmarked={bookmarked}
        onToggleBookmark={onToggleBookmark}
        pending={pending}
        style={styles.gridBookmarkStar}
      />
      <View style={styles.gridCardBody}>
        <AppText ellipsizeMode="tail" numberOfLines={2} style={styles.gridCardName}>
          {place.name || t('map.sheet.placeMissing')}
        </AppText>
        <AppText ellipsizeMode="tail" numberOfLines={1} style={styles.gridCardDistance}>{place.address}</AppText>
      </View>
    </RecommendationCardPressable>
  );
};

export const PlaceTrendCard = ({
  bookmarked,
  imageUrl,
  onPress,
  onToggleBookmark,
  pending,
  place,
}: {
  bookmarked: boolean;
  imageUrl?: string;
  onPress: () => void;
  onToggleBookmark: () => void;
  pending: boolean;
  place: RankedPlaceViewModel;
}) => {
  const { t } = useTranslation();
  const styles = useMapSheetStyles();
  return (
  <Pressable
    accessibilityLabel={`${place.name}, ${place.address}`}
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.homeTrendCard, pressed && styles.pressed]}
  >
    {/* Android's bitmap blur duplicates every thumbnail; the scrim supplies contrast. */}
    <PlaceArtwork blurBottom={Platform.OS !== 'android'} imageUrl={imageUrl} />
    <CardScrim />
    <Pressable
      accessibilityLabel={t(bookmarked ? 'map.sheet.bookmarkRemove' : 'map.sheet.bookmark')}
      accessibilityRole="button"
      accessibilityState={{ busy: pending, checked: bookmarked, disabled: pending }}
      disabled={pending}
      hitSlop={10}
      onPress={(event) => {
        event.stopPropagation();
        onToggleBookmark();
      }}
      style={styles.homeBookmarkStar}
    >
      <BookmarkStar onPhoto selected={bookmarked} />
    </Pressable>
    <View style={styles.homeTrendCardBody}>
      <AppText numberOfLines={1} style={styles.homeTrendCardName}>
        {place.name || t('map.sheet.placeMissing')}
      </AppText>
      <AppText numberOfLines={1} style={styles.homeTrendCardDistance}>
        {place.address}
      </AppText>
    </View>
  </Pressable>
  );
};

// The measured row includes its own padding, but excludes SheetInner's inset.
// Keep two columns at every width, including an odd final item.
export const getMapGridCardSize = (rowWidth: number) => {
  const width = Math.max(0, (rowWidth - 2 * 8 - 16) / 2);
  return { width, height: width * 222 / 177 };
};

export const ExpandedPlaceCard = ({
  bookmarked,
  imageUrl,
  onPress,
  onToggleBookmark,
  pending,
  place,
  size,
}: {
  bookmarked: boolean;
  imageUrl?: string;
  onPress: () => void;
  onToggleBookmark: () => void;
  pending: boolean;
  place: RankedPlaceViewModel;
  size?: { width: number; height: number };
}) => {
  const { t } = useTranslation();
  const styles = useMapSheetStyles();
  return (
  <Pressable
    accessibilityLabel={`${place.name}, ${place.address}`}
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.homeGridCard, size ?? styles.fluidHomeGridCard, pressed && styles.pressed]}
  >
    <PlaceArtwork blurBottom={Platform.OS !== 'android'} imageUrl={imageUrl} variant="grid" />
    <CardScrim />
    <Pressable
      accessibilityLabel={t(bookmarked ? 'map.sheet.bookmarkRemove' : 'map.sheet.bookmark')}
      accessibilityRole="button"
      accessibilityState={{ busy: pending, checked: bookmarked, disabled: pending }}
      disabled={pending}
      hitSlop={10}
      onPress={(event) => {
        event.stopPropagation();
        onToggleBookmark();
      }}
      style={styles.homeBookmarkStar}
    >
      <BookmarkStar onPhoto selected={bookmarked} />
    </Pressable>
    <View style={styles.homeGridCardBody}>
      <AppText ellipsizeMode="tail" numberOfLines={2} style={styles.homeGridCardName}>{place.name}</AppText>
      <AppText ellipsizeMode="tail" numberOfLines={1} style={styles.homeGridCardDistance}>{place.address}</AppText>
    </View>
  </Pressable>
  );
};
