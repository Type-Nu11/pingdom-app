import { VOICE_QUANTITY_LIMITS, VOICE_SCHEMA_VERSION } from './voiceAssistantCommand.types';
import type {
  ClarificationField, ProtocolErrorCode, ProviderEnvelope, VoiceAssistantCommand,
  VoiceEnvelopeParseResult, VoiceParserRejectionCode, VoiceTouristCategory,
} from './voiceAssistantCommand.types';

const categories = ['K_POP', 'BEAUTY', 'FASHION', 'CAFE', 'FOOD', 'POP_UP', 'EXHIBITION', 'NIGHTLIFE', 'OTHER'] as const satisfies readonly VoiceTouristCategory[];
// A generated enum addition must be considered before accepting new categories.
const categoriesExhaustive: Exclude<VoiceTouristCategory, typeof categories[number]> extends never ? true : never = true;
void categoriesExhaustive;
const clarificationFields = ['touristCategory', 'date', 'timeRange', 'quantity', 'useCurrentLocation', 'placeId', 'availabilityId'] as const satisfies readonly ClarificationField[];
const protocolErrors = ['UNSUPPORTED_REQUEST', 'PROVIDER_UNAVAILABLE', 'INVALID_RESPONSE'] as const satisfies readonly ProtocolErrorCode[];

class Rejection {
  constructor(readonly code: VoiceParserRejectionCode, readonly path: string) {}
}
function fail(code: VoiceParserRejectionCode, path: string): never { throw new Rejection(code, path); }

/** Snapshot own enumerable data properties only; never call input getters or toJSON. */
function record(input: unknown, path: string): Record<string, unknown> {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) fail('INVALID_OBJECT', path);
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) fail('INVALID_OBJECT', path);
  const keys = Reflect.ownKeys(input);
  // All v1 objects have <= 7 keys. Bound work before inspecting descriptors.
  if (keys.length > 10) fail('UNEXPECTED_FIELD', path);
  const result: Record<string, unknown> = Object.create(null);
  for (const key of keys) {
    if (typeof key !== 'string' || key === '__proto__' || key === 'constructor' || key === 'prototype') fail('UNEXPECTED_FIELD', path);
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) fail('INVALID_OBJECT', path);
    result[key] = descriptor.value;
  }
  return result;
}
function exact(value: Record<string, unknown>, required: readonly string[], optional: readonly string[], path: string) {
  if (Object.keys(value).some((key) => !required.includes(key) && !optional.includes(key))) fail('UNEXPECTED_FIELD', path);
  for (const key of required) if (!Object.hasOwn(value, key)) fail('MISSING_FIELD', `${path}.${key}`);
}
function integerId(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) fail('INVALID_ID', path);
  return value;
}
function quantity(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < VOICE_QUANTITY_LIMITS.min || value > VOICE_QUANTITY_LIMITS.max) fail('INVALID_QUANTITY', '$.args.quantity');
  return value;
}
function localDate(value: unknown): string {
  const path = '$.args.date';
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail('INVALID_DATE', path);
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year === 0 || month < 1 || month > 12 || day < 1 || day > days[month - 1]) fail('INVALID_DATE', path);
  return value;
}
function localTime(value: unknown, path: string): string {
  if (typeof value !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) fail('INVALID_TIME', path);
  return value;
}
function member<T extends string>(value: unknown, values: readonly T[], path: string): T {
  const match = values.find((item) => item === value);
  if (match === undefined) fail('INVALID_FIELD', path);
  return match;
}
function text(value: unknown): string {
  if (typeof value !== 'string' || value.length > 2000 || !value.trim()) fail('INVALID_FIELD', '$.text');
  return value;
}
function command(name: unknown, input: unknown): VoiceAssistantCommand {
  // Explicit switch avoids inherited-property dispatch (constructor / __proto__).
  switch (name) {
    case 'searchNearbyReservablePlaces': {
      const args = record(input, '$.args');
      exact(args, ['date', 'startTime', 'endTime', 'quantity', 'useCurrentLocation'], ['touristCategory'], '$.args');
      const date = localDate(args.date);
      const startTime = localTime(args.startTime, '$.args.startTime');
      const endTime = localTime(args.endTime, '$.args.endTime');
      if (endTime <= startTime) fail('INVALID_TIME_RANGE', '$.args.endTime');
      if (typeof args.useCurrentLocation !== 'boolean') fail('INVALID_FIELD', '$.args.useCurrentLocation');
      const touristCategory = Object.hasOwn(args, 'touristCategory')
        ? member(args.touristCategory, categories, '$.args.touristCategory') : undefined;
      return { command: name, args: Object.freeze({ date, startTime, endTime, quantity: quantity(args.quantity), useCurrentLocation: args.useCurrentLocation, ...(touristCategory ? { touristCategory } : {}) }) };
    }
    case 'getPlaceDetails': {
      const args = record(input, '$.args'); exact(args, ['placeId'], [], '$.args');
      return { command: name, args: Object.freeze({ placeId: integerId(args.placeId, '$.args.placeId') }) };
    }
    case 'getAvailabilities': {
      const args = record(input, '$.args'); exact(args, ['placeId', 'date', 'quantity'], [], '$.args');
      return { command: name, args: Object.freeze({ placeId: integerId(args.placeId, '$.args.placeId'), date: localDate(args.date), quantity: quantity(args.quantity) }) };
    }
    case 'prepareReservation': {
      const args = record(input, '$.args'); exact(args, ['placeId', 'availabilityId', 'quantity'], [], '$.args');
      return { command: name, args: Object.freeze({ placeId: integerId(args.placeId, '$.args.placeId'), availabilityId: integerId(args.availabilityId, '$.args.availabilityId'), quantity: quantity(args.quantity) }) };
    }
    case 'cancelVoiceSession': {
      const args = record(input, '$.args'); exact(args, [], [], '$.args');
      return { command: name, args: Object.freeze({}) };
    }
    default: return fail('UNKNOWN_COMMAND', '$.command');
  }
}

/** Accept a decoded, final JSON value. Streaming assembly/size limits belong to #347. */
export function parseVoiceAssistantEnvelope(input: unknown): VoiceEnvelopeParseResult {
  try {
    const value = record(input, '$');
    if (value.schemaVersion !== VOICE_SCHEMA_VERSION) fail('UNSUPPORTED_VERSION', '$.schemaVersion');
    if (typeof value.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value.id)) fail('INVALID_MESSAGE_ID', '$.id');
    const base = { schemaVersion: VOICE_SCHEMA_VERSION, id: value.id };
    let parsed: ProviderEnvelope;
    switch (value.kind) {
      case 'command_request':
        exact(value, ['schemaVersion', 'id', 'kind', 'command', 'args'], [], '$');
        parsed = { ...base, kind: value.kind, ...command(value.command, value.args) };
        break;
      case 'assistant_message':
        exact(value, ['schemaVersion', 'id', 'kind', 'text'], [], '$');
        parsed = { ...base, kind: value.kind, text: text(value.text) };
        break;
      case 'clarification_request':
        exact(value, ['schemaVersion', 'id', 'kind', 'field', 'text'], [], '$');
        parsed = { ...base, kind: value.kind, field: member(value.field, clarificationFields, '$.field'), text: text(value.text) };
        break;
      case 'protocol_error':
        exact(value, ['schemaVersion', 'id', 'kind', 'code'], [], '$');
        parsed = { ...base, kind: value.kind, code: member(value.code, protocolErrors, '$.code') };
        break;
      default: return fail('UNKNOWN_KIND', '$.kind');
    }
    return { ok: true, value: Object.freeze(parsed) };
  } catch (error) {
    // Even the thrown value can be a revoked Proxy whose instanceof check throws.
    try {
      if (error instanceof Rejection) {
        return { ok: false, rejection: { code: error.code, path: error.path }, userMessageKey: 'voiceAssistant.invalidResponse' };
      }
    } catch { /* Fall through without inspecting or logging the thrown value. */ }
    return { ok: false, rejection: { code: 'UNREADABLE_INPUT', path: '$' }, userMessageKey: 'voiceAssistant.invalidResponse' };
  }
}
