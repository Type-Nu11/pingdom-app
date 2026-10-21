import Skeleton from '../../../../shared/components/Skeleton';
import { Text as AppText } from '../../../../shared/components/Typography';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import { ApiErrorState } from '../../../../shared/components';
import { getApiErrorUx } from '../../../../shared/api';
import { isValidPlaceMenuId, usePlaceMenus } from '../hooks/usePlaceMenus';
import { formatPlaceMenuPrice, selectPlaceMenus } from '../model/placeMenuPresentation';
import type { PlaceMenuPresentation } from '../model/placeMenu.types';
import { useMenuExchangeRate } from '../hooks/useMenuExchangeRate';
import type { MenuExchangeRate } from '../api/menuExchangeRateApi';
import { useProfile } from '../../../user/profile';
import { getMenuExchangeCurrency } from '../model/menuExchangeCurrency';
import { formatCurrency } from '../../../../shared/i18n/formatters';
import PlaceNameTranslation from '../../translation/PlaceNameTranslation';

const API_ERROR_DESCRIPTION_KEYS = {
  canceled: 'common.apiError.generic.description',
  server: 'common.apiError.server.description',
  timeout: 'common.apiError.timeout.description',
  rateLimited: 'common.apiError.rateLimited.description',
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

function MenuImage({ imageUrl, name, expanded = false, onOpen }: { imageUrl: string | null; name: string; expanded?: boolean; onOpen?: () => void }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [imageUrl]);

  if (!imageUrl || failed) {
    return (
      <ImageFallback style={expanded ? { width: 104, height: 104 } : undefined}
        accessibilityLabel={t('placeMenu.accessibility.imageUnavailable', { name })}
        accessibilityRole="image"
      >
        <ImageFallbackText>{t('placeMenu.imageUnavailable')}</ImageFallbackText>
      </ImageFallback>
    );
  }

  const image = (
    <MenuArtwork style={expanded ? { width: 104, height: 104 } : undefined}
      accessibilityLabel={t('placeMenu.accessibility.image', { name })}
      accessibilityRole="image"
      onError={() => setFailed(true)}
      resizeMode="cover"
      source={{ uri: imageUrl }}
    />
  );
  return onOpen ? <Pressable accessibilityRole="button" accessibilityLabel={t('placeProduct.imageDetail', { name })} onPress={onOpen} testID="place-product-photo">{image}</Pressable> : image;
}

function MenuRow({ item, exchange, loading, failed, onRetry, expanded = false, onOpenImage }: {
  expanded?: boolean;
  onOpenImage?: () => void;
  item: PlaceMenuPresentation;
  exchange?: MenuExchangeRate;
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
}) {
  const { t, i18n } = useTranslation();
  const price = formatPlaceMenuPrice(item.priceAmount, item.currency, i18n.language);
  const priceText = price ?? t('placeMenu.priceUnavailable');
  const soldOut = item.status === 'SOLD_OUT';
  const convertible = item.currency === 'KRW' && item.priceAmount !== null;
  const converted = convertible && exchange
    ? formatCurrency(item.priceAmount! * exchange.rate, exchange.quote, i18n.language) : null;

  return (
    <Row $expanded={expanded} testID={`place-menu-${item.id}`}>
      <MenuBody>
        <PlaceNameTranslation original={item.name} description={item.description}
          managementHint={t('placeProduct.translationHint')}
          renderContent={({ name, description, onManage, hint }) => <>
            <MenuName $expanded={expanded} numberOfLines={2}
              accessibilityRole="button" accessibilityHint={hint} onPress={onManage} onLongPress={onManage}
            >{name}</MenuName>
            {description ? <MenuDescription $expanded={expanded} numberOfLines={3}
              accessibilityRole="button" accessibilityHint={hint} onPress={onManage} onLongPress={onManage}
            >{description}</MenuDescription> : null}
          </>}
        />
        <MenuPrice $expanded={expanded}
          accessibilityLabel={t('placeMenu.accessibility.price', { price: priceText })}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          numberOfLines={1}
        >
          {priceText}
        </MenuPrice>
        {convertible && converted ? (
          <ConversionText accessibilityLiveRegion="polite" testID={`place-menu-converted-${item.id}`}>
            {t('placeMenu.exchange.amount', { price: converted })}
          </ConversionText>
        ) : convertible && failed ? (
          <ConversionButton accessibilityRole="button" onPress={onRetry} accessibilityLabel={t('placeMenu.exchange.retry')}>
            <ConversionText>{t('placeMenu.exchange.retry')}</ConversionText>
          </ConversionButton>
        ) : convertible && loading ? (
          <ConversionText accessibilityLiveRegion="polite">{t('placeMenu.exchange.loading')}</ConversionText>
        ) : null}
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
      <MenuImage imageUrl={item.imageUrl} name={item.name} expanded={expanded} onOpen={onOpenImage} />
    </Row>
  );
}

export default function PlaceMenuSection({ placeId, presentation = 'default', onOpenImages }: { placeId: number; presentation?: 'default' | 'mapDetail'; onOpenImages?: (imageUrls: string[], initialIndex: number) => void }) {
  const { t } = useTranslation();
  const expanded = presentation === 'mapDetail';
  const query = usePlaceMenus(placeId);
  const menus = useMemo(() => selectPlaceMenus(query.data), [query.data]);
  const images = [...new Set(menus.flatMap(menu => menu.imageUrl ? [menu.imageUrl] : []))];
  const { profile } = useProfile({ enabled: isValidPlaceMenuId(placeId) && menus.length > 0 });
  const currency = getMenuExchangeCurrency(profile?.country);
  const hasConversion = currency !== null && menus.some((menu) => menu.currency === 'KRW' && menu.priceAmount !== null);
  const exchange = useMenuExchangeRate(currency, hasConversion);

  if (!isValidPlaceMenuId(placeId)) return null;

  if (query.isPending) {
    return (
      <Section $expanded={expanded} accessibilityRole="summary" testID="place-menu-loading">
        <SectionTitle $expanded={expanded}>{t(expanded ? 'placeProduct.title' : 'placeMenu.title')}</SectionTitle>
        <Skeleton variant="menu" count={expanded ? 3 : 2} accessibilityLabel={t('placeMenu.loading')} />
      </Section>
    );
  }

  if (query.isError && !menus.length) {
    const ux = getApiErrorUx(query.error);
    if (ux.kind === 'canceled') return null;
    return (
      <Section $expanded={expanded} accessibilityRole="summary" testID="place-menu-error">
        <SectionTitle $expanded={expanded}>{t(expanded ? 'placeProduct.title' : 'placeMenu.title')}</SectionTitle>
        <StateText accessibilityLiveRegion="polite">{t('placeMenu.error.title')}</StateText>
        <ErrorDescription>{t(API_ERROR_DESCRIPTION_KEYS[ux.kind])}</ErrorDescription>
        {ux.action === 'retry' || ux.kind === 'notFound' ? <RetryButton
          disabled={query.isFetching}
          accessibilityState={{ busy: query.isFetching, disabled: query.isFetching }}
          accessibilityLabel={t('placeMenu.retry')}
          accessibilityRole="button"
          onPress={() => void query.refetch({ cancelRefetch: false })}
        >
          <RetryText>{t('placeMenu.retry')}</RetryText>
        </RetryButton> : null}
      </Section>
    );
  }

  if (!menus.length) {
    return (
      <Section $expanded={expanded} accessibilityRole="summary" testID="place-menu-empty">
        <SectionTitle $expanded={expanded}>{t(expanded ? 'placeProduct.title' : 'placeMenu.title')}</SectionTitle>
        <EmptyText accessibilityLiveRegion="polite">{t('placeMenu.empty')}</EmptyText>
      </Section>
    );
  }

  return (
    <Section $expanded={expanded} accessibilityRole="summary" testID="place-menu-section">
      <SectionTitle $expanded={expanded}>{t(expanded ? 'placeProduct.title' : 'placeMenu.title')}</SectionTitle>
      {query.isError ? <ApiErrorState error={query.error} busy={query.isFetching} onRetry={() => query.refetch({ cancelRefetch: false })} /> : null}
      {menus.map((menu) => <MenuRow expanded={expanded} item={menu} key={menu.id}
        onOpenImage={menu.imageUrl && onOpenImages ? () => onOpenImages(images, images.indexOf(menu.imageUrl!)) : undefined}
        exchange={hasConversion ? exchange.data : undefined}
        loading={hasConversion && exchange.isPending}
        failed={hasConversion && exchange.isError}
        onRetry={() => void exchange.refetch()}
      />)}
    </Section>
  );
}

const Section = styled.View<{ $expanded: boolean }>`
  border-top-color: ${({ theme }) => theme.colors.backgroundNeutral};
  border-top-width: 8px;
  padding: ${({ $expanded }) => $expanded ? 16 : 20}px 24px;
`;

const SectionTitle = styled(AppText)<{ $expanded: boolean }>`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme, $expanded }) => $expanded ? 18 : theme.typography.label.fontSize}px;
  font-weight: ${({ theme, $expanded }) => $expanded ? 700 : theme.typography.label.fontWeight};
`;

const StateRow = styled.View`
  align-items: center;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding-vertical: ${({ theme }) => theme.spacing.lg}px;
`;

const StateText = styled(AppText)`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

const EmptyText = styled(AppText)`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
  padding-vertical: ${({ theme }) => theme.spacing.lg}px;
`;

const ErrorDescription = styled(AppText)`
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

const RetryText = styled(AppText)`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const Row = styled.View<{ $expanded: boolean }>`
  align-items: center;
  border-bottom-color: ${({ theme }) => theme.colors.border};
  border-bottom-width: 1px;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
  min-height: ${({ $expanded }) => $expanded ? 136 : 128}px;
  padding-vertical: ${({ $expanded }) => $expanded ? 16 : 14}px;
`;

const MenuBody = styled.View`
  flex: 1;
  min-width: 0;
`;

const MenuName = styled(AppText)<{ $expanded: boolean }>`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ $expanded }) => $expanded ? 18 : 14}px;
  font-weight: ${({ theme, $expanded }) => $expanded ? 700 : theme.typography.label.fontWeight};
  line-height: ${({ theme, $expanded }) => $expanded ? 24 : theme.typography.label.lineHeight}px;
`;

const MenuDescription = styled(AppText)<{ $expanded: boolean }>`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ $expanded }) => $expanded ? 16 : 13}px;
  line-height: ${({ $expanded }) => $expanded ? 21 : 18}px;
  margin-top: ${({ theme, $expanded }) => $expanded ? 8 : theme.spacing.xs}px;
`;

const MenuPrice = styled(AppText)<{ $expanded: boolean }>`
  color: ${({ theme }) => theme.colors.textStrong};
  flex-shrink: 1;
  font-size: ${({ $expanded }) => $expanded ? 16 : 14}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

const ConversionButton = styled.Pressable`
  align-self: flex-start;
  min-height: 44px;
  justify-content: center;
`;

const ConversionText = styled(AppText)`
  margin-top: 3px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;

const SoldOut = styled(AppText)`
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

const ImageFallbackText = styled(AppText)`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  text-align: center;
`;
