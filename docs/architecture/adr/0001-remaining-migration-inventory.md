# #360 remaining-domain inventory and compatibility evidence

Base: `0f43336ff6c6ea2d7ffd1d4f7691e85310b49c7b`. Counts include indexes, tests, fixtures and README files.

## Entire pre/post flat feature inventory

| Before feature | Files before | Actual owner after | Compatibility files after |
|---|---:|---|---:|
| `check-ins` | 2 | `existing Place/User/Booking implementation; named compatibility only` | 2 |
| `conversion` | 5 | `shared/analytics/conversion` | 0 |
| `current-activity-intent` | 6 | `modules/travel/current-activity-intent` | 0 |
| `home` | 2 | `app/home` | 0 |
| `map` | 4 | `existing Place/User/Booking implementation; named compatibility only` | 4 |
| `merchant-my-page` | 17 | `modules/merchant` | 1 |
| `my-page` | 6 | `existing Place/User/Booking implementation; named compatibility only` | 6 |
| `notifications` | 2 | `existing Place/User/Booking implementation; named compatibility only` | 2 |
| `offers-coupons` | 2 | `existing Place/User/Booking implementation; named compatibility only` | 2 |
| `onboarding-entry` | 5 | `modules/onboarding/entry` | 2 |
| `onboarding-preferences` | 19 | `modules/onboarding/preferences + modules/travel/calendar` | 1 |
| `place-visit-verification` | 2 | `existing Place/User/Booking implementation; named compatibility only` | 2 |
| `reservations` | 3 | `existing Place/User/Booking implementation; named compatibility only` | 3 |
| `settings` | 3 | `existing Place/User/Booking implementation; named compatibility only` | 3 |
| `travel-purposes` | 6 | `modules/travel/purposes` | 1 |
| `travel-schedules` | 6 | `modules/travel/schedules` | 0 |
| `voice-assistant` | 30 | `modules/voice-assistant` | 0 |

All 96 files in the nine remaining implementation folders were reviewed/moved or consolidated. The other 24 files were already compatibility exports. Final features: **29 files, all named V1/root compatibility exports**, zero implementations. Five required compatibility paths replace moved implementations; no exception is added. The separate shared test-provider adapter stays for two frozen V1 tests.

## Exact #362 handoff

Every target below is the original implementation, reached by named re-export rather than a wrapper, cloned function, copied type, new store or new query object. Thus runtime function/component/object identity and type identity are preserved. `as default` is a named export alias for unchanged V1 default imports.

| Compatibility path | Exact consumers (kind) | Actual implementation |
|---|---|---|
| `src/v2/features/check-ins/api/checkInApi.ts` | `src/app/navigation/__tests__/SettingsNavigation.test.tsx` (test-only) | `src/v2/modules/place/check-ins/api/checkInApi.ts` |
| `src/v2/features/check-ins/index.ts` | `src/features/place/hooks/__tests__/useLocationCheckIn.test.tsx` (test-only)<br>`src/features/place/hooks/useLocationCheckIn.ts` (production) | `src/v2/modules/place/check-ins/api/checkInApi.ts`<br>`src/v2/modules/place/check-ins/hooks/useCheckIns.ts` |
| `src/v2/features/map/hooks/useCurrentLocation.ts` | `src/features/place/hooks/__tests__/useLocationCheckIn.test.tsx` (test-only)<br>`src/features/place/hooks/useLocationCheckIn.ts` (production) | `src/v2/modules/place/map/location/hooks/useCurrentLocation.ts` |
| `src/v2/features/map/model/map.types.ts` | `src/features/place/hooks/useLocationCheckIn.ts` (production) | `src/v2/modules/place/map/camera/model/map.types.ts` |
| `src/v2/features/map/screens/MapScreen.tsx` | `src/app/navigation/MainNavigator.tsx` (production)<br>`src/app/navigation/__tests__/MainNavigator.test.tsx` (test-only)<br>`src/app/navigation/__tests__/SettingsNavigation.test.tsx` (test-only) | `src/v2/modules/place/map/screens/MapScreen.tsx` |
| `src/v2/features/map/utils/mapBack.ts` | `src/app/navigation/__tests__/navigation.test.mjs` (test-only) | `src/v2/modules/place/map/navigation/utils/mapBack.ts` |
| `src/v2/features/merchant-my-page/screens/MerchantMyPageContainer.tsx` | `src/app/navigation/MainNavigator.tsx` (production)<br>`src/app/navigation/__tests__/MainNavigator.test.tsx` (test-only) | `src/v2/modules/merchant/screens/MerchantMyPageContainer.tsx` |
| `src/v2/features/my-page/api/profileApi.ts` | `src/app/navigation/__tests__/SettingsNavigation.test.tsx` (test-only) | `src/v2/modules/user/profile/api/profileApi.ts` |
| `src/v2/features/my-page/screens/CouponBoxScreen.tsx` | `src/app/navigation/MainNavigator.tsx` (production) | `src/v2/modules/user/profile/my-page/coupons/screens/CouponBoxScreen.tsx` |
| `src/v2/features/my-page/screens/CouponDetailContainer.tsx` | `src/app/navigation/MainNavigator.tsx` (production) | `src/v2/modules/user/profile/my-page/coupons/screens/CouponDetailContainer.tsx` |
| `src/v2/features/my-page/screens/MyPageScreen.tsx` | `src/app/navigation/MainNavigator.tsx` (production)<br>`src/app/navigation/__tests__/MainNavigator.test.tsx` (test-only) | `src/v2/modules/user/profile/my-page/screens/MyPageScreen.tsx` |
| `src/v2/features/my-page/screens/ProfileEditScreen.tsx` | `src/app/navigation/MainNavigator.tsx` (production)<br>`src/app/navigation/__tests__/MainNavigator.test.tsx` (test-only) | `src/v2/modules/user/profile/screens/ProfileEditScreen.tsx` |
| `src/v2/features/my-page/screens/VerifiedPlacesScreen.tsx` | `src/app/navigation/MainNavigator.tsx` (production) | `src/v2/modules/user/profile/my-page/verified-places/screens/VerifiedPlacesScreen.tsx` |
| `src/v2/features/notifications/api/notificationApi.ts` | `src/app/navigation/__tests__/SettingsNavigation.test.tsx` (test-only) | `src/v2/modules/user/notifications/api/notificationApi.ts` |
| `src/v2/features/notifications/services/backgroundNotification.ts` | `index.ts` (production) | `src/v2/modules/user/notifications/services/backgroundNotification.ts` |
| `src/v2/features/offers-coupons/api/offerCouponApi.ts` | `src/app/navigation/__tests__/SettingsNavigation.test.tsx` (test-only) | `src/v2/modules/booking/offers-coupons/api/offerCouponApi.ts` |
| `src/v2/features/offers-coupons/index.ts` | `src/app/navigation/types.ts` (production) | `src/v2/modules/booking/offers-coupons/api/offerCouponApi.ts` |
| `src/v2/features/onboarding-entry/index.ts` | `src/app/navigation/AuthNavigator.tsx` (production)<br>`src/app/navigation/RootNavigator.tsx` (production)<br>`src/features/onboarding/OnboardingFlow.tsx` (production) | `src/v2/modules/onboarding/entry/hooks/useOnboardingEntry.ts`<br>`src/v2/modules/onboarding/entry/model/onboardingEntry.ts` |
| `src/v2/features/onboarding-entry/model/onboardingEntry.ts` | `src/app/navigation/__tests__/navigation.test.mjs` (test-only)<br>`src/app/navigation/__tests__/productionRoot.test.mjs` (test-only) | `src/v2/modules/onboarding/entry/model/onboardingEntry.ts` |
| `src/v2/features/onboarding-preferences/index.ts` | `src/app/navigation/RootNavigator.tsx` (production)<br>`src/features/onboarding/OnboardingFlow.tsx` (production)<br>`src/features/onboarding/__tests__/OnboardingFlow.test.tsx` (test-only) | `src/v2/modules/onboarding/preferences/screens/OnboardingPreferenceFlow.tsx`<br>`src/v2/modules/onboarding/preferences/hooks/useSyncOnboardingTravelSchedule.ts` |
| `src/v2/features/place-visit-verification/index.ts` | `src/app/navigation/MainNavigator.tsx` (production) | `src/v2/modules/place/visit-verification/screens/VisitVerificationPlacesScreen.tsx`<br>`src/v2/modules/place/visit-verification/screens/VisitVerificationReviewScreen.tsx`<br>`src/v2/modules/place/visit-verification/screens/VisitVerificationSessionScreen.tsx` |
| `src/v2/features/place-visit-verification/model/visitVerificationSession.ts` | `src/app/providers/AppProvider.tsx` (production) | `src/v2/modules/place/visit-verification/model/visitVerificationSession.ts` |
| `src/v2/features/reservations/screens/CreateReservationScreen.tsx` | `src/app/navigation/MainNavigator.tsx` (production) | `src/v2/modules/booking/reservations/screens/CreateReservationScreen.tsx` |
| `src/v2/features/reservations/screens/ReservationBoxScreen.tsx` | `src/app/navigation/MainNavigator.tsx` (production) | `src/v2/modules/booking/reservations/screens/ReservationBoxScreen.tsx` |
| `src/v2/features/reservations/screens/ReservationDetailScreen.tsx` | `src/app/navigation/MainNavigator.tsx` (production) | `src/v2/modules/booking/reservations/screens/ReservationDetailScreen.tsx` |
| `src/v2/features/settings/hooks/useSettingsNavigation.ts` | `src/app/navigation/MainNavigator.tsx` (production) | `src/v2/modules/user/settings/hooks/useSettingsNavigation.ts` |
| `src/v2/features/settings/index.ts` | `src/app/navigation/MainNavigator.tsx` (production)<br>`src/app/navigation/types.ts` (production) | `src/v2/modules/user/settings/screens/AccountManagementScreen.tsx`<br>`src/v2/modules/user/settings/screens/SettingsDetailScreen.tsx`<br>`src/v2/modules/user/settings/model/settings.types.ts` |
| `src/v2/features/settings/screens/SettingsScreen.tsx` | `src/app/navigation/MainNavigator.tsx` (production)<br>`src/app/navigation/__tests__/MainNavigator.test.tsx` (test-only) | `src/v2/modules/user/settings/screens/SettingsScreen.tsx` |
| `src/v2/features/travel-purposes/model/travelPurposeQueryKeys.ts` | `src/features/profile/hooks/useMyReviews.ts` (production)<br>`src/features/profile/hooks/useProfile.ts` (production) | `src/v2/modules/travel/purposes/model/travelPurposeQueryKeys.ts` |
| `src/v2/shared/testing/testProviders.tsx` | `src/app/navigation/__tests__/MainNavigator.test.tsx` (test-only)<br>`src/app/navigation/__tests__/SettingsNavigation.test.tsx` (test-only)<br>`src/v2/shared/components/__tests__/FavoriteIcon.test.tsx` (test-only)<br>`src/v2/shared/components/__tests__/HeaderBackButton.test.tsx` (test-only)<br>`src/v2/shared/components/__tests__/TypographyComponents.test.tsx` (test-only)<br>`src/v2/shared/i18n/__tests__/placeActions.test.ts` (test-only) | `src/v2/app/testing/testProviders.tsx` |

No existing #361/#358/#359 compatibility file was deletable: all 24 had frozen consumers. All V2/app callers of moved features and the shared test provider now use the owning public module/app test boundary. Removed old implementation paths are listed below; no unused compatibility-only file was retained.

## Complete file relocation inventory

Destination indexes may be intentionally narrowed; `app/home/index.ts` is removed as unused. Date contracts are additionally extracted verbatim from Onboarding preference model to `modules/travel/calendar/travelDate.ts`. Onboarding resource values and Merchant test-only performance fixture are extracted from shared into their respective modules.

| Before | After |
|---|---|
| `src/v2/app/testing/integration/__tests__/VoiceAssistantScreen.test.tsx` | `src/v2/modules/voice-assistant/screens/__tests__/VoiceAssistantScreen.test.tsx` |
| `src/v2/features/conversion/api/conversionApi.ts` | `src/v2/shared/analytics/conversion/api/conversionApi.ts` |
| `src/v2/features/conversion/data/index.ts` | `src/v2/shared/analytics/conversion/data/index.ts` |
| `src/v2/features/conversion/hooks/useConversionEvents.ts` | `src/v2/shared/analytics/conversion/hooks/useConversionEvents.ts` |
| `src/v2/features/conversion/index.ts` | `src/v2/shared/analytics/conversion/index.ts` |
| `src/v2/features/conversion/model/conversionRetry.ts` | `src/v2/shared/analytics/conversion/model/conversionRetry.ts` |
| `src/v2/features/current-activity-intent/api/currentActivityIntentApi.ts` | `src/v2/modules/travel/current-activity-intent/api/currentActivityIntentApi.ts` |
| `src/v2/features/current-activity-intent/data/index.ts` | `src/v2/modules/travel/current-activity-intent/__tests__/index.ts` |
| `src/v2/features/current-activity-intent/hooks/useCurrentActivityIntent.ts` | `src/v2/modules/travel/current-activity-intent/hooks/useCurrentActivityIntent.ts` |
| `src/v2/features/current-activity-intent/index.ts` | `src/v2/modules/travel/current-activity-intent/index.ts` |
| `src/v2/features/current-activity-intent/model/currentActivityIntent.types.ts` | `src/v2/modules/travel/current-activity-intent/model/currentActivityIntent.types.ts` |
| `src/v2/features/current-activity-intent/model/currentActivityIntentQueryKeys.ts` | `src/v2/modules/travel/current-activity-intent/model/currentActivityIntentQueryKeys.ts` |
| `src/v2/features/home/index.ts` | `src/v2/app/home/index.ts` (unused index removed) |
| `src/v2/features/home/screens/HomeScreen.tsx` | `src/v2/app/home/screens/HomeScreen.tsx` |
| `src/v2/features/merchant-my-page/api/merchantOwnerApi.ts` | `src/v2/modules/merchant/api/merchantOwnerApi.ts` |
| `src/v2/features/merchant-my-page/components/EventCard.tsx` | `src/v2/modules/merchant/components/EventCard.tsx` |
| `src/v2/features/merchant-my-page/components/MerchantReviewCard.tsx` | `src/v2/modules/merchant/components/MerchantReviewCard.tsx` |
| `src/v2/features/merchant-my-page/components/PlusIcon.tsx` | `src/v2/modules/merchant/components/PlusIcon.tsx` |
| `src/v2/features/merchant-my-page/components/StoreFeatureBadge.tsx` | `src/v2/modules/merchant/components/StoreFeatureBadge.tsx` |
| `src/v2/features/merchant-my-page/components/StoreInfoField.tsx` | `src/v2/modules/merchant/components/StoreInfoField.tsx` |
| `src/v2/features/merchant-my-page/components/VerifiedBadge.tsx` | `src/v2/modules/merchant/components/VerifiedBadge.tsx` |
| `src/v2/features/merchant-my-page/hooks/useMerchantOwner.ts` | `src/v2/modules/merchant/hooks/useMerchantOwner.ts` |
| `src/v2/features/merchant-my-page/index.ts` | `src/v2/modules/merchant/index.ts` |
| `src/v2/features/merchant-my-page/model/__tests__/mappers.test.ts` | `src/v2/modules/merchant/model/__tests__/mappers.test.ts` |
| `src/v2/features/merchant-my-page/model/mappers.ts` | `src/v2/modules/merchant/model/mappers.ts` |
| `src/v2/features/merchant-my-page/model/types.ts` | `src/v2/modules/merchant/model/types.ts` |
| `src/v2/features/merchant-my-page/screens/MerchantMyPageContainer.tsx` | `src/v2/modules/merchant/screens/MerchantMyPageContainer.tsx` |
| `src/v2/features/merchant-my-page/screens/MerchantMyPageScreen.tsx` | `src/v2/modules/merchant/screens/MerchantMyPageScreen.tsx` |
| `src/v2/features/merchant-my-page/screens/__tests__/MerchantMyPageContainer.test.tsx` | `src/v2/modules/merchant/screens/__tests__/MerchantMyPageContainer.test.tsx` |
| `src/v2/features/merchant-my-page/screens/__tests__/MerchantMyPageScreen.test.tsx` | `src/v2/modules/merchant/screens/__tests__/MerchantMyPageScreen.test.tsx` |
| `src/v2/features/merchant-my-page/testing/merchantMyPageFixtures.ts` | `src/v2/modules/merchant/__tests__/merchantMyPageFixtures.ts` |
| `src/v2/features/onboarding-entry/__tests__/onboardingEntry.test.tsx` | `src/v2/modules/onboarding/entry/__tests__/onboardingEntry.test.tsx` |
| `src/v2/features/onboarding-entry/hooks/useOnboardingEntry.ts` | `src/v2/modules/onboarding/entry/hooks/useOnboardingEntry.ts` |
| `src/v2/features/onboarding-entry/index.ts` | `src/v2/modules/onboarding/entry/index.ts` |
| `src/v2/features/onboarding-entry/model/onboardingEntry.ts` | `src/v2/modules/onboarding/entry/model/onboardingEntry.ts` |
| `src/v2/features/onboarding-entry/services/onboardingCompletionStorage.ts` | `src/v2/modules/onboarding/entry/services/onboardingCompletionStorage.ts` |
| `src/v2/features/onboarding-preferences/__tests__/onboardingPreference.test.ts` | `src/v2/modules/onboarding/preferences/__tests__/onboardingPreference.test.ts` |
| `src/v2/features/onboarding-preferences/__tests__/travelScheduleCalendar.test.ts` | `src/v2/modules/travel/calendar/__tests__/travelScheduleCalendar.test.ts` |
| `src/v2/features/onboarding-preferences/calendar/index.ts` | `src/v2/modules/travel/calendar/index.ts` |
| `src/v2/features/onboarding-preferences/components/OnboardingProgressHeader.tsx` | `src/v2/modules/onboarding/preferences/components/OnboardingProgressHeader.tsx` |
| `src/v2/features/onboarding-preferences/hooks/useSyncOnboardingTravelSchedule.ts` | `src/v2/modules/onboarding/preferences/hooks/useSyncOnboardingTravelSchedule.ts` |
| `src/v2/features/onboarding-preferences/index.ts` | `src/v2/modules/onboarding/preferences/index.ts` |
| `src/v2/features/onboarding-preferences/model/onboardingPreference.ts` | `src/v2/modules/onboarding/preferences/model/onboardingPreference.ts` |
| `src/v2/features/onboarding-preferences/model/travelScheduleCalendar.ts` | `src/v2/modules/travel/calendar/travelScheduleCalendar.ts` |
| `src/v2/features/onboarding-preferences/screens/OnboardingPreferenceFlow.tsx` | `src/v2/modules/onboarding/preferences/screens/OnboardingPreferenceFlow.tsx` |
| `src/v2/features/onboarding-preferences/screens/TravelPurposeSelectionScreen.tsx` | `src/v2/modules/onboarding/preferences/screens/TravelPurposeSelectionScreen.tsx` |
| `src/v2/features/onboarding-preferences/screens/TravelScheduleSelectionScreen.tsx` | `src/v2/modules/onboarding/preferences/screens/TravelScheduleSelectionScreen.tsx` |
| `src/v2/features/onboarding-preferences/screens/__tests__/OnboardingPreferenceFlow.test.tsx` | `src/v2/modules/onboarding/preferences/screens/__tests__/OnboardingPreferenceFlow.test.tsx` |
| `src/v2/features/onboarding-preferences/screens/__tests__/TravelPurposeSelectionScreen.test.tsx` | `src/v2/modules/onboarding/preferences/screens/__tests__/TravelPurposeSelectionScreen.test.tsx` |
| `src/v2/features/onboarding-preferences/screens/__tests__/TravelScheduleSelectionScreen.test.tsx` | `src/v2/modules/onboarding/preferences/screens/__tests__/TravelScheduleSelectionScreen.test.tsx` |
| `src/v2/features/onboarding-preferences/services/__tests__/syncOnboardingTravelSchedule.test.ts` | `src/v2/modules/onboarding/preferences/services/__tests__/syncOnboardingTravelSchedule.test.ts` |
| `src/v2/features/onboarding-preferences/services/onboardingPreferenceStorage.ts` | `src/v2/modules/onboarding/preferences/services/onboardingPreferenceStorage.ts` |
| `src/v2/features/onboarding-preferences/services/syncOnboardingTravelSchedule.ts` | `src/v2/modules/onboarding/preferences/services/syncOnboardingTravelSchedule.ts` |
| `src/v2/features/onboarding-preferences/store/__tests__/onboardingPreferenceStore.test.ts` | `src/v2/modules/onboarding/preferences/store/__tests__/onboardingPreferenceStore.test.ts` |
| `src/v2/features/onboarding-preferences/store/onboardingPreferenceStore.ts` | `src/v2/modules/onboarding/preferences/store/onboardingPreferenceStore.ts` |
| `src/v2/features/travel-purposes/api/travelPurposeApi.ts` | `src/v2/modules/travel/purposes/api/travelPurposeApi.ts` |
| `src/v2/features/travel-purposes/data/index.ts` | `src/v2/modules/travel/purposes/__tests__/index.ts` |
| `src/v2/features/travel-purposes/hooks/useTravelPurposes.ts` | `src/v2/modules/travel/purposes/hooks/useTravelPurposes.ts` |
| `src/v2/features/travel-purposes/index.ts` | `src/v2/modules/travel/purposes/index.ts` |
| `src/v2/features/travel-purposes/model/travelPurpose.types.ts` | `src/v2/modules/travel/purposes/model/travelPurpose.types.ts` |
| `src/v2/features/travel-purposes/model/travelPurposeQueryKeys.ts` | `src/v2/modules/travel/purposes/model/travelPurposeQueryKeys.ts` |
| `src/v2/features/travel-schedules/README.md` | `src/v2/modules/travel/schedules/README.md` |
| `src/v2/features/travel-schedules/api/travelScheduleApi.ts` | `src/v2/modules/travel/schedules/api/travelScheduleApi.ts` |
| `src/v2/features/travel-schedules/data/index.ts` | `src/v2/modules/travel/schedules/__tests__/index.ts` |
| `src/v2/features/travel-schedules/hooks/useTravelSchedules.ts` | `src/v2/modules/travel/schedules/hooks/useTravelSchedules.ts` |
| `src/v2/features/travel-schedules/index.ts` | `src/v2/modules/travel/schedules/index.ts` |
| `src/v2/features/travel-schedules/model/travelScheduleQueryKeys.ts` | `src/v2/modules/travel/schedules/model/travelScheduleQueryKeys.ts` |
| `src/v2/features/voice-assistant/api/voiceSessionApi.ts` | `src/v2/modules/voice-assistant/api/voiceSessionApi.ts` |
| `src/v2/features/voice-assistant/components/VoiceCommandResults.tsx` | `src/v2/modules/voice-assistant/components/VoiceCommandResults.tsx` |
| `src/v2/features/voice-assistant/hooks/__tests__/useVoiceCommands.test.tsx` | `src/v2/modules/voice-assistant/hooks/__tests__/useVoiceCommands.test.tsx` |
| `src/v2/features/voice-assistant/hooks/__tests__/useVoiceSession.test.tsx` | `src/v2/modules/voice-assistant/hooks/__tests__/useVoiceSession.test.tsx` |
| `src/v2/features/voice-assistant/hooks/useVoiceCommands.ts` | `src/v2/modules/voice-assistant/hooks/useVoiceCommands.ts` |
| `src/v2/features/voice-assistant/hooks/useVoiceInput.ts` | `src/v2/modules/voice-assistant/hooks/useVoiceInput.ts` |
| `src/v2/features/voice-assistant/hooks/useVoiceSession.ts` | `src/v2/modules/voice-assistant/hooks/useVoiceSession.ts` |
| `src/v2/features/voice-assistant/i18n/index.ts` | `src/v2/modules/voice-assistant/i18n/index.ts` |
| `src/v2/features/voice-assistant/i18n/voiceAssistantResources.ts` | `src/v2/modules/voice-assistant/i18n/voiceAssistantResources.ts` |
| `src/v2/features/voice-assistant/index.ts` | `src/v2/modules/voice-assistant/index.ts` |
| `src/v2/features/voice-assistant/model/__tests__/voiceAssistant.contract.types.ts` | `src/v2/modules/voice-assistant/model/__tests__/voiceAssistant.contract.types.ts` |
| `src/v2/features/voice-assistant/model/__tests__/voiceAssistantCommand.test.ts` | `src/v2/modules/voice-assistant/model/__tests__/voiceAssistantCommand.test.ts` |
| `src/v2/features/voice-assistant/model/__tests__/voiceCommandEngine.integration.test.ts` | `src/v2/modules/voice-assistant/model/__tests__/voiceCommandEngine.integration.test.ts` |
| `src/v2/features/voice-assistant/model/__tests__/voiceCommands.test.ts` | `src/v2/modules/voice-assistant/model/__tests__/voiceCommands.test.ts` |
| `src/v2/features/voice-assistant/model/__tests__/voiceInput.test.ts` | `src/v2/modules/voice-assistant/model/__tests__/voiceInput.test.ts` |
| `src/v2/features/voice-assistant/model/__tests__/voiceSession.contract.types.ts` | `src/v2/modules/voice-assistant/model/__tests__/voiceSession.contract.types.ts` |
| `src/v2/features/voice-assistant/model/__tests__/voiceSession.test.ts` | `src/v2/modules/voice-assistant/model/__tests__/voiceSession.test.ts` |
| `src/v2/features/voice-assistant/model/voiceAssistantCommand.types.ts` | `src/v2/modules/voice-assistant/model/voiceAssistantCommand.types.ts` |
| `src/v2/features/voice-assistant/model/voiceAssistantCommandParser.ts` | `src/v2/modules/voice-assistant/model/voiceAssistantCommandParser.ts` |
| `src/v2/features/voice-assistant/model/voiceAssistantCommandPolicy.ts` | `src/v2/modules/voice-assistant/model/voiceAssistantCommandPolicy.ts` |
| `src/v2/features/voice-assistant/model/voiceCommandProvenance.ts` | `src/v2/modules/voice-assistant/model/voiceCommandProvenance.ts` |
| `src/v2/features/voice-assistant/model/voiceCommandQuery.ts` | `src/v2/modules/voice-assistant/model/voiceCommandQuery.ts` |
| `src/v2/features/voice-assistant/model/voiceCommandTime.ts` | `src/v2/modules/voice-assistant/model/voiceCommandTime.ts` |
| `src/v2/features/voice-assistant/model/voiceCommands.ts` | `src/v2/modules/voice-assistant/model/voiceCommands.ts` |
| `src/v2/features/voice-assistant/model/voiceInput.ts` | `src/v2/modules/voice-assistant/model/voiceInput.ts` |
| `src/v2/features/voice-assistant/model/voiceSession.ts` | `src/v2/modules/voice-assistant/model/voiceSession.ts` |
| `src/v2/features/voice-assistant/model/voiceSessionError.ts` | `src/v2/modules/voice-assistant/model/voiceSessionError.ts` |
| `src/v2/features/voice-assistant/model/voiceSessionExpiry.ts` | `src/v2/modules/voice-assistant/model/voiceSessionExpiry.ts` |
| `src/v2/features/voice-assistant/screens/VoiceAssistantScreen.tsx` | `src/v2/modules/voice-assistant/screens/VoiceAssistantScreen.tsx` |
| `src/v2/features/voice-assistant/screens/VoiceCommandScreen.tsx` | `src/v2/modules/voice-assistant/screens/VoiceCommandScreen.tsx` |
| `src/v2/shared/api/__tests__/currentActivityIntent.contract.types.ts` | `src/v2/modules/travel/__tests__/currentActivityIntent.contract.types.ts` |
| `src/v2/shared/api/__tests__/currentActivityIntent.test.mjs` | `src/v2/modules/travel/__tests__/currentActivityIntent.test.mjs` |
| `src/v2/shared/api/__tests__/travelSchedules.test.mjs` | `src/v2/modules/travel/__tests__/travelSchedules.test.mjs` |
| `src/v2/shared/api/mock/features/current-activity-intent/fixtures.ts` | `src/v2/modules/travel/current-activity-intent/mock/fixtures.ts` |
| `src/v2/shared/api/mock/features/current-activity-intent/handlers.ts` | `src/v2/modules/travel/current-activity-intent/mock/handlers.ts` |
| `src/v2/shared/api/mock/features/place-exploration/fixtures.ts` | `src/v2/modules/place/exploration/mock/fixtures.ts` |
| `src/v2/shared/api/mock/features/place-exploration/handlers.ts` | `src/v2/modules/place/exploration/mock/handlers.ts` |
| `src/v2/shared/api/mock/features/place-menus/fixtures.ts` | `src/v2/modules/place/menus/mock/fixtures.ts` |
| `src/v2/shared/api/mock/features/place-menus/handlers.ts` | `src/v2/modules/place/menus/mock/handlers.ts` |
| `src/v2/shared/api/mock/features/travel-purposes/fixtures.ts` | `src/v2/modules/travel/purposes/mock/fixtures.ts` |
| `src/v2/shared/api/mock/features/travel-purposes/handlers.ts` | `src/v2/modules/travel/purposes/mock/handlers.ts` |
| `src/v2/shared/api/mock/features/travel-schedules/fixtures.ts` | `src/v2/modules/travel/schedules/mock/fixtures.ts` |
| `src/v2/shared/api/mock/features/travel-schedules/handlers.ts` | `src/v2/modules/travel/schedules/mock/handlers.ts` |
| `src/v2/shared/api/mock/features/visit-verification/fixtures.ts` | `src/v2/modules/place/visit-verification/mock/fixtures.ts` |
| `src/v2/shared/api/mock/features/visit-verification/handlers.ts` | `src/v2/modules/place/visit-verification/mock/handlers.ts` |
| `src/v2/shared/api/mock/features/visitor-verification-reports/fixtures.ts` | `src/v2/modules/place/verification-reports/mock/fixtures.ts` |
| `src/v2/shared/api/mock/features/visitor-verification-reports/handlers.ts` | `src/v2/modules/place/verification-reports/mock/handlers.ts` |
| `test/__tests__/voiceEnvelopeSchema.test.ts` | `src/v2/modules/voice-assistant/model/__tests__/voiceEnvelopeSchema.test.ts` |

Additional assertion moves: five Travel purpose/schedule Hook tests leave app integration for `modules/travel/__tests__/hooks.test.mjs`; one conversion Hook and two retry tests move to `shared/analytics/conversion/__tests__`. Cross-domain transport assertions stay app-owned. Their existing assertion bodies are retained.

## Exact current public indexes

Test-only `__tests__/index.ts` entries support factories/spies and do not enlarge production exports. Travel root supplies stable headless query keys; screens use the narrower schedules/calendar public entries.

### `src/v2/modules/onboarding/entry/index.ts`

```ts
export { useOnboardingEntry } from './hooks/useOnboardingEntry';
export { getInitialAppRoute, getAuthInitialRoute, getUnauthenticatedNavigationKey } from './model/onboardingEntry';
export type { OnboardingCompletion, OnboardingEntryState, SignupOnboardingContext } from './model/onboardingEntry';
```

### `src/v2/modules/onboarding/i18n/index.ts`

```ts
export { onboardingResources } from './onboardingResources';
```

### `src/v2/modules/onboarding/index.ts`

```ts
export { useOnboardingEntry, getInitialAppRoute, getAuthInitialRoute, getUnauthenticatedNavigationKey } from './entry';
export type { OnboardingCompletion, OnboardingEntryState, SignupOnboardingContext } from './entry';
export { OnboardingPreferenceFlow, useSyncOnboardingTravelSchedule } from './preferences';
```

### `src/v2/modules/onboarding/preferences/index.ts`

```ts
export { default as OnboardingPreferenceFlow } from './screens/OnboardingPreferenceFlow';
export { useSyncOnboardingTravelSchedule } from './hooks/useSyncOnboardingTravelSchedule';
```

### `src/v2/modules/travel/calendar/index.ts`

```ts
export type { CalendarMonth } from './travelScheduleCalendar';
export { getTravelScheduleSelectionState } from './travelScheduleCalendar';
export { selectTravelDate } from './travelScheduleCalendar';
export { getInitialCalendarMonth } from './travelScheduleCalendar';
export { shiftCalendarMonth } from './travelScheduleCalendar';
export { buildCalendarDays } from './travelScheduleCalendar';
export { formatCalendarMonth } from './travelScheduleCalendar';
export { formatAccessibleTravelDate } from './travelScheduleCalendar';
export { formatDisplayTravelDate } from './travelScheduleCalendar';
export type { TravelDateInput } from './travelDate';
export type { ServerTravelDate } from './travelDate';
export { isServerTravelDate } from './travelDate';
export type { CalendarDay } from './travelScheduleCalendar';
export { parseTravelDateRange, toCreateTravelScheduleBody } from './travelDate';
export type { TravelDateRange } from './travelDate';
```

### `src/v2/modules/travel/current-activity-intent/index.ts`

```ts
export { ACTIVITY_INTENT_VALUES } from './model/currentActivityIntent.types';
export type { ActivityIntent } from './model/currentActivityIntent.types';
```

### `src/v2/modules/travel/index.ts`

```ts
export { userQueryKeys, travelPurposeQueryKeys, recommendationQueryKeys } from './purposes/model/travelPurposeQueryKeys';
```

### `src/v2/modules/travel/mock/index.ts`

```ts
export { currentActivityIntentMockHandlers } from '../current-activity-intent/mock/handlers';
export { travelPurposeMockHandlers } from '../purposes/mock/handlers';
export { travelScheduleMockHandlers } from '../schedules/mock/handlers';
```

### `src/v2/modules/travel/purposes/index.ts`

```ts
export { TRAVEL_PURPOSE_MAX_SELECTIONS, TRAVEL_PURPOSE_VALUES, isTravelPurpose } from './model/travelPurpose.types';
export type { TravelPurpose } from './model/travelPurpose.types';
```

### `src/v2/modules/travel/schedules/index.ts`

```ts
export { travelScheduleApi } from './api/travelScheduleApi';
export type { CreateTravelScheduleBody, TravelSchedule } from './api/travelScheduleApi';
export { invalidateTravelScheduleDependencies, useTravelSchedules, useCreateTravelSchedule, useUpdateTravelSchedule, useCancelTravelSchedule } from './hooks/useTravelSchedules';
```

### `src/v2/modules/merchant/index.ts`

```ts
export { default as MerchantMyPageContainer } from './screens/MerchantMyPageContainer';
```

### `src/v2/modules/voice-assistant/i18n/index.ts`

```ts
export { voiceAssistantResources } from './voiceAssistantResources';
```

### `src/v2/modules/voice-assistant/index.ts`

```ts
// App/Place assistant composition; parsing, policies and lifecycle stay internal.
export { default as VoiceCommandScreen } from './screens/VoiceCommandScreen';
export { default as VoiceAssistantScreen } from './screens/VoiceAssistantScreen';
export type { VoiceCommandContext } from './hooks/useVoiceCommands';
```

### `src/v2/shared/analytics/conversion/data/index.ts`

```ts
export { createConversionApi } from '../api/conversionApi';
export { createConversionEventMutationOptions } from '../hooks/useConversionEvents';
```

### `src/v2/shared/analytics/conversion/index.ts`

```ts
export { conversionApi, createConversionApi } from './api/conversionApi';
export type {
  ConversionEventBatchBody,
  ConversionEventBatchResult,
} from './api/conversionApi';
export {
  createConversionEventMutationOptions,
  useIngestConversionEvents,
} from './hooks/useConversionEvents';
export {
  getConversionRetryDelay,
  shouldRetryConversionEventMutation,
} from './model/conversionRetry';
```

## Removed #360 exception tuples

| Source | Target | Rule | Kind | Count |
|---|---|---|---|---:|
| `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/home/screens/HomeScreen.tsx` | `domain-public-api` | production | 1 |
| `src/v2/features/current-activity-intent/model/currentActivityIntentQueryKeys.ts` | `src/v2/features/travel-purposes/model/travelPurposeQueryKeys.ts` | `domain-public-api` | production | 1 |
| `src/v2/features/merchant-my-page/screens/__tests__/MerchantMyPageContainer.test.tsx` | `src/v2/features/merchant-my-page/api/merchantOwnerApi.ts` | `screen-no-api` | test | 1 |
| `src/v2/features/travel-schedules/hooks/useTravelSchedules.ts` | `src/v2/features/travel-purposes/model/travelPurposeQueryKeys.ts` | `domain-public-api` | production | 1 |
| `src/v2/features/travel-schedules/model/travelScheduleQueryKeys.ts` | `src/v2/features/travel-purposes/model/travelPurposeQueryKeys.ts` | `domain-public-api` | production | 1 |
| `src/v2/shared/api/__tests__/apiError.test.mjs` | `src/v2/features/conversion/model/conversionRetry.ts` | `shared-no-domain` | test | 1 |
| `src/v2/shared/api/__tests__/apiError.test.mjs` | `src/v2/features/conversion/model/conversionRetry.ts` | `domain-public-api` | test | 1 |
| `src/v2/shared/api/__tests__/currentActivityIntent.contract.types.ts` | `src/v2/features/current-activity-intent/model/currentActivityIntent.types.ts` | `shared-no-domain` | test | 1 |
| `src/v2/shared/api/__tests__/currentActivityIntent.contract.types.ts` | `src/v2/features/current-activity-intent/model/currentActivityIntent.types.ts` | `domain-public-api` | test | 1 |
| `src/v2/shared/api/__tests__/currentActivityIntent.test.mjs` | `src/v2/features/current-activity-intent/api/currentActivityIntentApi.ts` | `shared-no-domain` | test | 1 |
| `src/v2/shared/api/__tests__/currentActivityIntent.test.mjs` | `src/v2/features/current-activity-intent/api/currentActivityIntentApi.ts` | `domain-public-api` | test | 1 |
| `src/v2/shared/api/__tests__/currentActivityIntent.test.mjs` | `src/v2/features/current-activity-intent/hooks/useCurrentActivityIntent.ts` | `shared-no-domain` | test | 1 |
| `src/v2/shared/api/__tests__/currentActivityIntent.test.mjs` | `src/v2/features/current-activity-intent/hooks/useCurrentActivityIntent.ts` | `domain-public-api` | test | 1 |
| `src/v2/shared/api/__tests__/currentActivityIntent.test.mjs` | `src/v2/features/current-activity-intent/model/currentActivityIntentQueryKeys.ts` | `shared-no-domain` | test | 1 |
| `src/v2/shared/api/__tests__/currentActivityIntent.test.mjs` | `src/v2/features/current-activity-intent/model/currentActivityIntentQueryKeys.ts` | `domain-public-api` | test | 1 |
| `src/v2/shared/api/__tests__/travelSchedules.test.mjs` | `src/v2/features/travel-schedules/api/travelScheduleApi.ts` | `shared-no-domain` | test | 1 |
| `src/v2/shared/api/__tests__/travelSchedules.test.mjs` | `src/v2/features/travel-schedules/api/travelScheduleApi.ts` | `domain-public-api` | test | 1 |
| `src/v2/shared/api/apiClient.ts` | `src/v2/shared/api/mock/mockApiClient.ts` | `production-cycle` | production | 1 |
| `src/v2/shared/api/mock/mockApiClient.ts` | `src/v2/shared/api/apiClient.ts` | `production-cycle` | production | 1 |
| `src/v2/features/onboarding-entry/index.ts` | `src/v2/features/onboarding-entry/hooks/useOnboardingEntry.ts` | `public-no-export-star` | production | 1 |
| `src/v2/features/onboarding-entry/index.ts` | `src/v2/features/onboarding-entry/model/onboardingEntry.ts` | `public-no-export-star` | production | 1 |
| `src/v2/features/onboarding-entry/index.ts` | `src/v2/features/onboarding-entry/services/onboardingCompletionStorage.ts` | `public-no-export-star` | production | 1 |
