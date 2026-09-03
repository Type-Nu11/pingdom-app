import type { PlaceMenus } from '../../../../../features/place-menus/model/placeMenu.types';

export const placeMenuFixture = [
  {
    id: 1701,
    placeId: 17,
    name: 'PingDom signature menu',
    description: 'Synthetic menu available only through the explicit development mock.',
    priceAmount: 12000,
    currency: 'KRW',
    imageUrl: 'https://cdn.example.test/places/17/menus/1701.jpg',
    status: 'AVAILABLE',
    displayOrder: 1,
    createdAt: '2026-09-01T03:00:00Z',
    updatedAt: '2026-09-01T03:00:00Z',
  },
  {
    id: 1702,
    placeId: 17,
    name: 'Sold-out mock menu',
    description: null,
    priceAmount: 0,
    currency: 'USD',
    imageUrl: null,
    status: 'SOLD_OUT',
    displayOrder: 2,
    createdAt: '2026-09-01T03:00:00Z',
    updatedAt: '2026-09-01T03:00:00Z',
  },
] satisfies PlaceMenus;
