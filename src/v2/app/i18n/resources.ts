import { contentActionResources } from '../../shared/i18n/contentActions';
import { myPageActivityResources } from '../../modules/user/profile/my-page/i18n';
import { authErrorResources } from '../../modules/user/account/auth/i18n';
import { placeProductResources } from '../../modules/place/menus/i18n';
import { routeResources } from '../../modules/place/map/routes';
import { onboardingResources } from '../../modules/onboarding/i18n';
import { mapTutorialResources } from '../../modules/place/map/tutorial';
import { communityResources } from '../../modules/community/i18n';
import { paymentResources } from '../../modules/booking/payments/i18n';
import { offerCouponResources, offerStatusResources } from '../../modules/booking/offers-coupons/i18n';
import { reservationResources } from '../../modules/booking/reservations/i18n';
import { visitVerificationResources } from '../../modules/place/visit-verification/i18n';
import { voiceAssistantResources } from '../../modules/voice-assistant/i18n';
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

function withOnboarding<Base extends Record<string, unknown>, Copy>(base: Base, copy: Copy): Base & { onboarding: Copy } {
  return Object.fromEntries(Object.entries(base).flatMap(([key, value]) =>
    key === 'map' ? [['onboarding', copy], [key, value]] : [[key, value]],
  )) as Base & { onboarding: Copy };
}

// Keep the previous spread precedence: common copy wins on overlapping keys.
export const resources = {
  en: { translation: {
    authErrors: authErrorResources.en,
    routes: routeResources.en,
    mapTutorial: mapTutorialResources.en,
    ...offerCouponResources.en,
    ...reservationResources.en,
    community: communityResources.en,
    visitVerification: visitVerificationResources.en,
    voiceAssistant: voiceAssistantResources.en,
    myPageActivity: myPageActivityResources.en,
    contentActions: contentActionResources.en,
    placeProduct: placeProductResources.en,
    ...withBookingStatuses(withOnboarding(sharedResources.en.translation, onboardingResources.en), { ...offerStatusResources.en, ...paymentResources.en }),
  } },
  ko: { translation: {
    authErrors: authErrorResources.ko,
    routes: routeResources.ko,
    mapTutorial: mapTutorialResources.ko,
    ...offerCouponResources.ko,
    ...reservationResources.ko,
    community: communityResources.ko,
    visitVerification: visitVerificationResources.ko,
    voiceAssistant: voiceAssistantResources.ko,
    myPageActivity: myPageActivityResources.ko,
    contentActions: contentActionResources.ko,
    placeProduct: placeProductResources.ko,
    ...withBookingStatuses(withOnboarding(sharedResources.ko.translation, onboardingResources.ko), { ...offerStatusResources.ko, ...paymentResources.ko }),
  } },
  ja: { translation: {
    authErrors: authErrorResources.ja,
    routes: routeResources.ja,
    mapTutorial: mapTutorialResources.ja,
    ...offerCouponResources.ja,
    ...reservationResources.ja,
    community: communityResources.ja,
    visitVerification: visitVerificationResources.ja,
    voiceAssistant: voiceAssistantResources.ja,
    myPageActivity: myPageActivityResources.ja,
    contentActions: contentActionResources.ja,
    placeProduct: placeProductResources.ja,
    ...withBookingStatuses(withOnboarding(sharedResources.ja.translation, onboardingResources.ja), { ...offerStatusResources.ja, ...paymentResources.ja }),
  } },
  'zh-CN': { translation: {
    authErrors: authErrorResources['zh-CN'],
    routes: routeResources['zh-CN'],
    mapTutorial: mapTutorialResources['zh-CN'],
    ...offerCouponResources['zh-CN'],
    ...reservationResources['zh-CN'],
    community: communityResources['zh-CN'],
    visitVerification: visitVerificationResources['zh-CN'],
    voiceAssistant: voiceAssistantResources['zh-CN'],
    myPageActivity: myPageActivityResources['zh-CN'],
    contentActions: contentActionResources['zh-CN'],
    placeProduct: placeProductResources['zh-CN'],
    ...withBookingStatuses(withOnboarding(sharedResources['zh-CN'].translation, onboardingResources['zh-CN']), { ...offerStatusResources['zh-CN'], ...paymentResources['zh-CN'] }),
  } },
  'zh-TW': { translation: {
    authErrors: authErrorResources['zh-TW'],
    routes: routeResources['zh-TW'],
    mapTutorial: mapTutorialResources['zh-TW'],
    ...offerCouponResources['zh-TW'],
    ...reservationResources['zh-TW'],
    community: communityResources['zh-TW'],
    visitVerification: visitVerificationResources['zh-TW'],
    voiceAssistant: voiceAssistantResources['zh-TW'],
    myPageActivity: myPageActivityResources['zh-TW'],
    contentActions: contentActionResources['zh-TW'],
    placeProduct: placeProductResources['zh-TW'],
    ...withBookingStatuses(withOnboarding(sharedResources['zh-TW'].translation, onboardingResources['zh-TW']), { ...offerStatusResources['zh-TW'], ...paymentResources['zh-TW'] }),
  } },
  vi: { translation: {
    authErrors: authErrorResources.vi,
    routes: routeResources.vi,
    mapTutorial: mapTutorialResources.vi,
    ...offerCouponResources.vi,
    ...reservationResources.vi,
    community: communityResources.vi,
    visitVerification: visitVerificationResources.vi,
    voiceAssistant: voiceAssistantResources.vi,
    myPageActivity: myPageActivityResources.vi,
    contentActions: contentActionResources.vi,
    placeProduct: placeProductResources.vi,
    ...withBookingStatuses(withOnboarding(sharedResources.vi.translation, onboardingResources.vi), { ...offerStatusResources.vi, ...paymentResources.vi }),
  } },
  es: { translation: {
    authErrors: authErrorResources.es,
    routes: routeResources.es,
    mapTutorial: mapTutorialResources.es,
    ...offerCouponResources.es,
    ...reservationResources.es,
    community: communityResources.es,
    visitVerification: visitVerificationResources.es,
    voiceAssistant: voiceAssistantResources.es,
    myPageActivity: myPageActivityResources.es,
    contentActions: contentActionResources.es,
    placeProduct: placeProductResources.es,
    ...withBookingStatuses(withOnboarding(sharedResources.es.translation, onboardingResources.es), { ...offerStatusResources.es, ...paymentResources.es }),
  } },
  'pt-BR': { translation: {
    authErrors: authErrorResources['pt-BR'],
    routes: routeResources['pt-BR'],
    mapTutorial: mapTutorialResources['pt-BR'],
    ...offerCouponResources['pt-BR'],
    ...reservationResources['pt-BR'],
    community: communityResources['pt-BR'],
    visitVerification: visitVerificationResources['pt-BR'],
    voiceAssistant: voiceAssistantResources['pt-BR'],
    myPageActivity: myPageActivityResources['pt-BR'],
    contentActions: contentActionResources['pt-BR'],
    placeProduct: placeProductResources['pt-BR'],
    ...withBookingStatuses(withOnboarding(sharedResources['pt-BR'].translation, onboardingResources['pt-BR']), { ...offerStatusResources['pt-BR'], ...paymentResources['pt-BR'] }),
  } },
  th: { translation: {
    authErrors: authErrorResources.th,
    routes: routeResources.th,
    mapTutorial: mapTutorialResources.th,
    ...offerCouponResources.th,
    ...reservationResources.th,
    community: communityResources.th,
    visitVerification: visitVerificationResources.th,
    voiceAssistant: voiceAssistantResources.th,
    myPageActivity: myPageActivityResources.th,
    contentActions: contentActionResources.th,
    placeProduct: placeProductResources.th,
    ...withBookingStatuses(withOnboarding(sharedResources.th.translation, onboardingResources.th), { ...offerStatusResources.th, ...paymentResources.th }),
  } },
} as const;
