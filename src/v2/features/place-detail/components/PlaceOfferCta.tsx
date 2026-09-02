import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import { Button, StatusBadge } from '../../../shared/components';
import type { Offer, OfferIssuanceView } from '../../offers-coupons';

export type PlaceOfferCtaProps = {
  issuance: OfferIssuanceView;
  offer: Offer;
  /** Omitted until issuing is wired up; the CTA then renders as unavailable. */
  onIssue?: () => void;
};

/**
 * The coupon CTA on a place detail screen.
 *
 * Every server state reaches this component through `getOfferIssuanceView`, so
 * the button label, the badge, and the stock line all move together and no
 * server enum is interpolated into a translation key here.
 */
export default function PlaceOfferCta({ issuance, offer, onIssue }: PlaceOfferCtaProps) {
  const { t } = useTranslation();
  const { remaining, statusView } = issuance;

  return (
    <Section testID="v2-place-offer-cta">
      <SectionTitle>{t('placeDetail.offer.title')}</SectionTitle>
      {/*
        `StatusBadge` announces its label verbatim, so the tone symbol stays out
        of it: the badge already pairs its colour with the status text.
      */}
      <StatusBadge label={t(statusView.labelKey)} tone={statusView.tone} />
      {offer.benefitDescription ? <Benefit>{offer.benefitDescription}</Benefit> : null}
      <Meta testID="v2-place-offer-remaining">
        {remaining.remainingQuantity === null
          ? t(remaining.labelKey)
          : t(remaining.labelKey, { count: remaining.remainingQuantity })}
      </Meta>
      <Meta>{t('placeDetail.offer.eligibility', { value: t(issuance.eligibilityLabelKey) })}</Meta>
      <Meta>{t('placeDetail.offer.expiry', { value: t(issuance.expiryLabelKey) })}</Meta>
      <Button
        disabled={!issuance.canIssue || onIssue === undefined}
        label={t(issuance.ctaLabelKey)}
        onPress={onIssue}
        testID="v2-place-offer-cta-button"
      />
    </Section>
  );
}

const Section = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
  margin: ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.none}px;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const Benefit = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const Meta = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;
