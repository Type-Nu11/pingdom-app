# 지도 탭 시트 콘텐츠 경계 수정

- 구현 위치: V2. V1 dependency delta: none.
- 원인: 장소 시트에는 콘텐츠 viewport 수정이 적용됐지만 커뮤니티·즐겨찾기·예약은 전체 높이의 SheetInner를 유지하고 있었음. 배경만 animated bottom/좌우 inset/하단 radius를 따르므로 목록이 실제 유리 배경의 하단과 둥근 모서리 밖으로 노출됨.
- 수정: 기존 SheetContentViewport를 세 시트에 적용하고 배경과 같은 animated bottom, 좌우 gap, 상하단 radius를 전달함. SheetInner의 기존 8px 좌우 padding은 viewport inset으로 대체함. 고정 내비게이션, 작성 FAB, 메뉴는 viewport 바깥을 유지함.
- 회귀 테스트: 커뮤니티의 expanded/intermediate/resting inset 0/150/300에서 bottom·좌우·radius 및 목록 포함/내비게이션 제외를 검증함. 즐겨찾기와 예약에서도 resting 경계 검증을 추가함.
- 관련 Jest: 6 suites / 41 tests 통과. 기존 pagination 테스트의 overlapping act 경고는 남아 있음.
- npm run check:v2: 경계 검사 및 76 tests 통과. npm run typecheck 및 git diff --check 통과.
- Android SM-F966N: 실제 이미지가 있는 커뮤니티 중간 높이, 핸들로 펼침, 드래그로 다시 줄인 뒤 하단 경계를 화면 확인함. 목록 텍스트/이미지가 하단 여백으로 새던 증상이 보이지 않음.
- 즐겨찾기·예약의 이번 변경은 코드/컴포넌트 테스트로 검증했으며 이번 수정 후 실기기 화면 재검증은 하지 않음. iOS 실기기도 미검증.
- [중간 높이](402-community-clipping-medium.png), [펼침](402-community-clipping-expanded.png)
