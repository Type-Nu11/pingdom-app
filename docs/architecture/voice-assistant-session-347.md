# #347 — 배포 계약으로 구현한 V2 세션 경계

## 구현 범위와 기준

- 기준 브랜치: `origin/dev` `8d2e258` (#345와 #346 포함). 작업 브랜치를 fast-forward했습니다. 구현 검증 후 사용자 승인에 따라 기능별로 커밋을 분리하며 푸시는 하지 않습니다.
- 구현 위치: V2. #346 화면·마이크·STT, #348 router/도메인 실행, #349 예약 mutation은 변경하지 않습니다.
- 사용자가 2026-09-17에 승인한 부분 구현입니다. 미확정 서버 계약은 추측하지 않고 아래 제한으로 남깁니다.
- 실서버 확인: **2026-09-17 11:43:20 KST**, `GET https://www.typenull.xyz/v3/api-docs`, HTTP 200.
- `docs/api/voice-ai.openapi.json`은 기존 저장소 방식처럼 실제 문서에서 네 operation과 전이적으로 참조하는 schema를 추출한 canonical snapshot입니다. `x-source`에 원문 URL/SHA-256을 기록하며 example을 DTO로 승격하지 않습니다.
- `npm run sync:voice-ai-openapi` → `npm run generate:voice-ai-api-types`로 갱신합니다. 타입은 `src/v2/shared/api/generated/voiceAi.ts`이며 수기 wire DTO를 추가하지 않았습니다. `check:api-types`와 `check:api-contract`에 포함했습니다.

## 확인한 HTTP 계약

| METHOD | PATH | 성공 | 요청 | 인증 |
|---|---|---|---|---|
| POST | `/voice-ai/sessions` | 201, VoiceAiSessionResponse | body 없음 | bearerAuth (JWT) |
| POST | `/voice-ai/sessions/{sessionId}/refresh` | 200, VoiceAiSessionResponse | path sessionId, body 없음 | bearerAuth (JWT) |
| POST | `/voice-ai/sessions/{sessionId}/messages` | 200, JsonNode | VoiceAiMessageRequest: requestId/text | bearerAuth (JWT) |
| DELETE | `/voice-ai/sessions/{sessionId}` | 200, body 없음 | path sessionId | bearerAuth (JWT) |

세션은 5분 만료이며 refresh는 현재부터 5분으로 갱신, 반복 종료는 성공으로 기술되어 있습니다.
전송은 최종 JSON 하나를 반환하는 request-response입니다. SSE/WebSocket/fake stream/ephemeral token/provider 직접 호출은 추가하지 않았습니다.

명세의 공통 401/403, 메시지 400/410/502를 사용합니다. 502는 명세 설명에 따라 `PROVIDER_ERROR`로만 분류하며 미문서화 provider 세부 code를 사용하지 않습니다. 429/기타 5xx는 일반 HTTP 상태 의미로 `RATE_LIMITED`/`SERVER_ERROR`를 분류할 뿐 서버의 rate-limit 정책을 가정하지 않습니다. 재시도·Retry-After 해석은 하지 않습니다.

## API와 transport

- `createVoiceSessionApi`는 기존 V2 apiClient, JWT token provider, toApiError를 재사용합니다. caller의 AbortSignal을 모든 operation에 전달합니다.
- shared client의 POST에 opt-in text 응답 보존을 추가했습니다. 기존 JSON·multipart 경로는 유지됩니다. JSON 자동 decode 전에 원문 UTF-8 크기를 검사하기 위한 옵션입니다.
- 메시지는 **최종 문자열** → UTF-8 크기 검사 → JSON.parse의 unknown → `parseVoiceAssistantEnvelope` 순서로 처리됩니다. wire 응답의 JsonNode를 ProviderEnvelope로 단언하지 않습니다.
- 추가 command allowlist는 없습니다. provider의 command_result/source: app/추가 필드는 기존 parser가 거부합니다. 부분 JSON은 invalid response입니다.
- 최대 16 KiB를 초과하면 decode/consumer 호출 전에 차단합니다. 자체 chunk 조립 버퍼는 없습니다. `maxContentLength`와 다운로드 progress 초과 abort도 전달합니다.
- **제한:** React Native의 native/XHR transport는 응답을 내부 버퍼링하며 progress 알림이 늦거나 없을 수 있습니다. 앱 parser 입력 한도는 검증했지만 native 네트워크 버퍼 자체의 16 KiB 하드 상한을 보장하지 않습니다. 실제 Android/iOS 메모리·progress 동작 검증은 미실시입니다.
- HTTP client의 기존 10초 timeout은 유지됩니다. controller는 별도로 전체 30초 monotonic deadline을 적용하며, 최종 consumer 완료 대기에도 같은 deadline을 사용합니다. progress로 연장하지 않습니다.
- 명시적 ECONNRESET/ERR_STREAM_PREMATURE_CLOSE만 CONNECTION_CLOSED로 분류합니다. React Native가 ERR_NETWORK만 제공하면 NETWORK_ERROR입니다. 빈/잘린 JSON을 근거 없이 연결 종료로 판정하지 않습니다.

## 앱 소유 세션·generation·replay

- `createVoiceSessionController`의 epoch는 세션별 Symbol이며 외부/provider에서 입력받지 않습니다. 재시작 후 복원하지 않습니다.
- 생성/종료/로그아웃/background/dispose는 이전 epoch와 pending 작업을 무효화하고 메모리 ledger/세션 정보를 폐기합니다.
- 새 입력은 generation을 증가시키고 이전 요청/consumer signal을 취소합니다. 완료 시 epoch·generation·인증·foreground·signal을 다시 확인하여 늦은 결과를 전달하지 않습니다.
- requestId는 해당 controller의 증가하는 generation에서 만들며, 응답 id와 같다는 미문서화 서버 보장은 사용하지 않습니다. 자동 재전송은 하지 않습니다.
- parser가 반환한 정규화 envelope를 정렬된 직렬화로 fingerprint합니다. raw prompt는 fingerprint에 포함하지 않습니다.
- ledger는 현재 epoch에 종속된 Map입니다. 검증 envelope id를 **consumer 호출 전에 동기적으로 claim**합니다. reentrant consumer도 중복 전달할 수 없습니다.
- 동일 id/동일 payload는 기존 consumer 완료 Promise를 공유합니다. 동일 id/다른 payload는 앱 로컬 REPLAY_CONFLICT로 거부합니다. 이 코드는 서버의 미문서화 409 매핑과 별개입니다.
- 네트워크 실패와 명시적 refresh에서는 ledger를 유지합니다. request-response에는 별도의 socket reconnect가 없으며, 실패 후 다음 요청에서도 기존 항목을 보존합니다.
- 256개 도달 시 이후 send를 LEDGER_FULL로 차단합니다. 임의 eviction은 없고 새 세션이 필요합니다.
- consumer 경계는 ProviderEnvelope와 앱 소유 `VoiceDeliveryContext`뿐입니다. context의 isCurrent/signal을 #348이 실제 실행·UI 게시 직전에 확인해야 합니다. parser 통과나 transport 전달이 실행 권한을 대신하지 않습니다.
- ledger에 보관하는 결과는 **transport consumer의 완료**입니다. 도메인 command result나 예약 결과의 저장·실행은 구현하지 않았습니다.

## Hook과 lifecycle

`useVoiceSession(accountId, onEnvelope)`은 `useSyncExternalStore`로 로컬 상태를 노출합니다. Query cache에 prompt나 envelope를 저장하지 않습니다. caller는 JWT가 아닌 현재 인증 계정 식별자를 전달하고, 안정적인 consumer callback을 사용해야 합니다.

- 계정 변경/로그아웃(null), unmount 시 이전 controller를 폐기합니다.
- AppState background/inactive 및 Android blur에서 세션을 무효화합니다. foreground 복귀 후 자동 재생성/재전송하지 않습니다.
- 명시적인 close는 먼저 로컬 무효화 후 서버 DELETE를 수행합니다. 실패 시 고정 오류 상태만 남깁니다.
- background/logout/dispose에서는 로컬 요청을 취소하고 종료합니다. 바뀐 계정 credential로 이전 세션 DELETE를 보내거나 background 네트워크 성공을 보장하지 않습니다. 원격 세션은 서버 TTL에 맡깁니다.
- 생성 도중 취소해 서버가 이미 만든 세션 ID를 받지 못한 경우도 서버 TTL에 맡깁니다.
- **화면에는 연결하지 않았습니다.** #346 입력 UI는 기존 로컬 동작을 유지합니다. 통합 시 화면 이탈에서도 dispose/close를 호출하고 현재 계정 identity를 전달해야 합니다.

## 개인정보·로그

새 코드에는 console/analytics/영속 저장 호출이 없습니다. provider credential/system instruction을 받거나 보관하지 않고 JWT는 기존 client 인증 경계에만 맡깁니다. 세션 메모리 ledger만 최종 검증 payload를 보관하며 종료 시 폐기합니다. transcript/prompt/정확한 위치/음성/envelope 원문, ApiError.message/body/fieldErrors는 상태·오류·로그에 노출하지 않습니다.

네트워크와 consumer 오류는 고정 VoiceSessionErrorCode로 변환하며 raw 예외를 cause로 보관하지 않습니다. 공개 getSnapshot에는 phase/generation/error enum만 존재합니다.

## 남은 서버 계약·통합 blocker

서버 [#1645](https://github.com/Type-Nu11/pingdom-api/issues/1645):

1. 최종 wire 응답이 `JsonNode: {type: object}`뿐입니다. 앱 #345 parser/JSON Schema로 검증하지만 서버 envelope DTO를 임의 생성하지 않았습니다.
2. expiresAt은 opaque 문자열로 보관합니다. timezone이 확정되기 전 날짜 해석·자동 갱신·자동 만료 스케줄은 없습니다. 명시적 refresh만 제공합니다.
3. operation별 404/409 및 provider 세부 code, rate limit/Retry-After, 재전송·동시 요청 보장 등이 미확정입니다. 이를 이용한 복구는 없습니다.
4. 요청 취소 시 서버/provider 처리 종료 보장과 logout 시 원격 세션 폐기 보장은 앱에서 만들 수 없습니다.

추가 출시 전 조건: 자유 텍스트 개인정보 최소화/redaction과 provider 보관·학습 제외·처리 리전 정책 합의, native transport 한도/취소 실기기 검증, #346/#348과의 앱 composition 통합입니다. 임의 redaction이나 provider 정책을 구현 완료로 주장하지 않습니다.

## 검증

- API exact METHOD/PATH·JWT·signal, 정상 생성/갱신/종료, HTTP 상태/timeout/취소/네트워크 오류 분류
- 부분 JSON·app-result 위조 차단, 16 KiB UTF-8 경계, progress로 연장되지 않는 30초 deadline
- 동일 payload 중복/다른 payload conflict, reentrant claim, 256개 한도, 네트워크 복구/refresh 후 ledger 유지
- generation 변경·취소·background·logout·종료 후 늦은 응답 폐기, consumer context 무효화, Hook 구독 해제
- 민감 원문 비로그 및 snapshot 미포함, Ajv 2020 기반 JSON Schema/runtime 대표 fixture 일치
- 기존 음성 입력 UI와 전체 앱 회귀 테스트. 실제 인증 서버/provider 성공 호출과 Android/iOS 실기기 테스트는 수행하지 않았습니다.

V1 dependency delta: **none**. `legacy-exception`: **불필요**.

### 2026-09-17 실행 결과

| 검증 | 결과 |
|---|---|
| 음성 기능 + JSON Schema 집중 Jest | 6 suites / 237 tests 통과 (기존 입력 UI/parser 포함) |
| `npm run check:v2` | 경계 검사 및 경계 harness 60개 통과 |
| `npm run typecheck` | 통과 |
| `npm run test:v2-api` | 168개 통과 |
| `npm run test:regression` | 255개 통과 |
| `npm run validate:pr` | 전체 Jest 123 suites / 1,122 tests, ownership 2개, 회귀 255개 포함 통과 |
| `npm run check:api-contract` | AI snapshot 포함 통과 |
| `npm run check:api-types` | AI 타입 재생성 일치 포함 통과 |
| `npm run check:v1-changes -- --base origin/dev` | 통과 |
| `git diff --check` | 통과 |

최초 V2 API 테스트는 sandbox의 tsx IPC 소켓 EPERM으로 실행되지 않아 승인된 실행으로 재검증했습니다.
최초 전체 검증에서 JSON Schema 테스트의 docs import가 V2 경계를 벗어나 실패하여, 테스트를 저장소 공통 `test/__tests__`로 이동하고 전체 검증을 재실행했습니다.
이후 모든 필수 검증이 통과했습니다. 기존 React act 경고는 전체 Jest 출력에 남아 있으나 실패는 없습니다.

### 변경 파일

- `docs/api/voice-ai.openapi.json`: 배포 계약 snapshot
- `src/v2/shared/api/generated/voiceAi.ts`: 생성 타입
- `scripts/sync-voice-ai-openapi.mjs`, `scripts/check-voice-ai-contract.mjs`, `scripts/check-generated-api-types.mjs`: 동기화·검증
- `package.json`, `package-lock.json`: scripts 및 테스트 전용 Ajv/Ajv-formats 추가 (앱 runtime 의존성 아님)
- `src/v2/shared/api/apiClient.ts`: POST 원문 응답·progress·응답 크기 옵션
- `src/v2/features/voice-assistant/api/voiceSessionApi.ts`: 4개 API 및 최종 decode/parser
- `src/v2/features/voice-assistant/model/voiceSession.ts`, `voiceSessionError.ts`: 상태·취소·deadline·ledger·오류
- `src/v2/features/voice-assistant/hooks/useVoiceSession.ts`, `index.ts`: lifecycle Hook과 공개 경계
- `src/v2/features/voice-assistant/model/__tests__/voiceSession.test.ts`: API/세션 테스트
- `src/v2/features/voice-assistant/hooks/__tests__/useVoiceSession.test.tsx`: lifecycle 테스트
- `test/__tests__/voiceEnvelopeSchema.test.ts`: JSON Schema/runtime fixture 일치 검사
- 본 문서: 구현 범위·미확정 계약·검증 인계
