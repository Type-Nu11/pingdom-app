# MVP API 계약 검토 기록

이 파일은 계약 자체가 아니라 담당자 승인 증빙이다. OpenAPI 변경 PR마다 아래 표를 갱신한다.

| 영역 | 필수 확인 항목 | 담당자 | 상태 | 리뷰/코멘트 링크 |
| --- | --- | --- | --- | --- |
| 장소 상세 | `PlaceSummary`/`PlaceDetail`, `LiveStatus`, 시간대 | 지정 필요 | PENDING | - |
| Trust | `TrustSummary`, 투표 집계·만료·신뢰도 | 지정 필요 | PENDING | - |
| 쿠폰 | Offer/Coupon 상태, 중복 발급, 사용·만료 | 지정 필요 | PENDING | - |
| 상점 | Claim, availability, merchant reservation 권한·전이 | 지정 필요 | PENDING | - |
| Map 랭킹 | `scope`/`period`/`criteria`, 카드 이미지 source, 빈 결과·400 계약 | 지정 필요 | PENDING | #190 |

승인 기준:

- 요청/응답 DTO가 담당 구현과 일대일로 대응한다.
- 정상·오류 예시로 구현과 프론트 분기가 가능하다.
- nullable과 enum의 `UNKNOWN` 처리가 확인되었다.
- 상태 전이의 중복, 만료, 권한 오류가 누락되지 않았다.
- 변경이 breaking이면 `/api/v2` 계획과 migration 기간이 함께 승인되었다.
