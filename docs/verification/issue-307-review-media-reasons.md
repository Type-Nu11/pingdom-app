# #307 방문 후기 사진·복수 추천 이유 계약 구현

구현 위치: **V2**. 브랜치: `fix/307-review-media-reasons-contract`.
작업 시작 시 작업 트리는 깨끗했으며, fetch 후 HEAD와 origin/dev는 모두 `17893bc820d5c5b4509bc016cf08acf01a343488`였습니다. 구현 완료 보고 시점에는 커밋·푸시를 하지 않았습니다. 이후 사용자의 RCP 커밋 요청과 메시지 승인에 따라 기능·페이지별로 커밋했습니다. 푸시 및 feature 폴더 이동은 하지 않았습니다.

## 실서버 계약 확인

- URL: https://www.typenull.xyz/v3/api-docs
- HTTP: **200**
- 응답 Date: **2026-09-16 11:37:02 UTC / 20:37:02 KST**
- 응답 헤더의 request ID: `f164c774-f0d4-4a61-ae23-9bbff942885b`
- 전체 원본 SHA-256: `10cac55c1e57db3a20c8b36b2b4728bf05b20a3db501cbf23e243bdeecaaa2fc`
- 내려받은 실서버 원본으로 scoped snapshot을 동기화하고 openapi-typescript로 타입을 생성했습니다.

| METHOD/PATH | 실제 operationId | 계약 |
|---|---|---|
| POST /places/{placeId}/reviews/media | upload_1 | 인증, multipart `file`, JPEG/PNG, 201, reviewMediaId/imageUrl/contentType/fileSize/expiresAt |
| DELETE /places/{placeId}/reviews/media/{reviewMediaId} | cancel_4 | 미연결 본인 사진 취소, 204 |
| POST /places/{placeId}/reviews | create_3 | content 최대 2,000자, recommendReasons 1~5개, reviewMediaIds 0~3개, 200 |

업로드 오류: 400/401/403/404/413/415/503. 취소 오류: 401/403/404/409.
서버 문서에 JPEG/PNG와 임시 업로드 24시간 만료가 명시되어 있습니다. 숫자로 된 파일 용량 상한은 문서에 없어 추정하지 않았으며, 413을 사용자 안내로 변환합니다.
신규 작성 요청에는 deprecated `recommendReason`, `imageUrls`를 넣지 않습니다.
실계약 동기화로 함께 바뀐 availability operationId(`list_6`)와 필수 응답 필드(`communityViewCount`, `productName`)의 consumer/fixture만 최소 수정했습니다.

## 추천 이유 매핑

| UI key | 서버 enum |
|---|---|
| kind | FRIENDLY |
| easyToFind | EASY_TO_FIND |
| delicious | GOOD_FOOD |
| multilingual | MULTILINGUAL_SUPPORT |
| parking | PARKING |
| photoSpot | PHOTO_SPOT |
| clean | CLEAN |

선택 순서를 유지하고 중복을 제거합니다. 빈 값·5개 초과·알 수 없는 key를 거부합니다. 번역 문구는 요청 직렬화에 사용하지 않습니다. 공통 매핑은 생성 schema의 enum 타입으로 검사합니다.

## 제출 및 실패 처리

1. 내용·이유·사진 개수와 모든 사진 형식을 업로드 전에 검증합니다.
2. picker의 uri/fileName/mimeType으로 RN FormData 파일 파트를 만들고 순차 업로드합니다. base64나 파일 전체 읽기를 하지 않습니다.
3. 반환된 유효한 reviewMediaId를 사진 순서대로 모아 후기 생성에 사용합니다. 사진이 없으면 업로드를 생략합니다.
4. 업로드 또는 생성 실패 시 확보한 미연결 ID를 순차 best-effort 취소합니다. 취소 실패는 원래 오류를 덮지 않으며 삭제 완료로 표시하지 않습니다.
5. 성공 후에는 연결된 사진을 취소하지 않습니다. 서버 응답을 cache에 반영한 뒤 완료 콜백으로 이동합니다.

전체 upload→create 흐름에 제출 잠금을 적용합니다. 실패 시 입력은 유지되며 재시도는 새 업로드부터 시작합니다. 화면은 업로드/제출 상태와 형식·용량·인증·권한·일시 서버·네트워크·제출 오류를 ko/en i18n 문구로 표시합니다. 로컬 경로나 서버 오류 본문을 화면/로그/analytics에 추가하지 않았습니다.

## 읽기 호환성과 cache

- 장소 상세는 reviewMedia URL과 recommendReasons를 우선 사용하고 순서를 보존합니다. 새 필드가 없을 때만 기존 imageUrls/recommendReason을 읽습니다.
- MapScreen은 enum에 대응하는 i18n key를 번역합니다. 신규 enum을 그대로 표시하지 않습니다.
- 해당 장소의 기존 첫 페이지 후기 cache에만 실제 서버 응답을 반영하고, 이후 페이지에는 삽입하지 않습니다.
- 해당 장소 후기 목록, 상세, verification-media, exploration-media를 무효화합니다.
- 방문 인증 session은 placeId가 일치하는 query만 무효화합니다.
- 기존 My Page 후기 query를 무효화하며 별도의 My Page 응답을 만들어 넣지 않습니다. cache 재조회 실패를 후기 제출 실패로 바꾸지 않습니다.
- #357에서 도입된 예외 목록을 확인했습니다. 기존 profileQueryKeys 예외(제거 이슈 #358)는 유지하고, 제거된 profile.types import의 stale 예외는 삭제했습니다. 새 cross-feature 예외는 추가하지 않았습니다.

## 자동 검증

- 실패 테스트를 먼저 실행해 기존 번역 문구 직렬화와 로컬 사진 누락을 재현했습니다.
- 관련 model/API/flow 테스트: 사진 0/1/3장, enum 전체 매핑/순서/중복/잘못된 입력, 업로드 부분 실패, 생성 실패, 정리 실패, 중복 실행, draft 보존/재시도, RN 파일 파트와 인증/Content-Type, 204, 오류 status 변환, snapshot 제약, cache 대상 확인.
- UI 테스트: 기존 화면 회귀와 실제 hook을 이용한 ko/en 업로드 실패→draft 보존→재시도→성공, 두 처리 단계의 버튼 비활성화, 성공 전 이동 방지.
| 검사 | 최종 결과 |
|---|---|
| 관련 후기 model/API/flow/snapshot/cache | 40개 통과 |
| 관련 후기 screen (실제 hook 포함) | 21개 통과 |
| 장소 상세 presentation | 12개 통과 |
| check:place-exploration-api-types | 통과 |
| check:api-contract | 통과 |
| check:api-types | 통과 |
| check:v2 | 통과, boundary 테스트 60개 |
| typecheck | 통과 |
| test:v2-api | 168개 통과 |
| test:regression | 255개 통과 (navigation 22, i18n 11, notifications 7, map 47, API 168) |
| validate:pr | 통과: Jest 120 suites / 1,065 tests 및 회귀 검사 전체 |
| check:v1-changes -- --base origin/dev | 통과 |
| git diff --check | 통과 |

최초 전체 실행에서 multipart 기존 헤더 보존 검사와 i18n baseline 해시 검사가 실패했으며, 수정 후 위 최종 검사를 다시 통과했습니다. tsx의 IPC 소켓 제한으로 필요한 npm 검사는 sandbox 밖에서 실행했습니다.

## 수동 검증 및 남은 확인

Android SM-F966N 기기 연결은 확인했습니다. 현재 Metro(8081)는 다른 작업 디렉터리 `/Users/oneriver/Developer/PingDom_app-333`에서 실행 중이며 전면 앱도 Brave였습니다. 이 환경을 이번 브랜치의 실행 증거로 사용하지 않았습니다.

**Android 실제 서버 제출은 미검증입니다.** 이 브랜치의 앱 실행 및 인증된 테스트 계정으로 사진 0/1/3장, 복수 이유, 네트워크 실패/재시도, 완료 후 상세 재조회를 확인해야 합니다. 실제 서버 쓰기 요청을 보내거나 서버 저장 성공을 주장하지 않았습니다. iOS 수동 확인도 수행하지 않았습니다. 실서버 계약 부재/상충 blocker는 없습니다.

- **V1 dependency delta: none**
- **legacy-exception: 불필요** (V1 소스 변경 없음)

## 변경 파일

- `docs/api/place-exploration.openapi.json`
- `scripts/check-place-exploration-contract.mjs`
- `scripts/sync-place-exploration-openapi.mjs`
- `scripts/v2-boundaries/exceptions.json`
- `src/v2/app/i18n/__tests__/composition.test.ts`
- `src/v2/features/map/screens/MapScreen.tsx`
- `src/v2/features/place-detail/model/placeDetail.types.ts`
- `src/v2/features/place-detail/model/placeDetailPresentation.ts`
- `src/v2/features/place-visit-verification/api/visitVerificationApi.ts`
- `src/v2/features/place-visit-verification/hooks/useSubmitVisitVerification.ts`
- `src/v2/features/place-visit-verification/i18n/visitVerificationResources.ts`
- `src/v2/features/place-visit-verification/model/visitVerification.ts`
- `src/v2/features/place-visit-verification/screens/VisitVerificationReviewScreen.tsx`
- `src/v2/features/place-visit-verification/screens/__tests__/VisitVerificationScreens.test.tsx`
- `src/v2/shared/api/__tests__/placeDetailPresentation.test.mjs`
- `src/v2/shared/api/__tests__/visitVerification.test.mjs`
- `src/v2/shared/api/apiClient.ts`
- `src/v2/shared/api/generated/placeExploration.ts`
- `src/v2/shared/api/mock/features/place-exploration/fixtures.ts`
- `src/v2/shared/api/__tests__/reviewMedia.contract.types.ts`
- `src/v2/shared/api/reviewReasons.ts`

- `docs/verification/issue-307-review-media-reasons.md` — 본 완료 보고서
