import type {
  MainNavigationProp,
  MerchantId,
  PlaceId,
} from '../types';

declare const merchantId: MerchantId;
declare const navigation: MainNavigationProp<'Map'>;
declare const placeId: PlaceId;

navigation.navigate('Map', { focusedPlaceId: placeId });
navigation.navigate('Merchant', { merchantId });

// @ts-expect-error Raw strings must be parsed before becoming route IDs.
navigation.navigate('Map', { focusedPlaceId: '123' });

// @ts-expect-error Entity-specific route ID brands cannot be mixed.
navigation.navigate('Map', { focusedPlaceId: merchantId });
