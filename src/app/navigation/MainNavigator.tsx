/**
 * Explicit production bridge (#124 parity / #139 removal).
 * CheckIn and Merchant deep links still require these legacy screens; auth keeps its
 * existing selector/session semantics. All V2 route composition belongs to application.
 * This module is also used by the retained, unreachable V1 root. No new fallback.
 */
import { createProductionMainNavigator } from '../../application/navigation/MainNavigator';
import { useAuthStore } from '../store/authStore';
import CheckInScreen from '../../features/place/screens/CheckInScreen';
import RoutePlaceholderScreen from './RoutePlaceholderScreen';

export const { MainNavigator, MapRouteScreen, MyPageRouteScreen, ProfileEditRouteScreen, VerifiedPlacesRouteScreen, SettingsRouteScreen, AccountManagementRouteScreen, SettingsDetailRouteScreen, NotificationSettingsRouteScreen } = createProductionMainNavigator({
  useAuthStore, CheckInScreen, RoutePlaceholderScreen,
});

export default MainNavigator;
