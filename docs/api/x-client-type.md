# `X-Client-Type` 요청 헤더 (#410)

앱이 핑덤 서버로 보내는 요청을 프록시가 웹 요청과 구분할 수 있도록 `X-Client-Type` 헤더를 붙인다.
이 문서는 앱 측 구현 범위와, 프록시·서버 담당자와 **아직 합의가 필요한** 사항을 정리한다.
아래 "확인 필요" 항목은 요청 사항이며 합의된 내용이 아니다.

## 앱 측 정의 (구현 완료)

| 항목 | 값 |
| --- | --- |
| 헤더 이름 | `X-Client-Type` |
| 앱 값 | `App` (대소문자 포함 정확히 이 값) |
| 정의 위치 | `src/v2/shared/api/clientType.ts` (`CLIENT_TYPE_HEADER`, `CLIENT_TYPE_APP`) — 유일한 정의 |
| 용도 | 클라이언트 종류 식별. **인증 수단이 아니다.** |

- JWT(`Authorization: Bearer …`) 정책, 공개 인증 경로의 Authorization 제거, 토큰 갱신 정책은 변경하지 않았다.
- 헤더는 위조가 쉬우므로 서버·프록시는 이 값만으로 사용자나 신뢰 기기를 판단하면 안 된다.
- 호출자가 요청별 헤더로 다른 값을 넘겨도 전송 직전에 `App`으로 고정된다.

## 헤더가 붙는 요청 경로

| 경로 | 구현 위치 | 적용 방식 |
| --- | --- | --- |
| V2 공용 API GET/POST/PUT/PATCH/DELETE | `src/v2/shared/api/apiClient.ts` | 요청별 헤더 병합 시 `withClientTypeHeader`로 마지막에 고정 |
| V2 PUT fetch fallback (Android `ERR_NETWORK`) | `src/v2/shared/api/apiClient.ts` `putWithFetchFallback` | 위와 같은 병합 헤더를 fetch에 전달 |
| 공용 axios `api` (운영에서 V2 transport로 주입, 인증 전 요청 포함) | `src/shared/api/apiClient.ts` | 기본 헤더 + 요청 인터셉터에서 매 요청 재설정 |
| 토큰 갱신 `POST /auth/token/refresh` | `src/shared/api/apiClient.ts` `refreshClient` | 공유 기본 헤더 |
| 401 후 원요청 재시도 | `src/shared/api/apiClient.ts` 응답 인터셉터 → `api(originalRequest)` | 요청 인터셉터를 다시 통과 |

`EXPO_PUBLIC_API_MODE=mock`에서는 네트워크 요청 자체가 없으므로 영향이 없다.

## 헤더가 붙지 않는 요청 (외부 서비스)

| 요청 | 위치 | 근거 |
| --- | --- | --- |
| 환율 `https://api.frankfurter.dev` | `src/v2/modules/place/menus/api/menuExchangeRateApi.ts` | 공용 클라이언트를 쓰지 않는 독립 `fetch`, 헤더 없음 |
| 카카오 로컬 `https://dapi.kakao.com` | `src/v2/modules/place/search/api/kakaoLocalApi.ts` | 독립 `fetch`, `KakaoAK` 헤더만 전송 |
| 지도 SDK, 카카오맵 링크, Firebase | 네이티브 SDK / `Linking.openURL` | JS 요청 계층을 거치지 않음 |
| 서버가 내려준 이미지·미디어 URL | RN `Image` 등 네이티브 로더 | API 요청 계층을 거치지 않음. 현재 이미지 URL은 API base URL로 조합하지 않음 |

공용 클라이언트는 외부 URL로 새지 않는다. V2 클라이언트는 상대 경로가 아니면 transport 호출 전에 거부하고,
공용 axios `api`는 `API_BASE_URL`과 다른 origin의 절대 URL을 요청 인터셉터에서 차단한다.

## 확인 필요 (프록시·서버 담당자)

1. **적용 경로**: 프록시가 헤더를 읽을 경로 범위(전체 `/api/v1/**`인지, 인증·갱신 경로 포함인지).
2. **허용 값**: 앱은 `App`만 보낸다. 웹 값(예: `Web`)과 대소문자 처리 규칙을 프록시 측에서 확정해야 한다.
3. **누락 시 처리**: 헤더 없는 요청을 어떻게 분류할지(기본값 처리, 로깅만, 거부).
4. **필수화 시점과 호환 기간**: 이 변경 이전에 설치된 앱은 헤더를 보내지 않는다. 기존 앱이 즉시 차단되지 않도록
   서버 측 호환 기간과 필수화 시점을 정해야 한다. 앱 PR만으로 필수화하지 않는다.
5. **배포 순서**: 프록시 반영 시점과 앱 스토어 배포 시점의 순서.
6. **브라우저로 여는 서버 URL**: Google OAuth 인가 URL은 시스템 브라우저로 열리므로 커스텀 헤더를 붙일 수 없다.
   해당 경로를 헤더 검사 대상에서 제외해야 하는지 확인이 필요하다. 이미지·미디어가 프록시 뒤 핑덤 호스트에서
   제공된다면 네이티브 로더 요청도 헤더가 없으므로 같은 확인이 필요하다.
7. **CORS**: 웹 클라이언트가 같은 헤더를 보내게 된다면 `Access-Control-Allow-Headers`에 `X-Client-Type` 허용이 필요하다
   (앱은 CORS 대상이 아님).
8. **API 계약 문서 반영**: 공개 API/프록시 계약 문서에 용도, 허용 값, 필수화 시점, 누락 시 처리 방식을 반영 요청.


## 디바이스 시각 헤더

프록시 담당자 요청에 따라 앱 API에는 `X-Timestamp`도 전송한다.
값은 디바이스의 `Math.floor(Date.now() / 1000)`으로 만든 Unix 시간(UTC 기준 정수 초)의 문자열이다.
V2 API, PUT fetch 대체 요청, 공용 axios, 토큰 갱신과 401 재시도마다 새로 생성한다.
호출자가 넣은 과거 timestamp는 덮어쓰며 외부 SDK·환율·카카오 요청에는 추가하지 않는다.
추가 서명 헤더 정책 및 디바이스 시각 오차 허용 범위는 서버 계약 확인이 필요하다.

앱 버전은 `src/v2/shared/config/appMetadata.json`에서 정의하며 Expo 빌드 설정과 API 헤더가 같은 값을 사용한다.
`X-App-Version`은 현재 `1.0.0`이며 공통 API·인증·갱신·재시도·PUT fallback에 적용된다.

## 설치 ID와 남은 서명 계약

`X-Device-Id`는 앱 설치 저장소의 UUID v4를 사용한다. 동시 요청은 같은 ID를 사용하고 앱 재실행 후에도 유지된다.
운영 composition에서 ID 공급자를 주입하며 GET/POST/PUT/PATCH/DELETE, 인증 및 토큰 갱신·재시도에 적용한다.
2026-10-04 서버 develop 로그인 DTO와 배포 명세에서는 디바이스/세션 서명 키 발급 API 또는 응답 필드를 찾지 못했다.
로컬 MVP 문서는 HMAC-SHA256 서명과 서버 발급 키를 요구하지만 실제 프록시와의 일치 여부는 확인되지 않았다.
서명 키 발급/등록·회전/폐기 계약이 확보되기 전에는 제품 키나 가짜 서명을 앱에 넣지 않는다.

## 2026-10-04 실제 연결 확인

- timestamp·앱 버전·설치 UUID를 포함한 토큰 없는 `GET /places/map` 요청은 필수 헤더 400 대신 인증 401을 반환했다. 서명 검사가 없다는 증거는 아니다.
- 로그인된 Android 앱의 `POST /routes`는 404를 반환했다. 공개 배포 명세에는 POST /routes가 있지만, `/routes`와 `/routes/`의 확인 요청은 모두 HTML 404를 반환했다.
- 앱 연결 코드와 별개로 프록시 라우팅·실제 API 배포 확인이 필요하다. 실제 경로 성공 응답은 아직 검증하지 못했다.
- 자동 검증: `npm run check:v2`, `npm run typecheck`, 관련 Jest 115개 및 API/설치 ID node 테스트 21개 통과.
- V1 dependency delta: `none` (공용 transport·운영 composition 경계 수정, V1 feature 수정 없음).
