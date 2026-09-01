import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import Button from '../../../shared/components/Button';
import EmptyState from '../../../shared/components/EmptyState';
import LoadingState from '../../../shared/components/LoadingState';
import { formatDate, formatNumber } from '../../../shared/i18n/formatters';
import type { Offer } from '../api/offerCouponApi';
import { useIssueCoupon, useOffers } from '../hooks/useOffersCoupons';
import OfferCouponErrorState from './OfferCouponErrorState';

type PlaceCouponOffersProps = {
  onSignIn?: () => void;
  onViewWallet?: () => void;
  placeId: number;
};

function formatOfferDate(value: string | undefined, language: string): string | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? formatDate(parsed, language) : null;
}

function offerPeriod(offer: Offer, language: string, fallback: string): string {
  const start = formatOfferDate(offer.startsAt, language);
  const end = formatOfferDate(offer.endsAt, language);
  if (start && end) return `${start} – ${end}`;
  return start ?? end ?? fallback;
}

export default function PlaceCouponOffers({
  onSignIn,
  onViewWallet,
  placeId,
}: PlaceCouponOffersProps) {
  const { i18n, t } = useTranslation();
  const offersQuery = useOffers({ limit: 20, placeId }, { enabled: placeId > 0 });
  const issueMutation = useIssueCoupon();
  const submissionLock = useRef<number | null>(null);
  const [issuedOfferId, setIssuedOfferId] = useState<number | null>(null);

  const offers = (offersQuery.data?.offers ?? []).filter(
    (offer): offer is Offer & { id: number } => Number.isSafeInteger(offer.id) && (offer.id ?? 0) > 0,
  );
  const failedOfferId = issueMutation.isError && typeof issueMutation.variables === 'number'
    ? issueMutation.variables
    : null;

  const issue = (offerId: number) => {
    if (submissionLock.current !== null || issueMutation.isPending) return;
    submissionLock.current = offerId;
    issueMutation.mutate(offerId, {
      onSuccess: () => setIssuedOfferId(offerId),
      onSettled: () => {
        submissionLock.current = null;
      },
    });
  };

  if (offersQuery.isPending) {
    return <LoadingState description={t('offerCoupon.place.loading')} />;
  }

  if (offersQuery.isError) {
    return (
      <OfferCouponErrorState
        error={offersQuery.error}
        onRetry={() => void offersQuery.refetch()}
        onSignIn={onSignIn}
        onViewWallet={onViewWallet}
        operation="listOffers"
        surface="placeCta"
      />
    );
  }

  if (offers.length === 0) {
    return (
      <EmptyState
        description={t('offerCoupon.place.emptyDescription')}
        title={t('offerCoupon.place.emptyTitle')}
      />
    );
  }

  return (
    <List accessibilityLiveRegion="polite" testID="v2-place-coupon-offers">
      {offers.map((offer) => {
        const pending = issueMutation.isPending && issueMutation.variables === offer.id;
        const issued = issuedOfferId === offer.id;
        const failed = failedOfferId === offer.id;

        return (
          <OfferCard key={offer.id} testID={`v2-place-coupon-offer-${offer.id}`}>
            <OfferTitle>{offer.title || t('offerCoupon.place.untitled')}</OfferTitle>
            {offer.description ? <OfferDescription>{offer.description}</OfferDescription> : null}
            {offer.benefitDescription ? <Benefit>{offer.benefitDescription}</Benefit> : null}
            <Meta>{t('offerCoupon.place.period', {
              value: offerPeriod(offer, i18n.language, t('offerCoupon.place.periodUnknown')),
            })}</Meta>
            {typeof offer.couponValidityDays === 'number' ? (
              <Meta>{t('offerCoupon.place.validityDays', { count: offer.couponValidityDays })}</Meta>
            ) : null}
            {offer.inventoryPolicy === 'UNLIMITED' ? (
              <Meta>{t('offerCoupon.place.inventoryUnlimited')}</Meta>
            ) : offer.inventoryPolicy === 'LIMITED' && typeof offer.remainingQuantity === 'number' ? (
              <Meta>{t('offerCoupon.place.inventoryRemaining', {
                count: formatNumber(offer.remainingQuantity, i18n.language),
              })}</Meta>
            ) : null}
            {offer.eligibilityPolicy ? (
              <Meta>{t(`offerCoupon.place.eligibility.${offer.eligibilityPolicy}`)}</Meta>
            ) : null}

            {failed ? (
              <OfferCouponErrorState
                error={issueMutation.error}
                onBack={issueMutation.reset}
                onRetry={() => issue(offer.id)}
                onSignIn={onSignIn}
                onViewWallet={onViewWallet}
                operation="issueCoupon"
                surface="placeCta"
              />
            ) : issued ? (
              <SuccessBox>
                <SuccessTitle>{t('offerCoupon.place.successTitle')}</SuccessTitle>
                <SuccessDescription>{t('offerCoupon.place.successDescription')}</SuccessDescription>
                {onViewWallet ? (
                  <Button
                    label={t('offerCoupon.error.actions.viewWallet')}
                    onPress={onViewWallet}
                    size="medium"
                    variant="secondary"
                  />
                ) : null}
              </SuccessBox>
            ) : (
              <Button
                disabled={issueMutation.isPending}
                fullWidth
                label={t('offerCoupon.place.issue')}
                loading={pending}
                onPress={() => issue(offer.id)}
                size="medium"
                testID={`v2-place-coupon-issue-${offer.id}`}
              />
            )}
          </OfferCard>
        );
      })}
    </List>
  );
}

const List = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const OfferCard = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const OfferTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const OfferDescription = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const Benefit = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: 700;
`;

const Meta = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

const SuccessBox = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.successSoft};
`;

const SuccessTitle = styled.Text`
  color: ${({ theme }) => theme.colors.success};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: 700;
`;

const SuccessDescription = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;
