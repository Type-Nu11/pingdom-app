import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import {
  ApiErrorState,
  Button,
  EmptyState,
  LoadingState,
  Surface,
} from '../../../shared/components';
import { useIssueCoupon, usePlaceOffers } from '../hooks/useOffersCoupons';
import {
  formatOfferDate,
  formatOfferEligibility,
  formatOfferInventory,
  formatOfferPeriod,
  formatOfferValidity,
  selectCouponCtaState,
  selectPlaceOffers,
  type CouponConflictCause,
  type OfferView,
} from '../model/offerPresentation';

export type PlaceCouponCtaProps = {
  placeId: number;
  /** Existing app auth entry for logged-out users. Optional: the CTA still states the requirement. */
  onRequestSignIn?: () => void;
  /** Navigates to the issued-coupons list; shown after a successful issuance. */
  onViewMyCoupons?: () => void;
};

const CONFLICT_COPY_KEY: Record<CouponConflictCause, string> = {
  duplicate: 'placeOffers.error.conflictDuplicate',
  'window-closed': 'placeOffers.error.conflictWindowClosed',
  'stock-out': 'placeOffers.error.conflictStockOut',
  unknown: 'placeOffers.error.conflictUnknown',
};

export default function PlaceCouponCta({
  placeId,
  onRequestSignIn,
  onViewMyCoupons,
}: PlaceCouponCtaProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const enabled = Number.isFinite(placeId) && placeId > 0;

  const offersQuery = usePlaceOffers(placeId, { enabled });
  const issue = useIssueCoupon();
  const offers = useMemo(() => selectPlaceOffers(offersQuery.data), [offersQuery.data]);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  // The Offer the in-flight/last issuance belongs to. A successful issuance
  // invalidates the Offer list, so the row can leave `offers` before the result
  // is rendered; keeping a copy stops the panel from blanking out mid-flight.
  const [pendingOffer, setPendingOffer] = useState<OfferView | null>(null);

  const state = selectCouponCtaState({
    offers: {
      data: offers,
      error: offersQuery.error,
      isError: offersQuery.isError,
      isPending: offersQuery.isPending,
    },
    issue: {
      data: issue.data,
      error: issue.error,
      isError: issue.isError,
      isPending: issue.isPending,
      isSuccess: issue.isSuccess,
    },
    selectedOfferId,
  });

  if (!enabled) return null;

  const activeOfferId = 'offerId' in state
    ? state.offerId
    : selectedOfferId ?? offers[0]?.id ?? null;
  const listedOffer = offers.find((offer) => offer.id === activeOfferId) ?? offers[0] ?? null;
  // Issuance outcomes belong to the Offer the user actually tapped.
  const settledIssue = issue.isPending || issue.isError || issue.isSuccess;
  const activeOffer = settledIssue ? pendingOffer ?? listedOffer : listedOffer;

  const resetIssue = () => {
    setPendingOffer(null);
    if (issue.isError || issue.isSuccess) issue.reset();
  };

  const selectOffer = (offer: OfferView) => {
    if (offer.id === activeOffer?.id) return;
    setSelectedOfferId(offer.id);
    // Otherwise a conflict/success from the previous Offer would keep this
    // Offer's CTA disabled or hidden behind the success panel.
    resetIssue();
  };

  const handleIssue = () => {
    if (issue.isPending || !listedOffer) return;
    setPendingOffer(listedOffer);
    issue.mutate(listedOffer.id);
  };

  if (state.kind === 'offer-loading') {
    return (
      <Wrapper accessibilityRole="summary">
        <LoadingState description={t('placeOffers.loading')} />
      </Wrapper>
    );
  }

  if (state.kind === 'offer-error') {
    return (
      <Wrapper accessibilityRole="summary">
        <ApiErrorState
          error={state.error}
          onRetry={() => void offersQuery.refetch()}
          onSignIn={onRequestSignIn}
        />
      </Wrapper>
    );
  }

  if (state.kind === 'auth-required') {
    return (
      <Wrapper accessibilityRole="summary">
        <Surface padding="lg" tone="outlined">
          <SectionTitle>{t('placeOffers.title')}</SectionTitle>
          <StatusLine accessibilityLiveRegion="polite">
            {t('placeOffers.auth.description')}
          </StatusLine>
          {onRequestSignIn ? (
            <Button
              accessibilityLabel={t('placeOffers.auth.action')}
              label={t('placeOffers.auth.action')}
              onPress={onRequestSignIn}
              variant="secondary"
            />
          ) : null}
        </Surface>
      </Wrapper>
    );
  }

  if (state.kind === 'no-offer') {
    return (
      <Wrapper accessibilityRole="summary">
        <EmptyState
          description={t('placeOffers.empty.description')}
          title={t('placeOffers.empty.title')}
        />
      </Wrapper>
    );
  }

  if (state.kind === 'issue-success') {
    const expiry = formatOfferDate(state.coupon.expiresAt, locale);
    return (
      <Wrapper accessibilityRole="summary">
        <Surface padding="lg" tone="outlined">
          <SectionTitle>{t('placeOffers.success.title')}</SectionTitle>
          <StatusLine $tone="positive" accessibilityLiveRegion="polite">
            {t('placeOffers.success.description')}
          </StatusLine>
          <DetailRow>
            <DetailLabel>{t('placeOffers.success.code')}</DetailLabel>
            <DetailValue selectable>{state.coupon.code}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>{t('placeOffers.success.expiry')}</DetailLabel>
            <DetailValue>
              {expiry ?? t('placeOffers.detail.periodUnavailable')}
            </DetailValue>
          </DetailRow>
          <HintText>{t('placeOffers.success.hint')}</HintText>
          <Actions>
            {onViewMyCoupons ? (
              <Button
                accessibilityLabel={t('placeOffers.success.viewAction')}
                label={t('placeOffers.success.viewAction')}
                onPress={onViewMyCoupons}
                variant="secondary"
              />
            ) : null}
            {offers.length > 1 ? (
              <Button
                accessibilityLabel={t('placeOffers.success.issueAnother')}
                label={t('placeOffers.success.issueAnother')}
                onPress={resetIssue}
                variant="ghost"
              />
            ) : null}
          </Actions>
        </Surface>
      </Wrapper>
    );
  }

  // issuable | issuing | eligibility-unmet | conflict — all render the benefit detail + CTA.
  if (!activeOffer) return null;

  const isIssuing = state.kind === 'issuing';
  const statusMessage = state.kind === 'eligibility-unmet'
    ? t('placeOffers.error.eligibility')
    : state.kind === 'conflict'
      ? t(CONFLICT_COPY_KEY[state.cause])
      : null;
  const ctaDisabled = isIssuing
    || state.kind === 'eligibility-unmet'
    || (state.kind === 'conflict' && state.cause !== 'unknown');
  const ctaLabel = isIssuing ? t('placeOffers.cta.issuing') : t('placeOffers.cta.issue');

  return (
    <Wrapper accessibilityRole="summary">
      <Surface padding="lg" tone="outlined">
        <SectionTitle>{t('placeOffers.title')}</SectionTitle>

        {offers.length > 1 ? (
          <OfferChoiceGroup accessibilityRole="radiogroup">
            {offers.map((offer) => {
              const selected = offer.id === activeOffer.id;
              return (
                <OfferChoice
                  key={offer.id}
                  $selected={selected}
                  accessibilityLabel={offer.title}
                  accessibilityRole="radio"
                  accessibilityState={{ disabled: isIssuing, selected }}
                  disabled={isIssuing}
                  onPress={() => selectOffer(offer)}
                >
                  <OfferChoiceText $selected={selected}>{offer.title}</OfferChoiceText>
                </OfferChoice>
              );
            })}
          </OfferChoiceGroup>
        ) : null}

        <OfferBenefitDetail locale={locale} offer={activeOffer} t={t} />

        {statusMessage ? (
          <StatusLine $tone="warning" accessibilityLiveRegion="polite">
            {statusMessage}
          </StatusLine>
        ) : null}

        <Actions>
          <Button
            accessibilityLabel={isIssuing
              ? t('placeOffers.cta.a11yIssuing')
              : t('placeOffers.cta.a11yIssue', { offer: activeOffer.title })}
            disabled={ctaDisabled}
            label={ctaLabel}
            loading={isIssuing}
            onPress={handleIssue}
          />

          {/* A duplicate issuance means the coupon already exists, so the only
              useful next step is opening it rather than retrying. */}
          {state.kind === 'conflict' && state.cause === 'duplicate' && onViewMyCoupons ? (
            <Button
              accessibilityLabel={t('placeOffers.success.viewAction')}
              label={t('placeOffers.success.viewAction')}
              onPress={onViewMyCoupons}
              variant="secondary"
            />
          ) : null}
        </Actions>
      </Surface>
    </Wrapper>
  );
}

type Translate = (key: string, options?: Record<string, unknown>) => string;

function OfferBenefitDetail({
  locale,
  offer,
  t,
}: {
  locale: string;
  offer: OfferView;
  t: Translate;
}) {
  return (
    <BenefitBlock>
      <OfferTitle>{offer.title}</OfferTitle>
      {offer.description ? (
        <DescriptionScroll nestedScrollEnabled showsVerticalScrollIndicator>
          <DescriptionText>{offer.description}</DescriptionText>
        </DescriptionScroll>
      ) : null}
      <DetailRow>
        <DetailLabel>{t('placeOffers.detail.benefitLabel')}</DetailLabel>
        <DetailValue>{offer.benefitDescription}</DetailValue>
      </DetailRow>
      <DetailRow>
        <DetailLabel>{t('placeOffers.detail.periodLabel')}</DetailLabel>
        <DetailValue>{formatOfferPeriod(offer, locale, t)}</DetailValue>
      </DetailRow>
      <DetailRow>
        <DetailLabel>{t('placeOffers.detail.validityLabel')}</DetailLabel>
        <DetailValue>{formatOfferValidity(offer, locale, t)}</DetailValue>
      </DetailRow>
      <DetailRow>
        <DetailLabel>{t('placeOffers.detail.inventoryLabel')}</DetailLabel>
        <DetailValue>{formatOfferInventory(offer, t)}</DetailValue>
      </DetailRow>
      <DetailRow>
        <DetailLabel>{t('placeOffers.detail.eligibilityLabel')}</DetailLabel>
        <DetailValue>{formatOfferEligibility(offer, t)}</DetailValue>
      </DetailRow>
    </BenefitBlock>
  );
}

const Wrapper = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-top: ${({ theme }) => theme.spacing.lg}px;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const BenefitBlock = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const OfferTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const DescriptionScroll = styled.ScrollView`
  max-height: 120px;
  margin: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.none}px;
`;

const DescriptionText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const DetailRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const DetailLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const DetailValue = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;

const Actions = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

const HintText = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;

const StatusLine = styled.Text<{ $tone?: 'positive' | 'warning' }>`
  margin: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.none}px;
  color: ${({ $tone, theme }) => $tone === 'positive'
    ? theme.colors.success
    : $tone === 'warning'
      ? theme.colors.warning
      : theme.colors.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const OfferChoiceGroup = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const OfferChoice = styled.Pressable<{ $selected: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
  border-width: 1px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  border-color: ${({ $selected, theme }) => ($selected ? theme.colors.primary : theme.colors.border)};
  background-color: ${({ $selected, theme }) => ($selected ? theme.colors.primarySoft : theme.colors.surface)};
`;

const OfferChoiceText = styled.Text<{ $selected: boolean }>`
  color: ${({ $selected, theme }) => ($selected ? theme.colors.primary : theme.colors.text)};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;
