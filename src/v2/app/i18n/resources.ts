import { offerCouponResources } from '../../features/offers-coupons/i18n';
import { reservationResources } from '../../features/reservations/i18n';
import { visitVerificationResources } from '../../features/place-visit-verification/i18n';
import { voiceAssistantResources } from '../../features/voice-assistant/i18n';
import { resources as sharedResources } from '../../shared/i18n/resources';

// Keep the previous spread precedence: common copy wins on overlapping keys.
export const resources = {
  en: { translation: {
    ...offerCouponResources.en,
    ...reservationResources.en,
    visitVerification: visitVerificationResources.en,
    voiceAssistant: voiceAssistantResources.en,
    ...sharedResources.en.translation,
  } },
  ko: { translation: {
    ...offerCouponResources.ko,
    ...reservationResources.ko,
    visitVerification: visitVerificationResources.ko,
    voiceAssistant: voiceAssistantResources.ko,
    ...sharedResources.ko.translation,
  } },
} as const;
