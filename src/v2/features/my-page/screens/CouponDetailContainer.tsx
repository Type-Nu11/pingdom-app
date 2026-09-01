import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { OfferCouponErrorState, useOffer, type Coupon } from '../../offers-coupons';
import { usePlaceDetail } from '../../place-detail';
import { ErrorState, LoadingState } from '../../../shared/components';
import {
  formatCouponInstant,
  formatOfferPeriod,
  isCouponUsable,
} from '../model/couponBoxEntries';
import { useCurrentCoupon } from '../hooks/useCurrentCoupon';
import CouponDetailScreen, { type CouponDetailInfoRow } from './CouponDetailScreen';

export type CouponDetailContainerProps = {
  coupon: Coupon;
  onBack: () => void;
  onReserve: (placeId: number) => void;
  onSignIn?: () => void;
};

/**
 * The current server has no single-Coupon endpoint. Navigation therefore hands
 * off the Coupon returned by `GET /coupons`; Offer and Place queries provide
 * optional presentation data without blocking lifecycle details or the barcode.
 */
export default function CouponDetailContainer({
  coupon,
  onBack,
  onReserve,
  onSignIn,
}: CouponDetailContainerProps) {
  const { i18n, t } = useTranslation();
  const locale = i18n.language;

  const currentCouponQuery = useCurrentCoupon(coupon.id);
  const currentCoupon = currentCouponQuery.coupon;
  const offerQuery = useOffer(currentCoupon?.offerId ?? coupon.offerId);
  const offer = offerQuery.data;
  const placeQuery = usePlaceDetail(offer?.placeId ?? 0, { enabled: Boolean(offer?.placeId) });
  const placeName = placeQuery.data?.name;

  if (currentCouponQuery.isLoading) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <LoadingState description={t('myPage.couponDetail.loading')} fill />
      </Screen>
    );
  }

  if (currentCouponQuery.error) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <OfferCouponErrorState
          error={currentCouponQuery.error}
          fill
          onBack={onBack}
          onRetry={currentCouponQuery.retry}
          onSignIn={onSignIn}
          operation="listCoupons"
          surface="wallet"
        />
      </Screen>
    );
  }

  if (currentCouponQuery.isNotFound || !currentCoupon) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <ErrorState
          actionLabel={t('myPage.back')}
          description={t('myPage.couponDetail.error')}
          fill
          onAction={onBack}
        />
      </Screen>
    );
  }

  const usable = isCouponUsable(currentCoupon.status);
  // A terminal coupon says why it cannot be presented, dated where the server
  // gives a date. `redeemedAt` is nullable even for a REDEEMED coupon.
  const stateNotice = (() => {
    if (usable) return undefined;
    if (currentCoupon.status === 'REDEEMED') {
      return currentCoupon.redeemedAt
        ? t('myPage.couponDetail.redeemedNotice', {
          date: formatCouponInstant(currentCoupon.redeemedAt, locale, { withTime: true }),
        })
        : t('myPage.couponDetail.redeemedNoticeUnknown');
    }
    if (currentCoupon.status === 'EXPIRED') {
      return t('myPage.couponDetail.expiredNotice', {
        date: formatCouponInstant(currentCoupon.expiresAt, locale, { withTime: true }),
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
      code={currentCoupon.code}
      infoRows={infoRows}
      onBack={onBack}
      onReserve={placeId ? () => onReserve(placeId) : undefined}
      periodText={formatOfferPeriod(currentCoupon.issuedAt, currentCoupon.expiresAt, locale)}
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
