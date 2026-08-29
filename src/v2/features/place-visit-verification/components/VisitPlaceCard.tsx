import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import PhotoIcon from '../../../../assets/v2/icons/edit/image.svg';
import type { VisitVerificationCandidate } from '../hooks/useVisitVerificationCandidates';

type Props = {
  candidate: VisitVerificationCandidate;
  onPress: () => void;
};

function PlacePhoto({ index, name, url }: { index: number; name: string; url?: string }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  if (!url || failed) {
    return <PhotoFallback testID="visit-place-image-fallback"><PhotoIcon height={28} width={28} /></PhotoFallback>;
  }
  return (
    <Photo
      accessibilityLabel={t('visitVerification.placePhoto', { index: index + 1, name })}
      onError={() => setFailed(true)}
      source={{ uri: url }}
      testID="visit-place-image"
    />
  );
}

export default function VisitPlaceCard({ candidate, onPress }: Props) {
  const { t } = useTranslation();
  const distance = candidate.distanceMeters >= 1_000
    ? t('visitVerification.distanceKm', { value: (candidate.distanceMeters / 1_000).toFixed(1) })
    : t('visitVerification.distanceMeters', { value: Math.round(candidate.distanceMeters) });
  if (candidate.status === 'loading') {
    return <LoadingCard testID="visit-place-loading"><StateText>{t('visitVerification.placeLoading')}</StateText></LoadingCard>;
  }
  if (candidate.status === 'error') {
    return (
      <LoadingCard testID="visit-place-error">
        <StateText>{t('visitVerification.placeError')}</StateText>
        <Retry accessibilityRole="button" onPress={candidate.retry}><RetryText>{t('visitVerification.retry')}</RetryText></Retry>
      </LoadingCard>
    );
  }

  return (
    <Card accessibilityRole="button" onPress={onPress} testID={`visit-place-${candidate.checkInId}`}>
      <Heading>
        <Copy>
          <TitleRow><Name numberOfLines={1}>{candidate.name}</Name><Category numberOfLines={1}>{candidate.category ?? t('visitVerification.unknownCategory')}</Category></TitleRow>
          <Meta numberOfLines={1}>{distance} · {candidate.address}</Meta>
        </Copy>
        <Affordance accessibilityElementsHidden>⋮</Affordance>
      </Heading>
      <Images>
        {(candidate.imageUrls.length ? candidate.imageUrls : [undefined]).map((url, index) => (
          <PlacePhoto index={index} key={url ?? 'fallback'} name={candidate.name} url={url} />
        ))}
      </Images>
    </Card>
  );
}

const Card = styled.Pressable`padding: ${({ theme }) => theme.spacing.md}px 0; border-bottom-width: 1px; border-bottom-color: ${({ theme }) => theme.colors.border};`;
const Heading = styled.View`flex-direction: row; align-items: flex-start; margin-bottom: ${({ theme }) => theme.spacing.sm}px;`;
const Copy = styled.View`flex: 1; min-width: 0;`;
const TitleRow = styled.View`flex-direction: row; align-items: baseline; gap: ${({ theme }) => theme.spacing.xs}px;`;
const Name = styled.Text`flex-shrink: 1; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight};`;
const Category = styled.Text`flex-shrink: 0; max-width: 36%; color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const Meta = styled.Text`margin-top: 2px; color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const Affordance = styled.Text`width: ${({ theme }) => theme.spacing.lg}px; text-align: right; color: ${({ theme }) => theme.colors.text};`;
const Images = styled.View`height: 86px; flex-direction: row; gap: 2px; overflow: hidden; border-radius: ${({ theme }) => theme.radius.md}px;`;
const Photo = styled(Image)`flex: 1; height: 86px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const PhotoFallback = styled.View`flex: 1; height: 86px; align-items: center; justify-content: center; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const LoadingCard = styled.View`min-height: 104px; align-items: center; justify-content: center; gap: ${({ theme }) => theme.spacing.sm}px; border-bottom-width: 1px; border-bottom-color: ${({ theme }) => theme.colors.border};`;
const StateText = styled.Text`color: ${({ theme }) => theme.colors.textMuted};`;
const Retry = styled.Pressable`min-height: 40px; justify-content: center; padding: 0 ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primarySoft};`;
const RetryText = styled.Text`color: ${({ theme }) => theme.colors.primary}; font-weight: ${({ theme }) => theme.typography.label.fontWeight};`;
