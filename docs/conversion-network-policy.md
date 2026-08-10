# 전환 API 네트워크 정책 및 검증

## 적용 범위

전환 이벤트는 `Screen -> Hook -> API -> Server` 흐름을 유지한다. Feature API는 v2 공용
`ApiClient`만 사용하고, 앱 조립 지점인 `App.v2.tsx`가 기존 인증 Axios 전송 계층을
주입한다. 따라서 기존 access token 주입, 동시 401의 single-flight 갱신, 원 요청 1회
재전송, 갱신 실패 로그아웃 정책을 그대로 사용한다. 응답 오류는 모두 `ApiError`로
변환한다. v2에 독립 인증 화면이 생기기 전까지 `App.v2.tsx`는 로그아웃 상태에서 기존
인증 플로우를 렌더링하고, 로그인 성공 시 v2 화면으로 복귀한다.

`POST /conversion-events/batch`는 요청의 각 `eventId`가 사용자 범위의 영구 멱등 키이고
서버가 재수신을 `DUPLICATE`로 처리한다는 OpenAPI 계약에 근거해 다음 경우만 자동
재시도한다.

- 네트워크 오류 또는 HTTP 5xx
- 최대 2회 재시도(최초 요청을 포함해 최대 3회 전송)
- 500ms 기준 exponential backoff, 0.75~1.25 jitter, 지연 상한 5초
- 동일한 요청 body와 `eventId`를 유지

401은 공용 인증 전송 계층의 토큰 갱신/원 요청 1회 재전송만 사용하며 React Query에서
다시 재시도하지 않는다. 취소, 4xx, 계약 오류도 자동 재시도하지 않는다. Hook은 Alert나
`onError`를 소유하지 않으므로 화면의 `ApiErrorState` 한 곳에서만 오류를 안내할 수 있다.

## PR 검증 방법

```sh
npm run typecheck
npm run test:v2-api
npm run check:v2
npm run check:a11y-i18n
```

수동 검증은 개발 서버 또는 mock transport에서 수행한다.

1. 첫 전환 요청을 401로 응답하고 refresh를 성공시킨다. refresh 호출 1회와 원 요청
   재전송 1회, 동일 `eventId`를 확인한다.
2. 동시 전환 요청 여러 개를 401로 응답한다. refresh 호출이 한 번뿐인지 확인한다.
3. refresh를 실패시킨다. 저장 토큰 제거, 로그아웃 화면 전환, 인증 오류 안내가 한 번만
   나타나는지 확인한다.
4. 네트워크 오류와 503을 연속 응답한다. 최대 3회 전송 후 멈추고 동일 body가 유지되는지
   확인한다.
5. 400, 401(갱신 후), 409, 413을 응답한다. React Query 추가 재시도가 없는지 확인한다.
6. VoiceOver/TalkBack으로 기존 `ApiErrorState`의 제목·설명·재시도 버튼을 읽을 수 있는지,
   영어와 한국어 문구가 모두 표시되는지 확인한다.

## 서버 계약 확인 필요

OpenAPI에는 서명 헤더 형식과 서명 키 만료 오류가 있지만 로그인 후 서명 키 발급 및
재발급 operation은 없다. 키를 앱에 내장하거나 임의 endpoint를 가정하지 않는다. 서버와
다음 계약을 추가 합의하기 전까지 본 작업은 Bearer token 갱신까지만 적용한다.

- 로그인 응답 또는 별도 endpoint의 `signingKeyId`, signing key, 만료 시각 형식
- `SIGNATURE_REQUIRED`, `INVALID_SIGNATURE`, `SIGNING_KEY_EXPIRED` 발생 시 키 재발급
  endpoint와 요청/응답
- 키 재발급 실패 시 세션 폐기 규칙
- 재서명 시 서버 `Date`를 이용한 시각 보정 규칙
