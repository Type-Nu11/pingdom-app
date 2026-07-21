import type {
  MainNavigationProp,
  MerchantId,
  PlaceId,
} from '../types';

declare const merchantId: MerchantId;
declare const navigation: MainNavigationProp<'Map'>;
declare const placeId: PlaceId;

navigation.navigate('PlaceDetail', { placeId });
navigation.navigate('Merchant', { merchantId });

// @ts-expect-error Raw strings must be parsed before becoming route IDs.
navigation.navigate('PlaceDetail', { placeId: '123' });

// @ts-expect-error Entity-specific route ID brands cannot be mixed.
navigation.navigate('PlaceDetail', { placeId: merchantId });

// @ts-expect-error PlaceDetail requires a placeId.
navigation.navigate('PlaceDetail');
