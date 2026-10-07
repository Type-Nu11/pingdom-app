# #349 — V2 서버 견적 기반 예약 초안 (1단계)

## 범위와 상태

2026-10-01, 사용자의 “일단 된 것만” 지시에 따라 **최신 서버 계약 연동·출처 검증·초안 표시**를
구현했습니다. **#349 전체 완료가 아닙니다.** 최종 사용자 확인·예약 생성·예약 응답 유실 복구·결제
동작은 이번 단계에서 구현하지 않았습니다. 초안 화면에는 제출 버튼이 없고 예약 미제출을 명시합니다.

- 구현 위치: **V2**, `src/v2/modules/booking` 및 `src/v2/modules/voice-assistant`.
- 시작 브랜치: `feat/349-ai-reservation-confirmation`, 작업 트리 깨끗함.
- 시작 HEAD: `1f463e06cda88efaa06c720a370df2e746c388e5`.
- 최종 `git fetch origin` 후 최신 `origin/dev`는 `8013a2d1d826fd1be2f6e1d81847fc7c053b74a4`,
  HEAD는 ahead 0 / behind 103입니다. 원격 변경을 합치지 않았으며 검증은 현재 브랜치 기준입니다.
- 기존 Booking 터치 예약·idempotency 생성·mutation·성공 후 캐시 무효화 정책은 변경하지 않았습니다.
- V1 dependency delta: **none**. `legacy-exception`: **불필요**. 경계 예외 추가 없음.
- 커밋·푸시·PR 생성 없음.

## 실서버 계약 확인

서버 [#1746](https://github.com/Type-Nu11/pingdom-api/issues/1746)은 CLOSED,
[PR #1747](https://github.com/Type-Nu11/pingdom-api/pull/1747)은 MERGED입니다.
`GET https://www.typenull.xyz/v3/api-docs/app`의 HTTP 200 응답에서 새 계약을 직접 확인했습니다.
SHA-256: `9691124889cabf79f441f33dc08e8095d051b8a5d0fc8aea814e65977803d7ad`.

- 새 `GET /places/{placeId}/availabilities/{availabilityId}/quote?quantity=N`:
  `confirmationToken`, `confirmation`, `remainingCapacity`를 반환합니다.
- `confirmation`: 실제 장소·상품·availability·시각·인원, timezone, 단가·추가 비용·합계,
  통화·최소 단위 자릿수, 결제 필요 여부, 취소 가능 여부·기한·수수료·환불액, 조건 버전·유효기한.
- `POST /reservations`: optional `confirmationToken` 추가. 토큰 없는 기존 터치 요청은 유지합니다.
- 생성·상세 응답: required nullable `confirmation` 추가. 기존 예약은 null입니다.
- 견적 유효기간은 최대 5분·슬롯 시작 전까지, 미설정 정책은 `422 QUOTE_TERMS_UNAVAILABLE`.
  서버 문서의 취소 정책은 취소 불가 또는 기한 내 수수료 0·전액 환불입니다.

`sync-reservation-payment-openapi.mjs`에 quote operation의 검증·안정적 이름 매핑을 추가하고
7개 경로·10개 참조 schema의 스냅샷과 생성 타입을 갱신했습니다. 서버 문서의 예시 가격을 기본값으로
사용하지 않습니다. 기존 예약 fixture에는 계약대로 `confirmation: null`을 추가했습니다.

## 실행 경계와 초안

`prepareReservation`의 parser/Registry/validator와 기존 정책을 사용합니다.
PREPARE_WRITE/draft/allowsMutation:false를 유지하며 command·route·API allowlist를 확대하지 않았습니다.
AI가 가격·취소 조건·확인 권한·예약자 개인정보를 입력할 수 없습니다.

1. 최근 공개 조회 결과의 장소·availability 출처, 활성 세션·계정·context·조건 revision을 검사합니다.
   표시한 슬롯 ID와 인원이 일치하고 provenance가 30초 이내여야 합니다.
2. 기존 canonical availability를 강제 재조회합니다. 슬롯이 사라졌거나 비활성·정원 부족·시작됨이면
   거부하고, 상품·시간이 이전 표시와 달라졌으면 STALE_CONTEXT로 거부합니다.
3. 기존 장소 상세도 강제 재조회하고 Booking 공개 quote Query로 실제 견적을 조회합니다.
4. 견적의 장소 ID/이름, availabilityId, productId/type/name, 시작·종료 시각, 인원을 재조회 결과와
   대조합니다. 가격·정책·timezone·만료·안전한 정수 연산을 runtime 검증하고 불일치는 거부합니다.
5. frozen snapshot으로 초안을 표시합니다. 요청 날짜·시간대와 실제 이용 시각·서버 시간대를 함께
   표시하고, minor-unit 금액은 부동소수점 반올림이나 환율 변환 없이 통화 코드와 정확하게 표시합니다.
6. 성공/실패 후 기존 availability 선택을 정리합니다. 같은 command는 #347 replay ledger를 재사용해
   중복 실행을 막고, 새 prepare command도 새로 표시한 availability 없이 재사용할 수 없습니다.

초안 `source`에는 실제 placeId·availabilityId·productId 및 canonical availability dataUpdatedAt이
연결됩니다. 초안 자체는 예약 성공이 아니며 예약 생성 결과 ID가 없습니다.

quote Query는 Booking에 소유되며 사용자별 key와 retry:false/staleTime:0/gcTime:0을 사용합니다.
확인 토큰은 runtime 검증만 하고 초안 결과/화면/provider로 전달하지 않습니다. Query observer 해제 후
임시 캐시에서도 제거하며 영속 저장하지 않습니다. 최종 제출 단계에서는 별도의 앱 소유 확인 intent를
설계해야 하며 이 초안 결과를 mutation 요청으로 변환하지 않습니다.

## 차단과 lifecycle

- **TICKET/CLASS 및 알 수 없는 상품:** 기존 GENERAL 전용 지원 범위를 유지합니다.
- **가격·취소 정책 미설정/불완전/계산 불가:** 무료·취소 불가로 추측하지 않고 거부합니다.
- **만료·조건 변경·정원 부족·서버 오류·timeout·네트워크 응답 유실:** 초안 성공으로 변환하지 않습니다.
  견적은 자동 재시도하지 않으며, 예약 생성 mutation은 모든 경우 0회입니다.
- **만료:** 표시 시 생성한 monotonic deadline과 서버 expiresAt을 함께 사용합니다.
  기기 시계를 뒤로 돌려도 초안 표시 기간이 늘어나지 않습니다.
- **취소·세션 종료·background·logout·context 변경·새 입력:** 기존 #347/#348 lifecycle로 초안과
  출처를 폐기합니다. 이전 세대의 늦은 결과는 현재 화면/새 선택을 덮어쓰지 않습니다.
- ko/en/ja로 서버 조건·오류·예약 미제출을 표시합니다.

## 검증과 한계

자동 검증의 최종 결과는 아래에 기록합니다. fixture/mock 성공은 실서버 견적 또는 예약 성공이 아닙니다.
추가 테스트는 표시 ID/시간/인원과 서버 결과 일치, 강제 재조회, 오래된/변경된 선택 거부,
정책 누락·가격/환불 계산 오류·만료 거부, 중복 AI 명령, 응답 유실 시 자동 재시도/예약 0회,
quote 캐시 정리, 초안 UI·만료·background·context 변경·취소를 검증합니다.

- `npm run check:v2`: 통과, 경계 테스트 76개. 새 runtime 모델을 포함하도록 production dependency
  graph를 갱신했으며 production SCC 0개·V1 경계 예외 추가 없음.
- `npm run typecheck`: 통과.
- 초기 Voice Assistant·Booking 관련 Jest: 20 suites / 511 tests 통과.
  추가 lifecycle/UI 검사는 2 suites / 12 tests, 최종 command 모델 검사는 76 tests 통과.
  모든 추가 검사는 아래 최종 전체 실행에도 포함됩니다.
- `npm run test:v2-api`: 185 tests 통과.
- `npm run validate:pr`: **최종 통과**. 전체 Jest 155 suites / 1,560 tests,
  회귀 291 tests 통과. tsx IPC 권한 오류 이력이 있어 승인된 환경에서 실행했습니다.
- 첫 전체 실행의 Jest는 통과했지만 API 회귀의 과거 오류 상태 목록 검사 한 건이 실패했습니다.
  최신 서버 계약과 quote schema를 검사하도록 갱신한 후 API 회귀가 통과했습니다.
  다음 전체 실행에서는 변경하지 않은 CommunityDetailScreen.places 테스트 한 건이 시간 초과했고,
  단독 8 tests 및 마지막 전체 실행에서 통과했습니다. 커뮤니티 코드를 수정하지 않았습니다.
- `npm run check:v1-changes -- --base origin/dev`: 통과. 스크립트가 커밋 diff만 검사하므로
  실제 tracked/untracked 작업 트리도 별도 검사해 V1 소스 변경 없음을 확인했습니다.
- `git diff --check`: 통과. 신규 파일의 줄 끝 whitespace도 별도 검사했습니다.
- 기존 React act/overlapping act 및 테스트용 API 진단 경고는 출력되지만 최종 실패는 없습니다.

**미검증/남은 작업:**

- 인증된 AI 세션·실제 availability/견적 성공 및 기기 E2E. 연결 기기 존재 자체는 인증 검증이 아닙니다.
- AI root OpenAPI는 여전히 내부 HTTP 8081로 301이며, 비인증 AI 세션·availability 호출은 401입니다.
- 서버 PR에는 실제 PostgreSQL 동시성·마이그레이션·인증된 API 검증이 미완료로 기록돼 있습니다.
- 다음 단계: 최종 확인 직전 availability·견적 재조회, 가격 등 확인 대상 변경 시 재확인,
  예약자 입력, 앱 소유 token/key/body intent, 기존 Booking mutation 연결, 결과 불명 복구,
  성공 응답 검증 및 필요 시 별도의 결제 동작. 현재는 해당 제출 동작을 제공하지 않습니다.

## 변경 파일

- `docs/api/reservation-payment.openapi.json`, `scripts/sync-reservation-payment-openapi.mjs`,
  `src/v2/shared/api/generated/reservationPayment.ts` — 실서버 계약·생성 타입.
- `src/v2/modules/booking/index.ts`, `reservations/index.ts`, `reservations/api/reservationApi.ts`,
  `reservations/hooks/useReservations.ts` — 공개 견적 API/Query.
- Booking의 `__tests__/reservationPayment.contract.types.ts`,
  `__tests__/reservationPayments.test.mjs`, `reservations/hooks/__tests__/useReservations.test.tsx`,
  `reservations/mock/records/fixtures.ts` — 기존 응답 호환·새 OpenAPI 오류 계약.
- Voice Assistant의 `model/reservationDraft.ts`, `model/voiceCommands.ts`,
  `model/voiceAssistantCommand.types.ts` — 출처·재조회·runtime 검증·초안 projection.
- `hooks/useVoiceCommands.ts`, `components/VoiceCommandResults.tsx`, `i18n/voiceAssistantResources.ts` — 표시·만료.
- `model/__tests__/reservationDraft.fixture.ts`, `reservationDraft.test.ts`, `voiceCommands.test.ts`,
  `voiceCommandEngine.integration.test.ts`, `hooks/__tests__/useVoiceCommands.test.tsx`,
  `components/__tests__/VoiceReservationDraft.test.tsx` — 모델·transport·화면·lifecycle 검증.
- `docs/architecture/adr/0001-production-dependency-graph.json` — 새 V2 모델의 실제 연결 그래프.
- 이 문서 및 #348 문서의 후속 상태 안내.
