# 장소 진입 시 자동 번역

- 최신 요청에 따라 전환 버튼을 제거하고 준비된 대상 언어 모델로 현재 장소명만 자동 번역함. 원문·언어·모델 관리는 제목 길게 누르기/접근성 동작으로 제공.
- 언어팩 다운로드는 계속 명시적 선택이 필요함. 다운로드가 끝나면 현재 제목만 자동 번역. 국가/언어 분리, 국가 추천과 계정별 수동 대상 우선, 별도 앱 표시 언어, 캐시/중복 요청 공유/늦은 결과 세대 검사는 유지함.
- Google 출처 표시는 자동 번역이어도 유지함. ML Kit 지침은 Cloud Translation 출처 지침을 따르며, 해당 문서에서 사용자에게 보이는 결과 옆에 출처 배지를 요구함.
  - https://developers.google.com/ml-kit/language/translation/translation-terms
  - https://docs.cloud.google.com/translate/attribution
- 관련 Jest 3 suites / 67 tests, typecheck, check:v2(디자인 8 + 경계 76) 및 diff --check 통과.
- Android SM-F966N: 앱 개발 번들 재실행 후 실제 장소 70128이 버튼 터치 없이 大邱美術発電所로 표시됨. 전환 버튼 없음, 공식 Google 배지 유지 확인. 네트워크는 끄지 않았으며 기존 오프라인 QA와 구분함.
- iOS 실기기 검증은 하지 않음. V1 dependency delta: none. 커밋/푸시/PR 없음.
- [진입 후 자동 번역 화면](402-auto-place-translation.png)
