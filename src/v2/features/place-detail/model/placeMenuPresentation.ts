import type { PlaceMenu } from './placeDetail.types';

export type PlaceMenuStatus = 'AVAILABLE' | 'SOLD_OUT' | 'UNKNOWN';

export type PlaceMenuPresentation = {
  currency: string | null;
  description: string | null;
  displayOrder: number | null;
  id: number | null;
  imageUrl: string | null;
  name: string | null;
  priceAmount: number | null;
  status: PlaceMenuStatus;
};

const clean = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

const finiteNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

/**
 * The public endpoint already returns displayOrder order. Keep that order intact,
 * while refusing to surface administrative states if a malformed response leaks one.
 */
export function presentPlaceMenus(
  menus: readonly PlaceMenu[],
  placeId: number,
): PlaceMenuPresentation[] {
  return menus.flatMap((menu) => {
    if (menu.placeId !== undefined && menu.placeId !== placeId) return [];
    if (menu.status === 'HIDDEN' || menu.status === 'INACTIVE') return [];

    return [{
      currency: clean(menu.currency),
      description: clean(menu.description),
      displayOrder: finiteNumber(menu.displayOrder),
      id: finiteNumber(menu.id),
      imageUrl: clean(menu.imageUrl),
      name: clean(menu.name),
      priceAmount: finiteNumber(menu.priceAmount),
      status: menu.status === 'AVAILABLE' || menu.status === 'SOLD_OUT'
        ? menu.status
        : 'UNKNOWN',
    }];
  });
}

export function formatPlaceMenuPrice(
  menu: Pick<PlaceMenuPresentation, 'currency' | 'priceAmount'>,
  locale: string,
): string | null {
  if (menu.priceAmount === null || menu.priceAmount < 0 || !menu.currency) return null;

  try {
    return new Intl.NumberFormat(locale, {
      currency: menu.currency,
      style: 'currency',
    }).format(menu.priceAmount);
  } catch {
    return null;
  }
}
