# 2026-10-15 도보·대중교통 API 연결 후속

## 19시 안내 및 스와이프 후속

- 대중교통 대안 카드는 실제 가로 페이지 스크롤로 전환한다. 기존 점 선택도 유지하며 요약·구간 바·선택 표시·지도·상세가 같은 경로를 가리킨다. 세로 시트 스크롤과 긴 구간 바 스크롤도 유지한다.
- 도보 요약의 시작은 자동차와 같은 현재 위치 따라가기 화면을 연다. 구간 상세는 별도 버튼으로 제공한다. 대중교통은 구간 상세의 안내 시작에서 같은 추적 화면을 연다.
- 선택 경로의 공급자 좌표·총시간·총거리·구간별 선·정류장 마커를 추적 시작 시 보존한다. GPS 업데이트가 기존 경로를 지우지 않으며, 도보/대중교통 안내를 자동차 API로 재조회하지 않는다. 분리된 대중교통 구간 사이를 직선으로 잇지 않는다.
- 기존 정확도·GPS 신선도·권한 검사, 백그라운드 일시 중단, 현재 위치로 복귀, 도착 확인을 재사용한다. 회전·음성 안내나 구간 자동 판정은 새로 구현하지 않았다.
- Android SM-N981N에서 실제 인증된 대중교통 경로 14분/1.5km → 왼쪽 스와이프 → 대안 18분/1.6km 및 노선색·정류장·말풍선 동시 전환을 확인했다. 두 번째 경로 상세의 안내 시작 → 정밀 위치 확인 → 버스 아이콘이 있는 경로 따라가기 화면(18분/1.6km) 진입도 확인했다. 도착지까지 실제 이동·도착, iOS는 미검증이다.
- 증거: `/private/tmp/routes-1015-swipe.png`, `/private/tmp/routes-1015-guidance-final.png`. 검증 후 앱은 대중교통 선택 화면으로 돌렸다.
- 도보 실조회는 여전히 HTTP 503 `ROUTE_PROVIDER_UNAVAILABLE`이다. 19:32:45 KST 재현은 98ms, trace `f02e4b47-b608-4101-8fd5-1bd1c914a871`. 실패를 mock이나 자동차 응답으로 대체하지 않았다. 도보 안내는 자동 테스트까지 검증했으며 실제 성공 경로 기반 기기 검증은 이 오류로 막혀 있다.
- Backend 도보는 `TMAP_PEDESTRIAN_ENABLED` 및 `TMAP_PEDESTRIAN_APP_KEY`를 별도로 요구한다. 비활성·키 누락·공급자 인증/쿼터/통신/비정상 응답이 같은 503으로 정규화되므로 현재 앱 로그만으로 세부 원인은 확정할 수 없다. 기본 timeout은 504다. 운영에서 trace와 upstream 호출/상태 및 effective 설정의 enabled/keyPresent 여부를 확인해야 한다. 키 값 자체를 로그에 출력하지 않는다.
- 근거: [서버 도보 계약](https://github.com/Type-Nu11/pingdom-api/blob/develop/docs/api/1795-tmap-pedestrian-route.md), [서버 클라이언트](https://github.com/Type-Nu11/pingdom-api/blob/develop/src/main/java/com/typenull/pingdom/place/infrastructure/route/TmapPedestrianClient.java). 코드가 포함된 [release deploy 실행](https://github.com/Type-Nu11/pingdom-api/actions/runs/38700062075)은 16:42 KST 성공했으나 readiness는 공급자 실호출 검증이 아니다. 서버 변경·배포는 수행하지 않았다. 사용자 요청에 따라 [운영 도보 503 버그 #1798](https://github.com/Type-Nu11/pingdom-api/issues/1798)을 등록했다.
- 구현 위치 V2, V1 dependency delta **none**. 경로 관련 12 suites / 183 tests, TypeScript 및 최종 전체 Jest 215 suites / 2,608 tests가 통과했다.

이하 이전 기록의 도보 시작=상세 및 대중교통 안내 시작=지도 복귀 설명은 위 후속 동작으로 대체된다.

현재 공개 OpenAPI(`https://www.typenull.xyz/v3/api-docs/app`)에는 `car`, `transit`, `walk`가 포함되어 있다. 아래 이전 기록의 독립 도보 미지원 설명은 후속 계약으로 대체된다.

- JWT `POST /routes`, 도보 요청은 `{origin: {latitude, longitude}, destination: {latitude, longitude}, mode: "walk"}`.
- `WalkingRouteResponse`: `mode=walk`, `provider=tmap`, `distanceMeters`, `durationSeconds`, `path`, 선택적 `steps[]` (`instruction`, `distanceMeters`, `durationSeconds`, `path`). 공개 snapshot과 생성 타입을 갱신했다.
- V2 도보 탭에서 실제 API 조회, 전체 경로선, 시간·거리·조회 시점 기준 예상 도착, 도보 말풍선, 서버 구간 안내 상세를 연결했다. 걸음 수·경사·계단·대안 경로를 합성하지 않는다.
- 도보 시작 버튼은 접근성 이름 `경로 상세`로 서버 안내를 연다. 자동차 위치 추적·턴 안내를 사용하지 않는다.
- 대중교통 기존 연결을 유지하며 도보·대중교통·자동차가 요청 취소, 늦은 응답 무시, 429 대기 상태를 공유한다. 자전거는 외부 지도 연결을 유지한다.
- 미조회·조회 중·실패 상태는 실제 상태 UI를 사용한다. 모든 언어에 도보 조회 문구를 추가했다.
- V1 dependency delta: **none**. 후속 작업은 V2 및 API 문서/타입/의존성 snapshot 범위다.
- 실제 인증된 서버 200 응답 및 Android/iOS 표시 검증은 미실시다. 이번 확인에서 `adb devices -l`에 연결된 기기가 없다. 공개 OpenAPI 확인을 실제 인증 경로 조회 성공으로 간주하지 않는다.

후속 검증 결과:

- `npm run check:v2`: 76건 통과, production graph snapshot 갱신 및 SCC 0건.
- `npm run typecheck`: 통과.
- `npm run test:v2-routes`: 12 suites / 182 tests 통과.
- `npm run check:routes-api-types`, `git diff --check`: 통과.
- 최종 `npm run validate:pr` 실행 중 V2 검사, ownership 검사, TypeScript, 전체 Jest 213 suites / 2,577 tests가 통과했다. 이어진 `test:regression`은 샌드박스의 `tsx` IPC 소켓 `listen EPERM`으로 중단됐다. 동일 `npm run test:regression`을 샌드박스 밖에서 재실행해 종료 코드 0을 확인했다. 따라서 각 검증 단계는 통과했지만 원래 `validate:pr` 단일 실행의 종료 코드는 1이다.
- 최초 UI 검증에서 변경된 버튼 접근성 이름과 기존 디자인 테스트 기대값이 달라 2건 실패했다. 테스트를 실제 상세 동작에 맞춘 뒤 위 최종 전체 Jest에서 모두 통과했다.
- React `act()` 관련 기존 진단 로그가 일부 출력되며 테스트 실패는 없다.
- 후속 작업에서 native 브리지는 수정하지 않았고 플랫폼 앱 빌드·설치·실기기 표시 성공을 주장하지 않는다.

이하 이전 구현·검증 기록:

# #428 TMAP 대중교통 연결 검증

## 범위와 상태

- 브랜치: `codex/428-tmap-transit-routes`, 기준: `origin/dev` (`ee3905f6`).
- 구현 위치: V2 `src/v2/modules/place/map/routes/**`.
- 인프라 경계: V2 네이티브 지도 인터페이스 및 Android/iOS 지도 브리지에 `routeSegments`를 추가했다. 별도 구간 좌표를 하나의 선으로 연결하지 않기 위해 필요한 변경이다.
- V1 dependency delta: **none**. V1 소스 추가·수정 및 신규 의존성이 없다.
- 본 변경만으로 #428 전체를 완료하거나 닫지 않는다. 독립 도보 API, 실제 인증 서버 응답, 양 플랫폼 기기 표시 검증이 남아 있다.

## 확인한 계약

2026-10-15에 공개 `https://www.typenull.xyz/v3/api-docs/app`에서 `/routes`와 재귀 참조 스키마를 추출하고 타입을 재생성했다. 원본 출처·해시는 `docs/api/routes.openapi.json`의 `x-source`에 보관한다.

- JWT `POST /routes`, 요청은 `{ origin: {latitude, longitude}, destination: {latitude, longitude}, mode: "transit" }`.
- `mode=transit`, `provider=tmap`, `itineraries[]` 응답. 대안 목록 내 위치로 선택을 관리한다. 서버가 제공하지 않는 경로 ID를 생성해 서버에 전송하지 않는다.
- 각 경로의 총시간·거리, 선택적 환승·도보·요금과 구간의 이동수단·노선·출발/도착·경유 정류장·좌표를 사용한다.
- Backend `develop`의 `docs/api/1780-tmap-transit-route.md`, `TransitRouteResponse.java`, `TmapTransitClient.java`도 확인했다. Java의 nullable 노선/정류장 정보는 앱에서 안전하게 생략한다. 알 수 없는 이동수단은 기타로 표시한다.
- 공개 계약은 독립 `walk`와 `bike`를 미지원으로 명시한다. 두 모드는 기존 외부 네이버지도 연결을 유지한다.
- 통화, 실시간 도착, 출발 시각, 운행 여부, 막차 정보는 Pingdom 응답에 없다. 실시간·막차를 합성하지 않으며, 요금에 통화 기호나 교통카드 종류를 임의로 붙이지 않는다. 상세 요금 칩의 접근성 설명에 통화 미제공을 알린다. 시간은 조회 시각과 소요시간으로 계산한 예상값이며 운행 시간표가 아니다.
- 오류: 400 잘못된 요청, 401 인증, 403 권한, 422 미지원/경로 없음, 429 호출 제한 및 `Retry-After`, 503 공급자 장애, 504 timeout. 공급자 원문은 UI에 노출하지 않는다.

## 구현 동작

- 대중교통 탭 선택 시 실제 Pingdom 계약으로 조회한다. 앱이 TMAP 공급자를 직접 호출하지 않는다.
- 실제 대안 수만큼 접근 가능한 페이지 선택 버튼을 제공한다. 선택 시 요약, 구간 바, 지도선, 정류장 마커, 말풍선, 상세가 같은 경로를 가리킨다.
- 카메라 경계 계산에는 표시 가능한 구간 좌표만 사용한다. 별도 native polyline으로 그려 구간 사이에 직선을 합성하지 않는다. 좌표가 없으면 상세만 제공하고 안내한다.
- 상세에서 노선·승하차 장소·구간 시간/거리·경유 정류장을 확인한다. 대중교통을 자동차 위치 추적기에 전달하지 않는다.
- 요청 중복을 막고 모드/장소 변경·화면 종료 시 취소한다. 늦은 성공/실패가 새 선택을 덮어쓰지 않는다.
- 429 대기시간은 장소·모드 변경으로 초기화하지 않는다. 자동차와 대중교통이 같은 대기 상태를 공유하며 자동 재시도하지 않는다.
- 응답은 화면 메모리에서만 사용한다. AsyncStorage, 디스크, DB, 서버 상태 캐시에 저장하지 않으며 공급자 키를 추가하지 않는다.
- 기존 8개 언어와 앱 테마를 사용한다. 상세 화면에서는 뒤의 지도를 접근성 탐색에서 숨긴다.

## 디자인 참고

Figma `8540:11236`(미리보기), `8549:17143`(상세)의 디자인 컨텍스트와 스크린샷을 확인했다. 기존 glass sheet, 모드 탭, 장소 편집, 타이포그래피, 테마를 재사용한다. 신규 구간 아이콘(각 12×12)과 말풍선 아이콘은 해당 Figma 자산을 로컬 SVG로 내려받아 사용한다.

실시간 도착 행과 통화 기호는 확인된 계약 범위에 맞춰 추가하지 않았다. 미리보기의 `시작`은 구간 상세를 열고, 상세 하단 `안내 시작`은 같은 선택 경로가 표시된 지도로 복귀한다. 접근성 이름·힌트는 실제 동작을 설명한다. 새 내비게이션 엔진이나 음성·턴 안내를 구현한 것은 아니다.

### 2026-10-15 디자인 후속 작업

사용자가 세 화면의 디자인만 맞추도록 요청하여 아래 UI를 보완했다. 이번 후속 작업에는 API 연동이나 지도 네이티브 코드 변경을 추가하지 않았다.

- `RouteSummaryCard`: 대중교통/도보 공통 요약 카드, 추천 태그, 오른쪽 48px 시작 버튼, 시간·거리·부가정보 배치.
- `WalkRouteResult`: 도보 요약·걸음 수/경사·주의/계단 태그 및 선택적 페이지 표시. 표시 문자열만 받는 UI 모델이며 새로운 서버 계약이 아니다. 실제 화면에서는 미연동 상태를 표시하고 시작을 비활성화한다.
- `RouteTimeBubble`: 기존 자동차의 실제 경로 앵커/위치 제한을 유지하고 세 이동수단의 로컬 아이콘과 시안 타이포그래피를 재사용한다.
- `TransitRouteResult`: 22px 비례 구간 바, 작은 페이지 표시, 시안 위치의 예상 경로 안내. 많은 구간은 가로 스크롤로 확인할 수 있다.
- 대중교통 상세: 24px 뒤로/닫기 아이콘, 제목/부제, 요약 칩, 구간 바, 점선/노선색 타임라인, 출발/도착 배지, 하단 고정 공유·안내 버튼.

실제 UI 컴포넌트를 React Native Web으로 렌더링해 세 화면의 배치와 자산 크기를 확인했다. 이 로컬 미리보기의 데이터는 Figma 비교용이며 앱에 들어가지 않는다. 지도는 제외했고, native GlassSurface만 웹 블러로 대체했으므로 Android/iOS 지도·블러의 검증 증거로 취급하지 않는다. 360px 폭·12구간 비교 데이터에서는 바의 표시 폭 278px, 콘텐츠 폭 589px이며 가로 스크롤 위치가 0에서 311px까지 이동함을 확인했다. 실제 기기 및 글자 확대 검증이 남아 있으므로 디자인의 기기별 픽셀 일치를 확정하지 않는다.

TMAP 공급자 자체에는 공식 보행자 `POST https://apis.openapi.sk.com/tmap/routes/pedestrian` API가 있다. 미지원이라는 설명은 Pingdom 서버의 공개 계약에 한정된다.

## 자동 검증

실행 결과:

- `npm run validate:pr`: 통과. V2 경계 fixture 76건, ownership fixture 2건, TypeScript, Jest 212 suites / 2,561 tests, 후속 regression 모두 통과했다. 일부 테스트에서 React `act()` 및 의도된 API 실패 진단 로그가 출력되지만 테스트 실패는 없다.
- `npm run check:routes-api-types`: 통과. 공개 서버 snapshot과 생성 타입이 일치한다.
- 최종 수정 후 `npm run check:v2`, `npm run typecheck`, `npm run test:v2-routes` 재검증: 통과. 경로 관련 11 suites / 166 tests가 통과했다.
- `git diff --check`: 통과.
- Android `:app:compileDebugKotlin`, `:app:assembleDebug`: 통과. APK는 `android/app/build/outputs/apk/debug/app-debug.apk`이며 기기 설치·실행 증거는 아니다.
- Swift 구문 파싱: 통과. iOS 앱 빌드는 아래 환경 오류로 미완료다.
- 별도 읽기 전용 코드 리뷰에서 재현 가능한 주요 결함은 보고되지 않았다.

검증 명령:

```sh
npm run validate:pr
npm run check:routes-api-types
git diff --check
cd android
./gradlew :app:compileDebugKotlin
./gradlew :app:assembleDebug
```

신규 테스트는 계약 파싱, 잘못된 좌표/수치, 빈 경로, optional/null 정보, 알 수 없는 mode, 구간별 좌표 분리, 대안·상세 전환, 요청 경합/취소, 오류 복구, 429 모드 간 제한 및 다국어 다크모드를 포함한다. 기존 자동차 경로 테스트도 함께 실행한다.

## 기기·운영 검증의 잔여 항목

- Android: 연결된 기기가 없어 실제 SDK 표시와 서버 응답을 함께 검증하지 못했다.
- iOS: `xcodebuild -workspace ios/Naviapp.xcworkspace -scheme Naviapp -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO`는 Xcode의 `iOS 26.2 is not installed` 오류로 빌드 대상 선택 단계에서 실패했다. `swiftc -frontend -parse ios/NaverMapView.swift`는 통과했지만 타입 검사·링크·실기기 검증을 대신하지 않는다.
- 인증된 실제 `/routes` 대중교통 응답의 200·공급자·좌표·시간·요금 검증은 미실시다. 공개 OpenAPI와 Backend 소스 확인을 배포된 실제 동작 증거로 취급하지 않는다.
- TMAP 계약 계정의 현재 지도 위 표시 허용 범위·출처 표기·보관 조건은 운영 담당 확인이 필요하다. 공식 공개 API 문서만으로 해당 계정의 이용권을 확정하지 않는다.
- 독립 도보 API가 제공되기 전에는 도보 길찾기를 구현 완료 처리하지 않는다.

실기기에서 확인할 순서: 로그인 → 두 장소 선택 → 대중교통 조회 → 대안 선택 → 지도선·정류장·말풍선·상세의 일치 확인 → 경유 정류장 펼치기 → 모드/장소 변경 중 응답 도착 → 429/timeout/권한 오류 복구 → 자동차 회귀. Android/iOS별 서버 버전·앱 버전·경로·결과·스크린샷을 기록한다.

## 최신 dev 통합 검증 (2026-10-15)

- 기준 `origin/dev`: `a9bf8d5e`. 기존 작업 98개 파일을 외부 백업과 stash로 보관한 뒤 fast-forward하고 복원했다.
- 길찾기 화면·화면 테스트·번역의 충돌 3개를 해결했다. `dev`의 빈 출발지/도착지 처리와 이번 도보·대중교통 기능을 함께 유지한다.
- 새로 들어온 호출어 설정의 태국어 번역과 길찾기 빈 상태 문구도 추가했다.
- `npm run validate:pr`: 종료 코드 0. V2 경계 76건, ownership 2건, TypeScript, Jest 221 suites / 2,663 tests, 회귀 검사 207건 통과.
- 통합 후 태국어·호출어 대상 테스트 2 suites / 16 tests 통과. 미해결 충돌 없음, V1 dependency delta **none**.
- 최신 dev 통합 이후 새 네이티브 빌드·실기기 재검증은 수행하지 않았다. 앞선 Android 길찾기 확인 및 서버 도보 503 기록과 구분한다.
