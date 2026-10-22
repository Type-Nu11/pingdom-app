import React from 'react';
import { screen, waitFor, act } from '@testing-library/react-native';
import { createTestQueryClient, renderWithProviders } from '../../../../../app/testing/testProviders';
import { createReservationsQueryOptions, type Reservation } from '../../../../booking/reservations';
import { createPlaceDetailQueryOptions, type PlaceDetail } from '../../../detail';
import RecentReservationPlaces from '../components/RecentReservationPlaces';

const reservation = (id: number, overrides: Partial<Reservation> = {}) => ({
  id, status: 'CONFIRMED', touristUserId: 1, createdAt: `2030-10-${id + 10}T00:00:00Z`,
  reservationStartsAt: '2030-10-30T03:00:00Z',
  confirmation: { placeId: id, placeName: `예약 장소 ${id}`, startsAt: '2030-10-30T03:00:00Z', timezone: 'Asia/Seoul' },
  ...overrides,
}) as Reservation;
const place = (id: number, latitude = 35.8) => ({ id, name: `예약 장소 ${id}`, address: '대구', roadAddress: '대구 도로명', latitude, longitude: 128.6 }) as PlaceDetail;
function cache(items: Reservation[], ownerId = 1) {
  const client = createTestQueryClient();
  const key = [...createReservationsQueryOptions({ page: 1, limit: 20 }).queryKey, `user:${ownerId}`];
  client.setQueryData(key, { pages: [{ reservations: items, hasNext: false }], pageParams: [1] });
  for (const item of items) if (item.confirmation) client.setQueryData(createPlaceDetailQueryOptions(item.confirmation.placeId).queryKey, place(item.confirmation.placeId));
  return client;
}

test('recent reservations show newest first and a tap resolves the actual place without another search', async () => {
  const client = cache([reservation(1), reservation(2), reservation(3, { status: 'CANCELED' }), reservation(4, { confirmation: null })]);
  const onSelect = jest.fn();
  const view = await renderWithProviders(<RecentReservationPlaces owner={{ kind: 'user', userId: 1 }} onSelect={onSelect} />, { queryClient: client });
  expect(screen.getByRole('header', { name: '최근 예약' })).toBeVisible();
  expect(screen.getAllByRole('button').map(button => button.props.accessibilityLabel)).toEqual(['예약 장소 2 도착지로 설정', '예약 장소 1 도착지로 설정']);
  await view.user.press(screen.getByRole('button', { name: '예약 장소 2 도착지로 설정' }));
  await waitFor(() => expect(onSelect).toHaveBeenCalledWith({ placeId: 2, name: '예약 장소 2', address: '대구 도로명', latitude: 35.8, longitude: 128.6 }));
  expect(screen.queryByText('최근 검색')).toBeNull();
});

test('missing coordinates do not select a destination and the same reservation can be retried', async () => {
  const client = cache([reservation(1)]);
  client.setQueryData(createPlaceDetailQueryOptions(1).queryKey, place(1, NaN));
  const onSelect = jest.fn();
  const view = await renderWithProviders(<RecentReservationPlaces owner={{ kind: 'user', userId: 1 }} onSelect={onSelect} />, { queryClient: client });
  await view.user.press(screen.getByRole('button'));
  expect(await screen.findByText('예약 장소를 불러오지 못했습니다. 다시 눌러 주세요.')).toBeVisible();
  expect(onSelect).not.toHaveBeenCalled();
  client.setQueryData(createPlaceDetailQueryOptions(1).queryKey, place(1));
  await view.user.press(screen.getByRole('button'));
  await waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
});

test('a changed account cannot use the previous reservations or a late place response', async () => {
  const client = cache([reservation(1)]);
  client.setQueryData([...createReservationsQueryOptions({ page: 1, limit: 20 }).queryKey, 'user:2'], { pages: [{ reservations: [], hasNext: false }], pageParams: [1] });
  let resolve!: (value: PlaceDetail) => void;
  jest.spyOn(client, 'fetchQuery').mockImplementationOnce(() => new Promise<PlaceDetail>(done => { resolve = done; }));
  const onSelect = jest.fn();
  const view = await renderWithProviders(<RecentReservationPlaces owner={{ kind: 'user', userId: 1 }} onSelect={onSelect} />, { queryClient: client });
  await view.user.press(screen.getByRole('button'));
  await view.rerender(<RecentReservationPlaces owner={{ kind: 'user', userId: 2 }} onSelect={onSelect} />);
  expect(screen.queryByText('예약 장소 1')).toBeNull();
  await act(async () => resolve(place(1)));
  expect(onSelect).not.toHaveBeenCalled();
});

test('a guest never sees cached account reservations', async () => {
  const client = cache([reservation(1)]);
  await renderWithProviders(<RecentReservationPlaces owner={{ kind: 'guest' }} onSelect={jest.fn()} />, { queryClient: client });
  expect(screen.queryByText('예약 장소 1')).toBeNull();
  expect(screen.getByText('도착지로 선택할 수 있는 예약이 없습니다.')).toBeVisible();
});
