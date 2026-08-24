import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import type { MapPlaceCardViewModel, MapPlaceSupportTag } from '../model/mapDiscovery';

type Props = {
  error: unknown;
  loading: boolean;
  onDismiss: () => void;
  onDirections: (place: MapPlaceCardViewModel) => void;
  onOpenPlace: (placeId: number) => void;
  onReserve: (placeId: number) => void;
  onRetry: () => void;
  onShare: (place: MapPlaceCardViewModel) => void;
  place: MapPlaceCardViewModel | null;
  selectedPlaceId: number | null;
  visible: boolean;
};

const SUPPORT_ICON: Record<MapPlaceSupportTag, string> = {
  coupon: '🎟', english: '🌐', englishMenu: 'A', foreignCard: '💳', reservation: '✓', wifi: '⌁',
};

export default function MapSelectedPlaceCard(props: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  if (!props.visible) return null;
  const matchingPlace = props.place?.id === props.selectedPlaceId ? props.place : null;

  return (
    <Sheet accessibilityLiveRegion="polite" testID="v2-selected-place">
      <Handle />
      {props.loading || (!props.error && !matchingPlace) ? (
        <CardState><ActivityIndicator color={theme.colors.primary} /><BodyText>{t('map.card.loading')}</BodyText></CardState>
      ) : props.error ? (
        <CardState>
          <BodyText>{t('map.card.error')}</BodyText>
          <RetryButton accessibilityRole="button" onPress={props.onRetry} testID="v2-selected-place-retry">
            <RetryLabel>{t('map.data.retry')}</RetryLabel>
          </RetryButton>
        </CardState>
      ) : matchingPlace ? <Content {...props} place={matchingPlace} /> : null}
    </Sheet>
  );
}

function Content({ onDirections, onDismiss, onOpenPlace, onReserve, onShare, place }: Pick<Props, 'onDirections' | 'onDismiss' | 'onOpenPlace' | 'onReserve' | 'onShare'> & { place: MapPlaceCardViewModel }) {
  const { t } = useTranslation();
  const [favorite, setFavorite] = useState(false);
  const tags = place.supportTags ?? [];
  const images = place.imageUrls?.length ? place.imageUrls : place.imageUrl ? [place.imageUrl] : [];
  useEffect(() => setFavorite(false), [place.id]);

  return (
    <>
      <HeadingRow>
        <OpenDetails accessibilityHint={t('map.card.openHint')} accessibilityRole="button" onPress={() => onOpenPlace(place.id)} testID="v2-selected-place-open">
          <TitleLine><Name numberOfLines={1}>{place.name}</Name><Category numberOfLines={1}>{place.category}</Category></TitleLine>
          <Meta numberOfLines={1}>{place.distanceMeters !== null ? `${formatDistance(place.distanceMeters)} · ` : ''}{place.address}</Meta>
          <Operating $open={place.currentlyOperating === true}>
            {place.currentlyOperating === null ? t('map.card.statusUnknown') : place.currentlyOperating ? t('map.card.open') : t('map.card.closed')}
          </Operating>
        </OpenDetails>
        <CircleButton accessibilityLabel={t('map.card.favorite')} accessibilityRole="button" accessibilityState={{ selected: favorite }} onPress={() => setFavorite((value) => !value)}>
          <Favorite $selected={favorite}>★</Favorite>
        </CircleButton>
        <CircleButton accessibilityLabel={t('map.card.dismiss')} accessibilityRole="button" onPress={onDismiss} testID="v2-selected-place-dismiss"><CircleLabel>×</CircleLabel></CircleButton>
      </HeadingRow>

      {tags.length > 0 ? (
        <SupportScroll horizontal showsHorizontalScrollIndicator={false} testID="v2-place-support-tags">
          {tags.map((tag) => <SupportChip key={tag}><SupportIcon>{SUPPORT_ICON[tag]}</SupportIcon><SupportLabel>{t(`map.card.support.${tag}`)}</SupportLabel></SupportChip>)}
        </SupportScroll>
      ) : null}

      <Actions horizontal showsHorizontalScrollIndicator={false}>
        <PrimaryAction accessibilityRole="button" onPress={() => onDirections(place)}><PrimaryActionText>⌁ {t('map.card.actions.start')}</PrimaryActionText></PrimaryAction>
        <ActionChip accessibilityRole="button" onPress={() => onDirections(place)}><ActionText>◎ {t('map.card.actions.arrive')}</ActionText></ActionChip>
        <ActionChip accessibilityRole="button" onPress={() => onShare(place)}><ActionText>↗ {t('map.card.actions.share')}</ActionText></ActionChip>
        <ActionChip accessibilityRole="button" onPress={() => onReserve(place.id)} testID="v2-selected-place-reserve"><ActionText>⌂ {t('map.card.actions.reserve')}</ActionText></ActionChip>
        <ActionChip accessibilityRole="button" onPress={() => onDirections(place)}><ActionText>▷ {t('map.card.actions.directions')}</ActionText></ActionChip>
      </Actions>

      {place.summary ? <Summary numberOfLines={2}>{place.summary}</Summary> : null}
      {place.notice ? <Notice numberOfLines={2}>{place.notice}</Notice> : null}
      <Gallery horizontal showsHorizontalScrollIndicator={false}>
        {images.length ? images.map((url, index) => <PlaceImage imageUrl={url} key={`${url}-${index}`} name={place.name} />) : <PlaceImage imageUrl={null} name={place.name} />}
      </Gallery>
    </>
  );
}

function formatDistance(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}km` : `${Math.round(value)}m`;
}

function PlaceImage({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [imageUrl]);
  if (!imageUrl || failed) return <ImageFallback testID="v2-selected-place-image-fallback"><ImageFallbackText>{t('map.card.imageUnavailable')}</ImageFallbackText></ImageFallback>;
  return <Photo accessibilityLabel={t('map.card.imageLabel', { name })} onError={() => setFailed(true)} source={{ uri: imageUrl }} testID="v2-selected-place-image" />;
}

const Sheet = styled.View`
  position: absolute; right: 0; bottom: 0; left: 0; max-height: 58%;
  padding: ${({ theme }) => theme.spacing.sm}px 0 ${({ theme }) => theme.spacing.md}px;
  border-top-left-radius: ${({ theme }) => theme.radius.lg}px;
  border-top-right-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
  shadow-color: #000000; shadow-opacity: 0.12; shadow-radius: 14px; elevation: 10;
`;
const Handle = styled.View`width: 64px; height: 5px; align-self: center; margin-bottom: ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.disabled};`;
const CardState = styled.View`min-height: 180px; align-items: center; justify-content: center; gap: ${({ theme }) => theme.spacing.sm}px;`;
const HeadingRow = styled.View`flex-direction: row; align-items: flex-start; gap: ${({ theme }) => theme.spacing.sm}px; padding: 0 ${({ theme }) => theme.spacing.md}px;`;
const OpenDetails = styled.Pressable`flex: 1;`;
const TitleLine = styled.View`flex-direction: row; align-items: baseline; gap: ${({ theme }) => theme.spacing.xs}px;`;
const Name = styled.Text`max-width: 75%; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.title.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight};`;
const Category = styled.Text`flex: 1; color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.body.fontSize}px;`;
const Meta = styled.Text`margin-top: 2px; color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const Operating = styled.Text<{ $open: boolean }>`margin-top: 2px; color: ${({ $open, theme }) => $open ? theme.colors.success : theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: ${({ theme }) => theme.typography.label.fontWeight};`;
const CircleButton = styled.Pressable`width: 40px; height: 40px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const CircleLabel = styled.Text`color: ${({ theme }) => theme.colors.textMuted}; font-size: 28px; line-height: 30px;`;
const Favorite = styled.Text<{ $selected: boolean }>`color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.textDisabled}; font-size: 20px;`;
const SupportScroll = styled.ScrollView`flex-grow: 0; margin-top: ${({ theme }) => theme.spacing.md}px; padding-left: ${({ theme }) => theme.spacing.md}px;`;
const SupportChip = styled.View`min-height: 40px; flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.xs}px; margin-right: ${({ theme }) => theme.spacing.sm}px; padding: 0 ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const SupportIcon = styled.Text`color: ${({ theme }) => theme.colors.primary}; font-size: ${({ theme }) => theme.typography.body.fontSize}px;`;
const SupportLabel = styled.Text`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.label.fontSize}px;`;
const Actions = styled.ScrollView`flex-grow: 0; margin-top: ${({ theme }) => theme.spacing.md}px; padding-left: ${({ theme }) => theme.spacing.md}px;`;
const ActionChip = styled.Pressable`min-height: 42px; justify-content: center; margin-right: ${({ theme }) => theme.spacing.sm}px; padding: 0 ${({ theme }) => theme.spacing.md}px; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.surface};`;
const PrimaryAction = styled(ActionChip)`border-color: ${({ theme }) => theme.colors.primary};`;
const ActionText = styled.Text`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.label.fontSize}px;`;
const PrimaryActionText = styled(ActionText)`color: ${({ theme }) => theme.colors.primary};`;
const Summary = styled.Text`margin: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.md}px 0; color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const Notice = styled.Text`margin: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px 0; color: ${({ theme }) => theme.colors.warning}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const Gallery = styled.ScrollView`flex-grow: 0; margin-top: ${({ theme }) => theme.spacing.md}px; padding-left: ${({ theme }) => theme.spacing.md}px;`;
const Photo = styled(Image)`width: 292px; height: 180px; margin-right: ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const ImageFallback = styled.View`width: 292px; height: 180px; align-items: center; justify-content: center; margin-right: ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const ImageFallbackText = styled.Text`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const BodyText = styled.Text`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const RetryButton = styled.Pressable`padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primarySoft};`;
const RetryLabel = styled.Text`color: ${({ theme }) => theme.colors.primary}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: ${({ theme }) => theme.typography.label.fontWeight};`;
