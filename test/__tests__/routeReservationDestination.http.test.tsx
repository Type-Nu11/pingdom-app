import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';
import { configureApiTransport, type ApiTransport } from '../../src/v2/shared/api';
import { renderWithProviders } from '../../src/v2/app/testing/testProviders';
import RecentReservationPlaces from '../../src/v2/modules/place/map/routes/components/RecentReservationPlaces';

type HttpResponse = { statusCode?: number; setEncoding: (encoding: string) => void;
  on: (event: string, listener: (chunk: string) => void) => void };
const http = require('node:http') as { get: (url: URL, options: { signal?: AbortSignal }, listener: (response: HttpResponse) => void) => {
  on: (event: string, listener: (error: Error) => void) => void;
} };
const simulationUrl = process.env.PINGDOM_RESERVATION_SIM_URL;
const simulate = simulationUrl ? test : test.skip;

simulate('HTTP reservation list -> selected place coordinates -> ready destination without a new search', async () => {
  const requests: string[] = [];
  const transport = { get: (path: string, options: { signal?: AbortSignal; params?: Record<string, string | number> }) => new Promise((resolve, reject) => {
    const url = new URL(`${simulationUrl}${path}`);
    for (const [key, value] of Object.entries(options?.params ?? {})) url.searchParams.set(key, String(value));
    requests.push(`GET ${url.pathname}${url.search}`);
    const request = http.get(url, { signal: options?.signal }, response => {
      let body = ''; response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => {
        try {
          if (response.statusCode !== 200) throw new Error(`Unexpected HTTP ${response.statusCode}`);
          resolve({ data: JSON.parse(body) });
        } catch (error) { reject(error); }
      });
    }); request.on('error', reject);
  }) } as unknown as ApiTransport;
  const restore = configureApiTransport(transport);
  const onSelect = jest.fn();
  const view = await renderWithProviders(<RecentReservationPlaces owner={{ kind: 'user', userId: 101 }} onSelect={onSelect} />);
  try {
    await view.user.press(await screen.findByRole('button', { name: '예약 길찾기 검증 장소 도착지로 설정' }));
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith({ placeId: 70096, name: '예약 길찾기 검증 장소', address: '대구 북구 엑스코로 10', latitude: 35.9, longitude: 128.6 }));
    expect(requests).toEqual(['/booking/reservations?page=1&limit=20', '/booking/places/70096'].map(path => `GET ${path}`));
  } finally { await view.unmount(); restore(); }
});
