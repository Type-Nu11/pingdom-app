# #390 예외 안내 및 복구 동작 조사·검증

## 기준과 구현 경계

- 브랜치 `feat/390-error-ux-i18n`. 시작 시 clean, `git fetch origin` 후 HEAD와 `origin/dev`는 `d3d3e48`로 동일(좌/우 차이 0/0).
- #390 본문 전체와 댓글(없음), 루트 AGENTS.md 확인. 구현은 `src/v2/**`.
- shared migration boundary: `src/shared/api/apiClient.ts`는 `src/application/runtime/configureProductionRuntime.ts`가 V2에 주입하는 기존 transport. 확인된 서명 오류 및 HTML 프록시 401에만 refresh/logout 제외 가드 추가. 정상 토큰 만료의 refresh 1회/동시성 정책은 그대로 유지.
- V1 dependency delta: **none**. `src/features/**` 수정 없음. 신규 언어, 서버 #1728, HMAC, 지도 SDK 및 transport 재설계 없음.
- production 경로는 `src/application/navigation/MainNavigator.tsx`와 실제 module 소비 경로 기준. 미사용 `MapSelectedPlaceCard`와 예제 `PlaceListExampleScreen`을 production 구현으로 오인하지 않음.

## 화면 조사표

| 실제 경로 / 화면 | 기존 상태와 판단 | 이번 처리 / ko·en 키 | 복구 동작 | 테스트 |
|---|---|---|---|---|
| 프로필 `MyPageScreen` | 실패 시 프로필 정보 없음 + 별도 실패 문구가 동시에 표시됨 | 초기 실패를 `ApiErrorState`로 분리. 기존 프로필이 있으면 유지. `common.apiError.*`; 성공 빈 프로필에만 `myPage.profileUnavailable` | 조회 재시도, in-flight 중 잠금 | `MyPageScreen.test.tsx` 초기 실패/정상 프로필/통계/재시도 |
| `ProfileEditScreen` | 조회 실패 시 비활성 저장 버튼만 보임. 수정 실패의 서버 message/field reason을 그대로 사용 | 조회 오류·로딩 표시. 비밀번호의 확인된 코드만 도메인 문구, 나머지는 안전한 `myPage.profileEdit.*` | 프로필 조회, 기존 저장·사진 변경 잠금 유지 | `ProfileEditScreen.test.tsx` 중복 제출·부분 성공·오류 코드·안전 fallback |
| 설정 `AccountInformation` | 실패와 빈 응답은 구분하지만 갱신 실패가 기존 계정 정보를 가림 | 기존 정보 + 공통 오류 표시 | 중복 취소 없는 재조회 | `AccountSupport.test.tsx`, 공통 CTA 테스트 |
| 지도 검색 결과 `MapBottomSheet` | 원본 places query 오류가 전달되지 않아 빈 결과처럼 보일 수 있음 | loading/error/busy 전달. 오류 배너와 기존 결과 함께 유지, 성공 빈 결과만 빈 카드 | 원래 places query 재조회 | `MapBottomSheet.test.tsx` 검색 실패·기존 결과·실제 CTA |
| 지도 장소 프리뷰 | detail 오류는 화면 높이 계산에만 사용. deep link 실패 시 홈으로 fall-through 가능 | detail 오류·조회 핸들러를 sheet에 전달. 성공한 preview는 유지. 데이터 없으면 로딩/실패 | 상세 재조회, 404 뒤로가기 | `MapBottomSheet.test.tsx` deep link 실패 |
| 즐겨찾기 `FavoritePlacesBottomSheet` | 초기 오류/인증/빈 결과는 이미 구분. 기존 목록이 있으면 갱신 오류는 숨겨짐 | 공통 오류 배너, cached 목록 유지, busy 전달. 북마크 요청 AbortSignal 전달 | 조회 재시도, 기존 pagination 동작 유지 | `FavoritePlacesBottomSheet.test.tsx`, `useBookmarkedPlaces.test.tsx` |
| 지도 북마크 mutation | `getBookmarkErrorMessage`가 서버 원문 반환 | 기존 함수는 번역 키 반환. 네트워크·timeout·5xx는 `common.apiError.mutationUnknown.description` | 자동 재전송 추가 없음. 기존 place별 잠금 유지 | `usePlaceBookmark.test.ts`, 공통 분류기 |
| `PlaceDetailScreen` / 메뉴 `PlaceMenuSection` | 초기 실패는 정상 분리. 갱신 실패는 기존 상세/메뉴를 가림 | 기존 상세/메뉴 + 오류 배너. 새 timeout/server/429 분류 반영 | 조회만 재시도. 메뉴 404는 기존 메뉴 계약의 불일치 복구 동작 유지 | `PlaceMenuSection.test.tsx`, place detail 모델 테스트 |
| 지도 예약 시트 `ReservationBottomSheet` | 주변 availability 오류를 빈 결과로 표시하고 장소 연결 실패 시 실제 예약을 누락 | 주변 후보·availability 오류와 busy 전달. 미연결 예약도 기존 `ReservationRecordCard`로 보존. refresh 실패 배너 | 주변 조회 재시도, 장소 연결 유무와 관계없이 실제 예약 상세 이동 | `ReservationBottomSheet.test.tsx` 기존 실패 재현·복구·미연결 예약 보존 |
| 예약함 / 예약 상세 | 초기 실패는 별도. 갱신 실패가 기존 목록·상세를 가림 | 기존 예약·결제 데이터 유지, 공통 오류 배너 | 원래 query 재시도, 404 뒤로가기 | `ReservationBoxScreen.test.tsx`, `ReservationScreens.test.tsx` |
| 예약 생성 일정 조회 | 실패/빈 결과 구분은 기존 지원. generic 안내·중복 refetch 가능 | 공통 분류·busy·cancelRefetch:false, 갱신 실패 시 기존 슬롯 유지 | 일정 재조회, 확인된 인원 부족/슬롯 만료 시 기존 availability 갱신 및 다른 슬롯 선택 | `ReservationScreens.test.tsx`, `useReservations.test.tsx` |
| 예약 생성 mutation | 네트워크 실패가 단순 재전송 안내. 모든 400을 입력 오류로 분류 | 확인된 validation 코드만 입력 오류. 응답 유실·5xx/unknown은 `reservation.create.submitNetworkError`. 일반 conflict는 공통 상태 충돌, 확인된 capacity만 마감/인원 안내 | 실제 `ReservationBox` navigation 제공. 기존 동일-intent idempotency key와 제출 잠금 보존, 자동 재전송 없음 | `ReservationScreens.test.tsx` 중복 탭·응답 유실 동일 key·새 intent key |
| 장소 쿠폰 발급 `PlaceCouponCta` | 네트워크/5xx에 발급 POST 재시도 CTA | 결과 미확정 제목/설명, 쿠폰함 확인. 서명 오류를 인증 만료로 재분류하지 않음 | 가능한 경우 쿠폰함 이동; 재발급 CTA 제거. 발급 hook의 중복 방지 유지 | `PlaceCouponCta.test.tsx`, `useIssueCoupon.test.tsx`, `offerCouponErrorUx.test.ts` |
| 쿠폰함 `CouponBoxScreen` | 초기 실패/빈 결과/추가 페이지 실패 구분, 기존 쿠폰 유지 지원 | refresh 실패 배너 추가, 공통 분류 보완 및 busy | 원래 조회 재시도·기존 로그인 handler. 추가 페이지 별도 재시도 유지 | `CouponBoxScreen.test.tsx`, 쿠폰 hook tests |
| `CouponDetailContainer` | 초기 실패 구분, 갱신 실패가 기존 쿠폰 가림 | 기존 쿠폰 유지 + 오류 안내 | 조회 재시도/기존 로그인 연결 | `CouponDetailScreen.test.tsx` 및 전체 regression |
| 방문 검증 장소 목록 | 초기 실패와 정상 빈 결과, OS 권한 거부 구분 지원 | refresh 실패 시 기존 방문 목록 유지 + 배너 | 조회 재시도. 기존 세션의 OS 권한 요청/설정 이동 유지 | `VisitVerificationScreens.test.tsx`, session/controller tests |
| 방문 검증 세션/리뷰 | 상태 enum·도메인 i18n·중복 제출/취소 제어 이미 지원 | 정상 경로 유지, 공통 오류 분류 보완 수혜 | OS 권한 상태에 따른 기존 요청/설정, 서버 오류 재시도 | 방문 검증 session/controller/review tests |
| 설정 위치/내보내기/로그아웃 | 오류 enum/키, OS 설정 실패와 요청 상태, 안전한 문구 지원 | 정상 경로 유지 | 기존 실제 OS 설정/재시도/내보내기 | `LocationPrivacy.test.tsx`, `DataExport.test.tsx` |
| 활성 AI 입력 `VoiceAssistantScreen` / `VoiceCommandResults` | 음성·텍스트 오류 코드, i18n fallback, 세션 generation·요청 중 잠금·같은 requestId 재시도 지원 | 기존 구현 유지 | 기존 세션 복구·입력 재시도·권한 안내 | `voiceSession.test.ts`, `voiceInput.test.ts`, `voiceCommandEngine.integration.test.ts`, `VoiceAssistantScreen.test.tsx` |
| 커뮤니티 글/댓글/좋아요 | 공통 오류 분류 사용. 필드 reason을 그대로 표시하는 경로 발견 | 필드 위치는 유지하고 `common.apiError.validation.description`으로 번역. 취소 배너 숨김 | 기존 submit/auth 동작 보존 | `CommunityWriteScreen.test.tsx`, `CommunityDetailScreen.comments.test.tsx` |
| V1 로그인·가입·비밀번호 재설정 (**후속 범위**) | production `AuthNavigator`는 아직 `src/features/auth`를 소비. `useLogin.ts`, `useSignup.ts`, `usePasswordReset.ts`에 원문 오류 또는 번역된 문자열 상태가 남아 있음 | 이번 V2 구현에서는 해당 V1 화면/훅을 수정하지 않음. 기존 route parity의 #124/#139 이관 범위로 명시 | 기존 로그인 흐름 유지; 아래 transport 가드만 적용 | 기존 auth tests는 회귀 확인용이며 이 V1 노출 문제의 해결 증거가 아님 |
| 계정 인증 경계 | 기존 공개 인증 401/만료 refresh 분리. 서명/HTML 401은 세션 삭제 가능 | signing 4개 코드 및 HTML 응답은 세션 refresh/logout하지 않음. V1 인증 화면 신규 변경 없음 | 정상 인증 만료는 기존 runtime 로그인 전환 | `apiClientAuth.test.ts`, account session tests |

## 분류 및 i18n 계약

- 추가: `common.apiError.timeout.{title,description}`, `server.{title,description}`, `rateLimited.{title,description}`, `mutationUnknown.{title,description}`.
- 기존 `common.apiError.actions.{retry,signIn,back,update}` 사용. 제공된 handler만 렌더링. 429는 대기 안내이며 근거 없는 retry-after 숫자를 만들지 않음.
- `ApiError` 원문/진단 필드는 보존하되 사용자 안내에는 사용하지 않음. Axios `ERR_BAD_REQUEST`가 HTTP 인증/권한 분류를 가리지 않도록 수정.
- 코드 없는 400은 generic. 명시적 validation 코드 또는 정규화된 fieldErrors 계약만 입력 검증으로 판단. 403은 재로그인 안내 없음.
- 오류 상태에는 오류 객체/코드만 보관하고 렌더에서 번역. 공통 component의 ko→en 전환 테스트 포함. 일본어 추가 없음.
- 취소: Axios `ERR_CANCELED`, native `AbortError`는 공통 오류 UI에서 숨김. React Query의 기존 취소/캐시 정책 유지.
- 조회 CTA는 promise 완료까지 ref 잠금 + busy/disabled 접근성 상태, `cancelRefetch:false`로 연속 탭이 기존 요청을 중단하지 않음.

## 검증 방식과 한계

- 실패 주입은 Jest API spy/QueryClient 및 node 단위 테스트에만 사용. production 성공 mock 추가 없음.
- 먼저 추가한 분류기 2개와 프로필 초기 실패 회귀가 기존 코드에서 실패함을 확인 후 구현. shared transport 서명 오류 4개와 미연결 예약 누락 회귀도 기존 코드에서 실패 확인.
- 라이트/다크 및 언어 변경 component tests, full-screen error ScrollView, 텍스트 줄 수 제한/폰트 확대 차단 없음, CTA busy/disabled 및 live-region/header 확인.
- 작은 화면·글꼴 확대의 실제 픽셀 배치와 VoiceOver/TalkBack 포커스는 Jest로 검증할 수 없음. **Android/iOS 실기기 수동 검증과 실서버 요청은 수행하지 않음**. 실제 기기에서 320/360dp, 글꼴 200%, ko/en, light/dark, 스크롤 및 CTA 가시성을 확인해야 함.
- **앱 전체 오류 안내 완료로 보고하지 않는다.** V1 인증 화면의 원문 노출/번역 문자열 보관은 위 표의 명시적 후속 범위다. V2 화면이 V1 훅을 가져오거나 인증 전체를 재설계하여 우회하지 않았다.
- 서버 #1728 장애 해결, HMAC, 일본어 #389는 이번 범위 밖. API 오류 UX 테스트 통과를 실서버 성공으로 해석하지 않음.
- 원본 생성 타입/OpenAPI 계약 변경 없음. production dependency graph는 추가된 V2 연결에 맞게 재생성.

최종 실행 결과는 아래에 기록한다.

## 최종 결과

- `npm run validate:pr`: **PASS**, 최종 종료 코드 0. 포함 단계: `check:v2`, ownership harness, `typecheck`, 전체 Jest, navigation/i18n-formatters/V2 notifications/map/API 회귀.
- V2 경계 테스트 **76/76**, ownership harness **2/2**, V2 API 회귀 **180/180**. production SCC 0, 기존 explicit exception 6개 유지.
- `npm run check:a11y-i18n`: **PASS**, production render graph 511 files. 예약 시트의 기존 장식 문자 `R`은 실제 아이콘으로 교체.
- `npm run check:v1-changes -- --base origin/dev`: **PASS**. 도구가 커밋 diff를 검사하므로 별도로 미커밋 diff도 동일 정책 함수로 검사: V1 source 변경 **0개**.
- `git diff --check`: **PASS**.
- 일부 Jest 실행에서 React `act(...)` 경고가 출력됨. 최종 테스트 실패 없음.
- sandbox에서 tsx IPC가 EPERM으로 차단되어 최종 전체 검증은 승인된 권한 확장으로 실행함. 환경 제한을 코드 실패로 기록하지 않음.
- 후속 사용자 승인에 따라 `feat/390-error-ux-i18n`에서 기능·페이지별 9개 커밋으로 정리. 푸시·PR 생성은 수행하지 않음.
