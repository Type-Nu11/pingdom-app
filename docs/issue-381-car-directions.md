# 앱 내부 자동차 길찾기 연결 (#381)

## 구현 위치

- V2: `src/v2/modules/place/map/directions`, 지도 화면과 네이티브 어댑터.
- shared migration boundary: Android/iOS 네이버 지도 브리지, `src/shared/api/apiClient.ts`의 기존 로그인·토큰 갱신 transport. 두 클라이언트에 동일한 앱 메타데이터를 공급하기 위한 최소 변경이다.
- V1 dependency delta: `none`. V2에서 V1 모듈을 새로 참조하지 않는다.

## 서버 계약과 동작

2026-10-09 배포 서버 `https://www.typenull.xyz/v3/api-docs/app`의 `/routes`와 참조 스키마를 `docs/api/routes.openapi.json`에 저장했다. `POST /routes`에 JWT와 출발·도착 WGS84 숫자 좌표, `mode: car`만 전송한다. 공급자 키는 서버가 관리한다.

길찾기 버튼은 앱 내부 자동차 경로를 조회한다. 서버가 반환한 전체 도로 형상을 순서대로 지도에 표시하고 출발·도착 마커, 거리, 예상 소요시간, NAVER 출처를 안내한다. 외부 길찾기는 별도 버튼으로 기존 외부 지도 연결을 사용한다. 도보·대중교통 경로를 생성하지 않는다.

조회에는 15초 클라이언트 timeout을 사용한다. 서버 전체 공급자 timeout(10초)에 전송 시간을 더한 값이다. 자동 재시도나 캐시를 사용하지 않는다. 중복 탭을 차단하고, 장소·목적지 좌표 전환, 검색, 화면 이탈, 위치 상실, 닫기에서 요청을 취소한다. 취소를 무시하는 transport의 늦은 응답도 반영하지 않는다. GPS 갱신만으로 재조회하거나 카메라를 이동하지 않는다. 새 경로가 도착하면 한 번 전체 경로에 카메라를 맞춘다.

## 함께 확인한 앱 요청 실패

운영 서버 health는 HTTP 200 / UP이며 OpenAPI도 HTTP 200으로 응답했다. `X-Client-Type: App`을 보낸 `/users/me` 요청은 프록시에서 HTTP 400 / `missing required header: X-Timestamp`로 거절되었다.

인프라의 `app_request.lua`, `app_auth.lua`, Rust validator를 확인했다. 현재 프록시 계약은 JWT와 `X-Timestamp`(Unix 초), `X-App-Version`(숫자 SemVer), `X-Device-Id`(UUID)이다. 이전 서명 헤더는 사용하지 않는다. application composition에서 앱 버전과 영속 설치 UUID 공급자를 구성하고 V2 클라이언트, 기존 transport, 토큰 갱신 요청에 적용했다. 하드웨어 ID나 인증용 secret을 생성·저장하지 않는다.

## 검증 및 남은 범위

- Android Kotlin 컴파일과 debug APK 빌드 통과. 연결 기기에 APK 설치 완료.
- 길찾기 요청/응답 검증, 오류 매핑, 중복 탭, 선택 전환, GPS 갱신, 닫기·화면 이탈·unmount, Retry-After 테스트 통과.
- 앱 설치 UUID 영속화·동시 요청, 요청 메타데이터·JWT 보존 테스트 통과.
- `npm run validate:pr` 통과: V2 경계 76개, 소유권 2개, typecheck, Jest 1,947개, navigation 22개, i18n 89개, notification 7개, map 50개, V2 API 203개.
- 최종 `npm run check:v2`, `git diff --check`, OpenAPI 생성 타입 일치 검사 통과.
- iOS Swift 구문 검사 통과. Xcode에서 iOS 26.2 플랫폼 미설치로 전체 iOS 빌드는 검증하지 못했다.
- 실기기에서 유효 JWT로 실제 경로 성공 응답, 거리·시간·도로 형상·카메라의 정확도 확인은 남아 있다. 프록시 요구 헤더를 수정했다고 실제 공급자 성공까지 검증한 것은 아니다.

타입 재생성: `npm run generate:routes-api-types`.
타입 일치 확인: `npm run check:routes-api-types`.
