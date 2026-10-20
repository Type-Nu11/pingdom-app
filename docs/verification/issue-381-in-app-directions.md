# #381 앱 내부 자동차 경로 미리보기 검증

검증일: 2026-09-30. 당시 커밋·푸시·PR 생성 없음. 2026-10-01 사용자 승인에 따라 API·네이티브 지도·V2 화면·검증 문서를 로컬 커밋으로 분리하며, 푸시·PR은 생성하지 않음.

## 시작 상태와 선행 구현

- 시작 브랜치: `feat/381-in-app-naver-directions`, HEAD `c2c9bef`.
- 시작 작업 트리: clean. 기존 사용자 변경 없음.
- `git fetch origin dev` 후 최신 `origin/dev`와 HEAD 동일: ahead 0 / behind 0. 기존 브랜치 병합·리베이스 없음.
- 작업 도중 다른 프로세스의 fetch로 `origin/dev`가 `5bd072c` (#403 커뮤니티 Figma PR 병합)로 갱신됨(20:25:10 KST reflog). 종료 시 HEAD는 `c2c9bef`, ahead 0 / behind 30. 현재 브랜치와 기존 변경을 유지했으며 새 origin/dev를 병합/리베이스하지 않음. 아래 검증은 현재 작업 브랜치 기준. 최신 dev에는 MapScreen/production dependency graph/공유 Typography·theme 등 변경이 있어 향후 통합 시 재검증 필요.
- 루트 AGENTS.md 및 앱 이슈 #381, #369, #376 확인.
- #369 SDK는 origin/dev에 포함되어 있음.
- #376 외부 네이버 길찾기는 별도 `feat/376-naver-map-directions` 브랜치에만 존재. 이 브랜치의 URL 계약, 실행 서비스, 양 플랫폼 polyline/caption·scheme 설정을 확인하고 최소 경계만 재사용. 해당 브랜치의 예시 경로/ETA, 화면·내비게이터, 관련 없는 수정은 가져오지 않음.
- 구현 소유권: V2 `src/v2/modules/place/map/routes/**`. Android/iOS 네이버 브리지는 shared migration boundary.

## 실서버 계약과 활성화 확인

공개 명세 GET: https://www.typenull.xyz/v3/api-docs/app — 실제 다운로드 성공.

- `POST /routes`, Bearer JWT. origin/destination은 WGS84 숫자 latitude/longitude, mode는 `car`.
- 응답: `mode: car`, `provider: naver`, `distanceMeters`(m), `durationSeconds`(초), `path`(출발→도착 도로 형상 전체).
- 공급자의 traoptimal 첫 번째 경로. 요청 좌표와 도로 위 경로 시작·끝은 다를 수 있으므로 경로 끝점을 덮어쓰지 않음.
- path는 명세에서 optional. 누락·2점 미만·동일 점만 있는 path는 경로 없음으로 처리. 비유한/범위 밖/문자열/손상 좌표는 전체 응답을 거부하며 일부 구간만 연결하지 않음.
- 400, 401, 403, 422(미지원/경로 없음), 429, 503, 504와 네트워크·클라이언트 timeout·취소 상태 분리.
- 명세의 기본 rate limit: 사용자 10회/분, IP 100회/분(서버 설정에 따라 변경). 앱의 신규 경로 기능은 캐시·저장·자동 재조회·자동 재시도 없음. 기존 인증 transport 경계를 그대로 이용함.
- 앱 transport의 기본 timeout 10초를 이용함. 429는 기다린 뒤 사용자 직접 재조회 안내.
- snapshot: `docs/api/routes.openapi.json`, 원문 SHA-256과 source URL 기록. 생성 타입: `src/v2/shared/api/generated/routes.ts`. 원문 재동기화/타입 재생성/일치 검사 스크립트 추가.
- 명세가 제공하는 server URL은 http이나, 앱 endpoint를 임의로 이 URL로 바꾸지 않음. 기존 HTTPS API base 설정과 상대 `/routes`를 사용.

**실제 앱 세션 POST /routes: HTTP 503 / ROUTE_PROVIDER_UNAVAILABLE 관측.** Android에 로그인된 기존 앱 세션으로 실제 요청했으며, payload·좌표·JWT 없이 method/route/host/status/code만 읽어 `www.typenull.xyz`의 503을 확인했습니다. 토큰을 추출하거나 임의 토큰으로 요청하지 않았습니다. 별도의 shell JWT 호출은 하지 않았습니다. **실제 성공 응답(200)은 확인하지 못했습니다.** 테스트 fixture/모킹된 transport 성공은 실제 서버 성공이 아닙니다.

서버 [PR #1738](https://github.com/Type-Nu11/pingdom-api/pull/1738) 및 [운영 문서](https://github.com/Type-Nu11/pingdom-api/blob/develop/docs/api/1735-car-route-api.md)를 추가 확인했습니다. `NAVER_DIRECTIONS_ENABLED` 기본값은 `false`이며, Directions 상품·요금·쿼터·서버 전용 키·실제 공급자/배포 검증이 활성화 선행 조건입니다. 503은 비활성·키 미설정·공급자 인증/쿼터/장애/비정상 응답을 같은 코드로 정규화합니다. 운영 환경 변수의 실제 값은 읽지 않았으므로 **운영에서 정확히 어느 원인인지 단정하지 않습니다**. API 명세/서버 이슈가 존재하거나 CLOSED라는 사실은 실제 활성화 증거가 아닙니다.

## 구현 동작

- 선택 장소 길찾기에서 V2 네이버 지도 미리보기 modal로 진입. 원래 지도와 bottom sheet 상태를 유지하며 닫기/Android back으로 복귀.
- 현재 위치와 목적지를 검증한 뒤 사용자가 자동차 조회 버튼을 눌렀을 때만 POST 요청. 기본 지도 표시 좌표를 요청 출발지로 대체하지 않음.
- 전체 서버 path를 순서대로 native polyline에 전달. 출발은 실제 사용자 위치 화살표, 도착은 선택 장소 카테고리 마커와 caption으로 표시. 직선 대체, 경로 끝점 덮어쓰기, 임의 ETA 없음.
- 서버 거리·시간만 단위 변환하여 표시. 시간은 분 표시 시 올림하되 1분 미만은 초로 표시.
- AbortController와 요청 generation으로 연속 요청/취소/장소 변경/좌표 변경/이동수단 변경/화면 이탈 시 오래된 응답 폐기. 새 요청은 이전 경로 즉시 제거. GPS 변경으로 자동 재조회하지 않음.
- 결과마다 전체 경로 카메라 fit 1회. 로딩 중 수동 gesture가 있으면 자동 fit 생략. 별도 전체 경로 보기 버튼은 cameraRevision 명령으로 같은 좌표여도 재실행 가능.
- 전체 화면 지도 위에 반투명 시트가 떠 있는 구성. 전체 path 경계를 native SDK fitBounds에 전달하고 status bar/시트 여백을 dp/pt로 반영. 아주 가까운 경로는 줌 16과 native pivot으로 과도한 확대를 방지. 사용자의 수동 줌 제한은 추가하지 않음. 기존 nightMode/장소 마커 보존. 네이버 로고는 safe area + 16, 기존 지도 기본 여백 160 유지.
- 내부 API는 자동차만 호출. 도보/대중교통/자전거는 내부 조회 버튼 없이 외부 네이버지도 안내. 별도 외부 CTA는 선택 이동수단을 nmap://route에 그대로 전달하고 내부 API를 호출하지 않음.
- 권한 거부·위치 실패·목적지 없음·로딩·경로 없음·인증·접근권한·호출제한·비활성·timeout·네트워크·취소 안내와 직접 재시도 제공. 영구 권한 거부 시 설정 열기 제공. 외부 길찾기는 출발지 생략 가능.
- 한국어/영어/일본어 카탈로그, button 역할/라벨/선택·disabled 상태, 상태 live region, 테마 색상, 스크롤 가능한 제어 패널 사용.
- 위치·경로 payload/JWT 로그 및 앱 네이버 API Secret 추가 없음. 기존 API 진단도 payload 없이 method/path/status만 기록.

## 자동 검증

| 검사 | 결과 |
| --- | --- |
| `npm run test:v2-routes` | 5 suites, 59 tests 통과 |
| `npm run check:v2` | 경계 검사 및 76 tests 통과 |
| `npm run typecheck` | 통과 |
| `npm run test:v2-map` | 50 tests 통과 |
| `npm run test:v2-api` | 185 tests 통과 |
| `npm run test:regression` (`validate:pr` 내부 실행) | navigation 22 + i18n 27 + notifications 7 + map 50 + API 185 = 291 tests 통과 |
| `npm run validate:pr` | 전체 Jest 159 suites / 1,564 tests 및 위 regression 통과 |
| `npm run check:routes-api-types` | snapshot 재생성과 생성 타입 일치 |
| `npm run check:a11y-i18n` | production render graph 검사 통과 |
| `npm run check:v1-changes -- --base origin/dev` | 통과 |
| 동일 정책 함수로 origin/dev→작업 트리 + 미추적 파일 검사 | V1 추가/수정 없음 |
| `git diff --check` | 통과 |
| Android `:app:assembleDebug --offline` | 통과 |
| iOS 실제 SDK·Pod headers로 Swift 두 브리지 파일 typecheck | 통과 (React umbrella header 경고 있음) |

신규 테스트 범위: DTO 최소 필드·Bearer header/signal 전달, WGS84 경계/결측/문자열/NaN/Infinity/동일 좌표, 손상 성공 응답, 전체 path 및 실제 distance/duration 표시, HTTP/도메인 오류, 연속 요청/취소/선택 변경/이전 선택 복귀/unmount, 카메라 중간 경유 범위·대형 path·gesture 억제·명시적 재fit, 미지원 이동수단의 외부 실행, 위치 거부/목적지 누락, 503에서 외부 대안, invalid live origin의 위치 재확인, Light/Dark SDK props·전체 geometry·camera command 전달, URL 인코딩·좌표 순서·출발지 생략·외부 앱 부재/실패.

## Figma 반영

[Figma 섹션 8365:10891](https://www.figma.com/design/XJ4uL6zQmulzrD7VQjpP5G?node-id=8365-10891): 자동차 8548:35327, 로딩 8553:11523, 권한 거부 8553:11311, 이동수단 화면의 context와 screenshot 확인.

- 전체 지도 + 가로 inset 8인 glass 시트, 위 모서리 36/아래 48, grabber 56×5, 공유/제목/닫기 header.
- 대중교통/도보/자동차/자전거 아이콘 탭 순서, 선택 white pill, 장소 2행(32 badge, 높이 56, 제목 16/설명 12).
- 결과 카드: 서버 예상 시간 28 bold, 조회 결과 수신 시각 + 실제 duration으로 산출한 예상 도착 시각/거리, 외부 앱으로 이동하는 시작 CTA와 안내.
- 로딩 skeleton/취소, 실패/권한 안내 카드는 동일 glass 표면·24 radius. 작은 화면/큰 글꼴은 시트 내부 스크롤. Light/Dark 테마, 접근성 tab/label/selected/disabled/live region, Pretendard 및 native status bar 유지.
- 원본 Figma SVG 16개를 `routes/assets`에 저장하고 자연 크기로 사용. 지도 이미지·예시 route vector·샘플 핀은 가져오지 않음.
- 성공 시 SDK가 실제 path vertex를 화면 좌표로 투영한 위치에 시간 bubble 표시. 이동 중에는 숨기며 화면/시트 밖 anchor에는 표시하지 않음. 경로 좌표는 변경하지 않음.
- 계약에는 추천 자동차 경로 1개만 있으므로 복수 경로 페이지·대안 ETA·통행료·교통 정보는 만들어 표시하지 않음. 도보/대중교통/자전거의 내부 성공 상세는 외부 연결 안내로 표시. 출발지는 원래 #381 범위인 현재 위치이며 장소 변경은 기존 장소 선택 화면에서 수행.

## 실제 기기 검증 및 blocker

자동 검증과 별도입니다.

- Android SM_F966N: 최종 디버그 APK 설치 성공. 기존 장소 마커→길찾기 진입, 경로 시트의 Light/Dark 렌더링, 실제 503 오류 안내, 출발/도착이 시트 위에 보이는 SDK fitBounds 카메라, 외부 도보 연결을 확인했습니다. 마지막 가까운 경로의 줌 16/pivot 보정은 빌드·설치/Swift typecheck까지 완료했으나 재캡처 중 ADB 기기 연결이 끊겨 해당 최종 보정의 실기기 재확인은 미완료입니다. 설치된 `com.nhn.android.nmap`의 도보 탭/실제 도착 장소 화면을 확인했습니다. 외부 앱의 도보 결과는 내부 자동차 API 성공이 아닙니다. 검증 중 기기가 사용 중일 때 입력을 중단하고 사용 가능 확인 후 계속했습니다. 기기의 원래 night mode `yes`로 복구했습니다.
- Android 실제 자동차 path·시간 bubble·거리/시간 **성공 화면은 503 때문에 미검증**. 자동 테스트 성공을 실기기 성공으로 보고하지 않습니다. screen reader/대형 글꼴/권한 실제 거부 및 복구/장소 교체 중 실제 네트워크 취소 검증도 남아 있습니다.
- iOS: paired iPhone 연결 확인. 전체 `xcodebuild`는 iOS 26.2 플랫폼 미설치로 destination 선택 전에 실패. 실제 SDK·Pod headers에 대한 최종 Swift typecheck는 통과했지만 앱 링크/설치·실기기 확인을 대체하지 않습니다.
- 실서버 blocker: 운영 활성화 변수와 공급자 키/상품/쿼터 확인 후 유효 앱 JWT로 국내 경로 2쌍 이상 실제 200 응답 확인이 필요합니다. 앱 저장소에 서버 전용 Secret을 추가하거나 mock 경로로 대체하지 않았습니다. 운영 서버 설정은 이 앱 변경에서 수정하지 않았습니다.

V1 dependency delta: **none**. V1 source 추가/수정 없음. `legacy-exception` 라벨 **불필요**.

## 변경 파일

- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/java/com/rmdka/pingdomapp/NaverMapView.kt`
- `android/app/src/main/java/com/rmdka/pingdomapp/NaverMapViewManager.kt`
- `docs/api/routes.openapi.json`
- `docs/architecture/adr/0001-production-dependency-graph.json`
- `docs/verification/issue-381-in-app-directions.md`
- `ios/NaverMapView.swift`
- `ios/NaverMapViewManager.m`
- `ios/Naviapp/Info.plist`
- `package.json`
- `scripts/check-generated-routes-api-types.mjs`
- `scripts/sync-routes-openapi.mjs`
- `src/v2/app/i18n/__tests__/composition.test.ts`
- `src/v2/app/i18n/resources.ts`
- `src/v2/modules/place/map/native/components/NaverMapAdapter.tsx`
- `src/v2/modules/place/map/routes/__tests__/CarRoutePreview.test.tsx`
- `src/v2/modules/place/map/routes/__tests__/NaverRouteAdapter.test.tsx`
- `src/v2/modules/place/map/routes/__tests__/externalRoutes.test.ts`
- `src/v2/modules/place/map/routes/__tests__/routesApi.test.ts`
- `src/v2/modules/place/map/routes/__tests__/useCarRoute.test.tsx`
- `src/v2/modules/place/map/routes/api/routesApi.ts`
- `src/v2/modules/place/map/routes/components/CarRoutePreview.tsx`
- `src/v2/modules/place/map/routes/components/RoutePlannerSheet.tsx`
- `src/v2/modules/place/map/routes/assets/*.svg` (원본 Figma UI 아이콘 16개)
- `src/v2/modules/place/map/routes/hooks/useCarRoute.ts`
- `src/v2/modules/place/map/routes/i18n.ts`
- `src/v2/modules/place/map/routes/index.ts`
- `src/v2/modules/place/map/routes/model/routePreparation.ts`
- `src/v2/modules/place/map/routes/model/routePresentation.ts`
- `src/v2/modules/place/map/routes/model/routeState.ts`
- `src/v2/modules/place/map/routes/model/routeUi.ts`
- `src/v2/modules/place/map/routes/services/openNaverRoute.ts`
- `src/v2/modules/place/map/screens/MapScreen.tsx`
- `src/v2/shared/api/generated/routes.ts`
- `src/v2/shared/native/NaverMapNativeView.tsx`
