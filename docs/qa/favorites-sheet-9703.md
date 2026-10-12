# 즐겨찾기 시트 9703:11572

- 디자인: https://www.figma.com/design/XJ4uL6zQmulzrD7VQjpP5G?node-id=9703-11572
- 구현: V2 즐겨찾기 시트. 지도 튜토리얼은 유지한다.
- 즐겨찾기: 378dp 유리 시트 + 하단 8dp 여백, 20dp 제목, 음식점→음악 순 카테고리, 18dp 장소명, 16dp 주소, 114dp 사진 두 칸과 2dp 간격. 더보기는 Figma SVG 원본을 테마 색상으로 사용한다.
- 데이터: 기존 즐겨찾기 API와 사진 조회를 그대로 사용한다. Figma 예시 장소를 운영 데이터에 추가하지 않았다.
- 확장/드래그 시 목록 높이를 시트 위치에 맞춰 조정해 고정 하단 내비게이션과 겹치지 않게 한다.

## 2026-10-12 검증

- Android SM-N981N 실기기: 실제 저장된 장소/사진 표시, 시트 펼치기, 음악 필터의 빈 상태, 전체 복귀, 저장된 장소 미리보기 열기 확인.
- 화면: `/private/tmp/favorites-after.png`, `/private/tmp/favorites-expanded-final.png`, `/private/tmp/favorites-filter.png` (로컬 QA 기록).
- `FavoritePlacesBottomSheet`, `MapSheetBottomNavigation` Jest: 2개 스위트 / 9개 테스트 통과.
- TypeScript 검사 통과. V2 경계 검사 및 의존 그래프 갱신.
- iOS 실기기 화면은 이번 변경에서 검증하지 않았다.
- V1 dependency delta: none. 커밋/푸시 없음.
