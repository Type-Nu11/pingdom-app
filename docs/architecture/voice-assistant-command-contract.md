# 음성 AI 에이전트 MVP 계약 v1 — #345

기준: `origin/dev` `520c981df2abc70a431730282e4bc365d04c7ff6` (2026-09-16 fetch 확인).
구현 위치: V2. 이 문서는 **확정한 앱 프로토콜과 후속 구현 의무**를 정의합니다.
서버 AI API가 배포되었다는 의미가 아니며, 이번 변경은 실행·네트워크·UI를 연결하지 않습니다.

## 1. 문제와 범위

외부 AI의 자연어 판단을 앱 실행 권한으로 신뢰하지 않습니다. MVP 흐름은
`검색 → 후보 비교 → 상세/조건 확인 → availability 선택 → 예약 초안`입니다.
사용자가 확인 화면에서 직접 수행하는 예약 제출은 AI 명령이 아닙니다.

공개 진입점은 `src/v2/features/voice-assistant/index.ts`입니다. 타입, 순수 parser,
불변 권한 표만 제공합니다. 외부 provider SDK, 새 validation package, Screen, Hook,
store, router, executor, API client, 마이크/STT/TTS, gateway, mutation은 추가하지 않습니다.

## 2. 사용자 시나리오

- “내 주변 카페, 9월 20일 오후 2~5시, 두 명 예약 가능한 곳”: 날짜·시간·인원을
  명확히 한 뒤 검색. 앱이 실행 시 확보한 위치만 기존 장소 API에 제공합니다.
- “두 번째 장소 자세히”: 화면 순서를 AI가 임의 ID로 치환하지 않습니다. 최근 결과로
  제공한 실제 ID만 제안하고 앱이 다시 출처를 검증합니다.
- “여기로 예약해 줘”: availability를 재조회하고 선택한 조건에 맞는 초안까지만 준비합니다.
  예약자 정보 입력 및 최종 확인 버튼은 앱 화면에서 사용자가 직접 수행합니다.
- “내일 오후”처럼 시간대·날짜 해석이 모호하면 clarification. 앱이 세션의 로컬 날짜와
  timezone을 제공합니다. AI가 조건을 추측하거나 인원을 기본값으로 채우지 않습니다.
- “그만”: 현재 음성 세션과 미완료 작업을 종료합니다. 예약 취소가 아닙니다.
- AI 장애·권한 거부: 기존 터치 검색·예약 화면을 계속 사용할 수 있습니다.

## 3. 책임과 신뢰 경계

| 주체 | 책임 | 권한으로 신뢰하지 않는 것 |
|---|---|---|
| 앱 | unknown 검증, 정책, 세션/요청 상관관계, ID 출처, 위치 권한 및 현재 위치, Query 재사용, 초안·확인 UI, 앱 결과 생성 | provider의 성공 선언, 확인했다는 주장, route/URL/좌표 |
| 서버 AI Gateway | 앱 사용자 인증, provider credential 격리, rate limit, 세션 만료·전송 제한, provider adapter, 최소 정보 전달 | provider 명령의 유효성, provider가 제시한 사용자 권한 |
| 기존 도메인 서버 | 최종 인증·인가, availability/정원/상품 상태, 예약 검증·원자성·idempotency | 앱 캐시만으로 예약 가능하다는 판단 |
| 외부 AI | 자연어를 허용 명령 또는 추가 질문으로 제안, 비권위적인 설명 | 실행·성공·예약 확정·권한 변경 결정 |

```text
Voice/Text Input
      ↓
Server AI Gateway
      ↓
Untrusted Envelope (unknown)
      ↓
Parser → Policy → Command Router (#348)
                    ├─ V2 Query
                    ├─ Clarification
                    └─ Reservation Draft (#349)
                              ↓
                       User Confirmation
                              ↓
                    Existing Reservation Mutation
                              ↓
                       App-owned server result
```

Parser 통과는 실행 허가가 아닙니다. provider origin 표시는 신뢰의 증거가 아니며
provider 채널에는 앱 결과 타입을 수신하는 경로 자체가 없습니다. AI가 서버에서 온
장소 설명에 포함된 지시(prompt injection)를 재출력해도 동일한 parser/policy를 거칩니다.

## 4. 조사한 기존 V2 공개 경계와 실제 계약

| 공개 경계 | 재사용 대상과 주의점 |
|---|---|
| `place-exploration/index.ts` | `createPlaceListQueryOptions`, `placeQueryKeys`, `PlaceListParams`, `PlaceList`, `createPlaceCardQueryOptions` 등. 날짜·시간·인원·reservable 필터는 list query에 없음. `touristCategory`는 query string이고 detail의 enum을 MVP allowlist로 사용 |
| `place-detail/index.ts` | `createPlaceDetailQueryOptions`, `PlaceDetail`. 상세 staleTime은 5분. availability의 별도 `createPlaceAvailabilitiesQueryOptions`와 `PlaceAvailabilities`도 있지만 예약 경로와 key/스냅샷이 다름 |
| `reservations/index.ts` | `createAvailabilitiesQueryOptions`, `reservationQueryKeys`, `AvailabilityList`, `isSelectableAvailability`, `NEARBY_RESERVATION_CANDIDATE_LIMIT`, `createReservationMutationOptions`, `invalidateReservationCreateDependencies` |
| `shared/api/index.ts` | `ApiError`, `toApiError`, `getApiErrorUx`, generated 기반 operation/schema 타입. JWT 주입은 기존 `apiClient`의 token provider 소유 |

현재 주변 예약 경로는 `MapScreen → usePlaces → usePlaceList`로 현재 위치·반경·
`sort: NEAREST`·후보 최대 12개를 조회하고 `useNearbyReservablePlaceIds`가 각 후보의
availability를 검사합니다. 기존 `hasReservableAvailability`는 ACTIVE, endsAt > now,
remainingCapacity > 0만 확인하므로 AI의 날짜·시간·인원 및 GENERAL 제한에는 충분하지 않습니다.
후속 router는 공개 query options와 selector를 사용하고 map screen/hook 내부를 import하지 않습니다.

예약 availability는 `reservation-payment.openapi.json` / generated `reservationPayment.ts`가
source of truth입니다. `id`, `placeId`, `productId`, `productType`, **`productName`**,
`startsAt`, `endsAt`, `totalCapacity`, `remainingCapacity`, `status`가 있습니다.
가격·통화·취소 조건은 이 availability 계약에 없습니다. 결제나 다른 응답에 가격이 있어도
이를 availability의 견적이라고 간주하지 않습니다.

**기존 코드의 불일치:** `reservationProduct.ts`와 그 테스트의 “상품명이 없다”는 설명은
현재 generated의 nullable `productName`과 다릅니다. 동작은 여전히 GENERAL만 선택 가능하고
TICKET/CLASS는 차단합니다. #345는 이를 수정하지 않으며 같은 정책을 유지합니다.
GENERAL은 서버 설명상 productId/productName이 null입니다. 모순된 응답은 초안 생성 시 거부합니다.

예약 POST body에는 `availabilityId`, `quantity`, `idempotencyKey`, `bookerName`,
`bookerPhone`, 선택적 `requestNote`만 있습니다. AI에 productId를 추가로 요구하지 않습니다.
quantity의 OpenAPI 최소값은 1이고 최대값은 없습니다. 이번 앱 계약의 **1~12 정수**는
`CreateReservationScreen.PEOPLE` UI와 일치하는 MVP 상한이며 서버 상한이라는 의미가 아닙니다.

기존 booker validator는 이름 trim 후 필수/100자, 전화 필수/30자/`^[0-9+()\- ]+$`,
메모 500자를 검사합니다. idempotency key는 앱에서 생성하며 100자 이하입니다.
재시도는 동일 intent의 key를 보존하고 사용자가 조건·예약자 정보를 바꾸면 새 intent/key를
만드는 기존 정책을 재사용합니다. 이 helper들은 현재 feature index에 export되지 않으므로
#349에서 필요한 공개 export를 별도 추가하거나 기존 확인 흐름 안에서 사용합니다.
voice-assistant가 내부 파일을 직접 import하지 않습니다.

## 5. Provider envelope 계약

정확한 TypeScript 정의: `voiceAssistantCommand.types.ts`.
기계 판독용 구조: [provider-envelope.v1.schema.json](./voice-assistant/provider-envelope.v1.schema.json).
JSON Schema는 구조/길이/enum을 표현합니다. 달력 유효성·시작/종료 비교는 parser의 추가
규칙이며 JSON Schema만 검사한 입력을 실행하면 안 됩니다. 실행 결과 계약은 TypeScript의
`AppCommandResult`이고 이 provider 입력 schema에 포함하지 않습니다.

공통 필드: `schemaVersion: 1`, `id: string`, `kind`.
ID는 ASCII `[A-Za-z0-9][A-Za-z0-9._:-]{0,127}` (1~128자). trim/coercion하지 않습니다.
세션 ID나 generation은 AI가 정하는 payload가 아니라 인증된 transport와 앱 runtime context 소유입니다.

| kind | 추가 필드 | 의미 |
|---|---|---|
| `command_request` | `command`, `args` | 아래 5개 union 중 하나 |
| `clarification_request` | `field`, `text` | field는 touristCategory/date/timeRange/quantity/useCurrentLocation/placeId/availabilityId 중 하나 |
| `assistant_message` | `text` | 비권위적인 텍스트; 명령·실행 결과로 해석 금지 |
| `protocol_error` | `code` | UNSUPPORTED_REQUEST / PROVIDER_UNAVAILABLE / INVALID_RESPONSE. 실제 HTTP 오류나 앱 실패 결과와 구분 |

text는 공백만 아닌 문자열, 최대 2,000 UTF-16 code units입니다. raw HTML/실행 링크로
렌더링하지 않습니다. 설명문이 “예약 성공”이라고 주장할 수 있으므로 사실/성공/확인 UI 및
성공 TTS는 앱 결과로만 생성합니다. parser는 자연어의 진실성을 판정하지 않습니다.

```json
{"schemaVersion":1,"id":"cmd-1","kind":"command_request","command":"searchNearbyReservablePlaces","args":{"touristCategory":"CAFE","date":"2026-09-20","startTime":"14:00","endTime":"17:00","quantity":2,"useCurrentLocation":true}}
```

### 명령 입력·출력

모든 args는 정확한 key 집합이며, optional 필드는 생략만 허용합니다 (`null`/`undefined` 불가).
placeId/availabilityId는 양의 **safe integer**입니다. 실제 int64 범위를 JS number로
정확히 표현할 수 없는 ID는 거부하며 서버 식별자 문자열 버전이 필요합니다.

| command | args | 앱 성공 data |
|---|---|---|
| `searchNearbyReservablePlaces` | date, startTime, endTime, quantity, useCurrentLocation; 선택 touristCategory | places: VoicePlaceFacts[], coverage: bounded_candidates |
| `getPlaceDetails` | placeId | place: VoicePlaceFacts |
| `getAvailabilities` | placeId, date, quantity | placeId, date, availabilities: VoiceAvailabilityFacts[] |
| `prepareReservation` | placeId, availabilityId, quantity | draft: ReservationDraft (awaiting_user_confirmation) |
| `cancelVoiceSession` | 빈 객체 | sessionStopped: true |

- 카테고리는 서버 detail enum K_POP/BEAUTY/FASHION/CAFE/FOOD/POP_UP/EXHIBITION/NIGHTLIFE/OTHER.
  생략은 모든 카테고리. 임의 자연어를 새로운 enum이나 API 조건으로 만들지 않습니다.
- date: Gregorian `YYYY-MM-DD`, 0001~9999년, 윤년 검증. 상대 날짜는 앱 세션의
  timezone/오늘 기준으로 명확히 해석한 뒤 전달합니다. 과거 날짜 여부는 실행 시 now로
  검사하고 추가 질문합니다. parser는 시계에 의존하지 않습니다.
- 시간: `HH:mm`, 00:00~23:59, startTime < endTime. 같은 날의 반열린 구간 [start,end).
  자정을 넘기는 요청·DST 중복/존재하지 않는 로컬 시간은 MVP에서 clarification합니다.
- getAvailabilities는 **단일 로컬 날짜**만 허용합니다. 기간/flexible time은 후속 버전 범위입니다.
- useCurrentLocation=false도 사용자의 명시적 의사이므로 유효한 syntax입니다. 실행은
  위치를 몰래 쓰지 않고 `clarification_required/useCurrentLocation`을 반환합니다.
  true도 OS 권한·최근 runtime 위치 없이는 실행할 수 없습니다. permission 변경은 AI 권한 밖입니다.
- 장소/availability ID 이외의 객체, 좌표, radius, page, URL, route, 함수, credential,
  productId, 개인정보, idempotencyKey, confirmation 필드는 AI 입력에 없습니다.

### 검색·availability의 실행 의미 (#348)

1. 앱이 사용 가능한 현재 위치·허용 반경·timezone을 선택하고 최대 12개 후보를 조회합니다.
   `touristCategory`를 지원하는 공개 list query에 그대로 전달합니다. feature flag가 꺼졌거나
   위치/시간 해석을 확정할 수 없으면 실행하지 않습니다.
2. 각 후보의 예약 availability를 공개 `createAvailabilitiesQueryOptions(placeId, {})`로 조회합니다.
   날짜·인원 필터를 존재하지 않는 HTTP query로 전송하지 않습니다.
3. 날짜/시간 조건은 로컬 timezone으로 변환한 서버 interval과 **겹침**으로 해석합니다.
   날짜만 있는 요청은 해당 날짜의 [00:00, 다음 날 00:00)과 겹쳐야 합니다. 끝점만 닿으면 불일치.
   검색 시간 구간과 겹치는 slot은 실제 서버 startsAt/endsAt 전체를 표시하며 사용자가 요청한
   시간대로 slot을 자르거나 바꾸지 않습니다. 초안 화면에서 실제 시간을 재확인합니다.
4. 서버 interval이 유효하고 endsAt > 실행 시 now, status ACTIVE, remainingCapacity가
   유한한 정수이고 quantity 이상인지 확인합니다. GENERAL 여부는 공개 selector를 재사용합니다.
   getAvailabilities의 facts에는 TICKET/CLASS도 표시할 수 있으나 초안 대상은 아닙니다.
5. 검색 성공은 조건에 맞는 GENERAL slot을 가진 장소만 반환합니다. 후보/상세 조회가 실패한 경우
   완전한 “0건”으로 변환하지 않고 실패 결과를 반환합니다. MVP는 partial success를 지원하지 않습니다.
   정상 빈 배열은 성공입니다. coverage는 지역 전체 검색 완료를 뜻하지 않는 bounded_candidates입니다.
6. VoicePlaceFacts는 상세 서버의 id/name/address/touristCategories/operatingStatus만 투영합니다.
   목록의 optional 필드가 부족하면 같은 공개 detail Query로 보충합니다. 임의 이름/주소를 생성하지 않습니다.

### 앱 실행 결과와 실패

`AppCommandResult`는 `kind: command_result`, `source: app`, schemaVersion/id/commandId/command,
명령별 `outcome`의 discriminated union입니다. 성공 data는 명령과 정적으로 연결되어 있습니다.
provider parser는 이 kind/source를 무조건 거부합니다. source 문자열을 넣는다고 신뢰가 생기지 않습니다.

- succeeded: 읽기 완료·초안 준비·세션 종료를 의미합니다. **예약 성공을 표현하는 명령 결과는 없습니다.**
- clarification_required: 앱이 허용된 field를 지정. 사용자 문구는 앱 i18n에서 생성합니다.
- rejected: 타입에 정의된 안전한 실패 코드만 반환. raw exception/ApiError.message/body는 넣지 않습니다.

| 상황 | 결과/코드 |
|---|---|
| 검색 위치 없음/권한 없음 | LOCATION_REQUIRED 또는 location clarification |
| 조작 ID/다른 장소의 slot | ID_NOT_IN_CONTEXT |
| 오래된 선택·세대·초안 | STALE_CONTEXT (이미 종료한 세션 UI에는 게시하지 않음) |
| 비활성/종료/정원 부족 | AVAILABILITY_UNAVAILABLE |
| TICKET/CLASS | UNSUPPORTED_PRODUCT |
| 같은 command ID의 다른 payload | REPLAY_CONFLICT |
| 취소/timeout | CANCELED / TIMEOUT |
| ApiError 401/403/404/429, network, 5xx | AUTHENTICATION_REQUIRED / FORBIDDEN / NOT_FOUND / RATE_LIMITED / NETWORK_ERROR / SERVER_ERROR |
| 비정상 서버 ID/날짜/필드 | INVALID_SERVER_RESPONSE |

명령별 가능한 실패는 공통 코드 집합의 부분집합입니다. cancel은 네트워크를 필요로 하지 않으며
오래된 세션에서 온 cancel이 새로운 세션을 종료해서는 안 됩니다.

## 6. 단일 권한 정책과 사용자 확인

규범적인 소스는 **`VOICE_COMMAND_POLICIES`** 한 곳입니다. 다음 표는 그 설명이며 router는
문서나 별도 문자열 비교로 권한을 재정의하지 않고 해당 표와 command union을 사용합니다.

| 명령 | classification | automaticAction | mutation |
|---|---|---|---|
| searchNearbyReservablePlaces | READ | query | 금지 |
| getPlaceDetails | READ | query | 금지 |
| getAvailabilities | READ | query | 금지 |
| prepareReservation | PREPARE_WRITE | draft | 금지; 사용자 확인 필요 |
| cancelVoiceSession | SESSION_CONTROL | stopSession | 금지 |

모든 정책은 active session/replay check/current generation을 요구합니다. 이는 이번 SPIKE에서
실행된 검증이라는 의미가 아니라 후속 executor가 반드시 구현해야 하는 전제조건입니다.
`allowsMutation`은 모든 항목에서 false입니다.

예약 확정/취소/결제/쿠폰 발급/계정 변경/위치 권한 변경/알림 설정 변경/임의 navigation은
allowlist 밖입니다. 자연어 “확인”, provider의 confirmed=true, assistant message, callback 등은
사용자 확인 이벤트가 아닙니다. #349에서 앱 확인 버튼으로만 예약 mutation을 시작합니다.
결제는 별도 사용자 동작이 필요하며 이번 프로토콜로 승인하지 않습니다.

## 7. ID provenance·초안·freshness 불변조건

형식상 양수 ID도 위조 가능하므로 `parsed command ≠ authorized command`입니다.
앱은 Query cache를 데이터 source로 유지하고 세션에는 아래 최소 provenance 메타데이터만 보관합니다.
AI 응답의 timestamp, place 객체, productId, success 주장으로 provenance를 갱신하지 않습니다.

- 검색/사용자 선택 provenance: session identity, generation, 사용자 계정, placeId 집합,
  query key, dataUpdatedAt, 위치·timezone·조건의 context revision. 사용자 선택도 서버에서
  조회한 registered place여야 합니다. 임의 지도 POI ID를 서버 placeId로 치환하지 않습니다.
- availability provenance: 위 정보 + placeId, 조회 date/quantity, 서버 결과에서 검증한
  availabilityId 집합, 실제 slot snapshot. #348의 공개 결과로 전달한 ID만 AI 선택 대상입니다.
- v1 provenance의 최대 재사용 시간은 **30초**(앱 monotonic clock). 이는 서버 보장이나
  예약 잠금이 아닙니다. 30초가 지나면 refetch하고 변경된 결과/조건은 다시 선택하도록 합니다.
- prepareReservation은 해당 세션의 최근 availability에 ID가 있었음을 **먼저** 확인합니다.
  없는 ID를 API로 조회해서 합법화하지 않습니다. 그 뒤 강제 refetch하여 placeId 결합,
  ACTIVE, endsAt, 정원, quantity, 실제 시간, GENERAL 및 null product 필드를 다시 검증합니다.
- 초안은 최신 server facts + quantity만 사용합니다. 날짜·인원·장소·slot·계정·timezone 변경,
  세션 종료·로그아웃·background, availability 변경은 초안을 무효화합니다.
- #349는 확인 직전에도 refetch하며 변경 시 기존 확인을 취소하고 새 정보로 재확인을 요구합니다.
  앱 생성 draft revision/token과 현재 UI의 버튼 이벤트를 연결합니다. provider는 이 token을 받지 않습니다.
- refetch와 mutation 사이 경쟁은 서버 정원 검증/트랜잭션의 책임입니다. 앱은 예약 성공을 예측하지 않습니다.

서버 facts 타입은 provenance 증명이 아닙니다. executor의 메타데이터는 로컬 전용이며
provider envelope에 추가하지 않습니다. `ReservationDraft`는 booking body가 아니고 예약자·key가 없습니다.

## 8. Replay·중복·timeout·취소·stale response

#347/#348은 session epoch + envelope id를 key로 **실행 전 원자적 claim**을 수행합니다.
같은 id/같은 검증 payload는 진행 중 작업을 공유하거나 원래 결과를 재사용하며 재실행하지 않습니다.
같은 id/다른 payload는 REPLAY_CONFLICT입니다. object key 순서가 다른 동일 payload는
정규화된 검증 결과의 정렬된 직렬화로 비교합니다. raw prompt를 fingerprint에 넣지 않습니다.

ledger는 세션 종료까지 유지합니다. 최대 256개 envelope 후 새 세션을 요구하며 오래된 항목을
evict하고 계속 실행하지 않습니다. 연결 재시도는 ledger를 유지합니다. 앱 재시작/로그아웃 후
이전 epoch 응답은 거부합니다. READ도 재실행에 따른 UI 경합을 막기 위해 동일 규칙을 따릅니다.
새 id로 같은 prepare가 반복되어도 기존 동일 초안을 재사용/교체할 뿐 mutation은 0회입니다.
예약 idempotency key는 command id와 다르고 AI replay ledger를 대체하지 않습니다.

- transport는 최종 메시지만 JSON decode 후 parser로 보냅니다. 문자열 자체/부분 JSON/stream chunk는 실행하지 않습니다.
- #347의 앱 측 응답 제한: 최종 envelope UTF-8 최대 16 KiB, 조립 버퍼도 같은 한도,
  gateway 요청 전체 30초 deadline (chunk 수신으로 연장하지 않음). 더 엄격한 서버 한도는 준수합니다.
- #348의 command는 30초 전체 deadline. 기존 API 호출은 10초 timeout입니다. Query 기본은
  30초 staleTime, 최대 2회 retry(4xx 제외), mutation retry=0이므로 전체 deadline도 따로 필요합니다.
- AbortSignal은 공개 Query option → API → axios까지 전달합니다. `ApiError.code === ERR_CANCELED`
  및 signal.aborted는 network failure로 표시하지 않습니다. timeout은 취소 사유와 구분합니다.
- 최신 사용자 요청 우선: 새 입력이 generation을 올리며 이전 작업을 취소합니다. 완료 직전에도
  active session/account/generation/context revision을 검사하여 늦게 도착한 결과를 폐기합니다.
- 사용자 중단/화면 이탈/background/로그아웃 시 STT·stream·query observer·초안을 정리합니다.
  전역 Query cache 전체를 지우거나 다른 화면의 동일 Query를 무조건 취소하지 않습니다.
  공유 중인 Query는 AI observer를 분리하고 AI 결과만 폐기합니다. 단독 소유 Query만 취소합니다.
- 네트워크 abort가 서버 write 취소를 보장하지 않습니다. #349에서 확인 후 제출된 예약은
  도메인 결과/idempotency로 추적하고 AI 세션 종료를 예약 취소로 해석하지 않습니다.

**Query key 주의:** 예약은 `['v2','availabilities',placeId,{}]`, 장소 상세 availability는
`['v2','places','entity',placeId,'availabilities']`입니다. AI 예약 경로는 전자를 canonical로
사용하며 별도 AI 데이터 cache를 만들지 않습니다. 기존 create invalidation은 예약 목록과
예약 availability만 무효화합니다. #349는 다른 key가 확인 화면의 freshness 근거가 되지
않도록 하고, 필요하면 별도 이슈에서 기존 key 통합을 다룹니다.

## 9. 위치·음성·예약정보 정책

| 데이터 | 전송 | 로그·보관 |
|---|---|---|
| 정확한 현재 위치 | 앱 runtime → 기존 장소 API만. gateway/provider 전달 금지 | 앱 내 일시 context, raw 좌표/Query key 로그·analytics 금지 |
| 음성 원본 | #346에서 STT 방식·처리 주체·동의 확정 후 최소 전송 | 기본 파일 저장·녹음 로그 없음, 중단 즉시 버퍼 해제 |
| transcript/prompt | 사용자에게 전송 시점 표시 후 인증된 gateway로 필요한 텍스트만 | 앱/gateway 원문 로그·analytics 기본 금지, 세션 중 메모리만, 종료 시 폐기 |
| JWT/provider credential | JWT는 앱→자사 인증 경계만, provider credential은 서버만 | prompt·envelope·앱 번들·로그 금지 |
| booker 이름/전화/requestNote, idempotency key | 사용자 확인 UI → 기존 예약 API만 | gateway/provider/result에 미포함, 기존 예약 정책 적용 |
| 장소/availability facts | allowlisted projection만 필요한 턴에 gateway로 전달 | 개인 이동·예약 의도와 결합된 history는 저장하지 않음 |
| 운영 진단 | 고정 enum 오류/command, 처리 시간, 총량 통계만 | envelope id·query key·raw 오류 body·음성·prompt 금지. 익명 집계 최대 7일 후 삭제하는 gateway 정책 필요 |

사용자가 텍스트로 개인정보/위치를 말할 수 있습니다. 필드 allowlist는 자유 텍스트의 PII를
자동 제거하지 않습니다. #346/#347은 전송 전 최소화·redaction 및 provider 보관/학습 설정을
확정해야 합니다. 앱 i18n 오류는 `voiceAssistant.invalidResponse` 키를 사용하며 #346에서
ko/en 문구를 추가합니다. 내부 rejection은 code + 정해진 path만 포함하고 입력값/임의 key 이름은
반영하지 않습니다. ApiError의 responseData/details/fieldErrors/message도 그대로 로그하지 않습니다.

외부 provider 보관 기간·학습 제외·리전은 현재 확인되지 않았습니다. 해당 계약과 개인정보 안내가
확정되기 전 실사용 음성·민감정보 전달은 출시 blocker입니다. 이 문서의 앱/서버 정책이 provider의
실제 보관 동작을 보장한다고 주장하지 않습니다.

## 10. Threat model와 방어 범위

| 위험 | 현재 코드/테스트 | 후속 실행 검증 |
|---|---|---|
| prompt injection, 임의 command | exact union, unknown command 거부 | 설명/서버 자유 텍스트를 지시로 해석 금지 |
| route/URL/method/header/JWT/code 주입 | 모든 추가 key 거부 | 공개 V2 API만 router에서 고정 연결 |
| prototype/accessor/NaN/Infinity | own data property snapshot, safe integer, 예외 containment | decode 크기/stream deadline |
| 조작 place/availability ID | 형식 검증 + provenance 정책 | 최근 서버 집합·place 결합 확인; 위조 ID 실행 0회 |
| 오래된 availability | fresh availability 정책 | 30초 provenance·prepare/확인 직전 재조회, 초안 무효화 |
| replay·중복 | replay/current generation 필수 정책 | 원자적 claim, payload conflict, reconnect/session 격리 |
| 확인 우회 | PREPARE_WRITE는 draft만, 모든 mutation false | 확인 전 mutation 0회, 앱 버튼에만 제출 권한 |
| AI 성공 위조 | app result kind 거부, 타입 분리 | 성공 UI/TTS는 실제 서버 결과만 |
| JWT·위치·예약정보 노출 | 입력 추가 필드 차단, 출력 DTO 최소 투영 | prompt redaction, 로그/analytics 검수, provider 보관 합의 |
| 음성·prompt 과다 저장 | parser rejection에 raw 입력 없음 | 원본 비저장·buffer 폐기·진단 최소화 |
| provider 장애 | 프로토콜 오류와 앱 오류 분리 | AI 비활성/실패가 기존 터치 흐름을 막지 않음 |

검증 테스트는 parser의 syntax rejection과 정책상의 불변조건을 보장합니다. replay store,
ID 서버 출처, stale snapshot, mutation 차단의 **실제 실행 테스트는 executor 구현 후** 수행합니다.
이 SPIKE의 테스트가 네트워크/예약 보안을 이미 end-to-end 보장한다고 해석하면 안 됩니다.

## 11. Provider 교체·버전 정책

Gateway adapter만 provider의 tool-call/stream 표현을 v1으로 변환합니다. provider 이름,
함수명 convention, tool-call ID, URL, SDK 타입은 core 타입으로 유출하지 않습니다.
provider native tool ID는 adapter 내부에서 envelope id와 연결합니다.

schemaVersion은 정수 1만 수용합니다. 알 수 없는 version/kind/command/key는 fail closed이며
알 수 없는 필드를 제거하고 실행하지 않습니다. 필드 추가·허용 command 변경·의미 변경은
새 schemaVersion과 앱 capability 협상/서버 배포가 필요합니다. optional key라도 구버전 parser는
거부하므로 gateway가 새 필드를 구버전에 보내면 안 됩니다. downgrade로 확인을 생략하지 않습니다.
하위 호환 대상은 provider 표현이 아니라 버전별 앱 프로토콜입니다. parser·타입·JSON Schema·
계약 fixture를 함께 갱신하고 strict typecheck 및 실행 테스트를 통과해야 합니다.

## 12. #346~#350 acceptance criteria

| 이슈 | 인계할 계약과 완료 증거 |
|---|---|
| [#346](https://github.com/Type-Nu11/pingdom-app/issues/346) 입력 UI | foreground 명시적 시작/중단, STT 최종 텍스트만 제출, 동일 텍스트 fallback, ko/en invalidResponse/clarification 문구, 비권위적인 assistant 표시, 성공은 앱 소유 UI/TTS, background 시 녹음/초안 폐기, 권한 거부 후 터치 기능 정상; 실제 기기 QA |
| [#347](https://github.com/Type-Nu11/pingdom-app/issues/347) 세션 | 배포된 OpenAPI로 API/Hook 구성, session epoch·generation 앱 소유, unknown 최종 decode→공개 parser, 16 KiB/30초 제한, provider result 거부, 인증/429/timeout/5xx 구분, 중복 ledger 256개 한도/재연결 유지, 원문·credential 로그 없음; stream/재접속/취소 테스트 |
| [#348](https://github.com/Type-Nu11/pingdom-app/issues/348) router | command union exhaustiveness, VOICE_COMMAND_POLICIES 소비, 공개 V2 query/key 재사용, 현재 위치 runtime 주입, false/권한 없음 clarification, bounded 12개 후보, 날짜/인원 로컬 필터, ID provenance/30초 freshness, atomic replay/generation 검사, 부분 실패를 빈 결과로 숨기지 않음; 조작 ID/stale/replay/race/빈 결과/오류 테스트 |
| [#349](https://github.com/Type-Nu11/pingdom-app/issues/349) 초안/확인 | GENERAL-only와 실제 서버 snapshot 일치, 최근 slot + 강제 refetch + 확인 직전 refetch, 사용자 확인 전 mutation 0회, booker validation/앱 idempotency/중복 제출/cache invalidation 재사용, timeout 후 동일 intent key 유지, 성공은 서버 응답 이후; 가격/취소 조건 누락 해결 전 추측 표시 금지 |
| [#350](https://github.com/Type-Nu11/pingdom-app/issues/350) 보안/E2E | 이번 parser corpus 재사용, app-result 위조/직접 route/API/키 주입 거부, ID 세션 교차·replay·stale slot·취소 후 늦은 응답, 확인 우회 mutation 0회, 로그/analytics 민감정보 검사, provider 장애 후 터치 검색/예약 회귀, Android/iOS 권한·오디오·세션 실제 기기 증거 |

## 13. 미확정 서버 계약·blocker

- #345의 순수 계약 구현 blocker는 없습니다. 신규 패키지는 필요하지 않습니다.
- #347: gateway/session/ephemeral token/stream endpoint와 auth·재연결·만료·오류 OpenAPI가
  아직 이번 저장소에 확정되지 않았습니다. URL/토큰 API를 추측해서 구현하지 않습니다.
- #349의 원래 요구인 금액·통화·취소 조건을 포함한 초안은 현재 availability DTO만으로
  만들 수 없습니다. 서버 견적/조건 계약과 예약 시 snapshot 일치 규칙이 필요합니다.
  “무료”/“취소 가능”으로 대체하지 않습니다. 서버 정보 부재가 사용자의 확인에 중요한 경우
  해당 예약 확정을 차단하고 기존 터치 흐름으로 안내합니다.
- productName은 generated에 이미 있으나 nullable이고 기존 selector가 상품 예약을 막습니다.
  TICKET/CLASS 해제는 #349 또는 별도 정책 이슈에서 서버 보장/화면 변경을 함께 검토합니다.
- 서버 장소 timezone이 없습니다. MVP는 세션 시작 시 앱 로컬 timezone 고정이며 UI에서
  명시해야 합니다. timezone 변경은 세션을 무효화합니다. 장소 timezone과의 불일치를
  해결할 수 없는 원격 여행/DST 요청은 clarification하며 암묵 변환하지 않습니다.
- 서버 list는 직접적인 reservable/date/quantity 필터를 지원하지 않습니다. 제한된 후보의
  availability fan-out을 사용하며 전 지역 예약 가능 장소를 완전하게 검색했다고 약속하지 않습니다.
- 개인정보/STT/provider 보관·학습 제외·진단 보관 정책 합의는 실연결 출시 전 필수입니다.

## 14. 검증과 변경 경계

테스트는 `src/v2/features/voice-assistant/model/__tests__`에 있으며 Jest 전체 실행에 포함됩니다.
정상 5명령, 누락·잘못된 타입·enum·추가 필드, ID/인원/달력/시간, 민감 key 주입,
prototype/accessor/throwing Proxy, 결과 위조, 불변 snapshot, READ/PREPARE_WRITE 구분을 검증합니다.
타입 fixture는 타입 수준의 명령/args, 결과/command 연결과 provider/app 분리를 검사합니다.

필수 확인: model 테스트, `check:v2`, `typecheck`, `test:regression`, `validate:pr`,
`check:v1-changes -- --base origin/dev`, `git diff --check`.
V1 dependency delta: **none**. `legacy-exception`: **불필요**.
커밋·푸시 없음. 기존 예약·장소 API와 화면은 수정하지 않습니다.

2026-09-16 검증 결과: 신규 model/parser/policy 테스트 140개 통과, `check:v2` 및
`typecheck` 통과, `test:regression` 225개 통과, `validate:pr` 전체 Jest 103 suites /
869 tests 및 ownership 2개와 회귀 225개 통과, V1 변경 정책과 whitespace 검사 통과.
최초 회귀 실행은 sandbox의 tsx IPC 소켓 EPERM으로 중단되어 승인된 실행으로 재검증했습니다.
전체 Jest에는 기존 UI 테스트의 React act 경고가 있으나 실패는 없습니다.
V1 정책 스크립트는 커밋 범위를 검사하므로, 별도로 untracked 8개 파일도 V2/docs 경로와
whitespace를 확인했습니다. 기준 브랜치 재현이 필요한 테스트 실패는 없었습니다.
