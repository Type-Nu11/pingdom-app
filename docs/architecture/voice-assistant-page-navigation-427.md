# #427 AI 페이지 이동 (App)

구현 위치: V2 및 기존 `src/application/navigation/MainNavigator.tsx` 운영 조합 경계.
V1 dependency delta: none. 새 Backend API, Proxy 구현, 예약 Mutation은 없습니다.

## 계약과 실제 진입점

기존 POST `/ai/chat`에 앱이 `navigateToPage` 도구 정의를 공급합니다. 모델은 기존 앱 요청의
`claude-haiku-5-5` 설정을 유지합니다. 신규 endpoint는 없습니다. 운영 프록시의 수락 여부와
화면 렌더링은 앱의 로컬 계약 검증과 별도로 확인해야 합니다.

입력: 기존 schemaVersion=1 command_request, command=`navigateToPage`, args=`{page, placeId?}`.
임의 URL/route, 추가 필드, 양수가 아닌 ID와 안전 정수 밖 ID를 거부합니다.
placeId는 placeDetail/createReservation에만 허용합니다. 생략하면 placeId 추가 질문을 반환합니다.

| page | 운영 앱 | V2 독립 내비게이터 |
| --- | --- | --- |
| map | 기존 지도 홈 시트 | 동일 |
| search | 기존 MapSearchOverlay 검색 진입점 | 동일 |
| favorites | 기존 즐겨찾기 시트 | 동일 |
| reservations | ReservationBox | ReservationBox |
| myPage | MyPage (기존 역할 분기 포함) | MyPage |
| settings | Settings | Settings |
| createReservation | 기존 CreateReservation + 검증된 placeId | CreateReservation |
| placeDetail | Map + focusedPlaceId, 기존 장소 상세/미리보기 진입 | PlaceDetail |
| community | 기존 커뮤니티 시트 | 동일 |
| communityPost | 실제 목록의 첫 글 상세 조회 후 CommunityDetail | 동일 |
| recommendations | 기존 추천 장소 시트 | 동일 |
| coupons | CouponBox | 동일 |
| verifiedPlaces | VerifiedPlaces, 프로필 확인 및 점주 제외 | 동일 |
| accountManagement | AccountManagement | 동일 |
| notificationSettings | NotificationSettings | 동일 |
| loginInformation | SettingsDetail(loginInformation) | 동일 |
| locationSettings | SettingsDetail(locationSettings) | 동일 |
| privacySettings | SettingsDetail(privacySettings), 기존 위치/개인정보 통합 화면 | 동일 |
| dataManagement | SettingsDetail(dataManagement) | 동일 |

장소 ID는 최근 검색 결과 또는 성공한 canonical detail query가 있는 사용자 선택에서만
받습니다. 장소 상세를 다시 조회·검증하고 세대/계정/취소 상태를 확인한 뒤 이동을 dispatch합니다.
대상 없는 요청은 clarification_required/placeId, 출처 없는 ID는 ID_NOT_IN_CONTEXT,
조회 404는 NOT_FOUND, 권한 거절은 FORBIDDEN, 미지원 진입점은 FORBIDDEN입니다.
기존 오류 매핑을 유지합니다. session 시작에는 인증이 필요하며 미인증 시 기존
AUTHENTICATION_REQUIRED 안내를 유지하고 로그인·예약·결제 동작을 자동 실행하지 않습니다.
운영 앱 인증은 기존 RootNavigator/AuthNavigator가 소유합니다. 로그인 취소 시 이동 명령을
보관하거나 재실행하지 않습니다.

성공 데이터: `{target, navigationRequested:true}`. 성공은 라우터/시트 진입 요청 접수이며
렌더링 완료를 의미하지 않습니다. 이동 전 모델의 완료 문구는 제거하고 앱 언어의 진행
문구를 사용합니다. 이동 성공을 주장하는 모델 후속 응답은 요청하지 않습니다.

## 수명과 안전

- 위치 권한 없는 페이지 이동을 허용합니다. 장소 탐색의 기존 위치 정책은 유지합니다.
- 같은 command ID는 세션 ledger가 중복 실행을 막습니다. 같은 AI 진입 중 같은 목적지는
  지도 조합의 동기 잠금으로 반복 dispatch를 막습니다. navigate를 쓰고 반복 push하지 않습니다.
- navigateToPage는 한 tool batch의 마지막 명령만 허용합니다. 모델이 뒤에 다른 명령을
  붙이면 batch 전체를 실행 전에 거부합니다.
- 이동 시 키보드를 닫고 AI overlay를 닫습니다. 기존 input hook의 focus/unmount cleanup이
  마이크를 중단하고 session hook의 dispose가 진행 중 요청과 대화 맥락을 폐기합니다.
- 이동 후 뒤로가기는 기존 내비게이터/지도 시트 정책을 사용합니다. AI 재진입은 새 대화입니다.
  대화 내용을 영구 저장하거나 다른 계정·새 AI 진입에 이어 붙이지 않습니다.
- 현재 선택 ID는 성공한 상세 Query 검증 뒤에만 system 맥락에 제공하고, 선택 언어도 앱이 공급합니다.
- 공개 서버 OpenAPI snapshot은 변경하지 않았습니다. 앱 provider-envelope schema만 확장했습니다.

## 검증

자동 검증: parser/schema, dispatcher/session replay, 위치 권한 없는 5개 화면 이동,
장소 모호성·ID 출처·상세 재조회·로그아웃 중 도착한 응답·라우터 거부, 프록시 어댑터의
실행 전 batch 검증과 완료 문구 억제, AI 전체 및 기존 운영 내비게이터 회귀.
타입 검사와 `npm run check:v2`를 실행합니다. production dependency graph도 재생성합니다.

수동 QA 대상: Android/iOS 음성 및 텍스트로 6개 목적지, 화면 뒤로가기/AI 재진입,
로그인 취소, 서버 404/403, 한국어 외 선택 언어. 예약/결제/삭제 요청이 발생하지 않는지
확인해야 합니다. 기기별 결과와 운영 Proxy 실연동 결과는 확인한 범위만 아래에 기록합니다.

### 2026-10-14 실연동 확인

Android SM-N981N, 기존 개발 클라이언트 + 변경된 Metro bundle, 운영 `/ai/chat` 프록시:
- 텍스트 `Open favorites`: 모델 navigateToPage 반환 → 즐겨찾기 시트 도달.
  AI overlay와 키보드가 닫힘. 목록 API는 서비스 연결 오류를 표시하므로 데이터 조회 성공은 미검증.
- AI 재진입 후 `Open settings`: 설정 화면 도달. Android 뒤로가기로 지도 복귀.
- 로그의 새 도구 정의 공급 및 provider tool response에서 navigateToPage와 유효한 page 인자를 확인.
- AI 재진입 후 `Open my page`: 마이페이지 화면 도달. 프로필 부가 API는 연결 오류 상태입니다.

이 결과는 세 페이지의 Android 텍스트 실연동 증거입니다. 음성 인식부터의 실제 음성 요청,
iOS 실기기, 다른 세 페이지의 실기기 도달, 로그인 취소와 다국어 수동 QA는 별도 확인이 필요합니다.

자동 검사 결과: AI 및 내비게이션 Jest 23 suites/770 tests, `check:v2` 76 tests, 지도 회귀 50 tests, 다국어 회귀 89 tests, `typecheck`, `git diff --check` 통과. 해당 QA 시점에는 커밋·푸시·이슈 종료를 수행하지 않았습니다.


### 서버 없이 진행한 추가 검증

운영 코드를 변경하지 않고 `api/__tests__/voiceNavigation.integration.test.tsx`에 12개 통합
검증을 추가했습니다. HTTP 응답과 native speech 장치만 대체하고 실제 입력 화면,
채팅 어댑터, parser, session, dispatcher, 결과 표시와 화면 종료를 연결했습니다.
외부 서버에 의존하지 않습니다.

- 현재 장소를 선택한 상태에서 map/favorites로 이동하며 선택 맥락이 초기화돼도 AI가 닫힘.
  맥락 변경에 따른 화면 종료 누락 가설은 재현되지 않았으며, 추측에 따른 수정은 하지 않았습니다.
- 여섯 목적지의 실제 입력 → 앱 소유 이동 callback → AI 화면 제거, 장소 상세 재조회 검증.
- AI 재진입에서 텍스트·이전 대화 기록 초기화, 모델이 이전 tool ID를 재사용해도 새 세션에서 실행.
- 라우터 거절 시 AI 유지 및 접근 불가 안내, 모델의 잘못된 완료 문구 억제.
- 502 응답 시 오류 안내 및 이동 차단, 미인증 시 채팅 HTTP 호출·이동 차단.
- 페이지 이동으로 business Mutation이 발생하지 않음.

전체 Jest: 205 suites / 2418 tests 통과. 이동 관련 추가 통합 테스트 12개도 경계에 맞게
API 테스트 디렉터리로 정리한 뒤 다시 통과했습니다. `check:v2` 76 tests 통과.
이는 로컬 UI/계약/수명 검증이며 실제 음성 인식·native 기기 인증 취소 검증을 대신하지 않습니다.

### 서버 복구 확인

2026-10-14 서버 복구 안내 후 `/actuator/health`를 재확인하여 HTTP 200,
`status=UP`을 확인했습니다. Android에서 현재 선택한 실제 장소에 대해
`Open the current place detail page` 텍스트를 입력·전송한 뒤 AI와 키보드가 닫히고
기존 선택 장소의 상세/미리보기 화면이 남는 것을 확인했습니다.
이 확인은 영어 텍스트 입력 기준이며 실제 한국어 음성 및 iOS 검증은 남아 있습니다.

복구 후 Android `Open my reservations` 요청으로 예약함 도달과 기존 예약 목록 표시도
확인했습니다. 기존 예약을 조회했으며 예약 확정·취소·결제는 실행하지 않았습니다.

복구 후 Android `Open the map page` 요청으로 선택 장소의 미리보기에서 지도 홈 시트로
전환되고 AI와 키보드가 닫히는 것도 확인했습니다. 기존 확인과 합치면 여섯 목적지 모두
Android 영어 텍스트 요청으로 진입을 관찰했습니다. iOS, 한국어 실제 음성, 실제 인증 취소
흐름, 한국어 외 앱 선택 언어의 실기기 QA는 남아 있습니다.

이번 추가 작업은 통합 테스트와 검증 문서 보강입니다. 새 운영 코드 수정, V1 의존성 추가,
해당 QA 시점에는 커밋·푸시·이슈 종료를 수행하지 않았습니다.


### 특정 식당의 예약 작성 화면 이동 수정

“용짬뽕 예약페이지로 보내줘”가 예약 가능한 후보 검색으로 잘못 처리된 사용자 제보를
수정했습니다. createReservation을 앱 소유 목적지에 추가하고, 장소 ID 출처·최신 상세
검증을 적용한 뒤 기존 CreateReservation 라우트에 placeId만 전달합니다.

AI 지침에서 예약 작성 페이지를 여는 요청과 예약 실행 요청을 명확히 구분했습니다.
식당 ID가 확인되지 않았다면 일반 장소명 검색 후 명확히 일치하는 장소로 이동하고,
여러 지점이 모호하면 사용자 선택을 요청합니다. 페이지 진입 때문에 날짜·인원 질문,
예약 가능 후보 검색·availability·quote·예약 Mutation을 실행하지 않습니다.
기존 예약 작성 화면이 진입 후 자체적으로 예약 선택 데이터를 읽는 동작은 그대로입니다.

실기기 검증: Android에서 정확한 한국어 “용짬뽕 예약페이지로 보내줘”를 실제 입력창의
onChangeText/onSubmitEditing 이벤트로 전달해 운영 AI/장소 API 흐름을 실행했습니다.
고정된 AI 응답이나 가짜 장소 응답을 주입하지 않았습니다. 용짬뽕의 “예약하기” 화면,
인원·날짜·시간 선택 폼에 도달하고 AI 화면이 닫힌 것을 확인했습니다.
폼의 기본 선택 값은 기존 예약 화면의 상태이며 AI가 예약 조건을 승인한 값이 아닙니다.
예약 제출·확정·취소·결제는 실행하지 않았습니다. 실제 음성 인식부터의 QA는 남아 있습니다.

최종 재검증: 새 AI 대화에서도 동일한 한국어 요청으로 용짬뽕 예약 작성 화면에 재진입했습니다.
전체 Jest 205 suites / 2428 tests, 타입 검사, V2 경계 검사 76 tests, `git diff --check` 통과.
최종 Android 확인 화면: `/private/tmp/pingdom-427-yong-booking-final.png`.
V1 dependency delta: none. 해당 QA 시점에는 커밋·푸시·이슈 종료를 수행하지 않았습니다.

### 추가 화면 이동과 권한 범위 (2026-10-14)

사용자가 지정한 추천 장소·쿠폰함·검증한 장소·계정 관리·알림 설정·로그인 정보·위치 설정·
개인정보 설정·데이터 관리 화면을 기존 진입점에 연결했습니다. 커뮤니티 목록과 아무 글
상세도 지원합니다. 전체 허용 목적지는 19개입니다. AI가 프로필·알림·위치 설정을 변경하거나
쿠폰 사용·방문 인증·게시·데이터 다운로드·회원 탈퇴를 자동 실행하는 기능은 추가하지 않습니다.

communityPost 입력은 page만 허용합니다. provider의 임의 postId·role·confirmed 필드는
거부합니다. 앱이 기존 GET /community/posts의 첫 페이지(page=1, limit=1)를 새로 읽고,
반환된 양수 안전 정수 postId로 GET /community/posts/{postId}를 다시 읽습니다. 상세 응답의
ID가 일치한 경우에만 이동하며, 빈 목록·잘못된 ID·상세 ID 불일치·403이면 이동하지 않습니다.
조회와 이동 사이에는 기존 계정·대화 세대·취소 검사를 유지합니다. 실기기 첫 검증에서
page=0 요청이 400으로 거절되어 기존 계약의 1 기반 페이지로 수정하고 요청 인자 회귀를 추가했습니다.

운영 내비게이터는 로그인 완료 상태에서만 AI route dispatch를 허용합니다. verifiedPlaces는
프로필 미확인 또는 MERCHANT_OWNER이면 거부하며 기존 화면의 역할 제한도 유지합니다.
V2 독립 내비게이터에도 동일한 검증한 장소 진입점을 등록했습니다. 추천·커뮤니티는 Map의
기존 시트를 사용합니다. 새 Backend/Proxy API나 V1 의존성은 없습니다.

실제 Android SM-N981N에서 아래 문장을 각각 새 AI 대화의 실제 TextInput handler로 입력하고
운영 /ai/chat 응답으로 목적지 화면·AI 닫힘을 확인했습니다. 실제 음성 STT 또는 iOS 검증은 아닙니다.

- 커뮤니티 아무 글이나 열어줘: 실제 게시글 상세 도달. 목록과 상세 모두 서버 조회 성공.
- 추천 장소 목록으로 가줘: 나만을 위한 추천 장소 시트와 실제 장소 카드 표시.
- 쿠폰함 열어줘: 쿠폰함 도달 및 기존 쿠폰 표시.
- 방문 인증한 장소 목록 열어줘: 검증한 장소 목록과 실제 장소 카드 표시.
- 계정 관리 열어줘 / 알림 설정 열어줘 / 로그인 정보 열어줘: 각 기존 화면 도달.
- 위치 설정 열어줘 / 개인정보 설정 열어줘: 기존 위치·개인정보 통합 화면 도달.
- 데이터 관리 열어줘: 내 데이터 화면 도달. 다운로드 버튼은 누르지 않았습니다.

캡처: `/private/tmp/427-expanded-post2.png`,
`/private/tmp/427-expanded-{coupons,verified,account,notification,login,location,privacy,data,recommendations}-final.png`.
최종 검증: 전체 Jest 205 suites/2490 tests, typecheck, check:v2 76 tests, diff --check 통과.
V1 dependency delta: none. 해당 QA 시점에는 커밋·푸시·이슈 종료를 수행하지 않았습니다.


### 추가 QA (2026-10-14)

자동 검증 17개를 추가했습니다. 실제 UI/채팅 수명 통합, dispatcher와 실제 i18n 리소스를
사용하고 HTTP/native speech 장치만 대체했습니다.

- 응답 대기 중 전송을 반복해도 요청/이동이 한 번만 실행됨.
- 응답 대기 중 AI 종료·재진입 후 이전 응답이 새 대화를 이동시키지 않음.
- 장소 상세 응답의 ID가 요청 ID와 다르면 상세/예약 페이지 이동을 거부함.
- 예약 페이지를 위한 상세 검증 중 종료·백그라운드·맥락 변경·새 요청이 발생하면 이전 이동을 차단함.
- 지원 언어 8개 모두 미인증 안내 표시와 HTTP 호출/이동 차단을 확인함.
- 결과 목록 없는 모호한 요청에 장소 이름 입력 안내와 입력 가능한 UI를 제공함.

실제 Android + 운영 AI 확인 (한국어 텍스트를 실제 입력창 이벤트로 전달):
| 요청 | 결과 |
| --- | --- |
| 용짬뽕 예약 화면 열어줘 | 용짬뽕 예약 작성 화면 도달 |
| 내 예약 목록 보여줘 | 예약함 도달, 기존 예약 목록 표시 |
| 두 번째 거 예약페이지로 보내줘 (새 대화) | 장소 선택 추가 질문, 임의 이동 차단 |
| 위 질문에 용짬뽕으로 답변 | 원래 예약 페이지 요청을 유지해 용짬뽕 예약 작성 화면 도달 |

모호한 대상에 기존 안내가 “조회 결과에서 장소를 선택”이라고만 나와 새 대화에서
다음 행동이 불분명했습니다. V2 번역 리소스 8개 언어에 장소 이름을 입력할 수 있다는
안내를 추가했습니다. 실패 재현 테스트를 먼저 확인하고 문구를 보완한 뒤 통과했습니다.

전체 Jest 205 suites/2445 tests, `typecheck`, `check:v2` 76 tests,
다국어 회귀 89 tests 통과. 예약 제출·확정·취소·결제는 실행하지 않았습니다.
실제 음성 인식/iOS 및 실제 인증 취소 흐름은 아직 별도 QA 대상입니다.

검색 결과 없음 실기기 QA는 개발 연결이 끊겨 한 차례 결과 판정을 보류했습니다.
개발 클라이언트를 같은 Metro로 재시작해 연결을 복구한 뒤 재검증했습니다.
“없는가게427테스트 예약 페이지 열어줘”에서 searchNearbyPlaces의 앱 실행 결과
(succeeded, places 0개)와 결과 없음 안내를 확인했고, 임의 예약 페이지로 이동하지 않았습니다.
이 검색은 해당 조회 범위의 일치 결과 없음이며 장소가 전 세계에 존재하지 않는다는 증거는 아닙니다.

QA 캡처: `/private/tmp/pingdom-427-qa-booking-alias.png`,
`/private/tmp/pingdom-427-qa-reservations.png`, `/private/tmp/pingdom-427-qa-ambiguous.png`,
`/private/tmp/pingdom-427-qa-place-answer.png`, `/private/tmp/pingdom-427-qa-missing-confirmed.png`.
V1 dependency delta: none. 해당 QA 시점에는 커밋·푸시·이슈 종료를 수행하지 않았습니다.

개발 경고 배너도 확인했습니다. 유지된 개발 콘솔의 경고는
GET `/places/recommendations/:id/explanation`의 HTTP 404,
`RECOMMENDATION_EXPLANATION_NOT_FOUND`였습니다. 추천 설명 데이터 조회 경고로 기록하며
페이지 이동 성공/실패 판정과 구분합니다. 상세 콘솔 출력은 요청 인자·인증 정보 없이
경로/상태/공개 오류 코드만 확인했습니다.

### 검색 화면 이동 누락 수정 (2026-10-14)

사용자 요청 “검색 페이지로 가줘”의 목적지 search가 앱의 페이지 allowlist에서 빠져 있었습니다.
V2 타입·parser·provider schema·도구 설명에 search를 추가하고 MapScreen에서 터치 검색과
동일한 MapSearchOverlay 진입점을 실행합니다. 검색어를 요구하거나 주변 장소 조회를 먼저
실행하지 않습니다. AI overlay를 닫은 뒤 기존 검색 입력창이 포커스를 받습니다.

기존 검색 overlay는 GPS center가 있어야 렌더링됐습니다. 검색 화면 자체는 위치 없이도
열리도록 수정했습니다. autocomplete와 Kakao 검색의 기존 선택적 좌표 계약을 사용하며,
좌표가 없으면 요청에서 생략합니다. 지도 표시용 기본 좌표를 사용자 위치로 보내지 않습니다.

실제 Android SM-N981N에서 “검색 페이지로 가줘”, “검색 화면 열어줘”를 각각 실제
TextInput handler로 입력·전송하고 운영 /ai/chat을 거쳐 검색 화면과 키보드가 열린 것을
캡처했습니다. 첫 진입 후 Android 뒤로가기로 키보드와 검색 화면을 닫고 두 번째 요청을
재검증했습니다. 캡처: `/private/tmp/pingdom-427-search-after.png`,
`/private/tmp/pingdom-427-search-alias-after.png`. 실제 음성 STT와 iOS 증거는 아닙니다.

검색 목적지 계약·실행·UI 통합과 좌표 없는 검색 회귀를 추가했습니다.
전체 Jest 205 suites/2449 tests, typecheck, check:v2가 통과했습니다.
V1 dependency delta: none. 해당 QA 시점에는 커밋·푸시·이슈 종료를 수행하지 않았습니다.
