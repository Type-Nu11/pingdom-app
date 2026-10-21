import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
const { readFileSync } = jest.requireActual<{ readFileSync(path: string, encoding: string): string }>('fs');
const server = JSON.parse(readFileSync('docs/api/voice-ai.openapi.json', 'utf8'));
const schema = JSON.parse(readFileSync('docs/architecture/voice-assistant/provider-envelope.v1.schema.json', 'utf8'));
import { parseVoiceAssistantEnvelope } from '../voiceAssistantCommandParser';

const ajv = new Ajv2020({ strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);
const validateServer = ajv.compile(server.components.schemas.ProviderEnvelopeV1);
const base = { schemaVersion: 1, id: 'fixture-1' };
const commands = [
  { command: 'searchNearbyReservablePlaces', args: { date: '2026-09-20', startTime: '14:00', endTime: '17:00', quantity: 2, useCurrentLocation: true } },
  { command: 'getPlaceDetails', args: { placeId: 1 } },
  { command: 'getAvailabilities', args: { placeId: 1, date: '2026-09-20', quantity: 2 } },
  { command: 'prepareReservation', args: { placeId: 1, availabilityId: 2, quantity: 2 } },
  { command: 'cancelVoiceSession', args: {} },
];
const valid = [
  ...commands.map(command => ({ ...base, kind: 'command_request', ...command })),
  { ...base, kind: 'clarification_request', field: 'date', text: '날짜를 알려 주세요.' },
  { ...base, kind: 'assistant_message', text: '안녕하세요.' },
  { ...base, kind: 'protocol_error', code: 'PROVIDER_UNAVAILABLE' },
];
test.each(valid)('schema and runtime accept representative $kind fixture', fixture => {
  expect(validate(fixture)).toBe(true);
  expect(validateServer(fixture)).toBe(true);
  expect(parseVoiceAssistantEnvelope(fixture).ok).toBe(true);
});
const invalid = [
  ...valid.map(value => ({ ...value, source: 'app' })),
  { ...base, kind: 'command_result' },
  { ...valid[0], schemaVersion: 2 },
  { ...valid[1], args: { placeId: 0 } },
  { ...valid[3], args: { placeId: 1, availabilityId: 2, quantity: 13 } },
  { ...base, kind: 'assistant_message', text: ' ' },
];
test.each(invalid)('schema and runtime reject representative invalid fixture %#', fixture => {
  expect(validate(fixture)).toBe(false);
  expect(validateServer(fixture)).toBe(false);
  expect(parseVoiceAssistantEnvelope(fixture).ok).toBe(false);
});
test('runtime retains semantic constraints beyond structural schema', () => {
  const value = { ...base, kind: 'command_request', command: 'searchNearbyReservablePlaces', args: { ...commands[0].args, startTime: '17:00', endTime: '14:00' } };
  expect(validate(value)).toBe(true);
  expect(parseVoiceAssistantEnvelope(value).ok).toBe(false);
});

test('general discovery extension matches the prepared server schema, not the deployed snapshot', () => {
  const fixture = { ...base, kind: 'command_request', command: 'searchNearbyPlaces', args: { useCurrentLocation: true } };
  expect(validate(fixture)).toBe(true);
  expect(parseVoiceAssistantEnvelope(fixture).ok).toBe(true);
  // The saved server contract is deliberately unchanged until this extension is deployed and fetched.
  expect(validateServer(fixture)).toBe(false);
});

test.each([
  { keyword: '갈비탕', category: 'RESTAURANT', matchSource: 'menu', matchTerms: ['갈비탕'], relatedKeywords: ['한식'] },
  { keyword: '암벽등반', matchSource: 'place', matchTerms: ['암벽등반', '클라이밍'] },
])('generic discovery plan is accepted by schema and runtime: %p', args => {
  const fixture = { ...base, kind: 'command_request', command: 'searchNearbyPlaces', args: { useCurrentLocation: true, ...args } };
  expect(validate(fixture)).toBe(true);
  expect(parseVoiceAssistantEnvelope(fixture).ok).toBe(true);
});

test.each([
  { matchSource: 'menu' }, { keyword: '호텔', relatedKeywords: [] },
  { keyword: '호텔', relatedKeywords: ['a', 'b', 'c', 'd'] }, { keyword: '호텔', matchTerms: [' '] },
])('schema and runtime reject invalid generic discovery plan: %p', args => {
  const fixture = { ...base, kind: 'command_request', command: 'searchNearbyPlaces', args: { useCurrentLocation: true, ...args } };
  expect(validate(fixture)).toBe(false);
  expect(parseVoiceAssistantEnvelope(fixture).ok).toBe(false);
});

test.each(['date', 'startTime', 'endTime', 'quantity', 'latitude', 'route', 'confirmed'])('general discovery rejects injected %s', field => {
  const fixture = { ...base, kind: 'command_request', command: 'searchNearbyPlaces', args: { useCurrentLocation: true, [field]: 1 } };
  expect(validate(fixture)).toBe(false);
  expect(parseVoiceAssistantEnvelope(fixture).ok).toBe(false);
});

test.each([
  { keyword: '갈비탕', limit: 3 }, { keyword: ' 갈비탕 ', limit: 1 },
])('general keyword discovery accepts bounded arguments %p', args => {
  const fixture = { ...base, kind: 'command_request', command: 'searchNearbyPlaces', args: { useCurrentLocation: true, ...args } };
  expect(validate(fixture)).toBe(true);
  expect(parseVoiceAssistantEnvelope(fixture)).toMatchObject({ ok: true, value: { args } });
});

test.each([
  { keyword: '' }, { keyword: '   ' }, { keyword: null }, { keyword: '가'.repeat(101) },
  { limit: 0 }, { limit: 4 }, { limit: 1.5 }, { limit: '3' }, { limit: null },
])('general keyword discovery rejects invalid arguments %p', args => {
  const fixture = { ...base, kind: 'command_request', command: 'searchNearbyPlaces', args: { useCurrentLocation: true, ...args } };
  expect(validate(fixture)).toBe(false);
  expect(parseVoiceAssistantEnvelope(fixture).ok).toBe(false);
});


test.each([
  { page: 'map' }, { page: 'search' }, { page: 'favorites' }, { page: 'reservations' }, { page: 'myPage' }, { page: 'settings' },
  { page: 'community' }, { page: 'communityPost' }, { page: 'recommendations' }, { page: 'coupons' }, { page: 'verifiedPlaces' },
  { page: 'accountManagement' }, { page: 'notificationSettings' }, { page: 'loginInformation' },
  { page: 'locationSettings' }, { page: 'privacySettings' }, { page: 'dataManagement' },
  { page: 'placeDetail' }, { page: 'placeDetail', placeId: 42 }, { page: 'createReservation' }, { page: 'createReservation', placeId: 42 },
  { page: 'directions' }, { page: 'directions', placeId: 42 },
])('navigation app schema and parser accept %p without altering the server snapshot', args => {
  const fixture = { ...base, kind: 'command_request', command: 'navigateToPage', args };
  expect(validate(fixture)).toBe(true); expect(parseVoiceAssistantEnvelope(fixture).ok).toBe(true);
  expect(validateServer(fixture)).toBe(false);
});

test('my reservations is an app-owned read tool, not a change to the historical server snapshot', () => {
  const fixture = { ...base, kind: 'command_request', command: 'getMyReservations', args: {} };
  expect(validate(fixture)).toBe(true);
  expect(parseVoiceAssistantEnvelope(fixture).ok).toBe(true);
  expect(validateServer(fixture)).toBe(false);
});

test.each([
  { page: 'https://example.com' }, { page: 'Settings' }, { page: 'delete' }, { page: 'map', route: 'Settings' },
  { page: 'communityPost', postId: 71 }, { page: 'communityPost', placeId: 71 },
  { page: 'verifiedPlaces', role: 'USER' }, { page: 'dataManagement', confirmed: true },
  { page: 'map', placeId: 1 }, { page: 'createReservation', placeId: 0 }, { page: 'createReservation', date: '2026-10-15' }, { page: 'createReservation', quantity: 2 }, { page: 'createReservation', confirmed: true },
  { page: 'placeDetail', placeId: 0 }, { page: 'placeDetail', placeId: '42' },
  { page: 'placeDetail', placeId: Number.MAX_SAFE_INTEGER + 1 }, { page: 'settings', confirmed: true }, {},
])('navigation schema and parser reject %p', args => {
  const fixture = { ...base, kind: 'command_request', command: 'navigateToPage', args };
  expect(validate(fixture)).toBe(false); expect(parseVoiceAssistantEnvelope(fixture).ok).toBe(false);
});
