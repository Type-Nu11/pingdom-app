import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { useOffer, type Coupon } from '../../offers-coupons';
import { usePlaceDetail } from '../../place-detail/hooks/usePlaceDetail';
import { ErrorState, LoadingState } from '../../../shared/components';
import { formatCouponDateRange, isCouponUsable } from '../model/couponBoxEntries';
import CouponDetailScreen, { type CouponDetailInfoRow } from './CouponDetailScreen';

export type CouponDetailContainerProps = {
  coupon: Coupon;
  onBack: () => void;
  onReserve: (placeId: number) => void;
};

/**
 * Joins a coupon (passed from the box — there is no `GET /coupons/{id}`) to its
 * offer and place for the detail view. The offer supplies the title, benefit and
 * usage copy; the place supplies the store name. Rows the server does not model
 * fall back to localized defaults so the screen still matches the design.
 */
export default function CouponDetailContainer({
  coupon,
  onBack,
  onReserve,
}: CouponDetailContainerProps) {
  const { i18n, t } = useTranslation();
  const locale = i18n.language;

  const offerQuery = useOffer(coupon.offerId);
  const offer = offerQuery.data;
  const placeQuery = usePlaceDetail(offer?.placeId ?? 0, { enabled: Boolean(offer?.placeId) });
  const place = placeQuery.data;

  if (offerQuery.isLoading) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <LoadingState description={t('myPage.couponDetail.loading')} fill />
      </Screen>
    );
  }

  if (offerQuery.isError) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <ErrorState
          actionLabel={t('myPage.retry')}
          description={t('myPage.couponDetail.error')}
          fill
          onAction={() => void offerQuery.refetch()}
        />
      </Screen>
    );
  }

  const title = offer?.title || t('myPage.couponBox.fallbackTitle');
  const benefit = offer?.benefitDescription || t('myPage.couponBox.fallbackDescription');

  const infoRows: CouponDetailInfoRow[] = [
    {
      label: t('myPage.couponDetail.rows.stores'),
      value: place?.name || t('myPage.couponDetail.defaults.stores'),
    },
    {
      label: t('myPage.couponDetail.rows.usage'),
      value: offer?.description || t('myPage.couponDetail.defaults.usage'),
    },
    {
      label: t('myPage.couponDetail.rows.period'),
      value: formatCouponDateRange(coupon.issuedAt, coupon.expiresAt, locale, { weekday: true }),
    },
    {
      // The server has no per-offer usage condition; the benefit line above
      // already carries `benefitDescription`, so repeating it here would just
      // print the same sentence twice.
      label: t('myPage.couponDetail.rows.condition'),
      value: t('myPage.couponDetail.defaults.condition'),
    },
    {
      label: t('myPage.couponDetail.rows.exclusion'),
      value: t('myPage.couponDetail.defaults.exclusion'),
    },
  ];

  return (
    <CouponDetailScreen
      benefit={benefit}
      code={coupon.code}
      infoRows={infoRows}
      onBack={onBack}
      onReserve={offer ? () => onReserve(offer.placeId) : undefined}
      periodText={formatCouponDateRange(coupon.issuedAt, coupon.expiresAt, locale)}
      placeName={place?.name}
      reservable={isCouponUsable(coupon.status)}
      title={title}
    />
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;
