# #350 AI 실패 복구·보안 검증 — 2026-10-07

**전체 완료 아님.** 앱 단독 자동 검증과 발견한 V2 결함 수정은 완료했으나, 인증된 AI/도메인 서버 성공, #349 예약 확인·생성, 양 플랫폼 실제 발화 E2E는 미검증입니다. 검증 단계에서는 커밋·푸시·PR·이슈 변경을 하지 않았습니다.

## 기준과 범위

- 시작 브랜치 `test/350-ai-agent-failure-recovery-e2e`, 깨끗한 작업 트리.
- `git fetch origin` 성공 후 HEAD = `origin/dev` = `a280fca49da6cfa6c8def90849feed89045d6cb4`, ahead/behind 0/0.
- 루트 AGENTS.md, 앱 #345~#350 본문, #345 schema/계약, #346 입력, #347 세션, #348 Registry 문서와 현재 V2 코드를 확인했습니다. 하위 AGENTS.md 없음.
- 구현 위치 **V2** (`src/v2/modules/voice-assistant`, `src/v2/shared/api`). 기존 변경 없음, 브랜치 전환/reset 없음.
- #349 OPEN. 현재 Registry의 `prepareReservation` handler는 null이며 **FORBIDDEN**입니다. 초안 준비조차 구현된 것으로 보고하지 않습니다. 허용될 미래 결과 타입만 `awaiting_user_confirmation`이며 예약 성공 타입은 없습니다.
- 모든 테스트의 HTTP transport/도메인 fixture는 실제 인증·모델·서버 성공 증거가 아닙니다. 실제 예약 생성·결제·외부 메시지 전송 없음.

## 발견한 결함과 수정

1. 재시도 중 입력 편집/feedback 해제는 dispatcher만 비우고 transport를 취소하지 않아 늦은 질문/결과가 다시 게시될 수 있었습니다. `dismissFeedback`에서 controller.cancel과 입력 revision 무효화를 수행합니다.
2. 연속 session 생성에서 이전 시작 Promise가 최신 처리 상태를 SESSION_REQUIRED로 덮었습니다. 입력 revision, controller identity와 generation을 확인한 후에만 상태를 게시합니다. 시작 시 동기적 old-session invalidation이 처리 안내를 취소로 남기지 않게 했습니다. background 도중 시작 완료도 취소 안내를 유지합니다.
3. 개발 API 진단의 소문자 session ID가 경로에서 마스킹되지 않았습니다. 서버 code/trace ID와 transport code의 문자열 형식 검사는 credential echo를 차단하지 못했습니다. 세션 segment를 명시적으로 마스킹하고 서버 code/trace ID는 출력하지 않으며 transport code는 고정 allowlist만 출력합니다. HTTP status/kind/route/host/timing은 유지합니다.

1·2의 두 대표 회귀와 3의 로그 회귀가 수정 전 실패하는 것을 확인한 뒤 통과했습니다. background 추가 회귀도 통과합니다.

변경 파일:

- `src/v2/modules/voice-assistant/hooks/useVoiceCommands.ts`
- `src/v2/modules/voice-assistant/hooks/__tests__/useVoiceCommands.test.tsx`
- `src/v2/modules/voice-assistant/model/__tests__/voiceCommandEngine.integration.test.ts`
- `src/v2/shared/api/requestDiagnostics.ts`
- `src/v2/shared/api/__tests__/requestDiagnostics.test.mjs`
- `src/v2/modules/booking/reservations/__tests__/ReservationScreens.test.tsx`
- 이 문서 및 native QA 증거(아래).

## 항목별 판정

| 검증 | 판정 | 근거·한계 |
|---|---|---|
| 임의 command/route/API, confirmation 우회 | 통과(자동) | 실제 decode→parser→session→dispatcher→Query/API 통합 fixture에서 추가 route/API/confirmed 및 미등록 command 거부. 도메인 write 0회. 장소 설명의 injection 지시도 facts에 투영하지 않음. 모델 자체의 자연어 공격 저항성은 미검증. |
| JSON/schemaVersion/추가 필드/위조 source | 통과(자동) | parser/schema의 기존 거부 corpus + HTTP 최종 JSON 통합에 mismatch/source/confirmation/API 추가. INVALID_RESPONSE, consumer/도메인 API 0회. |
| 존재하지 않거나 조회·선택 출처 없는 ID | 통과(자동) | `voiceCommands.test.ts`의 provenance/selected-query/freshness 검증 + 통합 unknown place ID에서 ID_NOT_IN_CONTEXT, 조회 0회. |
| 모델 가격·통화·취소 조건·성공 선언 | 통과(자동/정적) | AppCommandResult는 canonical facts projection. provider assistant 성공 문구는 advisory로만 처리하며 실제 텍스트 표시 안 함. provenance/결과에 모델 가격·조건을 추가하지 않음. |
| 일반 조회를 예약 가능으로 단정 | 안전 차단 통과 / 기능 미검증 | 현재 `searchNearbyPlaces` 미등록, 통합 테스트에서 실행 거부. 일반 조회 결과가 구현된 상태의 표시·실서버 분류 검증은 #1764/#349 후속 작업. |
| timeout/401/429/5xx/응답 유실 | 통과(자동) | 기존 세션 오류 코드·deadline·backoff·same requestId/text retry + 새 터치 회귀. 자동 재전송 없음. |
| streaming 중단 | 부분 통과 | explicit ERR_STREAM_PREMATURE_CLOSE는 CONNECTION_CLOSED, 잘린 JSON은 INVALID_RESPONSE. 현재 앱 snapshot은 최종 JSON request-response이며 SSE/WebSocket stream 구현 없음. 실제 stream E2E는 해당 없음, native 버퍼/실제 배포 계약은 미검증. |
| 연속 입력/중복 command/늦은 응답 | 통과(자동) | epoch/generation ledger·claim·deadline 기존 테스트 + 시작 경쟁·retry 편집 회귀. |
| 취소/패널 닫기/background/logout/계정 변경 정리 | 통과(자동), native 별도 | input/screen/adapter/session/hook 기존 lifecycle 테스트와 새 background-start 회귀. 마이크 listener detach 및 늦은 callback 차단. production 실서버 전체 lifecycle은 미검증. |
| 질문 대기 중 이미 받은 조건 유지 | 미검증/blocker | 현재 wire body는 requestId/text뿐이고 history/조건/selected ID 전달 필드가 없음. 앱은 새 모델 세션에 이전 조건을 보냈다고 가정하지 않음. #1764의 대화 조건 보존·선택 맥락 계약 및 실서버 검증 필요. |
| 만료 후 안전한 재개·재시도 | 통과(자동) / 대화 보존 미검증 | expiry가 pending/ledger/retry를 지움. retry가 세션을 자동 생성하지 않음. 명시적 새 입력만 session start 가능. 자동 context 복원/대화 보존은 없음. |
| 실패/취소/처리/성공 안내 | 통과(자동), 실서버 미검증 | latest input revision/generation 보완, provider 성공 주장 표시 차단, Query 완료 후 앱 결과 게시. native/실서버 전체 상태 전이는 미검증. |
| 최종 확인 전 예약 mutation 0회 | 통과(현재 경계/fixture) | 조회·악성 payload·prepare(유효/위조 slot)의 transport write 및 mutation cache 0회. 실제 #349 확인·생성 경로 자체는 미구현/미검증. |
| prepare는 초안만/예약 성공 표시 금지 | 안전 차단 통과 / 초안 미구현 | 현재 prepare=FORBIDDEN, 호출/초안/예약 성공 없음. mock draft로 완료하지 않음. |
| 기존 Booking idempotency/중복/응답 유실 | 통과(기존 터치 자동) | 제출 guard, mutation retry=0, 동일 intent key 유지. network/timeout/500에서도 자동 재제출·성공 화면 없음, 사용자 동일 재시도 key 동일. 서버 재고 거부일 때만 새 intent/key. AI 재사용은 #349 전이라 미검증. |
| 민감정보 로그/analytics/오류 | 통과(검사 범위), 서버/native 미검증 | voice production code에 console/analytics/영속 저장 없음. native persist=false. gateway에는 text만(좌표/JWT는 body에 없음, JWT 인증 헤더는 기존 client 소유). 공용 진단 보완 및 원문 message/body/credentials/좌표 노출 거부 fixture. analytics에서 음성·booker·좌표·auth 수집 연결 발견 안 됨. OS/provider 보관 및 production 실제 로그 E2E는 미검증. |
| AI 장애 후 터치 조회·예약 회귀 | 통과(자동), 실제 통합 미검증 | gateway 401/429/500/timeout/연결 중단 이후 같은 QueryClient의 canonical 상세·availability 조회 성공. 기존 예약 화면/중복/동일 키 테스트 및 전체 회귀 통과. 실제 지도→예약 전체 실서버 흐름 미검증. |

## 서버 상태와 배포 관찰

- [서버 #1764](https://github.com/Type-Nu11/pingdom-api/issues/1764): 2026-10-07 조회 시 **OPEN**, 일반 장소 도구·모델 분류·대화 조건 보존·선택 맥락·배포 후 인증 테스트가 미완료 항목입니다. 앱 현재 dev에는 일반 도구가 없습니다. 과거 작업 브랜치/검토용 서버 patch에 관한 이슈 문구를 현재 dev 구현이나 운영 반영으로 간주하지 않았습니다.
- 공개 `GET /v3/api-docs/app`: JSON, 83 paths, `/places`, `/routes` 있음. AI paths 및 searchNearbyPlaces 없음. SHA-256 `2695d5fa3553579be87bd98028b78bdc74d1891bf1a60f2f1bdf27e5ec895bcf`.
- `GET /v3/api-docs/common`: JSON, 13 paths, AI paths 및 searchNearbyPlaces 없음. SHA-256 `b09f9ac2985497a4baba115f7077691990b4a5b271a3f3d73b795d5fac92036e`.
- 이전 snapshot source인 `/v3/api-docs`: 301 → `/v3/api-docs/` → 404. `/v3/api-docs/swagger-config`는 admin/app/common/consulting/merchant 그룹을 열거합니다. 현 배포 AI OpenAPI 위치·계약 일치는 확보하지 못했습니다. generated snapshot을 추측으로 갱신하지 않았습니다.
- 인증 없는 `POST /voice-ai/sessions` + X-Client-Type: App은 HTTP 400. 인증된 생성 성공이나 provider 사용 가능성을 증명하지 않습니다. response payload/내부 정보는 공개 문서에 복사하지 않았습니다.
- [infra #27](https://github.com/Type-Nu11/pingdom-infra/issues/27)은 **CLOSED**지만 `/routes` 자동차 길찾기 프록시 이슈입니다. AI 도구 계약/운영 성공 근거가 아닙니다.

## 실기기와 검증 종류

- Android: SM-N981N / Android 13 / USB serial R3CRC0DV7WM. 앱 com.rmdka.pingdomapp 1.0.0, 기존 RECORD_AUDIO=granted.
- iOS: iPhone 2대 offline, Mac만 online. **iOS native QA 전체 미검증**.
- Android는 처음 secure lock 상태, 이후 잠금 해제됨. 현재 수정본 production 번들을 별도 QA Metro 8083에 로드했지만 인증 상태가 없고 onboarding/auth 화면이었습니다. **인증된 AI/조회 성공 없음**.
- 기존 8082 Metro는 중단하지 않았습니다. native QA용 임시 V2 입력 화면은 기존 native adapter/controller/screen을 사용하고 text를 로컬에만 유지합니다. AI나 예약 응답 mock을 제공하지 않습니다. 이 화면의 성공은 production 지도 composition 또는 인증된 AI 성공이 아닙니다.
- 사용자가 실발화 참여 불가라고 답했습니다. “안녕” 종료, “내일… 오후 두 시에” 중간 쉼, 작은 목소리·주변 소음 평가는 **미검증**. 기존 합성 STT 이벤트 테스트의 5초 무음/중간 쉼/반복 세그먼트 통과를 실제 음성 성능으로 승격하지 않습니다.
- native QA에서 사용하는 API mode는 real이지만 `VoiceAssistantScreen`의 기본 `retainInputLocally` callback만 사용했습니다. 세션 생성·도메인 요청·mutation handler를 연결하지 않았습니다. native 마이크/권한은 실제 OS adapter이며 합성 SpeechEvent를 주입하지 않았습니다.

| Android 임시 native 입력 QA | 판정 | 증거/범위 |
|---|---|---|
| 기존 허용 권한으로 청취 진입 | 통과(UI/native adapter 진입) | [listening.png](./350-ai-native/listening.png). 녹음 음질/발화 인식 성공 증거는 아님. 최초 권한 허용 버튼 선택 과정은 미검증. |
| 무음·종료 후 복구 안내 | 통과(무음 UI), 수동 종료는 부분 검증 | stop 조작을 시도했고 최종 [no-speech.png](./350-ai-native/no-speech.png)에 안전한 재발화/해제 안내. native 무음 종료와 수동 stop 중 정확한 terminal 원인은 기록하지 못해 수동 stop 성공을 독립적으로 확정하지 않음. |
| 재발화 시작 | 부분 통과 | 다시 말하기 조작 이후 청취 UI가 재진입함. 실제 재발화 인식 성공은 미검증. |
| background·복귀 | 통과(입력 UI 범위) | HOME 후 2초 대기, 같은 Activity 복귀 후 2초 대기. [background-return.png](./350-ai-native/background-return.png)에 청취 대신 텍스트 composer, 자동 재청취 없음. 실제 오디오 버퍼/OS capture의 정량 검증은 미검증. |
| 차단 권한 | 통과 | ADB로 runtime 권한 revoke + USER_FIXED 임시 설정, 실제 granted=false 확인. [permission-blocked.png](./350-ai-native/permission-blocked.png)의 거부/설정 안내. 일반 permission dialog의 거부 버튼 선택은 미검증. |
| 권한 차단 후 텍스트 fallback | 통과(로컬) | 실제 입력·IME 제출 후 [text-fallback.png](./350-ai-native/text-fallback.png)에 `350-local-text`와 로컬 준비/미전송 안내. 서버 AI 성공 아님. |
| 패널 닫기/취소 | 자동 통과 / native 미검증 | 닫기 시도 중 foreground가 다른 앱으로 전환되어 정상 종료 proof를 확보하지 못함. 다른 앱 화면은 증거에 포함하지 않았으며 이후 조작을 이어가지 않음. |
| Android 실제 발화·작은 목소리·소음 | 미검증 | 사용자 참여 불가. |
| iOS 권한·오디오·lifecycle | 미검증 | online iPhone 없음. |

임시 entry는 `src/v2/app/testing/voiceAssistantNativeQa.tsx`였으며 검사 후 삭제했습니다. `index.ts`는 시작 시 보관본과 byte-for-byte 동일함을 cmp로 확인했습니다. 마이크는 USER_FIXED를 제거하고 시작과 동일한 granted=true/USER_SET 플래그로 복원했습니다. USB reverse는 시작과 동일한 tcp:8081→tcp:8081만 남았고 QA 8083 reverse와 Metro는 종료했습니다. 기존 8082 Metro는 중단하지 않았습니다. QA 사진에는 개인 계정·원문 음성·좌표·credential이 없습니다.

## 자동 검증

- 임시 QA 진입점 원복 후 최종 `npm run validate:pr`: **exit 0 / 통과**, Jest **170 suites / 1,708 tests**, regression **371 tests** (navigation 22, formatter/composition 89, notifications 7, map 50, V2 API 203). 로컬 실행 로그: `/private/tmp/350-validate-pr-restored.log`.
- 최초 관련 테스트: **13 suites / 443 tests 통과**. 이후 Booking 결과미확인 parameter 2개와 background-start 1개를 보완, 최종 전체 검증 포함.
- `npm run check:v2`: 통과. `npm run typecheck`: 통과.
- 로그 보안 별도 node/tsx regression: **3 tests 통과**.
- `npm run check:v1-changes -- --base origin/dev`: 통과. 이 스크립트는 커밋 범위만 검사하므로 동일 policy helper에 작업 트리의 name-status diff를 별도 입력했고 V1 추가·수정 0개였습니다. untracked 파일은 이 문서와 QA PNG 5개뿐입니다.
- `git diff --check`: 통과. 임시 native QA 진입점 원복 후 검사했고 untracked 문서 whitespace도 별도 검사하여 통과했습니다.
- sandbox의 tsx IPC EPERM으로 첫 validate가 회귀 단계에서 중단됐고 승인된 동일 명령 재실행은 통과했습니다. 새 테스트 타입 오류 2개 및 상태 guard 회귀를 수정 후 재검증했습니다. 기존 React act 경고는 출력되었지만 테스트 실패 없음.

## #350 완료 조건 판정과 남은 blocker

| 이슈 완료 조건 | 충족 범위 | 남은 항목 |
|---|---|---|
| 허용되지 않은 작업 실행 안 됨 | 앱 parser/Registry/도메인 fixture 통과 | 인증된 모델 공격 입력·양 플랫폼 실제 E2E |
| 사용자 확인 우회 write 0회 | 현재 미구현 prepare 경계 및 fixture에서 0회 | #349 실제 확인 직전 revalidation·예약 생성·중복 확인·응답 유실 |
| 장애 이후 기존 기능 정상 | canonical 터치 Query/Booking 자동 회귀 통과 | 실제 인증된 지도→예약 회귀 |
| 민감정보 로그/오류 노출 안 됨 | V2 코드 검사·고정 오류·로그 회귀 통과 | OS/provider 보관 정책 및 실제 양 플랫폼 로그/native 버퍼 한도 |
| 자동 테스트와 실기기 증거 | 자동 검증 기록·장치/번들 확인 있음 | Android 실발화·production 통합, iOS 전체 |

남은 의존성은 #349, 서버 #1764의 명령·대화·선택 맥락 계약과 실제 배포 확인, 인증된 실서버 QA 환경, 직접 발화 참여 및 online iOS 기기입니다. 서버 미완료를 이유로 앱 단독 검사·수정을 중단하지 않았습니다. **#350 전체 완료로 보고하거나 이슈를 닫지 않습니다.**

V1 dependency delta: **none**. V1 source 변경/새 import/경계 예외 없음. `legacy-exception` **불필요**.
