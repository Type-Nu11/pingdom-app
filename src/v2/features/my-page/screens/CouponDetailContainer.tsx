import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { useCoupon, useOffer, type Coupon } from '../../offers-coupons';
import { usePlaceDetail } from '../../place-detail';
import { ErrorState, LoadingState } from '../../../shared/components';
import {
  formatCouponInstant,
  formatOfferPeriod,
  isCouponUsable,
} from '../model/couponBoxEntries';
import CouponDetailScreen, { type CouponDetailInfoRow } from './CouponDetailScreen';

type CouponDetailContainerCommonProps = {
  onBack: () => void;
  onReserve: (placeId: number) => void;
};

export type CouponDetailContainerProps = CouponDetailContainerCommonProps & (
  | { couponId: number }
  // Temporary application-composition compatibility for the legacy navigator.
  // Only the id is consumed; lifecycle and code are always re-read from V2 API.
  | { coupon: Coupon }
);

/**
 * The current server has no single-Coupon endpoint. `useCoupon` resolves the
 * navigation id from the paginated authenticated list and revalidates it on
 * mount and foreground return. Offer and Place remain optional presentation
 * data and never supply the security-sensitive code or lifecycle status.
 */
export default function CouponDetailContainer(props: CouponDetailContainerProps) {
  const { onBack, onReserve } = props;
  const couponId = 'coupon' in props ? props.coupon.id : props.couponId;
  const { i18n, t } = useTranslation();
  const locale = i18n.language;

  const couponQuery = useCoupon(couponId);
  const coupon = couponQuery.data;
  const offerQuery = useOffer(coupon?.offerId ?? 0, { enabled: coupon != null });
  const offer = offerQuery.data;
  const placeQuery = usePlaceDetail(offer?.placeId ?? 0, { enabled: Boolean(offer?.placeId) });
  const placeName = placeQuery.data?.name;

  if (couponQuery.isLoading) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <LoadingState description={t('myPage.couponDetail.loading')} fill />
      </Screen>
    );
  }

  if (couponQuery.isError || !coupon) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <ErrorState
          actionLabel={t('myPage.retry')}
          description={t('myPage.couponDetail.error')}
          fill
          onAction={() => void couponQuery.refetch()}
        />
      </Screen>
    );
  }

  const usable = isCouponUsable(coupon.status);
  // A terminal coupon says why it cannot be presented, dated where the server
  // gives a date. `redeemedAt` is nullable even for a REDEEMED coupon.
  const stateNotice = (() => {
    if (usable) return undefined;
    if (coupon.status === 'REDEEMED') {
      return coupon.redeemedAt
        ? t('myPage.couponDetail.redeemedNotice', {
          date: formatCouponInstant(coupon.redeemedAt, locale, { withTime: true }),
        })
        : t('myPage.couponDetail.redeemedNoticeUnknown');
    }
    if (coupon.status === 'EXPIRED') {
      return t('myPage.couponDetail.expiredNotice', {
        date: formatCouponInstant(coupon.expiresAt, locale, { withTime: true }),
      });
    }
    return t('myPage.couponDetail.unavailable');
  })();

  // Every row is server data the merchant registered on the offer. A row the
  // server has nothing for is dropped rather than filled with invented copy.
  const infoRows: CouponDetailInfoRow[] = [];

  if (placeName) {
    infoRows.push({ label: t('myPage.couponDetail.rows.stores'), value: placeName });
  }
  if (offer?.description) {
    infoRows.push({ label: t('myPage.couponDetail.rows.usage'), value: offer.description });
  }
  const offerPeriod = formatOfferPeriod(offer?.startsAt, offer?.endsAt, locale, { weekday: true });
  if (offerPeriod) {
    infoRows.push({ label: t('myPage.couponDetail.rows.period'), value: offerPeriod });
  }
  if (offer?.couponValidityDays) {
    infoRows.push({
      label: t('myPage.couponDetail.rows.validity'),
      value: t('myPage.couponDetail.validityDays', { count: offer.couponValidityDays }),
    });
  }
  if (offer?.eligibilityPolicy) {
    infoRows.push({
      label: t('myPage.couponDetail.rows.eligibility'),
      value: t(`myPage.couponDetail.eligibility.${offer.eligibilityPolicy}`),
    });
  }

  const placeId = offer?.placeId;

  return (
    <CouponDetailScreen
      benefit={offer?.benefitDescription || t('myPage.couponBox.fallbackDescription')}
      code={coupon.code}
      infoRows={infoRows}
      onBack={onBack}
      onReserve={placeId ? () => onReserve(placeId) : undefined}
      periodText={formatOfferPeriod(coupon.issuedAt, coupon.expiresAt, locale)}
      placeName={placeName}
      stateNotice={stateNotice}
      title={offer?.title || t('myPage.couponBox.fallbackTitle')}
      usable={usable}
    />
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;
