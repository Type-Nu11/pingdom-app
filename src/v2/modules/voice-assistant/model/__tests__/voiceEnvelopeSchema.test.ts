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
