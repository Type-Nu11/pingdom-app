import { VOICE_QUANTITY_LIMITS, VOICE_SCHEMA_VERSION } from './voiceAssistantCommand.types';
import type {
  ClarificationField, ProtocolErrorCode, ProviderEnvelope, VoiceAssistantCommand,
  VoiceEnvelopeParseResult, VoiceParserRejectionCode, VoiceTouristCategory,
} from './voiceAssistantCommand.types';

const categories = ['K_POP', 'BEAUTY', 'FASHION', 'CAFE', 'FOOD', 'POP_UP', 'EXHIBITION', 'NIGHTLIFE', 'OTHER'] as const satisfies readonly VoiceTouristCategory[];
// satisfies는 잘못된 항목을, 아래 Exclude 검사는 빠진 항목을 잡습니다. 서버 enum이 늘면 빌드에서 검토를 요구합니다.
const categoriesExhaustive: Exclude<VoiceTouristCategory, typeof categories[number]> extends never ? true : never = true;
void categoriesExhaustive;
const clarificationFields = ['touristCategory', 'date', 'timeRange', 'quantity', 'useCurrentLocation', 'placeId', 'availabilityId'] as const satisfies readonly ClarificationField[];
const protocolErrors = ['UNSUPPORTED_REQUEST', 'PROVIDER_UNAVAILABLE', 'INVALID_RESPONSE'] as const satisfies readonly ProtocolErrorCode[];

// 깊은 검증 함수에서 즉시 중단하기 위한 내부 제어 흐름입니다. 공개 parser가 결과 객체로 변환합니다.
class Rejection {
  constructor(readonly code: VoiceParserRejectionCode, readonly path: string) {}
}
function fail(code: VoiceParserRejectionCode, path: string): never { throw new Rejection(code, path); }

/**
 * 일반 객체의 직접 소유한 data property만 복사합니다. 상속 필드·getter·숨겨진 필드는 거부합니다.
 * input[key]로 읽으면 getter가 실행될 수 있어 descriptor.value를 사용합니다.
 * 이 함수는 얕은 복사이며, 중첩 args는 command()에서 다시 검사합니다.
 */
function record(input: unknown, path: string): Record<string, unknown> {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) fail('INVALID_OBJECT', path);
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) fail('INVALID_OBJECT', path);
  const keys = Reflect.ownKeys(input);
  // v1 객체는 최대 7개 필드입니다. descriptor 검사 전에 과도한 필드 수를 차단합니다.
  if (keys.length > 10) fail('UNEXPECTED_FIELD', path);
  // prototype 없는 임시 객체를 사용하여 상속된 이름을 정상 필드로 오인하지 않습니다.
  const result: Record<string, unknown> = Object.create(null);
  for (const key of keys) {
    if (typeof key !== 'string' || key === '__proto__' || key === 'constructor' || key === 'prototype') fail('UNEXPECTED_FIELD', path);
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) fail('INVALID_OBJECT', path);
    result[key] = descriptor.value;
  }
  return result;
}
// 알 수 없는 필드를 조용히 버리지 않습니다. 확인 우회/권한 주입을 시도한 요청 전체를 거부합니다.
function exact(value: Record<string, unknown>, required: readonly string[], optional: readonly string[], path: string) {
  if (Object.keys(value).some((key) => !required.includes(key) && !optional.includes(key))) fail('UNEXPECTED_FIELD', path);
  for (const key of required) if (!Object.hasOwn(value, key)) fail('MISSING_FIELD', `${path}.${key}`);
}
// safe integer 밖의 int64는 JS number에서 다른 ID로 반올림될 수 있습니다. 출처 검증은 executor의 별도 책임입니다.
function integerId(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) fail('INVALID_ID', path);
  return value;
}
function quantity(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < VOICE_QUANTITY_LIMITS.min || value > VOICE_QUANTITY_LIMITS.max) fail('INVALID_QUANTITY', '$.args.quantity');
  return value;
}
// Date의 자동 날짜 보정(예: 2월 30일 → 3월)과 timezone 영향을 피하려고 달력 규칙을 직접 검사합니다.
// 과거 날짜인지 여부는 실행 시점의 now가 필요하므로 여기서는 검사하지 않습니다.
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
// 검증한 allowlist 항목 자체를 반환하여 강제 타입 단언 없이 문자열 union으로 좁힙니다.
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
  // 객체에서 임의 이름으로 함수를 찾지 않습니다. switch의 다섯 분기만 실행 가능한 명령을 만듭니다.
  switch (name) {
    case 'searchNearbyReservablePlaces': {
      const args = record(input, '$.args');
      exact(args, ['date', 'startTime', 'endTime', 'quantity', 'useCurrentLocation'], ['touristCategory'], '$.args');
      const date = localDate(args.date);
      const startTime = localTime(args.startTime, '$.args.startTime');
      const endTime = localTime(args.endTime, '$.args.endTime');
      // 앞에서 두 자릿수 HH:mm을 보장했으므로 문자열 순서와 시간 순서가 같습니다.
      if (endTime <= startTime) fail('INVALID_TIME_RANGE', '$.args.endTime');
      if (typeof args.useCurrentLocation !== 'boolean') fail('INVALID_FIELD', '$.args.useCurrentLocation');
      // 생략은 허용하지만 명시적인 undefined/null은 잘못된 입력입니다.
      const touristCategory = Object.hasOwn(args, 'touristCategory')
        ? member(args.touristCategory, categories, '$.args.touristCategory') : undefined;
      return { command: name, args: Object.freeze({ date, startTime, endTime, quantity: quantity(args.quantity), useCurrentLocation: args.useCurrentLocation, ...(touristCategory ? { touristCategory } : {}) }) };
    }
    case 'getPlaceDetails': {
      const args = record(input, '$.args'); exact(args, ['placeId'], [], '$.args');
      return { command: name, args: Object.freeze({ placeId: integerId(args.placeId, '$.args.placeId') }) };
    }
    case 'getAvailabilities': {
      // date/quantity는 앱 필터입니다. 현재 availability API의 HTTP query 인자는 아닙니다.
      const args = record(input, '$.args'); exact(args, ['placeId', 'date', 'quantity'], [], '$.args');
      return { command: name, args: Object.freeze({ placeId: integerId(args.placeId, '$.args.placeId'), date: localDate(args.date), quantity: quantity(args.quantity) }) };
    }
    case 'prepareReservation': {
      // 양수 ID만으로 실행할 수 없습니다. executor가 최근 조회 결과의 소속·상태·정원을 재검증해야 합니다.
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

/**
 * 호출 순서: #347의 최종 JSON decode → 이 parser → 정책 검사 → #348 executor.
 * 부분 stream이나 JSON 문자열 자체는 받지 않습니다. byte 크기/조립 timeout은 #347 책임입니다.
 * 성공은 “형식이 올바름”만 의미하며 세션·중복·ID 출처·예약 가능 여부를 보장하지 않습니다.
 */
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
    // 외부 객체를 그대로 반환하지 않습니다. 복사한 envelope와 args를 각각 freeze하여
    // 검증 이후 원본 변경이나 소비자의 수정으로 명령 내용이 바뀌는 것을 막습니다.
    return { ok: true, value: Object.freeze(parsed) };
  } catch (error) {
    // Proxy trap은 임의 값을 throw할 수 있고, 그 값이 revoked Proxy면 instanceof조차 throw합니다.
    // 예외 분류도 보호하여 외부 입력 때문에 parser 밖으로 예외가 전파되지 않게 합니다.
    try {
      if (error instanceof Rejection) {
        return { ok: false, rejection: { code: error.code, path: error.path }, userMessageKey: 'voiceAssistant.invalidResponse' };
      }
    } catch { /* 원본 예외를 더 읽거나 로그로 남기지 않고 고정된 거부 사유로 처리합니다. */ }
    return { ok: false, rejection: { code: 'UNREADABLE_INPUT', path: '$' }, userMessageKey: 'voiceAssistant.invalidResponse' };
  }
}
