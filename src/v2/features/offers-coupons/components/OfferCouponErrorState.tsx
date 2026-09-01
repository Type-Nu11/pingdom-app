import React from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorState } from '../../../shared/components';
import {
  getOfferCouponErrorUx,
  type OfferCouponOperation,
  type OfferCouponSurface,
} from '../model/getOfferCouponErrorUx';

type OfferCouponErrorStateProps = {
  error: unknown;
  fill?: boolean;
  onBack?: () => void;
  onRetry?: () => void;
  onSignIn?: () => void;
  onViewWallet?: () => void;
  operation?: OfferCouponOperation;
  surface: OfferCouponSurface;
};

/**
 * Coupon/Offer error UX, resolved through {@link getOfferCouponErrorUx} so the
 * same failure reads identically on the place CTA, the wallet and the redeem
 * screen. Only the CTAs the caller can actually service are rendered; an
 * unhandled CTA (e.g. no sign-in recovery flow yet) collapses to text only.
 */
export default function OfferCouponErrorState({
  error,
  fill,
  onBack,
  onRetry,
  onSignIn,
  onViewWallet,
  operation,
  surface,
}: OfferCouponErrorStateProps) {
  const { t } = useTranslation();
  const ux = getOfferCouponErrorUx(error, surface, operation);

  const handler = ((): (() => void) | undefined => {
    switch (ux.cta) {
      case 'retry':
        return onRetry;
      case 'signIn':
        return onSignIn;
      case 'back':
        return onBack;
      case 'viewWallet':
        return onViewWallet;
      default:
        return undefined;
    }
  })();

  return (
    <ErrorState
      actionLabel={handler && ux.ctaLabelKey ? t(ux.ctaLabelKey) : undefined}
      description={t(ux.descriptionKey)}
      fill={fill}
      onAction={handler}
      title={t(ux.titleKey)}
    />
  );
}
