# Map HotPlace·전국 Trend 조회 계약 (이슈 #190)

서버가 `GET /map/place-rankings`를 배포하면서 계약이 확정되었다. 서버 스냅샷은 `map-place-ranking.openapi.json`에 있다.

- 확인 대상: `http://54.116.166.107:8080/v3/api-docs` (`info.title=OpenAPI definition`, `version=v0`)
- 확인일: 2026-08-19 (제안 시점 실측일 2026-08-18)
- 확정 이슈: #190 / 연동 이슈: #195 / 임시 구현: #51

## 1. 확정된 계약

`GET /map/place-rankings`

| 이름 | 타입 | 필수 | 기본값 | 비고 |
| --- | --- | --- | --- | --- |
| `scope` | enum `LOCAL`, `NATIONAL` | X | `LOCAL` | 우리 지역 / 전국 구분 |
| `latitude`, `longitude` | number | X | - | `scope=LOCAL`에서 사용 |
| `radiusKm` | number | X | - | 서버 기본값 미문서 |
| `period` | enum `DAY`, `WEEK`, `MONTH` | X | `WEEK` | 집계 기간 |
| `category` | string | X | - | 카테고리 필터 |
| `page` | integer | X | 1 | |
| `limit` | integer | X | 20 | |

응답 `PlaceRankingResponse`: `scope`, `period`, `periodStart`, `periodEnd`, `criteria`, `generatedAt`, `requestedRadiusKm`, `appliedRadiusKm`, `radiusExpanded`, `items`, `page`, `limit`, `totalCount`, `totalPages`, `hasNext`

`items[]`(서버 schema 이름 `Item`): `rank`, `placeId`, `placeName`, `category`, `latitude`, `longitude`, `distanceMeters`, `score`, `likeCount`, `postCount`, `imageUrl`, `thumbnailUrl`, `imageSource`, `representativePostId`, `representativeMediaId`, `registrantUsername`, `bookmarked`

## 2. 제안과 다른 점 (클라이언트가 방어해야 하는 부분)

1. `scope`가 optional이고 기본값이 `LOCAL`이다. 클라이언트는 항상 명시해서 보낸다.
2. `latitude`·`longitude`·`radiusKm`가 optional이고, `scope=LOCAL`에서 좌표를 생략했을 때의 동작이 문서화되어 있지 않다. 클라이언트는 좌표가 준비된 뒤에만 `LOCAL`을 호출한다.
3. `criteria`와 `imageSource`가 enum이 아닌 자유 string이다. `normalizePlaceRankingCriteria`, `normalizePlaceRankingImageSource`로 좁히고 모르는 값은 각각 `null`, `NONE`으로 처리한다.
4. 400 응답과 `ErrorResponse` 참조가 이 operation에 문서화되어 있지 않다. 오류 표시는 공통 `getApiErrorUx` 처리에 맡긴다.
5. **인증이 필요하다.** 토큰 없이 호출하면 `401 {"message":"유효하지 않은 토큰입니다.","code":"INVALID_TOKEN"}`이 온다. 제안했던 비로그인 공개는 반영되지 않았으므로 비로그인 사용자에게는 이 목록을 요청하지 않는다.
6. 응답 schema에 required·nullable 표기가 없다. `placeId` 외 필드는 누락될 수 있다고 보고 타입을 선택 필드로 둔다.

## 3. 클라이언트 대응 위치

- `src/features/place/model/placeRanking.types.ts` — 배포 schema 기준 타입
- `src/features/place/model/placeRanking.ts` — 알 수 없는 enum 처리, 카드 이미지 출처 결정
- `src/features/place/api/placeRankingApi.ts` — `scope` 명시 전송, `page`·`limit`·`radiusKm` 방어적 보정
- `src/features/place/hooks/useMapPlaceRankings.ts` — scope별 독립 query key, 좌표 준비 전 `LOCAL` 조회 차단
- `src/features/profile/dev/map-ranking-api-check/` — 실기기 검증 화면

## 4. 남은 확인

- `criteria`의 실제 값 집합과 산식, 동점 tie-break 규칙이 문서화되지 않았다. 실기기 응답으로 확인한 뒤 이 문서에 기록한다.
- `LOCAL`과 `NATIONAL`의 중복 허용 여부, 결과 부족 시 반경 확장 임계값도 응답의 `radiusExpanded`로만 관찰 가능하다.
- 위 두 항목은 #195 연동 중 확인해 서버에 회신한다.
