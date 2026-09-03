import type { PlaceMenusOperationResponse } from '../../../shared/api';

export type PlaceMenu = PlaceMenusOperationResponse<'list_5', 200>[number];
export type PlaceMenus = PlaceMenusOperationResponse<'list_5', 200>;

export const PLACE_MENU_CURRENCIES = ['KRW', 'USD', 'JPY', 'CNY', 'EUR'] as const;
export type PlaceMenuCurrency = (typeof PLACE_MENU_CURRENCIES)[number];

export type PlaceMenuPresentation = {
  currency: PlaceMenuCurrency | null;
  description: string | null;
  id: number;
  imageUrl: string | null;
  name: string;
  priceAmount: number | null;
  status: 'AVAILABLE' | 'SOLD_OUT';
};
