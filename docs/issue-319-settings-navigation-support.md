# #319 설정 탐색 및 지원 상태

## 기준과 조사 범위

- 시작: `feat/319-settings-navigation-support`, 깨끗한 working tree.
- HEAD / fetch한 `origin/dev`: `57e126b844cc66f71d02b40b1fcf3f8c88ec39f4`, ahead 0 / behind 0.
- 저장소 AGENTS.md 전체, #319·#230·#305, `docs/v2-production-entrypoint-migration.md`, settings/account/my-page 및 실제 production entrypoint를 확인했다.
- 구현 위치: V2. 사용자가 추가로 허용한 shared migration boundary `src/app/navigation/MainNavigator.tsx`, route 타입과 테스트에 한해 최소 연결 변경. `src/application`의 root, deep link, auth/session 경계는 유지한다. #356 구조 개편 없음.
- 실제 경로: App → application/ProductionApp → application/navigation/RootNavigator → app/navigation/MainNavigator. 조사 기준에서는 **standalone V2에만** onOpenDetail과 AccountManagement/SettingsDetail/NotificationSettings 등록이 있었다. production 주입이 이미 있다는 전제는 이 checkout과 달랐다.

## 시작 시 전수 조사와 최종 결정

P = production, S = standalone V2. ‘준비 화면’은 SettingsDetailPendingScreen.

| 항목 | 시작 클릭 / 목적지 | 기존 실제 V2 화면 | API / Query | 이번 연결 / 최종 상태 | 미지원 사유 / 후속 |
|---|---|---|---|---|---|
| 프로필 편집 | P/S 가능 → ProfileEdit (관광객) | 있음 | useProfile/useSaveProfile/useChangeProfileImage | ProfileEdit, 연속 탭 차단 | 사업자는 기존 범위 제한 유지 |
| 계정 관리 | P 내부 page, S AccountManagement | 서로 다른 두 구현 | useProfile (P 내부만) | AccountManagement 하나로 통일 | 없음 |
| 로그인 정보 | P 내부 계정 읽기, S 준비 화면 | P 내부 읽기 | GET /users/me, useProfile | 계정에서 실제 아이디·이메일 조회, 기존 detail id는 읽기 화면 | 이메일 직접 변경 계약 없음 |
| 비밀번호 변경 | P ProfileEdit, S 준비 화면 | ProfileEdit 현재 비밀번호 확인 폼 | POST /users/change-pw, useSaveProfile | root/계정 모두 ProfileEdit | OAuth 전용 계정의 비밀번호 설정으로 우회하지 않음 |
| 내 기록 | P 비활성, S 준비 화면 | 전용 관리 화면 없음 | 내 리뷰 Query는 존재 | 이유 안내, 리뷰 수는 별도 정확한 이름으로 조회 | ‘내 기록’ 범위·전용 화면 제품 결정 필요 |
| 쿠폰함 | P 계정/설정에 없음, S 계정 → 준비 화면 | CouponBox 있음 | GET /coupons, useCoupons | root/계정 → CouponBox | 없음 |
| 발자국 지도 | P 비활성, S 준비 화면 | 없음 | 일치 계약 없음 | 이유 안내 | 제품 정의·데이터 계약·화면 필요 |
| 저장한 장소 / 관심 장소 관리 | P 비활성, S 준비 화면 | 지도 favorites는 있으나 전용 관리 화면 없음 | bookmarks Query 존재 | 이유 안내, 지도나 검증 장소로 임의 대체 안 함 | 전용 목적지 정의 필요 |
| 알림 설정 | P 내부 실제 두 서버 토글, S 샘플 UI | 실제 내부 화면 + 별도 샘플 UI | 기존 useNotificationSettings/useUpdateNotificationSettings | NotificationSettings route에서 실제 내부 화면 재사용 | 8개 시안 항목 서버 연결은 #320 |
| 언어 | P/S 내부 language | LanguageSettingsScreen | 기존 언어 저장 경계 | 유지 | 없음 |
| 화면 모드 | P/S 내부 appearance | AppearanceSettingsScreen | appearance store | 유지 | 없음 |
| 위치 설정 | P/S 내부 location | LocationPrivacyScreen (안내/비활성) | 권한 표시만, 변경 미연결 | 기존 화면 유지 | #321 권한·정책 연동 |
| 개인정보 설정 | root 독립 행 없음, 위치 화면 내부 | LocationPrivacyScreen | 공개 범위 변경 계약 없음 | 기존 UI/지원 안내 유지; detail id도 같은 화면 | #321 |
| 데이터 관리 / 내 데이터 다운로드 | P 비활성, S 준비 화면 | 기존 API/Hook/파일 writer만 | GET /users/me/export, useDownloadUserDataExport | JSON export 화면, 확인·취소·오류·파일 준비 상태 | native 공유창 완료/취소 결과는 API가 반환하지 않음; 저장 성공으로 표시 안 함 |
| 위치 기록 다운로드 | 위치 화면 → 안내 | 전용 export 없음 | account export와 다른 의미 | 기존 미지원 안내 유지 | #321 위치 기록 계약 필요 |
| 공지사항 | P 비활성, S 준비 화면 | 없음 | 공식 제공 경로 없음 | 이유 안내 | 공식 컨텐츠/목적지 필요 |
| 이용약관 | P 비활성, S 준비 화면 | 없음 | 승인 문서 URL 미등록 | 이유 안내 | 승인 문서/URL 필요 |
| 개인정보 처리방침 | P 비활성, S 준비 화면 | 없음 | 승인 문서 URL 미등록 | 이유 안내 | 승인 문서/URL 필요 |
| 로그아웃 | P root/내부계정 실제 logout, S 준비 화면 | production session 경계 있음 | 기존 authStore.logout / clearTokenSession | root/계정 모두 실제 경계; 동기 잠금 유지 | 토큰·FCM·Query 정리 구현 변경 없음 |
| 회원 탈퇴 | P 비활성, S 준비 화면 | 없음 | DELETE /users/me는 존재 | 이유 안내, 호출 안 함 | 재인증/최종확인/복구 정책 필요. 계약 부재라고 표시하지 않음 |
| 앱 버전 | P/S 정적 표시 1.0.0 | 정적 행 | API 불필요 | 기존 정적 표시 유지 | 런타임 native version 검증은 별도 |
| 내 리뷰 수 | P 계정 없음, S 없음 | MyPage 통계만 존재 | GET /users/me/reviews.totalElements | 기존 limit:1/page:1 key 재사용 | total 미제공 시 값 없음; 내 기록 총합이라고 부르지 않음 |
| 체크인 수 | 계정 없음 | MyPage/VerifiedPlaces 조회 있음 | GET /location-check-ins.totalElements | 기존 limit:4 key 재사용, 서버 total만 표시 | 정규화된 기본 0을 쓰지 않고 serverTotalElements 보존 |
| 검증한 장소 수 | 없음 | VerifiedPlaces는 체크인 기반 목록 | 고유 검증 장소 total 없음 | 수량 숨김 + 이유 | 체크인 수를 고유 장소 수로 대체하지 않음 |
| OAuth 연결 상태 | 없음 | link/unlink Hook만 있음 | 상태 GET 없음; unlink 응답만 linked 포함 | 상태 숨김 + 이유 | 읽기 계약 필요, unlink로 조회하지 않음 |

모든 수량은 현재 페이지 길이·합산·전체 페이지 순회로 계산하지 않는다. 로딩, 오류, total 미제공, 실제 0을 구분한다. 조회 오류 후 재시도는 리뷰/체크인 행과 쿠폰 목적지의 기존 오류 UI를 사용한다.

실서버 확인 세부 METHOD/PATH·security·request/response·required/nullable·오류 코드는 [OpenAPI 확인 기록](issue-319-openapi-audit.md)을 참조한다.

## 탐색 책임

`resolveSettingsDestination`은 지원 route / 실제 detail / 미지원 안내 / logout action을 구분한다. 두 navigator가 같은 `useSettingsNavigation`을 사용한다. 동일 행의 profile/password/coupon은 같은 resolver를 거친다. 이동 잠금은 출발 화면의 focus 복귀 시 해제된다.

계정 화면의 중복 내부 구현은 제거하고 같은 AccountManagementScreen을 사용한다. language/appearance/location의 기존 local page는 유지하며 Android back은 local page가 열려 있을 때만 소비한다. NotificationSettings route의 back은 실제 navigation stack으로 돌아간다. 기존 deep link 및 ID 파싱 계약은 변경하지 않는다.

## 데이터 export의 제한

기존 account generated 타입·Query key·Hook·writer를 사용한다. 서버 GET 요청과 파일 생성 전에 확인/취소를 제공한다. 오류를 성공으로 바꾸지 않는다. expo-sharing의 Promise<void>는 저장 여부나 공유창 취소 여부를 구분하지 못하므로 이후 상태는 ‘파일 준비됨, 저장/취소 여부 확인 불가’다. 확인창 취소는 별도 취소 상태이며 요청을 보내지 않는다. account export를 위치 기록 다운로드로 표시하지 않는다.

## 검증

- 테스트 우선: production 탐색 6개 실패, 계정 실제 데이터 3개 실패, export 상태 3개 실패를 먼저 확인하고 구현했다. 체크인 원본 total·구형 detail route alias·기존 비밀번호 callback 회귀도 실패를 재현한 뒤 수정했다.
- 설정/production Jest: 8 suites, 64 tests 통과. 신규 테스트는 실제 설정 컴포넌트를 렌더링하고 API 경계만 fixture로 대체한다.
- `npm run check:v2`, `npm run typecheck`, `npm run check:v1-changes -- --base origin/dev`, `git diff --check`: 통과.
- `npm run test:regression`: 통과. 포함된 navigation 22 / i18n 11 / V2 notifications 7 / V2 map 47 / V2 API 140 tests 모두 통과.
- `npm run validate:pr`: 최종 통과. ownership harness 2 tests, typecheck, 전체 Jest **113 suites / 989 tests**, 전체 regression 통과. 일부 기존 RN suite의 act 경고는 출력되었지만 변경 영역의 별도 8-suite 실행에는 경고/실패가 없었다.
- 필수 `npm run test:navigation`와 `npm run test:v2-api`는 regression 및 validate:pr 내부에서 실제 실행되어 각각 22 / 140 tests 통과했다.
- tsx IPC 소켓은 sandbox에서 EPERM이 발생하여 승인된 sandbox 외 실행으로 검증했다. 의존성 없는 초기 worktree에는 lockfile 기반 `npm ci --ignore-scripts`를 실행했다. package/lockfile 변경 없음.
- `check:v1-changes`는 committed diff만 보는 스크립트이므로 별도로 uncommitted 변경 경로도 확인했다. `src/features/**` 변경 없음.
- 자동 테스트의 API 응답은 fixture이며 실서버 인증 조회/mutation 성공을 주장하지 않는다.

## 수동 QA와 남은 항목

- `adb devices -l`: 연결 기기 0. `xcrun simctl list devices booted`: 부팅된 시뮬레이터 0. iOS 실기기 연결/설치는 수행하지 않았다.
- 따라서 Android/iOS 실행 화면, 하드웨어 back의 실제 OS 동작, 작은 화면·큰 글꼴의 픽셀 레이아웃, VoiceOver/TalkBack, native JSON 공유/취소는 **미검증**이다.
- 자동 확인: 한국어/영어 모든 미지원 사유, disabled/busy/button 역할, 긴 문자열의 줄 제한 없음과 값 축소, dark theme, 로컬 Android back callback, route back/param/등록, standalone-production 동일 목적지.
- 남은 QA: 실 로그인 → 설정/계정 → 프로필/쿠폰/알림 → back; 연속 탭 후 focus 재진입; 서버 오류/빈 응답/실제 0; 화면 폭 320 및 큰 글꼴 ko/en; 다크모드; native export 저장/취소/공유 불가; logout FCM 정리와 Auth 전환; 기존 foreground/cold-start deep link.
- export 공유창 완료 후 저장 여부는 현재 라이브러리 계약상 확인 불가로 표시한다. 확인창 취소는 API를 호출하지 않고 취소 상태를 표시한다.

## 후속 blocker

- #320 알림 시안의 나머지 항목 계약·정책.
- #321 실제 위치 권한/공개 범위/위치 기록 삭제 및 다운로드.
- 내 기록·발자국·전용 저장 장소의 제품 의미와 목적지.
- 공식 공지/약관/개인정보 문서 URL.
- 탈퇴의 재인증·확인 정책 및 OAuth 상태 읽기 계약.
- #324 Android/iOS 기기 QA, native export 저장/취소 동작.

V1 dependency delta: **none**. `src/features/**` 수정 없음. `legacy-exception` 불필요(저장소 정책은 `src/features/**` 소스 추가/수정을 검사). production composition 파일의 최소 수정은 사용자 명시 허용을 받았다. 커밋·푸시·GitHub 이슈 수정 없음.

## 변경 파일

- `docs/issue-319-openapi-audit.md`
- `docs/issue-319-settings-navigation-support.md`
- `src/app/navigation/__tests__/SettingsNavigation.test.tsx`
- `src/v2/features/settings/components/AccountInformation.tsx`
- `src/v2/features/settings/hooks/useSettingsLogout.ts`
- `src/v2/features/settings/hooks/useSettingsNavigation.ts`
- `src/v2/features/settings/model/settingsNavigation.ts`
- `src/v2/features/settings/screens/DataExportScreen.tsx`
- `src/v2/features/settings/screens/SettingsDetailScreen.tsx`
- `src/v2/features/settings/screens/__tests__/AccountSupport.test.tsx`
- `src/v2/features/settings/screens/__tests__/DataExport.test.tsx`
- `src/v2/features/settings/screens/__tests__/SettingsSupport.test.tsx`
- `src/app/navigation/MainNavigator.tsx`
- `src/app/navigation/types.ts`
- `src/v2/app/navigation/RootNavigator.tsx`
- `src/v2/features/check-ins/api/checkInApi.ts`
- `src/v2/features/my-page/hooks/useProfile.ts`
- `src/v2/features/settings/components/SettingsLayout.tsx`
- `src/v2/features/settings/index.ts`
- `src/v2/features/settings/model/settings.types.ts`
- `src/v2/features/settings/screens/AccountManagementScreen.tsx`
- `src/v2/features/settings/screens/SettingsDetailPendingScreen.tsx`
- `src/v2/features/settings/screens/SettingsScreen.tsx`
- `src/v2/features/settings/screens/__tests__/SettingsScreen.test.tsx`
- `src/v2/features/settings/screens/__tests__/SettingsScreens.test.tsx`
- `src/v2/shared/api/__tests__/visitVerification.test.mjs`
- `src/v2/shared/i18n/resources.ts`
