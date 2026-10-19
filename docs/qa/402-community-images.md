# 커뮤니티 Wikimedia 이미지 요청 수정

- 구현 위치: V2 `CommunityImage`. V1 dependency delta: none.
- 증상: 실제 서버 게시글 21의 사진 3장과 연결 장소 70149의 썸네일이 대체 아이콘으로 표시됨.
- 원인: Android에서 동일 Wikimedia URL을 기본 요청하면 HTTP 403. 응답 본문에서 User-Agent 설정 요구를 확인함. 정직한 PingDom 앱 식별 헤더를 추가한 요청은 HTTP 200 image/jpeg, 네이티브 이미지 크기 조회도 1920×1280으로 성공함.
- 수정: HTTPS thumb.wikimedia.org / upload.wikimedia.org에만 앱 버전과 프로젝트 연락 URL을 포함한 User-Agent 전달. 원본 URL, API 계약, 다른 이미지 제공자 요청은 유지함.
- Android SM-F966N 실기기: 수정된 실제 컴포넌트로 게시글 21을 다시 열어 첫 사진, 다음 사진, 연결 장소 썸네일 표시를 화면 확인함. 세 번째 사진으로 스와이프하는 검증은 하지 않음.
- iOS: 이번 이미지 요청 변경의 실기기 검증은 하지 않음.
- 검증: 관련 Jest 10 suites / 81 tests 통과, npm run typecheck 통과, npm run check:v2 76 tests 통과, git diff --check 통과.
- 테스트의 기존 API 네트워크 경고와 overlapping act 경고는 남아 있으며 모든 테스트는 통과함.
- 스크린샷: [수정 후 금호강 게시글](402-community-images-fixed.png)
- 정책 문서: https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_User-Agent_Policy/en
