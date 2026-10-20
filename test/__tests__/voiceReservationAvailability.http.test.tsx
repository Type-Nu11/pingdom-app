import React from 'react';
import { AppState, Pressable, Text } from 'react-native';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { configureApiTransport, type ApiTransport } from '../../src/v2/shared/api';
import { renderWithProviders } from '../../src/v2/app/testing/testProviders';
import { useVoiceReservation } from '../../src/v2/modules/voice-assistant/hooks/useVoiceReservation';

type HttpResponse = { statusCode?: number; setEncoding: (encoding: string) => void;
  on: (event: string, listener: (chunk: string) => void) => void };
const http = require('node:http') as { get: (url: string, options: { signal?: AbortSignal }, listener: (response: HttpResponse) => void) => {
  on: (event: string, listener: (error: Error) => void) => void;
} };

// Start postman/simulations/voice-reservation.sim.yaml and supply its /booking URL.
const simulationUrl = process.env.PINGDOM_RESERVATION_SIM_URL;
const simulate = simulationUrl ? test : test.skip;
function Harness() {
  const flow = useVoiceReservation('101', 'Asia/Seoul', { phase: 'idle' });
  return <>
    <Pressable testID="select-place" disabled={flow.state.phase === 'loading'} onPress={() => { void flow.selectPlace({ id: 70095, name: '계약 검증 장소', address: '서울',
      touristCategories: ['CAFE'], operatingStatus: 'OPERATING' }); }}><Text>선택</Text></Pressable>
    <Text testID="available-dates">{flow.dates.join(',')}</Text>
    <Text testID="load-error">{String(flow.loadError)}</Text>
  </>;
}

simulate('actual HTTP availability -> API normalization -> AI reservation dates without optional terms', async () => {
  const originalState = AppState.currentState; AppState.currentState = 'active';
  jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2030-10-19T00:00:00Z'));
  const requests: string[] = [];
  const transport = { get: (path: string, options: { signal?: AbortSignal }) => new Promise((resolve, reject) => {
    requests.push(`GET ${path}`);
    const request = http.get(`${simulationUrl}${path}`, { signal: options?.signal }, response => {
      let body = '';
      response.setEncoding('utf8'); response.on('data', chunk => { body += chunk; });
      response.on('end', () => {
        try {
          if (response.statusCode !== 200) throw new Error(`Unexpected HTTP ${response.statusCode}`);
          resolve({ data: JSON.parse(body) });
        } catch (error) { reject(error); }
      });
    });
    request.on('error', reject);
  }) } as unknown as ApiTransport;
  const restore = configureApiTransport(transport);
  const view = await renderWithProviders(<Harness />);
  try {
    await waitFor(() => expect(screen.getByTestId('select-place')).toBeEnabled());
    await fireEvent.press(screen.getByTestId('select-place'));
    await waitFor(() => expect(screen.getByTestId('available-dates')).toHaveTextContent('2030-10-20'));
    expect(screen.getByTestId('load-error')).toHaveTextContent('false');
    expect(requests).toEqual(['GET /places/70095/availabilities']);
  } finally { await view.unmount(); restore(); AppState.currentState = originalState; }
});
