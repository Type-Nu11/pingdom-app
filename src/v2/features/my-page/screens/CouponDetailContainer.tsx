import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { OfferCouponErrorState, useCoupon, useOffer } from '../../offers-coupons';
import { ErrorState, LoadingState } from '../../../shared/components';
import {
  formatCouponInstant,
  formatOfferPeriod,
  isCouponUsable,
} from '../model/couponBoxEntries';
import CouponDetailScreen, { type CouponDetailInfoRow } from './CouponDetailScreen';

export type CouponDetailContainerProps = {
  couponId: number;
  onBack: () => void;
  onReserve: (placeId: number) => void;
};

/**
 * `GET /coupons/{couponId}` already carries the offer title, benefit and place
 * name, so the screen renders from one request and reflects a redemption that
 * happened while the user was on this screen. The offer is fetched only for the
 * secondary info rows; it 404s once the merchant closes the offer, which leaves
 * those rows out without breaking the coupon itself.
 */
export default function CouponDetailContainer({
  couponId,
  onBack,
  onReserve,
}: CouponDetailContainerProps) {
  const { i18n, t } = useTranslation();
  const locale = i18n.language;

  const couponQuery = useCoupon(couponId);
  const coupon = couponQuery.data;
  const offerQuery = useOffer(coupon?.offerId ?? 0, { enabled: coupon != null });
  const offer = offerQuery.data;

  if (couponQuery.isLoading) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <LoadingState description={t('myPage.couponDetail.loading')} fill />
      </Screen>
    );
  }

  if (couponQuery.isError) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <OfferCouponErrorState
          error={couponQuery.error}
          fill
          onBack={onBack}
          onRetry={() => void couponQuery.refetch()}
          surface="wallet"
        />
      </Screen>
    );
  }

  if (!coupon) {
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

  if (coupon.placeName) {
    infoRows.push({ label: t('myPage.couponDetail.rows.stores'), value: coupon.placeName });
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

  const placeId = coupon.placeId ?? offer?.placeId;

  return (
    <CouponDetailScreen
      benefit={coupon.benefitDescription || t('myPage.couponBox.fallbackDescription')}
      code={coupon.code}
      infoRows={infoRows}
      onBack={onBack}
      onReserve={placeId ? () => onReserve(placeId) : undefined}
      periodText={formatOfferPeriod(coupon.issuedAt, coupon.expiresAt, locale)}
      placeName={coupon.placeName ?? undefined}
      stateNotice={stateNotice}
      title={coupon.offerTitle || t('myPage.couponBox.fallbackTitle')}
      usable={usable}
    />
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;
