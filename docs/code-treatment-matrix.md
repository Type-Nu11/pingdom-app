# PingDom 코드 처리 매트릭스

> 목적: 기존 코드를 일괄 복사하지 않고, 검증된 네이티브 기반과 서버 계약만 보존하면서 새 앱 구조로 전환한다.
>
> 판정 기준일: 2026-07-20 / 현재 `dev` 브랜치 정적 분석 + 「Pingdom 서비스 기획서 — 외국인 관광객을 위한 K-컬처 방문 전환 플랫폼」 기준

## 판정 및 표시 규칙

| 표시 | 의미 | 적용 원칙 |
|---|---|---|
| **KEEP** | 현 구조와 구현을 유지 | 네이티브 프로젝트, 빌드 설정, 검증된 SDK 브리지, 브랜드 원본 자산 |
| **PORT** | 계약과 검증된 로직을 검토 후 이식 | 새 인터페이스 뒤로 옮기며 오류·권한·보안 정책을 재검증 |
| **REWRITE** | 요구사항과 새 구조를 기준으로 재작성 | 기존 화면 코드는 동작/문구 참고만 허용하고 복사 금지 |
| **DROP** | 제거 후보 | 연결된 대체 이슈가 완료되거나 제거 조건을 만족한 뒤 삭제 |
| **BUILD** | 대응 코드가 없어 신규 구축 | 기존 코드를 억지로 확장하지 않고 새 도메인·API 계약부터 설계 |
| **API** | 서버 또는 외부 HTTP API 의존 | 백엔드 계약 및 환경변수 검증 필요 |
| **NATIVE** | iOS/Android 네이티브 의존 | 실제 기기 및 양 플랫폼 빌드 검증 필요 |

## 0. 기획서 반영 핵심 결정

| 제품 원칙 | 코드 처리 결정 | 확정 근거 |
|---|---|---|
| Pingdom은 범용 지도·게시글 앱이 아니라 **방문 전환 플랫폼**이다. | 지도와 장소 카드의 UI는 **REWRITE**하고 `Get coupon / Book / Navigate`를 1차 CTA로 둔다. | 핵심 루프가 `방문 결정 → 혜택 저장 → 예약/길찾기 → 방문 인증 → 재추천`이기 때문 |
| 핵심 정보는 정적 소개보다 **지금 방문 가능한지**다. | 장소 상세와 카드 데이터 모델에 영업 상태, 웨이팅, 외국인 친화, 언어 지원, 쿠폰, 예약, 마지막 검증 시각을 새로 설계한다. | 기존 place/post 모델만으로 Visit Score와 현재성 표현이 불가능 |
| 상점 입력은 사실이 아니라 **Claimed**다. | `Claimed / Visitor Verified / Pingdom Verified` 출처와 검증 시각을 모든 상태 데이터에 포함한다. | 출처 없는 boolean 또는 자유 텍스트로는 Trust Layer를 만들 수 없음 |
| 일반 게시글 피드는 MVP 핵심이 아니다. | 기존 게시글 카드·피드·자유 캡션 중심 UI는 **DROP**한다. | 방문 결정과 전환을 직접 만들지 못함 |
| 방문자의 현장 데이터는 핵심 자산이다. | record 도메인을 **위치 기반 체크인 + 구조화 상태 투표 + 현장 사진 증거**로 **REWRITE**한다. | 방문 인증과 최근 상태가 Verified Now Data의 공급원 |
| 온보딩은 인구통계보다 방문 의도 중심이다. | 국가·연령·성별 중심 화면을 복사하지 않고 여행 목적, 체류 기간, 지금 원하는 것으로 **REWRITE**한다. 언어 선택은 접근성 설정으로 유지한다. | 기획서 6-1의 행동 기반 세그먼트 |
| MVP 수익 검증은 상점 전환 성과다. | 쿠폰 저장/사용, 예약·문의, 길찾기, 방문 인증 이벤트를 서버·분석 계약에 포함하고 상점 대시보드를 신규 구축한다. | MVP 성공 기준이 이 이벤트들의 측정 가능 여부로 정의됨 |

### 범위 확정 수준

- **최종 확정:** 네이티브 기반 KEEP, 기존 범용 UI REWRITE, 레거시 fixture/stub DROP 원칙.
- **조건부 확정:** 기존 서버 API의 PORT 여부. 새 Trust/Offer/Conversion 데이터 계약과 맞는 endpoint만 이식한다.
- **제품 결정 필요:** 외부 예약·길찾기 공급자, 쿠폰 QR 발급/정산 방식, Visit Score 산식의 MVP 단순화 수준.

## 1. 주요 디렉터리별 판정

| 경로 | 기능 | 판정 | 의존성 | 처리 방식 / 완료 기준 |
|---|---|---:|---|---|
| `ios/` | Xcode 프로젝트, Pod, 권한, 앱 부팅 | **KEEP** | **NATIVE** | 새로 생성하지 않는다. 변경은 SDK·권한·서명 요구가 있을 때만 최소화하고 iOS 빌드로 검증한다. `Pods/`, `build/`, `.xcworkspace`는 생성물로 소스 이식 대상이 아니다. |
| `android/` | Gradle 프로젝트, Manifest, 앱 부팅 | **KEEP** | **NATIVE** | 새로 생성하지 않는다. 기존 package/application 등록과 SDK 설정을 보존하고 Android 빌드로 검증한다. `.gradle/`, `app/build/`, `.cxx/`는 생성물이다. |
| `app.json`, `app.config.js`, `metro.config.js`, `package.json`, `tsconfig.json`, `index.ts` | Expo 55 및 RN 빌드 기반 | **KEEP** | **NATIVE** | 버전 호환성 확인 후 유지. `EXPO_PUBLIC_API_BASE_URL`, Kakao 키 주입 방식은 환경별 검증한다. |
| `ios/Config/`, `android/app/google-services.json` | 네이티브 비밀값/Firebase 설정 | **KEEP** | **NATIVE** | 예제·gitignore 정책 유지. 실제 비밀 파일은 저장소에 추가하지 않는다. |
| `src/assets/`, `ios/Naviapp/Images.xcassets/`, `src/shared/fonts/` | 로고, 아이콘, 지도 마커, 폰트 | **KEEP** | 일부 **NATIVE** | 원본을 보존하되 미사용 자산 제거는 새 화면 자산 매핑 완료 후 별도 수행한다. |
| `src/styles/` | 색상·간격·radius·theme | **PORT** | — | 브랜드 토큰을 추출해 새 디자인 시스템의 단일 진실 공급원으로 이식한다. 화면별 하드코딩 값은 가져오지 않는다. |
| `src/shared/api/` | Axios, 토큰 갱신, Keychain | **PORT** | **API**, **NATIVE** | API 계약 테스트, 동시 refresh, 401, 로그아웃, 손상 토큰 복구를 검증한 뒤 새 data/auth 계층으로 이식한다. |
| `src/features/auth/api/`, `hooks/`, `model/`, `lib/` | 로그인·가입·인증 로직 | **PORT** | **API** | UI와 분리하여 요청/응답 타입, validation, mutation 로직만 검토 후 이식한다. 미구현 전화 인증은 별도 처리한다. |
| `src/features/auth/screens/`, `components/` | 로그인·가입·인증 화면 | **REWRITE** | **API** | 새 인증 플로우와 공통 폼 컴포넌트 기준으로 재작성한다. 중복 세대의 화면을 섞어 복사하지 않는다. |
| `src/features/onboarding/` | 국가·언어·연령·성별·진입 흐름 | **REWRITE** | — | 여행 목적·체류 기간·지금 원하는 것을 수집하도록 재작성한다. 언어 선택과 브랜드 자산만 선별 이식한다. |
| `src/app/navigation/` | 현재 null navigator 3개 | **REWRITE** | — | 실제 라우트 타입, auth gate, deep link/알림 진입을 갖는 내비게이션으로 구현한다. |
| `App.tsx` | 수동 화면 분기 앱 셸 | **REWRITE** | **NATIVE**(FCM 초기화) | Provider, 부팅 gate, navigator, notification routing으로 분리한다. 현재 `mainScreen` 조건 분기는 복사하지 않는다. |
| `src/app/providers/`, `src/app/store/` | Query/Zustand 및 앱 전역 상태 | **PORT** | 일부 **API** | 서버 상태와 UI 상태 경계를 재정의한 후 필요한 slice만 이식한다. 화면 전환 상태는 navigator로 대체한다. |
| `src/features/place/api/`, `model/`, API 연동 hooks | 장소·추천·북마크·Kakao Local 계약 | **PORT 선별** | **API** | 좌표·기본 장소·검색·장소 북마크 계약을 보존한다. 영업 상태·웨이팅·언어·쿠폰·예약·검증 출처를 포함하는 새 Place Decision 모델에 맞지 않는 DTO는 폐기한다. |
| `src/features/place/components/KakaoMapCard.tsx` | Kakao Map RN 브리지 | **KEEP** | **NATIVE** | 네이티브 view name과 props/events 계약을 고정하고 양 플랫폼 smoke test를 둔다. |
| `src/features/place/screens/`, 나머지 `components/` | 지도 화면, 장소 생성/상세, bottom sheet | **REWRITE** | **API**, 일부 **NATIVE** | 지도 브리지는 재사용한다. 카드/상세는 `Open now`, `Wait`, `Foreigner-friendly`, `Last verified`, `Coupon/Book/Navigate` 중심으로 재작성하고 등록은 상점·방문자·스카우트 3경로로 분리한다. |
| `src/features/firebase/` | FCM 권한, 토큰 동기화, 알림 라우팅 | **KEEP**(기반) / **PORT 후순위**(흐름) | **API**, **NATIVE** | 네이티브 Firebase 기반은 유지. 8주 MVP의 방문 결정·Trust·전환 계측보다 우선하지 않으며, 재방문/쿠폰·예약 알림 시나리오 확정 후 이식한다. |
| `src/features/translation/` | ML Kit 번역 서비스·훅 | **KEEP**(브리지) / **PORT**(훅) | **NATIVE** | native module 계약은 유지. 모델 다운로드 동의, 실패/오프라인 상태 UI는 새 구조에 이식한다. |
| `src/i18n/`, `src/shared/i18n/`, onboarding 번역 | 중복 i18n 구현 | **PORT** | — | 하나의 i18next 인스턴스와 리소스 구조로 통합한 뒤 중복 `i18n-js` 구현을 제거한다. |
| `src/features/profile/` | 프로필·좋아요·보관 UI와 API | **PORT**(계정 API) / **REWRITE**(여행자 UI) / **DROP**(피드 UI) | **API** | `/users/me`와 저장 데이터는 검토 후 이식한다. 여행 목적·쿠폰·예약·방문 인증 중심으로 재작성하고 gallery/archive 게시글 UI와 fixture는 폐기한다. |
| `src/features/settings/` | 계정·권한·알림·법적 고지 | **PORT**(API/권한/콘텐츠) / **REWRITE**(UI) | **API**, **NATIVE** | 계정 작업과 권한 로직은 검토 후 이식. 공통 설정 화면과 상태 UI는 재작성한다. |
| `src/features/record/api/`, hooks/model | 삭제된 지도 게시글 API 및 장소 화면의 데이터 의존 | **DROP** | **API** | 대체 앱 계약이 없어 #234에서 API·호출자·게시글 모델을 제거했다. 의미가 다른 방문 검증·장소 정보 제보 계약으로 치환하지 않는다. |
| `src/features/record/components/`, `screens/` | 게시글 카드·게시글 생성 화면 | **DROP 후 대체** | **API**, 신규 **NATIVE**(위치) | `MIG-006`의 방문 인증 UI가 완료된 뒤 삭제한다. 일반 게시글 작성이 아닌 체크인, 웨이팅/언어/재고/쿠폰 상태 투표, 현장 사진으로 대체한다. |
| `src/features/map/` | 별도 레거시 MapCard/useMap | **DROP** | — | 현재 앱 진입점이 `features/place` 지도를 사용함을 확인하고 `MIG-007`에서 참조 0건·기능 중복 여부 확인 후 삭제한다. |
| `src/shared/components/` | 공통 Button/Input/Modal/Loading | **REWRITE** | — | 접근성·상태 variant를 갖춘 새 공통 상태/UI 컴포넌트로 재작성한다. 기존 구현은 API 모양 참고만 허용한다. |
| `src/services/` | 미구현 API/storage와 0,0 위치 stub | **DROP** | 가짜 **API**/위치 | `MIG-007`에서 참조 0건 확인 후 삭제. 실제 구현은 `shared/api`, Keychain/AsyncStorage adapter, location service로 대체한다. |
| `src/types/`, `src/shared/utils/`, `src/shared/hooks/` | 공통 타입·순수 유틸 | **PORT** | — | 사용처와 테스트가 있는 순수 로직만 이식하고 범용 이름의 미사용 타입은 제거한다. |

## 2. 기획서 기준 기능별 확정

| 기능 | 현재 코드 대응 | 판정 | MVP 처리 |
|---|---|---:|---|
| 여행 의도 온보딩 | 인구통계 중심 onboarding/auth 화면 | **REWRITE** | 여행 목적, 체류 기간, 지금 원하는 것 수집. 언어 선택은 별도 유지 |
| 방문 결정 지도 카드 | place map/card/bottom sheet | **REWRITE** | 현재 상태·Tourist Fit·Now Value와 세 CTA를 첫 화면에 노출 |
| 장소 상세 | `PlaceDetailScreen` 및 record 결합 | **REWRITE** | 최신 검증 시각, 정보 출처, 쿠폰/예약/길찾기, 상태 불일치 신고 포함 |
| 혜택 저장 | bookmark가 일부 유사 | **PORT + 확장** | 장소 저장과 쿠폰 저장을 분리하고 발급·만료·사용 상태 추가 |
| 예약/문의 | 대응 구현 없음 | **BUILD** | 외부 링크/제휴 API 중 MVP 방식을 결정하고 성공/실패 이벤트 수집 |
| 길찾기 | 대응 구현 없음 | **BUILD** | 지도 앱 deep link와 `navigate_click` 이벤트를 원자적으로 기록 |
| 위치 기반 방문 인증 | 현재 위치 hook과 record 업로드 일부 | **REWRITE** | 위치 반경, 시간, 중복/조작 방지 정책을 포함한 check-in 플로우 구축 |
| 구조화 상태 투표 | 대응 구현 없음 | **BUILD** | 웨이팅·영어 메뉴·재고·쿠폰 이행 등을 enum으로 입력 |
| Trust 라벨/점수 | 대응 구현 없음 | **BUILD** | Claimed/Visitor/Pingdom Verified와 산출 근거·최근 시각 표시 |
| Visit Score/추천 | 추천 API 일부 존재 | **PORT 선별 + 확장** | Local Heat/Tourist Fit/Now Value 신호가 없는 기존 추천은 임시로만 사용 |
| 상점 등록 | 일반 장소/사진 등록 흐름 | **REWRITE** | 운영 상태, 쿠폰, 예약, 이벤트 기간의 구조화 입력과 Claimed 표시 |
| 스카우트 제보 | 일반 장소 등록 일부 | **REWRITE** | 신뢰도/관리자 검수 상태를 가진 별도 제출 경로로 분리 |
| 상점 대시보드 | 대응 구현 없음 | **BUILD** | 노출·카드 클릭·쿠폰 저장/사용·길찾기·예약·체크인·Trust 변화 제공 |
| FCM 재참여 | 구현 존재 | **PORT 후순위** | 핵심 전환 루프 계측 후 쿠폰 만료·예약·재추천 알림에 연결 |
| ML Kit 번역 | 양 플랫폼 구현 존재 | **KEEP + PORT** | 한국어 현장 정보 접근성에 재사용하되 정보 출처/원문을 함께 표시 |

## 3. 네이티브 의존 파일

| 파일/범위 | 네이티브 기능 | 판정 | 필수 검증 |
|---|---|---:|---|
| `ios/KakaoMapView*.{swift,m}`, `ios/Naviapp/AppDelegate.swift`, `ios/Podfile` | Kakao Maps SDK와 RN view bridge | **KEEP** | iOS 실기기 지도 로딩, 키 주입, marker press, camera idle |
| `android/app/src/main/java/com/rmdka/pingdomapp/KakaoMap*.kt`, `MainApplication.kt`, Gradle/Manifest | Kakao Maps SDK와 package 등록 | **KEEP** | Android 실기기 지도 로딩, lifecycle, marker/camera event |
| `src/features/place/components/KakaoMapCard.tsx` | `requireNativeComponent('KakaoMapView')` | **KEEP** | 양 플랫폼 props/event 계약 및 앱 시작 시 module 등록 |
| `ios/MLKitTranslation.{swift,m}`, `android/.../MLKitTranslation*.kt` | Language ID / on-device Translate bridge | **KEEP** | 언어 감지, 모델 다운로드, offline/error 결과 |
| `src/features/translation/services/mlKitTranslation.ts` | `NativeModules.MLKitTranslation` adapter | **KEEP** | native unavailable와 download consent 처리 |
| `@react-native-firebase/*`, `ios` Firebase 설정, Android google services 설정 | Firebase app/messaging | **KEEP** | APNs/FCM 토큰, foreground/background/cold-start 알림 |
| `src/features/firebase/utils/*`, `hooks/*` | Firebase/Expo Notifications orchestration | **PORT** | 권한 거부/재허용, 토큰 refresh, notification route 중복 방지 |
| `src/shared/api/authStorage.ts`, `authTokens.ts` | `react-native-keychain` | **PORT** | 신규/기존 설치, 손상 JSON, logout, refresh-token rotation |
| `src/features/place/hooks/useCurrentLocation.ts`, `src/features/settings/hooks/useDevicePermissions.ts` | `expo-location` 및 OS 설정 | **PORT** | denied/blocked/limited, fallback 노출, watcher 해제와 배터리 정책 |

## 4. 서버·외부 API 의존 파일

| 파일/범위 | API 계약 | 판정 | 이식 전 확인 |
|---|---|---:|---|
| `src/shared/api/apiClient.ts` | base URL, bearer 주입, refresh 및 retry | **PORT** | refresh endpoint/응답 스키마, 동시 401, retry loop, timeout |
| `src/features/auth/api/authApi.ts` | `/auth/login`, `/auth/signup`, `/auth/email/verify`, 사용자 변경 | **PORT** | DTO와 오류 코드, logout/revoke 여부, change endpoint 중복 |
| `src/features/auth/api/phoneVerificationApi.ts` | 전화 인증 예정 | **PORT 보류** | 현재 본문이 미구현이므로 서버 endpoint 확정 전 production 이식 금지 |
| `src/features/place/api/placeApi.ts` | `/places/*`, `/users/me/bookmarks` | **PORT 선별** | place ID 의미, pagination, recommendation/click 추적과 함께 새 Decision/Trust/Offer 필드 수용 여부 |
| `src/features/place/api/kakaoLocalApi.ts` | Kakao Local REST API | **PORT** | 키 노출 정책, quota, timeout, 좌표계, 오류 로깅에서 응답정보 제거 |
| `src/features/record/api/recordApi.ts` | 삭제된 게시글·좋아요·신고 계약 | **DROP** | #234에서 대체 계약 없이 제거 완료 |
| `src/features/profile/api/profileApi.ts` | `/users/me`, 계정 수정/삭제 | **PORT** | 재인증 필요 여부, 삭제 복구/확인 정책, authApi와 중복 제거 |
| `src/features/firebase/api/firebaseApi.ts` | `/firebase/fcm-token` | **PORT** | 로그인/로그아웃 시 token 등록·폐기, 멀티 디바이스 정책 |
| API 소비 hooks/components | React Query와 화면 상태 연결 | **PORT** 또는 **REWRITE** | API 호출을 presentation component에서 분리하고 loading/empty/error/retry를 공통화 |

### 기획서 대비 신규 서버 계약

현재 저장소에서 확인되지 않아 기존 코드 PORT로 해결할 수 없는 범위다.

| 신규 계약 | 최소 데이터/이벤트 | 우선순위 |
|---|---|---:|
| Place Decision Status | open/closed-soon, wait bucket, stock, foreigner-friendly, language/menu, event period, last verified | MVP 1 |
| Verification/Trust | claim source, verification label, verifier count, observedAt, mismatch/report, Trust Score 근거 | MVP 1 |
| Offer/Coupon | 발급, 저장, 만료, QR/code 사용, 이행 실패 신고, merchant 정산 식별자 | MVP 1 |
| Conversion Events | impression, card click, coupon save/use, booking click/result, navigate click, check-in | MVP 1 |
| Check-in/State Vote | place, 좌표 검증 결과, 구조화 응답, 현장 사진, 중복 방지 key | MVP 1 |
| Booking/Inquiry | 공급자, availability, deep link 또는 예약 payload, 성공/실패 상태 | MVP 1~2 |
| Merchant/Scout | claimed place 권한, offer/status 관리, scout 신뢰도, 관리자 검수 상태 | MVP 2 |
| Merchant Dashboard | 상점별 전환 집계, Trust 추이, 기간/캠페인 필터 | MVP 2 |
| Recommendation/Visit Score | Local Heat, Tourist Fit, Now Value 신호와 추천 이유 | MVP 2 |

## 5. DROP 후보와 연결 작업

아래 이슈 ID는 마이그레이션 백로그에 생성할 대체 이슈 키다. 실제 삭제는 연결 이슈의 완료 조건을 모두 만족한 뒤 수행한다.

| DROP 후보 | 대체 이슈 | 제거 조건 |
|---|---|---|
| `src/services/apiClient.ts` | **MIG-001 — API client 단일화** | 모든 호출이 새 API adapter를 사용하고 import 0건, refresh/401 계약 테스트 통과 |
| `src/services/storage.ts` | **MIG-002 — 저장소 adapter 확정** | 토큰은 Keychain, 비민감 설정은 AsyncStorage로 분리되고 import 0건 |
| `src/services/location.ts` | **MIG-003 — 위치 서비스 이식** | 권한 상태·현재 위치·watch 해제를 포함한 새 service/hook가 양 플랫폼 검증 완료 |
| `src/features/profile/constants/profileMock.ts` | **MIG-004 — 프로필 실데이터 전환** | `ProfileMini`, `LikesBottomSheet`가 API 또는 명시적 empty state를 사용하고 mock import 0건 |
| `src/features/place/constants/mapFixtures.ts` | **MIG-005 — K-컬처 분류체계 구축** | K-pop/Beauty/Fashion/Cafe/Food/Pop-up/Exhibition/Nightlife의 ID·번역·marker mapping이 서버 계약 또는 단일 domain constant로 이전됨 |
| `src/features/record/components/RecordCard.tsx`, `screens/RecordCreateScreen.tsx` 및 게시글 중심 UI | **MIG-006 — 방문 인증/현장 증거 대체** | 위치 기반 체크인, 구조화 상태 투표, 현장 사진, 상태 정정/신고 플로우가 승인되고 레거시 route/import 0건 |
| `src/features/map/` | **MIG-007 — dead code 및 중복 feature 정리** | 현재 `features/place` 지도와 기능 비교 완료, 참조 0건, 회귀 테스트 통과 |
| `src/app/navigation/{Auth,Main,Root}Navigator.tsx`의 null 구현 | **MIG-008 — 실제 내비게이션 구축** | 새 navigator가 auth gate, main routes, notification/deep link 진입을 담당한 뒤 placeholder 파일을 교체 또는 삭제 |
| 중복 인증 화면 세대 (`auth/screens`의 미참조 top-level, `InformationSelect`, 일부 signup 화면) | **MIG-009 — 인증/온보딩 화면 통합** | route map 확정, 새 플로우 E2E 통과, 각 후보 import 0건을 파일별 확인 |
| `src/shared/i18n/index.ts` 또는 중복 i18n 인스턴스 | **MIG-010 — i18n 단일화** | 모든 화면이 단일 provider/resource를 사용하고 locale 저장·복원 및 fallback 검증 완료 |
| `console.log/info` 및 request/response 샘플 로그 (`kakaoLocalApi`, place hooks/components, `recordApi`) | **MIG-011 — 운영 로깅 정리** | 민감 payload 제거, 개발 전용 logger guard 또는 관측 도구로 치환, production build 무출력 확인 |
| `.DS_Store`, `.expo/`, `ios/Pods/`, `ios/build/`, `android/*/build/`, `.gradle/` | **MIG-012 — 생성물 위생 점검** | git 추적 0건 유지; 로컬 생성물은 재생성 가능함을 확인. 코드 이식/백업 대상에서 제외 |
| 게시글 gallery/archive 중심 프로필 UI | **MIG-013 — 여행자 전환 보관함 구축** | 저장 장소·쿠폰·예약·방문 인증 내역 화면이 대체하고 fixture/import 0건 |
| 인구통계 중심 온보딩 단계 | **MIG-014 — 방문 의도 온보딩 구축** | 여행 목적·체류 기간·현재 니즈 저장과 추천 연결이 완료되고 기존 연령/성별 단계 의존 0건 |

## 6. 재작성 시 공통 상태 UI 기준

| 상태 | 새 공통 컴포넌트의 최소 계약 | 기존 코드 처리 |
|---|---|---|
| Loading | 지연 표시 정책, 접근성 label, skeleton/spinner variant | 화면별 `return null`과 임시 indicator를 복사하지 않음 |
| Empty | 제목, 설명, 선택적 CTA, illustration slot | fixture로 채우지 않고 실제 빈 응답을 표현 |
| Error | 사용자 메시지, retry, 오류 분류/추적 ID | raw 서버 오류와 `console.*`를 직접 노출하지 않음 |
| Offline | 연결 상태, 캐시 데이터 여부, 재시도 | 네트워크 오류를 일반 오류와 구분 |
| Permission | 요청 가능/거부/차단 상태, 설정 이동 CTA | 위치·알림·사진 권한별 OS 차이를 adapter에서 흡수 |
| Stale | 마지막 검증 시각, 만료 기준, 사용자 확인 CTA | 오래된 상태를 현재 사실처럼 표시하지 않음 |
| Claimed/Unverified | 주장 주체, 검증 전 안내, 신고/확인 CTA | 상점 입력을 검증된 사실처럼 표현하지 않음 |
| Conversion pending/failed | 쿠폰·예약·길찾기 처리 상태와 복구 행동 | 클릭만으로 성공 처리하거나 중복 이벤트를 만들지 않음 |

## 7. 실행 순서와 최종 게이트

1. **KEEP 기준선 고정:** iOS/Android의 Kakao Map, ML Kit, Firebase smoke test를 먼저 만든다.
2. **전환 이벤트 계약 우선:** impression → card click → coupon/book/navigate → check-in을 서버에서 식별 가능하게 정의한다.
3. **PORT 경계 확정:** 기본 장소/API, Keychain, 위치, i18n을 UI와 분리된 adapter로 이식한다. FCM은 핵심 루프 뒤에 연결한다.
4. **REWRITE 진행:** 앱 셸 → 내비게이션 → 방문 의도 온보딩 → 방문 결정 카드/상세 → 쿠폰·예약·길찾기 → 방문 인증/Trust UI 순으로 교체한다.
5. **상점 MVP 구축:** 상점 등록, 구조화 상태/쿠폰 입력, 핵심 전환 대시보드를 연결한다.
6. **DROP 실행:** `MIG-001`~`MIG-014`의 제거 조건과 import 0건을 확인한 후보만 삭제한다.
7. **완료 판정:** TypeScript 검사, 양 플랫폼 빌드, 핵심 API 계약 테스트, 전환 이벤트 중복 방지, 권한/지도/번역 실기기 smoke test가 모두 통과해야 한다.

## 결정 요약

- 네이티브 프로젝트와 Kakao Map·ML Kit·Firebase 기반은 **재생성하지 않고 KEEP**한다.
- 인증·API client·Keychain·위치·i18n은 화면에서 분리해 **검토 후 PORT**하고, FCM 흐름은 MVP 핵심 루프 뒤로 둔다.
- 앱 셸·내비게이션·방문 의도 온보딩·방문 결정 카드/상세·공통 상태 UI는 **새 요구사항으로 REWRITE**한다.
- 쿠폰·예약/길찾기 계측·방문 인증·Trust Layer·상점 대시보드는 기존 대응 구현이 없어 **BUILD**한다.
- 게시글 피드 UI·stub 서비스·mock/fixture·중복/미참조 화면·운영 디버그 로그는 **조건부 DROP**한다. 단, 최근 사진/신고 등 현장 증거에 필요한 계약은 선별 이식한다.
