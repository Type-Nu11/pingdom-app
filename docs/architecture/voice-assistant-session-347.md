# #347 — V2 AI 세션 API와 상태 관리

## 기준과 구현 범위

- 구현 위치는 V2이며 브랜치는 `feat/347-ai-session-streaming`입니다. 기존 4개 커밋 위에 서버 #1645의 확정 계약을 반영했습니다. 후속 변경은 서버 계약, 세션 구현, 검증 문서 단위로 분리하며 기존 커밋은 유지합니다.
- #346 화면·마이크·STT, #348 command router·도메인 실행, #349 예약 mutation은 변경하지 않습니다.
- 실서버 확인: **2026-09-17 16:09:07 KST**, `GET https://www.typenull.xyz/v3/api-docs`, HTTP 200.
- 서버 [#1645](https://github.com/Type-Nu11/pingdom-api/issues/1645) 종료와 실제 배포 응답을 확인했습니다. 초기 조사에서 누락됐던 최종 envelope schema, 만료 시각 offset, 오류·재전송 규칙이 이제 명세에 있습니다.
- `docs/api/voice-ai.openapi.json`은 기존 방식에 맞춰 실제 문서에서 네 operation과 참조 schema를 추출한 canonical snapshot입니다. `x-source`에 원본 URL과 원문 SHA-256을 기록하며 Swagger example을 계약으로 승격하지 않습니다.
- `npm run sync:voice-ai-openapi` → `npm run generate:voice-ai-api-types`로 갱신합니다. 생성 타입은 `src/v2/shared/api/generated/voiceAi.ts`입니다. `check:api-types`와 `check:api-contract`에 포함했습니다.

## 배포된 HTTP 계약

| METHOD | PATH | 성공 응답 | 요청 | 인증 |
|---|---|---|---|---|
| POST | `/voice-ai/sessions` | 201 VoiceAiSessionResponse | body 없음 | Bearer JWT |
| POST | `/voice-ai/sessions/{sessionId}/refresh` | 200 VoiceAiSessionResponse | sessionId, body 없음 | Bearer JWT |
| POST | `/voice-ai/sessions/{sessionId}/messages` | 200 ProviderEnvelopeV1 | requestId/text | Bearer JWT |
| DELETE | `/voice-ai/sessions/{sessionId}` | 200, body 없음 | sessionId | Bearer JWT |

JSON 응답의 content type은 `application/json`입니다. 생성/갱신 응답의 sessionId와 expiresAt은 required입니다. expiresAt은 offset이 포함된 ISO-8601 시각이고 now >= expiresAt이면 만료됩니다. 세션 수명은 5분, 명시적 refresh는 현재부터 5분으로 갱신합니다.

전송 방식은 최종 JSON 하나를 반환하는 request-response입니다. SSE/WebSocket/reconnect cursor는 서버가 지원하지 않으며 별도 streaming transport는 없습니다. 최종 envelope.id는 requestId와 정확히 일치해야 합니다.

### 오류 매핑

| HTTP/상황 | 앱의 고정 오류 |
|---|---|
| 401 | AUTHENTICATION_REQUIRED |
| 403 | FORBIDDEN |
| 404 | SESSION_NOT_FOUND |
| 410 | SESSION_EXPIRED |
| 409 REPLAY_CONFLICT | REPLAY_CONFLICT |
| 429 RATE_LIMIT_EXCEEDED | RATE_LIMITED |
| 502 PROVIDER_UNAVAILABLE | PROVIDER_UNAVAILABLE |
| 502 PROVIDER_RESPONSE_INVALID | PROVIDER_RESPONSE_INVALID |
| 503 RATE_LIMIT_UNAVAILABLE | RATE_LIMIT_UNAVAILABLE |
| code가 없는 502 / 나머지 5xx | PROVIDER_ERROR / SERVER_ERROR |
| 앱 deadline/HTTP client timeout | TIMEOUT |
| 사용자 취소 | CANCELED |
| 명시적 ECONNRESET/ERR_STREAM_PREMATURE_CLOSE | CONNECTION_CLOSED |
| ERR_NETWORK 등 일반 네트워크 장애 | NETWORK_ERROR |

provider timeout은 서버 계약상 PROVIDER_UNAVAILABLE에 포함되며 별도 timeout code가 없습니다. 빈/잘린 JSON을 연결 종료라고 추정하지 않습니다. raw text 응답에서도 오류 body는 shared client의 기존 toApiError 경계를 거친 뒤 고정 enum만 feature에 남깁니다.

## API·최종 응답 검증

- `createVoiceSessionApi`는 기존 V2 apiClient와 JWT token provider를 사용하며 모든 요청에 AbortSignal을 전달합니다. provider API 직접 호출이나 provider credential은 없습니다.
- 성공 응답은 shared POST의 opt-in text 응답 옵션으로 보존합니다. 최종 문자열 → UTF-8 최대 16 KiB 확인 → JSON.parse의 unknown → 기존 `parseVoiceAssistantEnvelope` → requestId 일치 검사 순서입니다.
- wire DTO는 generated schema를 사용합니다. 앱 #345의 parser/policy를 우회하거나 별도 command allowlist를 만들지 않습니다. provider의 command_result/source: app 및 부분 JSON은 거부합니다.
- 다운로드 progress 초과 시 abort와 maxContentLength를 설정합니다. 자체 chunk 조립 버퍼는 없습니다.
- **native 한도 검증 범위:** React Native XHR 내부 버퍼는 progress가 늦게 발생할 수 있습니다. 앱의 decode/consumer 입력은 16 KiB로 제한하지만, native 네트워크 버퍼 자체의 16 KiB 하드 상한은 아직 보장하지 않습니다. 실제 Android/iOS 메모리·progress 검증이 필요합니다.
- 기존 HTTP client 10초 timeout을 유지하고, controller는 요청 시작부터 consumer 완료까지 별도의 전체 30초 monotonic deadline을 적용합니다. progress 수신으로 연장하지 않습니다.

## epoch·generation·만료·중복

- epoch는 앱이 생성한 세션별 Symbol입니다. provider에서 받지 않으며 앱 재시작 후 복원하지 않습니다.
- 새 입력은 generation을 증가시키고 이전 요청·consumer signal 및 재시도 데이터를 무효화합니다. 최종 결과 전달 전 epoch/generation/signal/foreground/인증/만료를 확인합니다.
- 만료 시각은 offset을 검증하고 앱 타이머로 관리합니다. 달력에 없는 날짜나 timezone 없는 문자열은 거부합니다. wall clock과 수신 시 만든 monotonic deadline을 함께 확인해 시계를 뒤로 돌려도 수명이 늘어나지 않도록 합니다. 서버 410도 authoritative하게 종료 처리합니다. 단말과 서버의 시계 오차 보정은 별도 계약이 없어 추측하지 않습니다.
- 명시적 refresh 성공 시 만료 타이머만 갱신하고 epoch/ledger를 유지합니다. 자동 keep-alive 요청은 하지 않습니다.
- 401/403/404/410, 종료, logout, background, dispose는 epoch와 pending 작업·만료 타이머·ledger·재시도 본문을 폐기합니다.
- ledger는 epoch별 Map이며 parser가 정규화한 envelope의 정렬된 직렬화로 fingerprint합니다. raw prompt는 fingerprint에 넣지 않습니다.
- envelope id를 **consumer 호출 전에 동기적으로 claim**합니다. 동일 id/동일 payload는 기존 consumer 완료 Promise를 공유하고 다시 전달하지 않습니다. 다른 payload는 REPLAY_CONFLICT입니다.
- ledger는 256개 도달 시 LEDGER_FULL로 후속 send를 차단합니다. 임의 eviction은 없고 새 세션이 필요합니다. 네트워크 복구/refresh/동일 요청 retry에서는 유지합니다.
- transport는 ProviderEnvelope와 앱 소유 VoiceDeliveryContext만 전달합니다. #348은 실제 실행·UI 게시 직전에 context.isCurrent()/signal 및 #345 policy를 검사해야 합니다. ledger는 consumer의 완료만 추적하며 도메인 명령·예약 실행은 구현하지 않습니다.

## 명시적 재시도

서버는 같은 활성 세션의 같은 requestId·동일 text에 저장된 결과를 재사용하고, 다른 text는 409를 반환합니다. session 단위 send/refresh/close는 직렬화됩니다. 실패하여 결과가 저장되지 않았다면 재시도 시 provider를 다시 호출할 수 있습니다.

- `controller.retry(signal?)`는 마지막 전송이 재시도 가능한 네트워크/timeout/일반 5xx/provider unavailable/rate-limit 장애로 끝났을 때만 제공합니다. 자동 재전송은 없습니다.
- 같은 requestId/text/generation을 유지하고 새 AbortController와 30초 deadline을 사용합니다. timeout된 이전 요청의 늦은 응답은 재시도 결과로 전달하지 않습니다.
- 앱 정책으로 최소 1초부터 최대 30초까지 exponential backoff를 적용합니다. 429에는 최소 60초 대기를 적용합니다. 서버의 Retry-After는 제공되지 않으며 실제 quota 회복 시각을 보장하는 값이 아닙니다.
- 상태에는 retryAvailable/retryAt만 노출합니다. 원문은 retry를 위해 현재 세션 메모리에만 보관하며 성공·새 입력·취소·종료·만료·계정 변경·background에서 폐기합니다.
- 이미 consumer에 전달된 응답, parser 오류, replay conflict, provider schema 오류에는 retry를 제공하지 않습니다. 소비자의 오류는 DELIVERY_FAILED로 구분합니다.

## Hook·책임 경계

`useVoiceSession(accountId, onEnvelope)`은 현재 계정 식별자를 주입받고 useSyncExternalStore로 로컬 상태를 노출합니다. JWT나 원문을 Query cache에 저장하지 않습니다. caller는 안정적인 consumer callback을 전달해야 합니다.

계정 변경/logout(null)/unmount에서 이전 controller를 폐기합니다. AppState background/inactive와 Android blur에서 세션을 무효화하고 foreground 복귀 후 자동 재생성하지 않습니다. 화면 이탈 시에는 composition에서 dispose/close를 호출해야 합니다.

close는 먼저 로컬 무효화 후 서버 DELETE를 요청합니다. 서버 계약상 DELETE는 진행 중 send 완료 후 실행되며 provider 호출을 중단하지 않습니다. background/logout/dispose에서는 로컬 취소·정리만 수행하고, 변경된 계정 JWT로 이전 세션 종료를 요청하지 않습니다. 원격 세션은 서버 TTL에 맡깁니다. 생성 요청 취소로 sessionId를 받지 못한 경우도 같습니다.

**#346 화면에는 아직 연결하지 않았습니다.** 화면·마이크·STT 수정 금지 범위를 유지하며, 서버 호출/예약 성공 UI를 새로 노출하지 않습니다. 기존 터치 기능은 이 controller를 의존하지 않습니다.

## 개인정보·남은 출시 조건

새 코드에 console/analytics/영속 저장은 없습니다. JWT/provider credential/system instruction, 음성/transcript/prompt/정확한 위치/envelope 원문 및 ApiError의 raw message/body/fieldErrors를 로그나 공개 상태에 남기지 않습니다. 오류는 고정 enum으로 변환하고 raw 예외를 cause로 보관하지 않습니다.

**API 계약 blocker #1645는 해소되었습니다.** 아래는 별도의 출시·통합 조건입니다.

- 서버 명세에 재전송 저장 데이터의 **자동 삭제 기간이 설정되지 않았음**이 명시되어 있습니다. 앱 종료 시 메모리 폐기는 서버 데이터 삭제를 의미하지 않습니다. 서버 보관·삭제 정책 및 provider 보관/학습 제외/리전, 자유 텍스트 개인정보 최소화 정책이 확정되어야 합니다.
- 실제 인증 서버/provider 성공 응답과 Android/iOS의 취소·native 버퍼 한도는 실기기 검증이 필요합니다.
- #346/#348과의 composition, 화면 이탈 처리 및 도메인 실행 검증은 해당 통합 범위입니다.

V1 dependency delta: **none**. `legacy-exception`: **불필요**.

## 검증 이력

이전 부분 구현은 전체 Jest 123 suites / 1,122 tests, 회귀 255개 및 필수 검사 전체를 통과했습니다. 이번 갱신은 배포 서버 schema·앱 JSON Schema·runtime parser 대표 fixture와 양방향 타입 호환 검사를 추가하고, offset/만료 타이머/재시도/오류 코드/ID 불일치 테스트를 보강했습니다. 최신 실행 결과는 아래에 기록합니다.

- 음성 API/model/Hook/parser/schema: 6 suites, 263 tests 통과.
- `npm run validate:pr`: 통과. `check:v2`, ownership harness, `typecheck`, 전체 Jest 및 `test:regression` 포함.
- 전체 Jest: 123 suites, 1,148 tests 통과. 회귀: 255 tests 통과(API 168 포함).
- `npm run test:v2-api`: 별도 실행 168 tests 통과.
- `npm run check:api-contract`, `npm run check:api-types`: 통과.
- `npm run check:v1-changes -- --base origin/dev`, `git diff --check`: 통과.
- Android `:app:assembleDebug` (`-x lint -x test`, arm64-v8a/armeabi-v7a): 통과. 누락된 로컬 debug keystore를 복구했으며 키 파일은 Git 제외 대상입니다.
- 전체 Jest에는 다른 화면 테스트의 React `act()` 경고가 출력됐으나 실패는 없었습니다. 실제 인증 서버/provider 호출 및 실기기 검증 결과는 포함하지 않습니다.

변경 파일은 canonical snapshot·생성 타입·계약 검사, V2 공용 API client의 text 응답 오류 변환, voice-assistant API·session·expiry·error·export 및 관련 테스트, 이 문서입니다. 화면 파일은 변경하지 않았습니다.
