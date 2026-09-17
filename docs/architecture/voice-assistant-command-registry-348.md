# #348 — V2 AI Command Registry와 장소 읽기 도구

## 작업 기준과 소유권

- 시작 브랜치: `feat/348-ai-command-registry`.
- 시작 HEAD / 로컬 `origin/dev`: `7f77f7bd7418a16b33b37efe99763ea2544704fa` (#347 / PR #368 병합 상태).
- 구현 위치: **V2**. 루트 AGENTS, V2 README, #345 계약/JSON Schema, #347 세션 문서/API/controller/Hook과 실제 지도·예약 Query 경로를 확인했습니다.
- V1 소스 변경, V1 의존성 추가, boundary 예외 추가 없음.
- V1 dependency delta: **none**. `legacy-exception`: **불필요**.

## Provider-independent 완료 기준

**Provider-independent Command Engine 구현 완료**를 #348의 완료 기준으로 삼습니다.
실제 AI Provider E2E는 프록시 배포 후 **#350에서 검증 예정**입니다. Provider 부재는 #348의
구현 blocker가 아니며 **mock/fixture 통과를 실서버 AI 성공으로 간주하지 않습니다.**
**#349 예약 Mutation은 구현하지 않습니다.** 예약 초안 성공이나 예약 성공도 생성하지 않습니다.

`voiceCommandEngine.integration.test.ts`는 HTTP transport만 주입된 fixture로 대체합니다.
고정된 wall/monotonic clock과 QueryClient 아래에서 실제 #347 API의 최종 JSON decode → unknown parser →
session/ledger → Registry/policy/runtime → 기존 공개 V2 Query/API → AppCommandResult를 실행합니다.
fixture는 generated `ProviderEnvelopeV1` DTO와 타입 검사되며 production에 import되지 않습니다.
실제 모델 호출, Provider SDK/API Key, 모델 이름별 분기, 새로운 AI API/cache는 없습니다.

현재 production 연결은 `MapScreen → MapAssistantModal → VoiceCommandScreen → useVoiceCommands`입니다.
기존 feature flag와 #347의 활성 세션이 필요합니다. parser 실패, stale session/epoch/generation/context,
deadline/취소, 알 수 없는 ID, handler 부재, prepare 명령은 도메인 실행으로 이어지지 않습니다.
승인된 위치/권한은 검색뿐 아니라 상세·availability와 provider의 로컬 cancel 명령에도 필요합니다.
사용자가 직접 누르는 앱의 닫기/취소 버튼은 위치와 무관하게 세션을 정리합니다.
Gateway 장애는 #347의 안전한 오류 코드로 종료하고, `PROVIDER_UNAVAILABLE` envelope도 화면에
동일한 고정 오류 코드로 표시합니다. 성공 결과로 변환하지 않습니다.

이번 보완은 기존 `features/voice-assistant` 안에서 진행했습니다. 폴더 이동과 공개 export 추가는 없습니다.
Query observer(`voiceCommandQuery`), provenance(`voiceCommandProvenance`), 시간 검증(`voiceCommandTime`),
Registry/dispatcher(`voiceCommands`), session lifecycle(`voiceSession`), 화면 연결(`useVoiceCommands`),
결과 표시(`VoiceCommandResults`) 경계를 유지하여 #360의 모듈 이동과 섞지 않습니다.

## 실행과 정책

`voiceCommands.ts`의 mapped Registry는 command union 전체를 포함하고 각 항목의 `policy`가
기존 `VOICE_COMMAND_POLICIES` 객체를 그대로 참조합니다. 별도 command allowlist나 권한표는 없습니다.
각 항목은 이름, 정책, runtime validator, 고정 handler를 가집니다. 3개 READ handler는 공개 Query
options에 고정 연결되며 command 문자열을 URL/route/함수 이름으로 사용하지 않습니다.

`prepareReservation`은 PREPARE_WRITE/draft/`allowsMutation: false`를 유지하며 handler는 `null`입니다.
현재 실행은 `FORBIDDEN`입니다. `VoiceCommandHandler<'prepareReservation'>`는 #349가 연결할
초안 전용 결과와 runtime/provenance/query 실행 경계를 정의합니다. 예약 성공 데이터는 이 타입에 없습니다.
실행 테스트는 유효한 장소/slot provenance가 있어도 API 추가 호출과 Mutation cache 생성이 0임을 확인합니다.

Provider의 최종 JSON은 #347 decode/parser를 거칩니다. dispatcher에서도 기존 parser로 재검증합니다.
등록되지 않은 명령, 추가 route/API/좌표, 앱 결과 위조는 실행하지 않습니다. assistant/clarification/protocol
메시지는 read handler를 호출하지 않으며 provider의 성공 문장은 성공 UI/TTS로 사용하지 않습니다.

## #347 연결·replay·deadline

`VoiceDeliveryContext`에 앱 소유 `sessionId`, `envelopeId`, 원래 요청의 monotonic `deadline`,
`claimExecution`을 추가했습니다. 기존 epoch별 256개 ledger entry에 실행 점유 비트만 추가했으며
별도 replay Map은 없습니다. 기존 consumer delivery Promise 공유/충돌/세션 종료 시 초기화를 유지합니다.
실행 claim도 동일 ledger fingerprint와 비교하므로 consumer를 실수로 재호출해도 두 번 실행되지 않습니다.
다른 payload는 `REPLAY_CONFLICT`입니다.

실행 전, 각 Query 전후, 결과/provenance 게시 직전에 active identity, account revision, epoch,
generation, context revision, 실제 위치·권한·반경·timezone, signal, `isCurrent()`를 검사합니다.
이전 generation이나 종료된 epoch의 늦은 결과는 게시하지 않습니다. 이전 cancel delivery로 새 세션을
종료할 수 없습니다. `cancelVoiceSession`은 현재 세션 close lifecycle만 사용하며 예약/결제/쿠폰을 건드리지 않습니다.

30초는 transport 시작 시각부터 계산합니다. dispatcher가 그 deadline을 공유하며 하위 API마다
연장하지 않습니다. 테스트에서는 transport가 20초를 소비한 뒤 멈춘 Query가 나머지 10초에 종료됩니다.

## 기존 Query/API 재사용

| 읽기 | 공개 options | 기존 Query key |
|---|---|---|
| 장소 목록 | `place-exploration.createPlaceListQueryOptions` | `placeQueryKeys.list(params)` |
| 장소 상세 | `place-detail.createPlaceDetailQueryOptions` | `placeQueryKeys.detail(placeId)` |
| 예약 availability | `reservations.createAvailabilitiesQueryOptions(placeId, {})` | `reservationQueryKeys.availabilities(placeId, {})` |

별도 AI API/Query key/cache를 만들지 않습니다. 주입한 기존 QueryClient 안에서 QueryObserver를
일시 구독합니다. Query signal은 기존 options → API → HTTP client를 그대로 거칩니다.
취소/timeout에는 AI observer만 해제합니다. 다른 화면이 구독 중이면 요청은 유지되고 AI 결과만 폐기합니다.
전역 cancelQueries/clear/invalidate는 없습니다. AI가 단독 구독한 요청의 취소는 기존 Query lifecycle이 처리합니다.

기존 staleTime을 최대 30초로 제한합니다(목록의 15초는 유지). monotonic provenance가 만료되면
동일 canonical Query를 staleTime 0으로 재조회합니다. 네트워크 작업 중에도 하나의 deadline을 적용합니다.

## 검색·상세·availability 정책

- 앱에서 승인한 실제 위치와 granted 권한, 유효한 반경/feature flag가 있어야 검색합니다.
  위치 누락은 LOCATION_REQUIRED, `useCurrentLocation: false`는 location clarification입니다.
  좌표 fallback은 없습니다. runtime의 좌표는 장소 목록 Query에만 전달하고 gateway/result/log/storage에 넣지 않습니다.
- `NEAREST`, 기존 후보 제한 **12**, 지원되는 `touristCategory`만 서버 목록 param으로 보냅니다.
  날짜·시간·인원은 서버 param에 추가하지 않습니다.
- 후보마다 canonical 예약 availability를 조회합니다. ACTIVE, 유효 interval, 종료 전,
  유한 정수 정원 및 요청 인원 이상, 요청 구간과의 엄격한 overlap을 검사합니다.
  검색에는 공개 `isSelectableAvailability` selector로 GENERAL만 포함합니다.
- 목록의 facts가 부족하면 상세 Query로 보완합니다. 서버 id/name/address/categories/status만
  투영합니다. 가격·취소 조건·설명은 생성하지 않습니다. 후보 일부 실패는 전체 실패이고,
  정상 조회 후 불일치일 때만 빈 배열 성공입니다. coverage는 항상 `bounded_candidates`입니다.
- 상세/availability는 최근 검색 ID 또는 사용자가 선택한 canonical 상세 Query의 실제 성공 데이터로
  먼저 출처를 확인합니다. 모르는 ID를 조회해서 사후 승인하지 않습니다.
- 상세 하나를 확인해도 검색의 다른 장소를 제거하지 않습니다. 상세 재조회 freshness는 해당 ID에만
  별도로 기록하여 다른 ID까지 갱신된 것처럼 취급하지 않습니다.
- availability는 단일 로컬 날짜와 겹치는 실제 slot 전체 시각을 그대로 반환합니다. **서버 응답 순서를 유지**합니다.
  GENERAL/TICKET/CLASS facts를 허용하고 nullable 상품명은 그대로 null입니다. 상품명이나 예약 가능성을 추측하지 않습니다.
- 시간은 session timezone의 Gregorian 날짜로 해석합니다. 같은 날의 `[start, end)`이며 끝점만
  접하면 제외합니다. 과거 날짜, 존재하지 않거나 중복된 DST 로컬 시각은 clarification입니다.
  서버 timestamp는 offset과 달력 유효성을 검증합니다.

## Provenance·freshness

세션 메모리에는 identity/epoch/generation/account revision, runtime context revision 및 검색 조건
revision, 검증된 ID 집합, canonical key/dataUpdatedAt, monotonic 관찰 시각만 유지합니다.
availability에는 place/date/quantity, 공개 결과에 포함한 availability ID 및 불변 slot snapshot을 추가합니다.
검색에 내부적으로 사용했으나 사용자에게 반환하지 않은 slot ID는 기록하지 않습니다.

최대 재사용 시간은 30초입니다. 만료된 장소 ID는 과거 서버 출처만 남겨 강제 재조회하며,
만료된 availability는 draft 재사용 accessor에서 반환하지 않습니다. Query cache의 기존 나이도 차감합니다.

새 검색을 시작하면 이전 장소/availability를 즉시 무효화하고, 새 availability 요청은 이전 slot 선택을
즉시 무효화합니다. 새 조건의 요청이 실패해도 이전 선택이 남지 않습니다. 위치·권한·반경·timezone·선택 장소·
계정/feature flag 변경은 hook에서 context revision 증가, 진행 작업 취소, provenance 정리를 수행합니다.
종료/background/logout/unmount는 #347 lifecycle에 연결하여 정리합니다. AsyncStorage 등 영속 저장은 없습니다.

## 앱 결과와 화면

결과는 module-lifetime 증가 ID를 가진 `source: app` AppCommandResult입니다. 실제 Query 완료 후에만
성공을 생성하며 facts/배열/outcome/result를 freeze한 별도 projection이므로 cache 변경으로 바뀌지 않습니다.
오류는 고정 enum만 포함합니다. ApiError message/body/details/stack, JWT, transcript, prompt, 좌표를 넣지 않습니다.

기존 VoiceAssistantScreen에 처리 중/clarification/장소/상세/slot/빈 결과/오류/취소/명시적 재시도를 추가했습니다.
지도 모달은 현재 profile identity 및 인증 가능 상태, 승인된 위치, 반경, timezone, 선택 장소를 주입합니다.
기존 voice feature flag는 유지합니다. 요청은 사용자가 입력 확인을 누른 뒤에만 전송합니다.

Android native Modal의 activity blur 후에도 사용자가 활성 앱의 입력 필드에 직접 포커스를 주거나
검토한 입력을 제출하면 입력/세션을 다시 시작할 수 있습니다. background에서 자동 재개하지 않습니다.
실패한 read의 재시도는 입력 화면의 현재 문장으로 새 generation을 제출합니다. transport retry는 #347의
같은 requestId/text 및 backoff를 재사용하며 대기 후 버튼이 자동 활성화됩니다.

## 검증과 한계

실패 테스트를 먼저 실행한 뒤 구현했습니다. 핵심 Registry/실행 테스트, 화면/Hook 연결, replay 재진입,
30초 slot 만료, 조건 변경 실패 시 출처 정리, 검색의 다른 ID 보존, nullable 상품명, Android blur 후
명시적 입력 복구에서 실패 → 통과를 확인했습니다.
Provider-independent 보완에서도 상세·availability·provider cancel의 위치 차단과
PROVIDER_UNAVAILABLE 표시 테스트 **4개가 먼저 실패**한 뒤 수정으로 통과했습니다.

최종 자동 검증 결과는 아래에 기록합니다.

- 음성 feature(#345/#347 포함)·장소 탐색/상세·예약 및 지도 진입점 Jest: **19 suites / 416 tests 통과**.
- 새 Provider-independent 통합 fixture: **19 tests 통과**. 실제 JSON decode/parser와 Query/API를 사용합니다.
- `test:v2-api`: 168 tests 통과. `test:v2-map`: 47 tests 통과.
- `test:regression`: 255 tests 통과.
- `validate:pr`: **통과**. 전체 Jest **126 suites / 1,230 tests**, 회귀 **255 tests** 통과.
- `check:v2`: 통과(경계 fixture 60개, 기존 예외 373개 유지). `typecheck`: 통과.
- `check:v1-changes -- --base origin/dev`, `git diff --check`: 통과. untracked 신규 파일도 별도로 whitespace 검사했습니다.
- tsx의 IPC 소켓은 sandbox에서 EPERM이 발생하여 동일 명령을 승인된 실행으로 재검증했습니다.
- 전체 Jest의 기존 React act/overlapping act 경고는 원래 화면 테스트에서도 출력됩니다.

이전 Android 확인 이력: SM-N981N에서 이 작업 폴더의 개발 번들을 로드하여 지도, AI 모달 진입, 전송 안내, timezone,
닫기 후 지도 복귀를 확인했습니다. native Modal blur가 입력을 막는 현상을 발견하여 회귀 테스트와
명시적 입력 복구를 추가했습니다. 이후 기기가 잠겨 최종 수정의 실기기 재검증은 완료하지 못했습니다. 검증용 개발 서버는 종료했습니다.
**인증된 Gateway/서버 검색·상세·availability 성공, 취소·재시도의 end-to-end, 예약 화면 전체 회귀,
iOS 및 실제 음성/STT는 미검증입니다.** 이번 Provider-independent 보완의 실기기 검증도 수행하지 않았습니다.
성공으로 집계하지 않습니다. 실제 AI Provider E2E는 프록시 배포 후 #350에서 검증하며,
Provider 부재는 #348 blocker가 아닙니다. 구현을 막는 새 계약 충돌은 없습니다.

## 변경 파일

- `src/v2/features/voice-assistant/model/voiceCommands.ts`
- `src/v2/features/voice-assistant/model/voiceCommandQuery.ts`
- `src/v2/features/voice-assistant/model/voiceCommandTime.ts`
- `src/v2/features/voice-assistant/model/voiceCommandProvenance.ts`
- `src/v2/features/voice-assistant/model/voiceSession.ts`
- `src/v2/features/voice-assistant/model/__tests__/voiceCommands.test.ts`
- `src/v2/features/voice-assistant/model/__tests__/voiceCommandEngine.integration.test.ts`
- `src/v2/features/voice-assistant/hooks/useVoiceCommands.ts`
- `src/v2/features/voice-assistant/hooks/__tests__/useVoiceCommands.test.tsx`
- `src/v2/features/voice-assistant/components/VoiceCommandResults.tsx`
- `src/v2/features/voice-assistant/screens/VoiceCommandScreen.tsx`
- `src/v2/features/voice-assistant/screens/VoiceAssistantScreen.tsx`
- `src/v2/features/voice-assistant/screens/__tests__/VoiceAssistantScreen.test.tsx`
- `src/v2/features/voice-assistant/i18n/voiceAssistantResources.ts`
- `src/v2/features/voice-assistant/index.ts`
- `src/v2/features/map/components/MapAssistantModal.tsx`
- `src/v2/features/map/screens/MapScreen.tsx`
- `src/v2/app/i18n/__tests__/composition.test.ts` (기존 번역 baseline 유지, #348 새 하위 namespace만 제외)
- 이 문서.
