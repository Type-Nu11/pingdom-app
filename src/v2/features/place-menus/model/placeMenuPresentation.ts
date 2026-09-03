import { formatCurrency } from '../../../shared/i18n/formatters';
import {
  PLACE_MENU_CURRENCIES,
  type PlaceMenu,
  type PlaceMenuCurrency,
  type PlaceMenuPresentation,
  type PlaceMenus,
} from './placeMenu.types';

const currencySet = new Set<string>(PLACE_MENU_CURRENCIES);

const clean = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

const isValidId = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

const isPublicStatus = (
  value: PlaceMenu['status'] | string | undefined,
): value is PlaceMenuPresentation['status'] => value === 'AVAILABLE' || value === 'SOLD_OUT';

const asCurrency = (value: unknown): PlaceMenuCurrency | null =>
  typeof value === 'string' && currencySet.has(value) ? value as PlaceMenuCurrency : null;

export function selectPlaceMenus(value: PlaceMenus | unknown): PlaceMenuPresentation[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item: PlaceMenu) => {
    const name = clean(item?.name);
    if (!isValidId(item?.id) || !name || !isPublicStatus(item?.status)) return [];

    return [{
      currency: asCurrency(item.currency),
      description: clean(item.description),
      id: item.id,
      imageUrl: clean(item.imageUrl),
      name,
      priceAmount: typeof item.priceAmount === 'number'
        && Number.isSafeInteger(item.priceAmount)
        && item.priceAmount >= 0
        ? item.priceAmount
        : null,
      status: item.status,
    }];
  });
}

export function formatPlaceMenuPrice(
  amount: number | null,
  currency: PlaceMenuCurrency | null,
  language: string,
): string | null {
  if (amount === null || currency === null) return null;
  try {
    return formatCurrency(amount, currency, language);
  } catch {
    return null;
  }
}
