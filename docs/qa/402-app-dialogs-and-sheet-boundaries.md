# 앱 확인창 및 시트 경계 검증

## 결과

- 전체 Jest: 231 suites / 2,770 tests 통과.
- npm run check:v2: 경계 검사, 신규 디자인 검사 fixture 8개, 기존 경계 fixture 76개 통과.
- npm run typecheck 통과.
- npm run test:regression: navigation 22 + i18n 96 + notifications 7 + map 50 + API 207 = 382개 통과.
- git diff --check 통과.
- V1 dependency delta: none. 새 UI는 V2, production 연결은 application composition 경계에서 처리함.

## 실제 화면 확인

- Android SM-F966N: 실제 로그인 세션의 프로필 사진 변경 창을 열어 앱 카드·버튼·다크 테마 표시를 확인함. 사진 선택/카메라를 실행하거나 프로필을 변경하지 않았음.
- Android: 실제 장소명에서 번역 언어팩 관리창을 열어 공통 카드, 언어 목록, 모델 관리, 닫기 표시를 확인함. 이 검증에서 모델 삭제/추가 다운로드는 실행하지 않았음.
- [프로필 사진 선택창](402-app-dialog-avatar.png), [번역 언어팩 창](402-app-dialog-translation.png).
- 현재 앱에서 AppDialogProvider와 MapSheetSurface가 실행되는 것을 확인함.
- iOS: 모달 닫힘 이후 콜백 실행 및 화면 이탈 시 콜백 취소는 컴포넌트 테스트로 검증했으며 실기기 화면은 미검증.
- 모든 오류/상점 종료/개인정보 내보내기 분기를 실서버에서 실제 실행한 것은 아님. 해당 분기는 테스트 검증과 구분함.

## 회귀 보호

- 공통 시트의 라이트·다크 및 드래그 오프셋 0/150/300/600에서 배경/콘텐츠 경계 동일성, 불투명 상세의 즉시 full-bleed 검증.
- 공통 확인창의 라이트·다크, 취소, 중복 열기, 하드웨어 뒤로가기, 취소 불가 옵션, 호출 화면 이탈, iOS 닫힘 이후 실행/지연 콜백 취소 검증.
- 실제 ProductionProviders에서 공통 확인창이 열리는 통합 테스트 추가.
- 기존 테스트의 일부 act/모의 API 네트워크 경고는 남아 있으며 테스트는 통과함.
- TSX 검사에서 한 번 발견한 box-shadow 문자열 파싱 오류는 React Native style 속성으로 전달하도록 고침.
- 기존 번역 baseline 해시는 새 확인 문구만 제외하도록 갱신하고 나머지 기존 문구 검사를 유지함.
- 실행 경로에 포함되지 않는 V1 settings의 Alert는 유지함. 현재 V2/application 경로에서 기본 Alert·Toast 호출은 남아 있지 않음.
