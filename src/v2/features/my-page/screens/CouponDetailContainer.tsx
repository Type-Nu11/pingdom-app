import React from 'react';
import { useTranslation } from 'react-i18next';

import { useOffer, type Coupon } from '../../offers-coupons';
import { usePlaceDetail } from '../../place-detail';
import {
  formatCouponInstant,
  formatOfferPeriod,
  isCouponUsable,
} from '../model/couponBoxEntries';
import CouponDetailScreen, { type CouponDetailInfoRow } from './CouponDetailScreen';

export type CouponDetailContainerProps = {
  coupon: Coupon;
  onBack: () => void;
  onReserve: (placeId: number) => void;
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
}: CouponDetailContainerProps) {
  const { i18n, t } = useTranslation();
  const locale = i18n.language;

  const offerQuery = useOffer(coupon.offerId);
  const offer = offerQuery.data;
  const placeQuery = usePlaceDetail(offer?.placeId ?? 0, { enabled: Boolean(offer?.placeId) });
  const placeName = placeQuery.data?.name;

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
