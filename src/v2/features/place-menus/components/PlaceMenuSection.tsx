import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import { getApiErrorUx } from '../../../shared/api';
import { isValidPlaceMenuId, usePlaceMenus } from '../hooks/usePlaceMenus';
import { formatPlaceMenuPrice, selectPlaceMenus } from '../model/placeMenuPresentation';
import type { PlaceMenuPresentation } from '../model/placeMenu.types';

const API_ERROR_DESCRIPTION_KEYS = {
  authentication: 'common.apiError.authentication.description',
  authorization: 'common.apiError.authorization.description',
  conflict: 'common.apiError.conflict.description',
  expired: 'common.apiError.expired.description',
  generic: 'common.apiError.generic.description',
  network: 'common.apiError.network.description',
  notFound: 'placeMenu.error.notFound',
  outOfRange: 'common.apiError.outOfRange.description',
  updateRequired: 'common.apiError.updateRequired.description',
  validation: 'common.apiError.validation.description',
} as const;

function MenuImage({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [imageUrl]);

  if (!imageUrl || failed) {
    return (
      <ImageFallback
        accessibilityLabel={t('placeMenu.accessibility.imageUnavailable', { name })}
        accessibilityRole="image"
      >
        <ImageFallbackText>{t('placeMenu.imageUnavailable')}</ImageFallbackText>
      </ImageFallback>
    );
  }

  return (
    <MenuArtwork
      accessibilityLabel={t('placeMenu.accessibility.image', { name })}
      accessibilityRole="image"
      onError={() => setFailed(true)}
      resizeMode="cover"
      source={{ uri: imageUrl }}
    />
  );
}

function MenuRow({ item }: { item: PlaceMenuPresentation }) {
  const { t, i18n } = useTranslation();
  const price = formatPlaceMenuPrice(item.priceAmount, item.currency, i18n.language);
  const priceText = price ?? t('placeMenu.priceUnavailable');
  const soldOut = item.status === 'SOLD_OUT';

  return (
    <Row testID={`place-menu-${item.id}`}>
      <MenuBody>
        <MenuName numberOfLines={2}>{item.name}</MenuName>
        {item.description ? (
          <MenuDescription numberOfLines={3}>{item.description}</MenuDescription>
        ) : null}
        <MenuPrice
          accessibilityLabel={t('placeMenu.accessibility.price', { price: priceText })}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          numberOfLines={1}
        >
          {priceText}
        </MenuPrice>
        {soldOut ? (
          <SoldOut
            accessibilityLabel={t('placeMenu.accessibility.status', {
              name: item.name,
              status: t('placeMenu.soldOut'),
            })}
            accessibilityLiveRegion="polite"
          >
            {t('placeMenu.soldOut')}
          </SoldOut>
        ) : null}
      </MenuBody>
      <MenuImage imageUrl={item.imageUrl} name={item.name} />
    </Row>
  );
}

export default function PlaceMenuSection({ placeId }: { placeId: number }) {
  const { t } = useTranslation();
  const query = usePlaceMenus(placeId);
  const menus = useMemo(() => selectPlaceMenus(query.data), [query.data]);

  if (!isValidPlaceMenuId(placeId)) return null;

  if (query.isPending) {
    return (
      <Section accessibilityRole="summary" testID="place-menu-loading">
        <SectionTitle>{t('placeMenu.title')}</SectionTitle>
        <StateRow accessibilityLiveRegion="polite">
          <ActivityIndicator accessibilityLabel={t('placeMenu.loading')} />
          <StateText>{t('placeMenu.loading')}</StateText>
        </StateRow>
      </Section>
    );
  }

  if (query.isError) {
    const ux = getApiErrorUx(query.error);
    return (
      <Section accessibilityRole="summary" testID="place-menu-error">
        <SectionTitle>{t('placeMenu.title')}</SectionTitle>
        <StateText accessibilityLiveRegion="polite">{t('placeMenu.error.title')}</StateText>
        <ErrorDescription>{t(API_ERROR_DESCRIPTION_KEYS[ux.kind])}</ErrorDescription>
        <RetryButton
          accessibilityLabel={t('placeMenu.retry')}
          accessibilityRole="button"
          onPress={() => void query.refetch()}
        >
          <RetryText>{t('placeMenu.retry')}</RetryText>
        </RetryButton>
      </Section>
    );
  }

  if (!menus.length) {
    return (
      <Section accessibilityRole="summary" testID="place-menu-empty">
        <SectionTitle>{t('placeMenu.title')}</SectionTitle>
        <EmptyText accessibilityLiveRegion="polite">{t('placeMenu.empty')}</EmptyText>
      </Section>
    );
  }

  return (
    <Section accessibilityRole="summary" testID="place-menu-section">
      <SectionTitle>{t('placeMenu.title')}</SectionTitle>
      {menus.map((menu) => <MenuRow item={menu} key={menu.id} />)}
    </Section>
  );
}

const Section = styled.View`
  border-bottom-color: ${({ theme }) => theme.colors.border};
  border-bottom-width: 1px;
  padding: 20px 24px;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const StateRow = styled.View`
  align-items: center;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding-vertical: ${({ theme }) => theme.spacing.lg}px;
`;

const StateText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

const EmptyText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  padding-vertical: ${({ theme }) => theme.spacing.lg}px;
`;

const ErrorDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

const RetryButton = styled.Pressable`
  align-items: center;
  align-self: flex-start;
  border-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radius.full}px;
  border-width: 1px;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  min-height: 40px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
`;

const RetryText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const Row = styled.View`
  align-items: center;
  border-bottom-color: ${({ theme }) => theme.colors.border};
  border-bottom-width: 1px;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
  min-height: 128px;
  padding-vertical: 14px;
`;

const MenuBody = styled.View`
  flex: 1;
  min-width: 0;
`;

const MenuName = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 14px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  line-height: ${({ theme }) => theme.typography.label.lineHeight}px;
`;

const MenuDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  line-height: 18px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

const MenuPrice = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  flex-shrink: 1;
  font-size: 14px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

const SoldOut = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

const MenuArtwork = styled.Image`
  border-radius: 12px;
  height: 96px;
  width: 100px;
`;

const ImageFallback = styled.View`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.backgroundNeutral};
  border-radius: 12px;
  height: 96px;
  justify-content: center;
  padding-horizontal: ${({ theme }) => theme.spacing.xs}px;
  width: 100px;
`;

const ImageFallbackText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  text-align: center;
`;
