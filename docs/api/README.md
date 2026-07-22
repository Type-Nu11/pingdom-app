# PingDom MVP API 계약

`mvp.openapi.json`이 프론트엔드 타입과 서버 DTO의 단일 원천이다. 이 문서는 명세를 읽을 때 필요한 규칙, 상태 전이, 버전 정책과 검토 절차만 보충한다. 필드나 경로가 문서와 명세에서 충돌하면 OpenAPI가 우선한다.

## 계약 범위와 이름 대응

| 기능 | OpenAPI schema | 프론트 타입 | 서버 DTO |
| --- | --- | --- | --- |
| 장소 목록 카드 | `PlaceSummary` | `PlaceSummary` | `PlaceSummaryDto` |
| 장소 상세 | `PlaceDetail` | `PlaceDetail` | `PlaceDetailDto` |
| 실시간 상태 | `LiveStatus` | `LiveStatus` | `LiveStatusDto` |
| 관광객 지원 | `TouristSupport` | `TouristSupport` | `TouristSupportDto` |
| 신뢰 요약 | `TrustSummary` | `TrustSummary` | `TrustSummaryDto` |
| 체크인 | `LocationCheckIn` | `LocationCheckIn` | `LocationCheckInDto` |
| 상태 투표 | `StatusVote` | `StatusVote` | `StatusVoteDto` |
| 상점 Claim | `PlaceClaim` | `PlaceClaim` | `PlaceClaimDto` |
| Offer/쿠폰 | `Offer`, `Coupon` | 같은 이름 | 이름 뒤에 `Dto` |
| 예약 | `Availability`, `Reservation` | 같은 이름 | 이름 뒤에 `Dto` |
| 전환 이벤트 | `ConversionEvent`, `ConversionEventBatchResult` | 같은 이름 | 이름 뒤에 `Dto` |
| 오류 | `ErrorResponse`, `FieldError` | 같은 이름 | 이름 뒤에 `Dto` |

코드 생성 시 schema 이름을 바꾸거나 별도 앱 전용 필드명을 만들지 않는다. 서버 엔티티는 DTO가 아니며 공개 응답에 직접 직렬화하지 않는다.

프론트에서는 OpenAPI generator가 만든 `components["schemas"]["PlaceSummary"]` 같은 타입을 feature 모델의 원천으로 사용한다. 서버도 schema 이름에 `Dto`만 붙이고 mapper에서 domain entity와 분리한다. 생성 결과는 수정하지 않고 명세를 고친 뒤 다시 생성한다.

## Swagger 원본에서 고정한 결정

- 경로와 핵심 필드는 전달받은 App Place Swagger를 유지했다.
- 장소 목록과 상세를 각각 `PlaceSummary`, `PlaceDetail`로 분리했다. 목록에는 상세 영업시간, 운영 예외, 상점 연락처를 싣지 않는다.
- Swagger에 없던 상태 투표, 관광객 예약 생성/목록/취소, 전환 이벤트 배치 경로는 MVP 흐름을 완성하기 위해 추가했다.
- 모든 페이지는 1부터 시작한다. `page` 기본값은 1, `limit` 기본값은 20, 최대값은 100이다.
- 페이지 응답은 리소스 배열 이름과 `page`, `limit`, `totalCount`, `totalPages`, `hasNext`를 사용한다. Swagger의 `totalElements` 및 0 기반 응답 예제는 사용하지 않는다.
- 빈 결과는 요청 page를 그대로 반환하고 `totalCount: 0`, `totalPages: 0`, `hasNext: false`, 빈 배열을 사용한다. 마지막 page보다 큰 요청도 404 대신 빈 배열을 반환한다.
- 같은 정렬값은 `id ASC`로 tie-break한다. offset pagination 도중 데이터가 바뀌면 중복 또는 누락이 생길 수 있으며, 안정적인 실시간 탐색이 필요해지는 시점에 cursor pagination을 다음 major에서 도입한다.
- 응답에서 nullable 필드는 항상 키를 포함하고 값으로 `null`을 보낸다. 배열은 `null` 대신 `[]`을 보낸다. 요청에서 생략은 `PATCH` 또는 명시적으로 optional인 필드에만 허용한다.
- 정수 ID는 JSON number인 양의 `int64`다. JavaScript 안전 정수 범위를 넘기기 전에 문자열 ID로 전환하는 것은 다음 major 계약에서만 한다.

## 날짜와 시간대

- `date-time`은 RFC 3339 instant다. 서버 응답은 UTC `Z`로 정규화한다. 요청은 offset을 허용하되 저장·응답 시 UTC로 정규화한다.
- `date`는 장소의 IANA 시간대에서 계산한 달력 날짜다. 체크인의 `checkInDate`가 대표 예다.
- 영업시간의 `time`은 장소의 `timeZone`에 적용하는 벽시계 시각이며 offset을 붙이지 않는다.
- 장소는 항상 IANA `timeZone`을 제공한다. DST 경계의 존재하지 않거나 중복되는 로컬 시각은 서버가 해당 시간대 규칙으로 판정한다.

## enum과 nullable

- enum wire value는 대문자 `UPPER_SNAKE_CASE`다.
- 모든 읽기 모델 enum에는 `UNKNOWN`을 둔다. 클라이언트는 알 수 없는 값을 `UNKNOWN` UI로 안전하게 처리한다.
- 상태 전이 enum에 새 값을 넣거나 기존 값을 제거·개명하는 것은 breaking change다.
- `required`이면서 `type`에 `null`이 포함된 필드는 키가 반드시 존재하되 값이 없을 수 있다는 뜻이다. optional과 nullable을 같은 의미로 쓰지 않는다.

## 상태 전이

| 모델 | 허용 전이 | 중복/잘못된 전이 |
| --- | --- | --- |
| `PlaceClaim` | `PENDING → APPROVED \| REJECTED \| CANCELED` | 동일 장소의 활성 Claim은 `PLACE_CLAIM_ALREADY_EXISTS`; terminal 상태 변경은 `INVALID_STATE_TRANSITION` |
| `Offer` | `DRAFT → PUBLISHED → CLOSED`; 게시 중 `SOLD_OUT` 또는 `EXPIRED` 가능 | terminal 상태는 되돌리지 않는다 |
| `Coupon` | `ISSUED → REDEEMED \| EXPIRED \| CANCELED` | 재사용은 `COUPON_ALREADY_REDEEMED`, 만료는 `COUPON_EXPIRED` |
| `Reservation` | `PENDING → CONFIRMED \| CANCELED \| EXPIRED`; `CONFIRMED → COMPLETED \| NO_SHOW \| CANCELED` | terminal 상태 변경은 `INVALID_STATE_TRANSITION` |
| `LocationCheckIn` | 생성 성공 시 `PROXIMITY_MATCHED` | 같은 장소 현지 날짜의 중복은 `CHECK_IN_ALREADY_EXISTS` |
| `ConversionEvent` | `ACCEPTED \| DUPLICATE \| REJECTED` 수집 결과 | 동일 `eventId` 재전송은 오류가 아니라 `DUPLICATE`로 응답 |

만료는 서버 시간이 경계를 지난 최초 읽기 또는 처리 시점에 결정되며 경계는 `now >= expiresAt`이다.

`LiveStatus`의 방문자 투표 신호는 `observedAt`부터 30분간 유효하다. 유효 투표가 없으면 Merchant 공지, 정규 영업시간, `UNKNOWN` 순으로 fallback한다. `TrustSummary`의 점수와 confidence는 서버가 계산하며 앱이 재계산하지 않는다. 증빙이 없으면 `lastVerifiedAt`은 `null`이고 `verificationStatus`는 `UNVERIFIED`다. `TouristSupport`에서 확인되지 않은 값은 `UNAVAILABLE`이 아니라 `UNKNOWN`이다.

## 엔드포인트 권한

| 경로 그룹 | 최소 역할 | 추가 검증 |
| --- | --- | --- |
| `GET /places*` | 인증 사용자 | 없음 |
| `/location-check-ins`, `/places/{placeId}/status-votes` | 활성 `TOURIST` | 본인 체크인, 장소 일치, 체크인 후 24시간 이내 |
| `GET /offers*`, `/coupons`, `/reservations` | 활성 `TOURIST` | 진행 중 여행 일정, 본인 리소스 |
| `/merchant-owner/place-claims*` | 활성 `MERCHANT_OWNER` | 본인 Claim |
| `/merchant-owner/offers/coupons/redeem` | 활성 `MERCHANT_OWNER` | 소유 장소에서 발급된 Coupon |
| `/merchant-owner/reservations*` | 활성 `MERCHANT_OWNER` | 소유 장소의 Reservation |
| `/conversion-events/batch` | 인증 사용자 | 이벤트의 user는 access token에서 결정; body로 받지 않음 |

토큰이 없거나 유효하지 않으면 401, 역할이 없으면 `ROLE_REQUIRED`, 리소스 소유자가 아니면 `RESOURCE_OWNERSHIP_REQUIRED`를 403으로 반환한다. 존재 여부 노출이 권한 상승에 이용될 수 있는 본인 리소스 조회는 정책에 따라 404를 사용할 수 있으며 각 operation의 응답이 최종 기준이다.

## 인증, 권한과 요청 서명

모든 이 명세 경로는 Bearer access token과 아래 네 헤더를 요구한다.

- `X-Timestamp`: Unix epoch seconds
- `X-SignatureBase64`: HMAC-SHA256 결과의 표준 Base64
- `X-App-Version`: SemVer 앱 버전
- `X-Device-Id`: 앱 설치 단위 UUID

공통 고정 비밀키를 앱에 넣지 않는다. 로그인 후 서버가 발급한 디바이스 또는 세션별 키를 Keychain/Keystore에 저장한다. 로그아웃 시 키와 기기 연결을 폐기한다.

canonical string은 정확히 다음 여섯 줄이다.

```text
HTTP_METHOD
PATH_WITH_SORTED_QUERY
X_TIMESTAMP
X_DEVICE_ID
X_APP_VERSION
SHA256_REQUEST_BODY
```

규칙은 다음과 같다.

1. 메서드는 ASCII 대문자다.
2. 경로는 origin을 제외하고 배포 base path(`/api/v1`)를 포함한다. 경로의 trailing slash를 임의로 추가하거나 제거하지 않는다.
3. 쿼리는 RFC 3986 UTF-8 percent encoding을 적용한 키, 값 순으로 bytewise 오름차순 정렬한다. 같은 키의 복수 값을 보존하고 빈 값은 `key=`로 쓴다. 공백은 `%20`이며 `+`를 쓰지 않는다. 쿼리가 없으면 `?`도 쓰지 않는다.
4. JSON은 RFC 8785 JCS로 한 번 직렬화하고 그 바이트를 그대로 전송한다. body digest는 전송 전 UTF-8 바이트의 SHA-256 lowercase hex다. 본문 없는 요청은 빈 바이트의 SHA-256(`e3b0c442…b855`)을 쓴다.
5. 최종 값은 `Base64(HMAC-SHA256(deviceOrSessionKey, canonicalString UTF-8 bytes))`다.
6. 서버 허용 시간창은 `±300초`다. `REQUEST_TIMESTAMP_OUT_OF_RANGE` 응답에는 RFC 7231 `Date` 헤더를 넣어 단말 시각 보정을 돕는다.
7. 서버는 `(signingKeyId, X-SignatureBase64)`를 허용 시간창 동안 보관해 같은 서명 재사용을 `REPLAY_DETECTED`로 거절한다. 정상 재시도는 새 timestamp/signature를 만들고 도메인 중복 키를 유지한다.

예시:

```json
{"checkInId":7001,"couponUsageStatus":"AVAILABLE","crowdLevel":"MODERATE","observedAt":"2026-07-23T05:30:00Z","waitTimeMinutes":15}
```

```text
POST
/api/v1/places/17/status-votes?include=liveStatus&locale=ko-KR
1784784600
6f1a0f58-34b3-4f7a-81e0-9959c76283cb
1.4.0
387156346985e0e676b1cc8046a56ea5d194c7a24d9ed4ea0f924001fdd265b9
```

테스트 전용 키 `test-signing-key`를 사용한 `X-SignatureBase64` 기대값은 `ldIhZD2vxX91FmpJQjIZjqbAyrCl7s68yC48kO0b9SA=`다. 테스트 키는 제품에 포함하지 않는다.
동일 값을 기계 검증하는 fixture는 [signing-fixture.json](./signing-fixture.json)이다.

## 오류와 재시도

모든 오류는 `ErrorResponse`다. 앱은 HTTP status가 아니라 안정적인 `code`로 분기하고 `traceId`는 사용자에게 노출하지 않은 채 지원 로그에만 남긴다.

| HTTP | 대표 code | 클라이언트 처리 |
| --- | --- | --- |
| 400 | `VALIDATION_FAILED` | 필드 오류 표시, 자동 재시도 안 함 |
| 401 | `INVALID_TOKEN`, `TOKEN_EXPIRED` | 토큰 갱신은 한 번만 시도; 실패 시 재로그인 |
| 401 | `SIGNATURE_REQUIRED`, `INVALID_SIGNATURE`, `SIGNING_KEY_EXPIRED` | 키 재발급은 한 번만 시도; 실패 시 재로그인 |
| 403 | `FORBIDDEN`, `ROLE_REQUIRED`, `RESOURCE_OWNERSHIP_REQUIRED` | 권한 안내, 재시도 안 함 |
| 404 | 리소스별 `*_NOT_FOUND` | 최신 목록으로 복귀 |
| 409 | `*_ALREADY_EXISTS`, `INVALID_STATE_TRANSITION`, `REPLAY_DETECTED` | 도메인별 처리; 같은 signed request 재전송 금지 |
| 410 | `COUPON_EXPIRED`, `RESOURCE_EXPIRED` | 만료 상태로 동기화 |
| 422 | `CHECK_IN_OUT_OF_RANGE` | 위치 정확도/거리 안내 |
| 426 | `UNSUPPORTED_APP_VERSION` | 강제 업데이트 화면 표시 |

GET 및 네트워크 단절은 jitter가 있는 제한된 exponential backoff로 재시도할 수 있다. 상태 변경 POST는 명세가 정의한 도메인 중복 키가 있을 때만 재시도한다. `4xx`는 `TOKEN_EXPIRED`와 일시적 시각 오차 보정 외에는 자동 재시도하지 않는다.

## 버전과 breaking change

- 명세 자체는 SemVer를 사용하며 현재 버전은 `1.0.0`이다. 배포 base path의 major는 `/api/v1`이다.
- 필드/경로 추가, optional 요청 필드 추가, 읽기 모델의 `UNKNOWN`으로 안전하게 흡수 가능한 enum 추가는 minor다.
- 설명·예제·오탈자 수정은 patch다.
- 필드 삭제/개명/타입 변경, required 필드 추가, nullability 축소, 의미 변경, 상태 enum 또는 상태 전이 변경, HTTP method/status 변경은 breaking이며 `/api/v2`와 major 버전이 필요하다.
- deprecation은 `Deprecation`, `Sunset`, `Link` 응답 헤더와 명세의 `deprecated: true`로 최소 90일 공지한다.
- PR에서는 `npm run check:api-contract`와 OpenAPI diff를 실행한다. breaking diff가 감지되면 major 경로 변경 없이는 병합하지 않는다.

## 검토 게이트

병합 전에 [REVIEW.md](./REVIEW.md)의 네 담당 영역이 모두 승인되어야 한다. 승인은 PR review 또는 해당 표에 리뷰 링크를 남기는 방식으로 증빙한다.
