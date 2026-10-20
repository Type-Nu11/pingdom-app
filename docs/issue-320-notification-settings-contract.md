# #320 알림 설정 서버 계약·production 연결

## 시작과 범위

- 작업 경로: `/Users/oneriver/Developer/PingDom_app-320`
- 브랜치: `feat/320-notification-settings-contract`
- 시작 HEAD: `9df80c3f8d8bd29b9a238dcfc9016a78a4ca6bb4`
- 시작 working tree: clean. `git fetch origin` 후 `HEAD...origin/dev`: ahead 0 / behind 0.
- #319는 PR #363으로 2026-09-16T05:58:50Z에 dev에 병합되었으며 시작 HEAD가 그 merge commit이다.
- 저장소 AGENTS.md 전체, #320/#229/#305, #319 병합 결과, V2 notifications/settings/navigation, application composition, 기존 snapshot/generated 타입과 생성·검사 스크립트를 확인했다.
- 구현 위치: V2. snapshot/생성기/검증 문서는 계약 동기화 부속 변경이다. V1 및 production route 선언은 변경하지 않았다.
- #321, #356–#362, #247, FCM lifecycle 재작성은 제외했다. 구현·검증 완료 후 사용자 요청에 따라 기능별 분할 커밋으로 정리했다. 푸시는 수행하지 않았다.

## 실서버 확인

| 요청 | 확인 시각 (UTC) | 결과 |
|---|---|---|
| `GET https://www.typenull.xyz/v3/api-docs` | 2026-09-16T06:04:53Z | HTTP 200 |
| `GET https://www.typenull.xyz/notifications/settings` (인증 없음) | 2026-09-16T06:05:53Z | HTTP 401, `INVALID_TOKEN` |

다운로드한 원문 SHA-256: `9129edde1977b1e5c75176fbdd3bc1aa2e9069eb9d2f00707d9aae03f8e3da3a`.
원문 임시 경로: `/private/tmp/issue-320-live-openapi.json`. 공개 원문에는 서버 URL이 `http://www.typenull.xyz`로 기재되어 있다. snapshot은 이를 그대로 보존하되 조회·재생성 기본 주소는 위 HTTPS URL이다. 앱 transport/base URL을 변경하지 않았다.

인증된 사용자 GET/PATCH는 실행하지 않았다. 유효한 테스트 계정 세션이 제공되지 않았으므로 사용자 설정을 실제 변경하거나 null 사용자 응답을 실측했다고 주장하지 않는다.

| 계약 | GET | PATCH |
|---|---|---|
| 경로 | `/notifications/settings` | `/notifications/settings` |
| security | `bearerAuth: []` (HTTP bearer JWT) | 동일 |
| request | 없음 | body required, `application/json`, `NotificationSettingUpdateRequest` |
| 200 | `*/*`, `NotificationSettingResponse` | 동일 |
| 400 | 문서에 없음 | timezone/quiet hours 오류, example code `INVALID_QUIET_HOURS`; 오류 schema 없음 |
| 401 | `application/json`, `ErrorResponse`, `INVALID_TOKEN` / `EXPIRED_TOKEN` | 동일 |
| 403 | `application/json`, `ErrorResponse`, `ACCESS_DENIED` 또는 도메인 권한 오류 | 동일 |

`ErrorResponse.message`는 required string, `code`는 optional nullable string이다. 고정 오류 code가 모든 실패에서 보장된다고 가정하지 않는다.

| request/response 공통 필드 | 타입 | required | nullable | 서버 설명 |
|---|---|---|---|---|
| `newHotplaceEnabled` | boolean | 아니오 | 미명시 | 핫플레이스 알림 수신 여부 |
| `newLikeEnabled` | boolean | 아니오 | 미명시 | 좋아요 알림 수신 여부 |
| `quietHoursEnabled` | boolean | 아니오 | 미명시 | quiet hours 적용 여부 |
| `quietHoursStart` | string, format time | 아니오 | 미명시 | quiet hours 시작 시각 |
| `quietHoursEnd` | string, format time | 아니오 | 미명시 | quiet hours 종료 시각 |
| `timezone` | string | 아니오 | 미명시 | IANA timezone |

### 재현 가능한 서버 계약 불일치

GET 200 example에는 `quietHoursStart: null`, `quietHoursEnd: null`이 있으나 참조 schema에는 nullable 선언이 없다. 최신 focused snapshot에서 다음 명령으로 재현할 수 있다.

```sh
node -e 'const d=require("./docs/api/server-notifications.openapi.json"); console.log(d.paths["/notifications/settings"].get.responses[200].content["*/*"].example); console.log(d.components.schemas.NotificationSettingResponse.properties.quietHoursStart)'
```

이는 **공개 OpenAPI 내부 불일치 재현**이다. 인증된 실제 응답의 null 재현은 미검증이다. 수기 DTO에 null을 추가하지 않았다. generated 타입은 optional string을 유지하며 presentation에서 런타임 null/누락/잘못된 타입을 검사한다.

### snapshot/type 동기화

기존 생성기의 오래된 IP 기본 URL을 HTTPS 공개 주소로 바꾸고 operation tag, security/securitySchemes, 전이 schema 참조를 보존했다. `--check`는 파일을 변경하지 않고 upstream projection과 canonical snapshot이 일치하는지 검사한다.

```sh
npm run generate:notification-api -- /private/tmp/issue-320-live-openapi.json
node scripts/generate-notification-api-contract.mjs /private/tmp/issue-320-live-openapi.json --check
npm run check:notification-api-types
# 다음 작업 시점의 서버와 직접 비교:
node scripts/generate-notification-api-contract.mjs --check
```

최신 공개 OpenAPI에는 `/firebase/fcm-tokens` POST/DELETE만 있고 기존 `/firebase/fcm-token` PATCH는 없다. 따라서 canonical snapshot/generated에서 사라졌으며 구버전 operation을 임의 복원하지 않았다. 기존 compatibility API 메서드와 FCM 토큰 등록/삭제 호출은 그대로 유지한다. 실제 endpoint 폐기 여부는 별도 서버 확인 사항이다. generated 파일은 기존 생성기로만 재생성했다.

## 디자인 ↔ 서버 ↔ OS 매핑

아래의 조회/수정은 해당 **디자인 의미를 가진 상태**가 공개되어 있는지 기준이다. 이름이 비슷한 항목끼리 매핑하지 않는다.

| 디자인/서버 항목 | 서버 필드 | OS 권한 관계 | 조회 | 수정 | production 노출 정책 / 미지원 이유 |
|---|---|---|---|---|---|
| 푸시 알림 전체 허용 | 없음 | OS 권한·category preference와 별개 | 불가 | 불가 | 비활성, 전체 허용 제품 정책 없음 |
| First Recorder 장소 급상승 | 확정 불가 | 수신에는 권한 필요 | 불가 | 불가 | 비활성, 최초 기록자 조건 계약 없음 |
| 기록에 새 태그 추가 | 없음 | 수신에는 권한 필요 | 불가 | 불가 | 비활성, 전용 서버 필드 없음 |
| 관심 장소 분위기 변경 | 없음 | 수신에는 권한 필요 | 불가 | 불가 | 비활성, 좋아요와 다른 의미 |
| 자주 방문한 지역의 핫플레이스 | 확정 불가 | 수신에는 권한 필요 | 불가 | 불가 | 비활성, 생활권/지역 조건 계약 없음 |
| 오늘의 미션 구역 | 없음 | 수신에는 권한 필요 | 불가 | 불가 | 비활성, 전용 서버 필드 없음 |
| 주간 리포트 | 없음 | 수신에는 권한 필요 | 불가 | 불가 | 비활성, 전용 서버 필드 없음 |
| 야간 알림 받기 | 확정 불가 | 권한 허용과 수신 시간 정책은 별개 | 불가 | 불가 | 비활성, 야간 수신 허용을 quiet hours의 반전으로 해석하지 않음 |
| 마케팅·이벤트 | 없음 | OS 권한은 마케팅 동의를 대체하지 않음 | 불가 | 불가 | 비활성, category/동의 계약 없음 |
| 서버 핫플레이스 알림 | `newHotplaceEnabled` | 켜는 동작에서 확인·필요 시 요청 | 가능 | boolean 제공 시 가능 | 서버 설명 그대로 별도 항목 제공 |
| 서버 좋아요 알림 | `newLikeEnabled` | 켜는 동작에서 확인·필요 시 요청 | 가능 | boolean 제공 시 가능 | 서버 설명 그대로 별도 항목 제공 |
| 서버 방해 금지 시간 | `quietHoursEnabled`, `quietHoursStart`, `quietHoursEnd`, `timezone` | OS 권한과 독립적인 시간 제한 | 가능 | 이번 구현은 읽기 전용 | 활성화 필수 조건·구간 검증 정책 미확정 |

미지원 항목은 checked를 만들어 넣지 않으며 disabled/hint로 이유를 전달한다. 모든 지원 상태·오류·권한 안내는 ko/en을 제공한다.

## production 책임과 정책

production 경로는 그대로 `설정 → NotificationSettings → SettingsScreen initialPage="notifications"`이다. `SettingsScreen`이 notification page에서 단일 `NotificationSettingsScreen`을 구성한다. 기존 별도 화면의 디자인 기본값, local preference state, 외부 initialValues/presentationStates 모의 입력을 제거했고 실제 Query와 mutation으로 대체했다. 내부 중복 토글 구현도 제거했다.

참조 증거: `SettingsScreen.tsx`의 import와 notification page 분기, `NotificationProduction.test.tsx`의 실제 production route 및 MainNavigator stack 테스트. 예전 디자인 local-state 테스트 파일은 그 동작을 제거함에 따라 `NotificationSettingsContract.test.tsx`의 서버 계약 테스트로 대체했다. Git diff로 이전 테스트를 복원할 수 있다.

- 전체 허용: 독립 server field 및 확정 제품 정책이 없어 미지원. 두 category를 묶어 PATCH하지 않는다. 설정 루트의 모호한 통합 On/Off 요약도 제거했다.
- 지원 category: 서버 GET boolean을 사용한다. optional 값이 누락되거나 잘못된 타입이면 unknown/disabled로 표시한다. OS 허용과 서버 true를 서로 대체하지 않는다.
- quiet hours: 현재 계약은 시간/시간대의 타입만 제시하고 활성화 필수 조건, 시작=끝, 날짜 경계 등 검증 정책을 정의하지 않는다. 따라서 완전한 서버 값도 **읽기 전용**으로 표시하며, 저장 기능은 제공하지 않는다. 누락/null/유효하지 않은 시각·timezone에는 명시적인 fallback을 표시한다. 원본 HH:mm:ss를 locale 시간으로 표시하고 wire 값을 변형하거나 저장하지 않는다. 임의 기본 시간이나 기기 timezone을 확정하지 않는다. 디자인에 없는 시간 편집 UI 없음.
- navigation: Settings의 기존 goBack/Android local-back 책임과 production stack pop을 유지했다.

## 권한 adapter

기존 `ensureNotificationPermission()`과 FCM lifecycle 호출은 변경하지 않았다. boolean 요청 결과만으로는 화면의 조회/거부/오류 상태를 구분할 수 없어 같은 V2 native 서비스 경계에 주입 가능한 `NotificationPermissionAdapter`를 추가했다.

- 화면 진입: `read()`만 호출. foreground 복귀 시 재조회. 오래된 조회 결과와 unmount 후 응답은 화면 상태에 반영하지 않는다.
- category ON 동작: 최신 권한 조회 → 이미 authorized/provisional이면 요청 생략 → notDetermined/Android denied이면 요청 → 허용된 경우에만 PATCH. 거부/blocked/unavailable/error이면 PATCH와 성공 표시 없음.
- category OFF: 서버 preference만 끈다. OS 권한을 끈 것으로 표시하지 않는다.
- Android 13+: `POST_NOTIFICATIONS` check/request. `never_ask_again`은 blocked이며 동일 런타임에서는 반복 요청하지 않는다. 앱 재시작 후 영구 거부 여부는 check API만으로 확정할 수 없어 denied로 표시하고 기기 설정 링크를 제공한다.
- Android 12 이하: runtime 권한 팝업 없음. 기존 Firebase native `hasPermission`이 사용하는 `NotificationManagerCompat.areNotificationsEnabled()`로 시스템 설정에서의 차단도 조회한다.
- iOS: authorized/provisional/denied/notDetermined 구분. 이미 허용된 상태와 denied에서는 재요청하지 않는다. denied는 시스템 설정 안내.
- native Firebase runtime 없음: unavailable. 테스트의 adapter를 실제 native 검증으로 간주하지 않는다.
- native 조회/요청 예외: error로 분리. 기기 설정 이동 실패도 error 안내.
- 새 테스트는 adapter dependency injection을 사용하며 native 모듈 전역 monkey patch를 추가하지 않았다. raw token/JWT/알림 payload 로그 없음.

## Query / 저장 일관성

`Screen → useNotificationSettings / useUpdateNotificationSettings → notificationApi → 공통 transport` 경계를 유지한다. query key는 `['v2', 'notifications', 'settings', 'me']`, GET AbortSignal과 PATCH partial body도 유지한다.

화면의 필드별 동기 ref lock으로 render 이전 중복 탭도 차단한다. 다른 필드는 누를 수 있으나 동일 QueryClient의 요청은 순차 실행한다. **cancel GET → 이전 cache 보관 → 해당 partial optimistic update → PATCH → 서버 응답 전체 cache 적용 또는 정확한 snapshot rollback → invalidate/refetch** 전체 구간을 한 transaction으로 직렬화한다. React Query mutation scope만 쓰면 onMutate가 먼저 실행될 수 있어 이 전체 구간에 별도 queue를 둔다.

따라서 두 번째 mutation의 서버 응답이 첫 번째보다 앞서 cache를 덮어쓸 수 없고, 첫 번째 rollback이 뒤의 성공을 덮어쓰지 않는다. 화면에는 필드별 pending/error, 접근성 busy/disabled/checked/hint 및 오류 live region을 제공한다. 공통 `ApiError`의 status/code로 400 `INVALID_QUIET_HOURS`, 401, 403을 구분한다. logout 등으로 해당 query가 제거/교체되면 오래된 응답으로 cache를 재생성하지 않고 대기 중인 요청도 실행하지 않는다.

## 변경 파일

- `src/v2/features/notifications/screens/NotificationSettingsScreen.tsx`: 단일 서버 연동 화면.
- `src/v2/features/settings/screens/SettingsScreen.tsx`: notification page를 위 화면으로 구성, 중복 구현 제거.
- `src/v2/features/notifications/components/NotificationSettingToggle.tsx`: unknown/disabled, hint, live region.
- `src/v2/features/notifications/hooks/useNotificationSettings.ts`: transaction queue, rollback/refetch, session cache guard.
- `src/v2/features/notifications/services/notificationPermission.ts`: 주입 가능한 권한 adapter.
- `src/v2/features/notifications/services/firebaseMessaging.ts`: 기존 native runtime에 hasPermission 타입 추가.
- `src/v2/features/notifications/model/settingsPresentation.ts`: 오류 분류·quiet hours 런타임 표시 검증.
- `src/v2/features/notifications/index.ts`: 폐기한 디자인 모의 입력 타입 export 제거.
- `src/v2/shared/i18n/resources.ts`: ko/en 안내.
- `docs/api/server-notifications.openapi.json`, `src/v2/shared/api/generated/notifications.ts`, `scripts/generate-notification-api-contract.mjs`: 최신 계약 생성·검사.
- 테스트: notification Hook/permission/screen, V2 `NotificationProduction.test.tsx`, 기존 SettingsScreen 테스트, 공통 API `notificationSettingsApi.test.mjs`.
- 이 문서.

## 검증 결과

| 검증 | 최종 결과 |
|---|---|
| `npm run check:v2` | 통과 |
| `npm run typecheck` | 통과 |
| upstream projection `--check` | 다운로드한 HTTP 200 원문과 snapshot 일치 |
| `npm run check:notification-api-types` | snapshot과 generated 타입 일치 |
| 알림 API/Hook/권한/화면 및 Settings/production navigation Jest | 통과, 전체 Jest에도 포함 |
| `npm run test:v2-notifications` | 7/7 통과 |
| `npm run test:v2-api` | 145/145 통과 |
| `npm run test:navigation` | 22/22 통과 |
| `npm run test:regression` | 232/232 통과 (위 3종 + i18n 11, map 47) |
| `npm run validate:pr` | 종료 코드 0, Jest 116 suites / 1,030 tests + ownership 2 + 회귀 검사 통과 |
| `npm run check:v1-changes -- --base origin/dev` | V1 additions/modifications 없음 |
| `git diff --check` | 통과 |

전체 PR 검사에서 내부적으로 위 회귀 npm scripts를 실제 실행했다. 최종 로그: `/private/tmp/issue-320-validate-complete.log`.
첫 회귀 실행은 sandbox의 tsx IPC socket 제한(EPERM)으로 중단되어 권한 있는 실행으로 재검증했다. 새 API 오류 테스트의 direct import/공통 entry point 간 클래스 동일성 문제도 공통 entry point import로 수정 후 통과했다. 변경 범위 밖의 MapBottomSheet/MyPage/CouponBox 등 일부 suite에서 React `act()` 경고가 출력되지만 최종 실패 테스트는 없다.

TDD 근거: 기존 production의 전체 허용 활성 상태, concurrent mutation 실행 및 logout 후 cache 재생성, 디자인 local-state 화면의 서버 항목/권한/상태 부재를 먼저 실패 테스트로 재현했다. 구현 뒤 해당 테스트 및 일반 GET 오류 문구의 추가 회귀 테스트를 통과시켰다. 새 테스트는 지연 Promise로 순서 역전·실패·중복 탭·화면 이탈·logout 대기를 검증한다.

수동 검증: `adb devices -l` 연결 기기 0, `xcrun simctl list devices booted` 부팅 기기 0. 실제 Android/iOS 권한 팝업, 영구 거부 후 시스템 설정 복귀, 실 push 수신, 작은 화면의 시각적 잘림과 스크린리더 발화는 미검증이다. ko/en·다크모드·접근성 props·navigation/Android back은 자동 테스트로 검증했다.

## 남은 server/product blocker

1. GET example의 null과 non-nullable schema를 일치시키고 인증된 실제 응답을 확인해야 한다.
2. 디자인 전체 허용과 세부 category의 제품 의미·서버 필드/동의 정책을 확정해야 한다.
3. quiet hours 활성화 필수 값, 구간 validation(동일 시각/자정 경계), nullable 의미, 편집 UX 정책을 확인해야 한다. 현 상태에서는 읽기 전용 유지.
4. 공개 OpenAPI에서 사라진 compatibility `/firebase/fcm-token` endpoint의 실제 폐기 여부를 별도 확인해야 한다. 이번 변경은 endpoint 마이그레이션을 수행하지 않는다.
5. 테스트 계정과 native Android/iOS 기기로 인증 GET/PATCH 재진입 저장 및 실제 권한/수신 QA가 필요하다.

V1 dependency delta: **none**. `legacy-exception` label: **불필요**.
