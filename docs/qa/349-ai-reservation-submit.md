# #349 AI 예약 일정 선택·확인·제출 및 복구

## 구현 범위

- V2, `feat/349-ai-reservation-submit`. 현재 네비게이션·아이콘 PR #422와 별도 작업입니다.
- AI가 조회한 장소의 실제 GENERAL availability 중 날짜·시간을 고릅니다. 희망 날짜·시간은 검색 조건이며 임의 슬롯이나 운영 시간 기반 슬롯을 만들지 않습니다.
- 서버 가격·취소 정책과 시간대가 등록된 미래 일정만 선택하며 인원을 바꾸면 기존 선택과 견적을 해제합니다. AI의 getAvailabilities 결과에서 요청 인원과 예약 가능한 희망 날짜를 보존합니다.
- 예약자 정보는 AI가 아닌 앱 안에서만 입력·검증합니다. 최종 확인 버튼 이전에는 예약 생성 0회입니다.
- 최종 확인 시 일정·정원과 견적을 다시 조회합니다. 조건 변경·만료는 새 견적을 표시하고 재확인을 요구합니다. 서버 조건 검증은 기존 초안과 Booking 제출이 같은 함수를 사용합니다.
- 예약 생성은 기존 Booking mutation을 사용하며 자동 재시도를 끕니다. 연속 확인과 같은 계정의 병렬 제출은 제출 가드로 차단합니다. 성공 후 예약함과 해당 장소 일정 캐시를 무효화합니다.
- 계정·API 서버별 Keychain에 토큰·키·고정 본문을 먼저 보관합니다. 저장 실패·저장 중 취소·저장 중 만료 시 최초 HTTP 예약 요청을 보내지 않습니다.
- timeout/5xx/응답 불일치는 결과 불명으로 유지합니다. 사용자가 복구를 누르면 같은 키·토큰·본문을 재전송합니다. 재시작·패널 재진입에서는 자동 제출하지 않습니다.
- background·계정·검색 맥락 변경은 미제출 선택을 폐기합니다. 이미 제출된 요청의 복구 기록은 유지하며 다른 계정에 노출하지 않습니다. 복구 기록 삭제는 해당 키가 일치할 때만 수행합니다.
- 실제 서버 응답의 예약 ID·계정·일정·인원·예약자·수락 조건을 검증한 뒤 결과를 표시합니다. PENDING은 요청 접수이며 관리자 확정 또는 결제 완료가 아닙니다. 결제 실행 기능은 추가하지 않았습니다.
- 조회용 Booking 공개 API와 네이티브 확인·복구 공개 API를 분리하여 기존 Node API 계약 테스트가 React Native를 로딩하지 않게 했습니다.
- V1 dependency delta: none. 네이티브 패키지 추가 없음. 새 문구는 8개 지원 언어에 제공됩니다.

## 최신 서버 계약

2026-10-09 공개 `https://www.typenull.xyz/v3/api-docs/app`에서 예약·견적 계약을 재확인하고 snapshot/types를 동기화했습니다.
원본 SHA-256: `14e421f7f836105fca466bf9264e1189d2445c3df0a8e05c5ceb476ca91a0765`.
AvailabilityResponse에 required `conditionsVersion`과 required nullable `reservationTerms`가 추가되어 있었습니다.
공개 OpenAPI 조회 성공은 인증된 견적·예약 성공의 증거가 아닙니다.

## 검증

- 예약 모델: 확인 전 0회, 취소, 입력 오류, 연속 제출, 가격·취소 정책·조건 버전 변경, 정원·상태·시간 변경, 만료·시계 역행, 저장 실패, 응답 유실·5xx, 재시작 복구, 확정 거절, 잘못된 성공 응답, 삭제 실패, logout/background, 계정 격리, 저장 중 취소·만료를 검증합니다.
- 실제 UI·hook·Booking API 계층을 연결한 통합 테스트: 서버 일정 선택→예약자 입력→최종 확인→PENDING 표시, 응답 유실→패널 재진입→동일 요청 복구→서버 시뮬레이터 예약 1건, 인원 변경·선택 취소, AI 요청 인원·날짜 보존을 검증합니다.
- 이 통합 테스트의 서버와 Keychain은 테스트 대역입니다. 실서버·실기기 E2E로 표시하지 않습니다.
- 최종 실행 결과는 아래에 기록합니다.

## 실제 E2E를 위한 테스트 데이터 준비

현재 테스트 서버 주소, 인증된 일반 사용자/점주 테스트 계정 및 테스트 가게 ID는 확보되지 않았습니다. 연결된 Android 기기는 확인했지만 테스트 계정·가게를 확인한 것으로 간주하지 않습니다.

1. 테스트용 서버와 활성 일반 사용자·점주 계정, 해당 점주가 소유한 GENERAL 예약용 가게를 확보합니다. 앱을 같은 테스트 서버에 연결합니다.
2. 배포된 merchant OpenAPI와 소유 권한을 확인한 뒤 다음 서버 API로 테스트 전용 미래 일정을 준비합니다. 이 경로는 로컬 서버 소스의 MerchantAvailabilityController에서 확인했으며, 인증된 배포 API 실행은 미검증입니다.
   - `POST /merchant-owner/availabilities`: placeId, productType=GENERAL, productId=null, startsAt, endsAt, totalCapacity.
   - `PUT /merchant-owner/availabilities/{id}/reservation-terms`: unitAmountMinor, additionalAmountMinor, currency, timezone, cancellable, cancellationCutoffMinutes.
   - `POST /merchant-owner/availabilities/{id}/activate` 또는 `/deactivate`.
3. 실행 날짜 이후의 두 날짜에 60분 일정 A(정원 3)·B(정원 1)·비활성 C를 만듭니다. 가격·정책은 명시적 테스트값으로 설정합니다. 예: KRW 단가 1000, 추가 비용 50, Asia/Seoul, 시작 60분 전까지 취소 가능. 운영 기본값으로 사용하지 않습니다.
4. 등록 입력의 LocalDateTime은 서버 Clock 시간대 계약에 맞춰 생성합니다. 표시 timezone만 바꾸어 예약 순간을 재해석하지 않습니다. 조회 응답의 offset 포함 시작/종료 시각과 quote를 대조합니다.
5. 두 플랫폼에서 AI로 장소 탐색→실제 일정 선택→예약자 입력→최종 확인을 실행합니다. 예약 POST 이전/이후의 요청 수와 예약 ID를 확인합니다.
6. A를 이용해 연속 확인 및 첫 응답만 유실시키는 테스트 프록시 시나리오를 실행합니다. 같은 본문·키·토큰 재전송 후 예약 ID가 동일하고 서버 예약·정원 차감이 1건인지 확인합니다.
7. 점주 계정으로 가격·정원·활성 상태를 변경하여 재확인 또는 차단을 확인합니다. 패널 닫기, background, 계정 변경, 앱 재시작 후 복구를 확인합니다. 최종 확인 전 취소는 예약 0건이어야 합니다.

테스트 환경이 확보되기 전에는 위 API의 데이터를 생성하지 않았고 실제 예약·취소·결제를 실행하지 않았습니다. #349의 인증된 성공·실패·재시도·취소 E2E 완료 조건은 아직 미충족입니다.

### 최종 자동 검증 결과

- `npm run validate:pr`: 통과. V2 경계 76개, ownership harness, TypeScript, Jest 186 suites / 2,069 tests, 회귀 374개(22 navigation / 89 i18n / 7 notifications / 50 map / 206 API).
- 마지막 lifecycle·timestamp 보완 후 관련 Jest 27 suites / 719 tests, `typecheck`, `check:v2` 재검증 통과.
- `npm run check:api-types`, V1 변경 정책, `git diff --check`: 통과.
- production graph: 694 dependencies / 1,745 local edges / 0 SCC.
- Expo Android 및 iOS Hermes 번들 export: 통과. 전체 네이티브 빌드나 실제 기기 검증을 의미하지 않습니다.
- Android·iOS의 인증된 실서버 예약 E2E: 미실행. 테스트 계정·가게·일정 준비 필요.
