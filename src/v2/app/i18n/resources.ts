import { paymentResources } from '../../modules/booking/payments/i18n';
import { offerCouponResources, offerStatusResources } from '../../modules/booking/offers-coupons/i18n';
import { reservationResources } from '../../modules/booking/reservations/i18n';
import { visitVerificationResources } from '../../modules/place/visit-verification/i18n';
import { voiceAssistantResources } from '../../features/voice-assistant/i18n';
import { resources as sharedResources } from '../../shared/i18n/resources';

// Preserve the original shared-catalog insertion order as well as its values.
// Status copy used to sit immediately before My Page; app now injects its domain owners there.
function withBookingStatuses<Base extends Record<string, unknown>, Statuses extends Record<string, unknown>>(
  base: Base,
  statuses: Statuses,
): Base & Statuses {
  return Object.fromEntries(Object.entries(base).flatMap(([key, value]) =>
    key === 'myPage' ? [...Object.entries(statuses), [key, value]] : [[key, value]],
  )) as Base & Statuses;
}

// Keep the previous spread precedence: common copy wins on overlapping keys.
export const resources = {
  en: { translation: {
    ...offerCouponResources.en,
    ...reservationResources.en,
    visitVerification: visitVerificationResources.en,
    voiceAssistant: voiceAssistantResources.en,
    ...withBookingStatuses(sharedResources.en.translation, { ...offerStatusResources.en, ...paymentResources.en }),
  } },
  ko: { translation: {
    ...offerCouponResources.ko,
    ...reservationResources.ko,
    visitVerification: visitVerificationResources.ko,
    voiceAssistant: voiceAssistantResources.ko,
    ...withBookingStatuses(sharedResources.ko.translation, { ...offerStatusResources.ko, ...paymentResources.ko }),
  } },
} as const;
