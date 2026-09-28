import { diagnosticUrl, withApiDiagnostics } from '../apiDiagnostics';
import type { ApiTransport } from '../apiClient';

afterEach(() => jest.restoreAllMocks());
test('URL metadata removes credentials, query, fragment, and dynamic values', () => {
  expect(diagnosticUrl('https://user:password@api.example.com/places/123?token=secret#private')).toBe('https://api.example.com/places/:redacted');
  expect(diagnosticUrl('/users/private@example.com', 'https://api.example.com')).toBe('https://api.example.com/users/:redacted');
});
test('logs proxy failure, final address and auth presence without sensitive response data', async () => {
  const log = jest.spyOn(console, 'info').mockImplementation(() => {});
  const error = { code: 'ERR_BAD_REQUEST', config: { headers: { Authorization: 'Bearer secret-token' }, _retry: true }, response: {
    status: 400, data: { error: 'missing required header: x-timestamp', email: 'private@example.com' },
    headers: { location: 'http://api.example.com:8081/places/?token=secret' },
  } };
  const original = { get: jest.fn().mockRejectedValue(error) } as unknown as ApiTransport;
  const client = withApiDiagnostics(original, 'https://api.example.com', true);
  await expect(client.get('/places', { headers: { Authorization: 'Bearer secret-token' }, params: { keyword: 'private-name' } })).rejects.toBe(error);
  expect(log.mock.calls[1][2]).toMatchObject({ status: 400, missingRequiredHeader: 'x-timestamp', internalPortRedirect: true, insecureRedirect: true, authorizationPresentAtTransport: true, authRetryAttempted: true });
  const output = JSON.stringify(log.mock.calls);
  for (const sensitive of ['secret-token', 'private@example.com', 'private-name', '?token=']) expect(output).not.toContain(sensitive);
});
test('production gating returns original transport and emits nothing', () => {
  const transport = {} as ApiTransport;
  expect(withApiDiagnostics(transport, 'https://api.example.com', false)).toBe(transport);
});
test('success and no-response failure are distinguished, logging cannot alter results', async () => {
  const log = jest.spyOn(console, 'info').mockImplementation(() => {});
  const response = { status: 200, data: { token: 'private' }, request: { responseURL: 'https://api.example.com/users/me' } };
  const original = { get: jest.fn().mockResolvedValueOnce(response).mockRejectedValueOnce({ code: 'ERR_NETWORK' }) } as unknown as ApiTransport;
  const client = withApiDiagnostics(original, 'https://api.example.com', true);
  expect(await client.get('/users/me')).toBe(response);
  expect(log.mock.calls[1][2]).toMatchObject({ status: 200, finalUrl: 'https://api.example.com/users/me' });
  await expect(client.get('/places')).rejects.toMatchObject({ code: 'ERR_NETWORK' });
  expect(log.mock.calls[3][2]).toMatchObject({ status: null, errorCode: 'ERR_NETWORK' });
  expect(JSON.stringify(log.mock.calls)).not.toContain('private');
});
