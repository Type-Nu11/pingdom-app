# Map HotPlace·전국 Trend 조회 계약 (이슈 #190)

이 문서는 **서버 확정 전 프론트엔드 제안**이다. 확정 계약이 아니며, 서버가 `/v3/api-docs`에 반영하기 전까지 구현 기준으로 사용하지 않는다. 제안 명세는 `map-hotplace-trend.proposal.openapi.json`에 있다.

- 실측 대상: `http://54.116.166.107:8080/v3/api-docs` (`info.title=OpenAPI definition`, `version=v0`)
- 실측일: 2026-08-18
- 확정 요청 이슈: #190 / 연동 이슈: #195 / 임시 구현: #51

## 1. 배포 spec 실측 요약

- HotPlace·Trend 전용 조회 operation이 없다. `NEW_HOTPLACE`는 알림 유형 enum(`notificationType`)에만 존재한다.
- `GET /map/posts`는 `page`, `limit`만 지원한다. 위치·반경·지역, 랭킹, 기간 parameter가 없다.
- `GET /places`는 `sort=LATEST|NEAREST|POPULAR`, `latitude`/`longitude`/`radiusKm`, `category`, `touristCategory`를 지원하지만 `POPULAR`의 산식·집계 기간·동점 정책이 문서화되어 있지 않고, `PlaceListItem`에 카드 이미지 필드가 없으며 400 응답 스키마도 없다.
- `GET /places/recommendations`는 좌표가 필수인 개인화 추천이라 전국 스코프와 랭킹 기준을 대신할 수 없다.
- `GET /places/{id}/media/exploration`은 장소 단위 조회라 목록 카드 이미지로 쓰면 place당 1콜(N+1)이 된다.

## 2. 현재 클라이언트 임시 구현 (제거 대상)

`src/features/place/hooks/useHotPlaceIds.ts`는 `GET /map/posts`를 `limit=100`으로 **전체 페이지까지 반복 호출**한 뒤 `likeCount >= HOT_PLACE_MIN_POST_LIKE_COUNT`(5)로 핫플을 계산한다. 게시물이 늘수록 요청 수와 페이로드가 선형 증가하고, 순위 기준이 서버와 불일치한다. #195에서 공식 API로 교체한다.

## 3. 제안 계약

`GET /map/place-rankings`

우리 지역 핫플과 전국 트렌드를 **단일 operation + `scope` parameter**로 제안한다. 응답 스키마와 랭킹 메타(기간·기준·생성 시각)가 동일하고, 클라이언트는 `scope`를 query key에 포함해 두 목록의 cache를 독립적으로 관리할 수 있다. 서버가 별도 operation(`/map/hotplaces`, `/map/trends`)을 선호하면 응답 스키마만 공유해도 FE 요구사항은 충족된다.

| 항목 | 제안 |
| --- | --- |
| 범위 구분 | `scope=LOCAL`(우리 지역 핫플) / `scope=NATIONAL`(전국 트렌드), 필수 |
| 우리 지역 기준 | `latitude`+`longitude`+`radiusKm`(기본 5.0, 최대 50.0). `scope=LOCAL`에서 좌표 누락 시 400 |
| 집계 기간 | `period=DAY\|WEEK\|MONTH`, 기본 `WEEK`. 응답에 `periodStart`/`periodEnd`(UTC)를 포함 |
| 랭킹 기준 | 응답 `criteria` enum(`POST_LIKE_COUNT`, `POST_COUNT`, `CHECK_IN_COUNT`, `COMPOSITE`)으로 명시. 정렬은 `score` DESC, 동점은 `placeId` ASC |
| 중복 정책 | LOCAL·NATIONAL 독립 집계, 동일 장소 양쪽 노출 허용. 클라이언트는 중복 제거를 하지 않는다 |
| fallback | LOCAL 결과 부족 시 서버가 반경을 확장하고 `appliedRadiusKm`, `requestedRadiusKm`, `radiusExpanded`로 알린다 |
| category filter | `category` query. `GET /places`의 category 값과 동일 집합을 사용한다 |
| 카드 이미지 | `imageUrl`·`thumbnailUrl`과 출처 enum `imageSource`(`POST`, `PLACE_EXPLORATION_MEDIA`, `NONE`). 목록 응답에 포함해 N+1을 없앤다 |
| 식별자 | `placeId` 필수, 이미지 출처에 따라 `representativePostId` 또는 `representativeMediaId` |
| pagination | `page`(기본 1)·`limit`(기본 20, 최대 50) + `totalCount`/`totalPages`/`hasNext`. collapsed 5건, expanded 20건 사용 |
| 개인화 | 랭킹 산정은 비개인화. 비로그인 호출 허용. `bookmarked`는 로그인 시에만 값, 비로그인은 `null` |
| 빈 결과 | 200 + 빈 배열 + `totalCount: 0`, `totalPages: 0`, `hasNext: false` |
| 오류 | 400 + 배포 spec과 동일한 `ErrorResponse`(`message` 필수, `code` nullable) |

`docs/api/README.md`의 공통 규칙(1-base page, `id ASC` tie-break, nullable 키 유지, UTC 정규화)을 그대로 따른다.

## 4. 서버 확정이 필요한 최소 항목

1. HotPlace·Trend를 구분하는 정확한 METHOD + PATH
2. 우리 지역 기준의 확정 형태(좌표+반경 / 행정구역 코드 / 사용자 설정 지역)
3. 랭킹 산식, 집계 기간, 동점 tie-break
4. 카드 이미지의 공식 source와 목록 응답 포함 여부
5. LOCAL·NATIONAL 중복 허용과 결과 부족 시 fallback
6. 빈 결과·400 응답 스키마, enum·nullable 명세

확정되면 이 문서의 "제안"을 확정 계약으로 갱신하고, `map-hotplace-trend.proposal.openapi.json`은 배포 `/v3/api-docs` 기준으로 대체한다.
