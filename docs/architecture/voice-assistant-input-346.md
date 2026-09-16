# #346 V2 입력 경계 구현 및 STT blocker

## 상태와 기준

- 브랜치: `feat/346-voice-assistant-input-stt`. 기준: 최신 `origin/dev`
  `f7cb022` (#345를 병합한 PR #353), 2026-09-16 fetch 후 HEAD와 일치.
- 구현 위치: V2. 사용자 요청에 따라 기능·페이지 단위 로컬 커밋으로 정리하며 푸시는 하지 않습니다. #345 parser/policy 변경 없음.
- **입력 UI와 어댑터 기반 lifecycle 구현 완료. 실 STT 연결 및 기기 검증 미완료.**
  아래 blocker가 해소되기 전 #346 전체 완료 또는 실음성 사용 가능으로 표시하지 않습니다.

## 조사와 선택

실제 production은 `src/application/navigation/RootNavigator.tsx` →
`src/app/navigation/MainNavigator.tsx`를 사용합니다. 별도의 `src/v2/app/navigation`만
바꿔서는 production에 노출되지 않습니다. 기존 production V2 `MapScreen`의 내 위치 버튼 바로 아래에 별도 48 dp FAB를 배치합니다.
FAB에서 기존 입력 화면을 full-screen modal로 열고 지도/바텀시트 상태는 유지합니다.
설정 화면의 assistant 입력 진입점은 제거했습니다. 설정은 향후 마이크 권한·개인정보·음성
환경설정만 담당하며 미구현 설정 placeholder는 추가하지 않았습니다.
모달의 Android back은 입력 세션을 닫고 기존 지도/바텀시트 상태로 복귀합니다.
화면 코드에서 V1을 참조하거나 V1 navigation 파일을 수정하지 않습니다.

V2 공통 `AppThemeProvider`, typography, Safe Area, i18next resources를 사용합니다.
기존 AppState 처리는 AppProviders/query focus 및 방문 인증 hook에 있고,
위치 권한은 expo-location, 알림 권한은 플랫폼별 구현을 사용합니다.
새 입력 controller는 해당 위치/알림 권한이나 앱 전역 오류 상태에 의존하지 않습니다.

현재 package.json은 Expo ~55.0.28 / React Native 0.83.6이며 STT 패키지는 없습니다.
Android main manifest에 RECORD_AUDIO/recognition service query가 없고,
iOS Info.plist에 NSMicrophoneUsageDescription/NSSpeechRecognitionUsageDescription이
없습니다. 기존 app.config.js에도 STT plugin이 없습니다.

음성 처리 주체, 동의 문구, 전송 및 보관/학습 정책이 이슈와 #345 계약에서 미확정입니다.
따라서 **실 STT 엔진을 선택하지 않았으며 새 패키지/네이티브 권한도 추가하지 않았습니다.**
공식 문서로 호환성이 입증되었다고 주장하지 않습니다. production 기본값은
`unavailableSpeechAdapter`로 마이크가 비활성화되며, 사용 불가 안내와 텍스트 입력을 제공합니다.
테스트용 어댑터가 실제 녹음·인식을 수행하는 것으로 표시하지 않습니다.

## 구현과 경계

- `model/voiceInput.ts`: 9개 입력 상태, 권한 상태, STT session 인터페이스,
  controller, 공통 validation, 로컬 제출 callback.
- `hooks/useVoiceInput.ts`: navigation focus/blur, AppState active/inactive/background,
  Android focus/blur, unmount 연결과 listener 해제.
- `screens/VoiceAssistantScreen.tsx`: 시작/중지/취소/설정/텍스트/확인/닫기,
  최종 텍스트 검토, 접근성 label/state/live region, 키보드와 Safe Area 대응.
- `i18n/voiceAssistantResources.ts` 및 `shared/i18n/resources.ts`: ko/en 문구,
  `voiceAssistant.invalidResponse`, clarification, 9개 상태와 권한/오류 안내.
- `features/map/screens/MapScreen.tsx`, `MapTopOverlay.tsx`, `MapTopOverlay.styles.ts`:
  production 지도 FAB, Safe Area와 별도 수직 배치, 공통 theme 및 ko/en 접근성 label.
- `features/map/hooks/useMapAssistantEntry.ts`, `components/MapAssistantModal.tsx`:
  동기 ref로 연속 탭 차단, 모달 세션, focus/flag 해제 시 닫기.
- `shared/config/env.ts`, `.env.example`, config README: flag 기본 false.
- map component/hook/composition 테스트와 runtime config 테스트: FAB 및 정책 회귀.
- `features/voice-assistant/index.ts`: 공개 UI와 입력 인터페이스.
- `model/__tests__/voiceInput.test.ts`, `screens/__tests__/VoiceAssistantScreen.test.tsx`:
  controller·UI·설정의 입력 진입 제거·theme·i18n 검증.

`SpeechInputAdapter`는 `available`, permission 조회/요청과 세션 생성을 제공합니다.
권한은 `undetermined`, `granted`, `denied`, `blocked`로 구분합니다. 실제 adapter는
OS의 마이크와 speech authorization/restricted 상태를 함께 정규화해야 합니다.
blocked는 권한 재요청 없이 설정 안내로 연결하며, denied도 텍스트를 계속 사용할 수 있습니다.
화면 진입만으로 권한을 요청하거나 녹음하지 않습니다.

세션은 start/stop/cancel을 소유합니다. cancel은 listener를 즉시 떼고 pending startup,
녹음·인식·native buffer를 중단/해제하는 idempotent 계약입니다. controller는 종료 시
세대 번호를 먼저 바꿔 늦은 permission/final/error callback을 무효화하고 AbortSignal,
세션, timer를 정리합니다. 부분 transcript, 최종 draft, 중복 방지용 텍스트는 세션 취소 시
지웁니다. 인식은 최대 60초, 사용자 stop 뒤 최종 결과 대기는 최대 10초로 제한합니다.
interruption/noSpeech/unavailable/failed는 고정 enum으로 격리합니다.
**실제 native 정리는 아직 adapter 구현 및 기기 검증이 필요합니다.**

부분 결과는 표시만 하며 draft나 callback으로 전달하지 않습니다. 첫 final에서 세션을
정리하여 중복 final을 무효화합니다. 사용자의 **입력 확인**에서만 `OnFinalInput`을 호출합니다.
음성 최종 결과와 텍스트는 같은 trim/필수/최대 2,000자 validation을 통과합니다.
callback 호출 전에 동기적으로 입력을 claim해 연속 탭과 같은 정규화 문자열의 재제출을
차단합니다. callback 오류는 자동 재시도하지 않습니다. 같은 요청을 의도적으로 다시
입력하려면 취소로 새 요청을 시작합니다. 취소/화면 이탈/background는 callback signal도
abort하며, 늦게 도착한 결과는 화면에 반영하지 않습니다.

production callback은 `retainInputLocally`이며 저장소나 서버를 호출하지 않고
`localOnly`를 반환합니다. callback은 `{ text, source, signal }`을 받고 결과를 돌려주는
명시적 상위 경계입니다. 외부 callback을 주입할 때는 `submissionNotice`도 필수로
제공해야 합니다. #347 연결 시 실제 전송 시점/정책과 일치하는 안내가 필요합니다.
세션 API, streaming, Gateway, command router, 검색 실행, 예약 mutation은 구현하지 않습니다.
assistant 문구는 평문 안내로만 렌더링하고 성공 UI나 TTS를 만들지 않습니다.

## 지도 FAB 노출 정책

`EXPO_PUBLIC_ENABLE_VOICE_ASSISTANT=true`일 때만 진입점을 제공합니다. development,
staging, production 모두 미설정/false는 비노출이며 잘못된 값은 config error로 처리합니다.
이 값은 번들에 포함되므로 변경 후 Expo 재시작 또는 빌드가 필요합니다. 서버/STT 연결을
활성화하는 값이 아니며, 현재는 텍스트 로컬 입력 미리보기만 제공합니다.

내 위치 버튼은 기존 크기/handler/눌림 동작을 유지하고 FAB를 8 dp 아래에 별도 배치합니다.
Safe Area 전체를 포함한 overlay 실측 높이와 바텀시트 Animated.Value를 비교하여,
시트가 FAB 아래 8 dp 여백을 침범하면 opacity/touch/accessibility를 모두 차단합니다.
숨겨도 FAB slot의 layout은 유지하여 보임/숨김에 따른 측정 진동을 막습니다. 창 크기와
bottom inset도 함께 확인하며 검색 중·expanded 시트·지도 focus 상실 시에는 진입점을
제거합니다. flag off에서는 assistant용 sheet listener도 등록하지 않습니다.

## 개인정보 및 로그

녹음/파일 저장/네트워크/analytics/로그를 추가하지 않습니다. transcript는 화면/controller
메모리에만 있고 종료 시 참조를 제거합니다. JavaScript 메모리의 물리적 zeroization을
보장한다는 의미는 아닙니다. 원문 오류도 저장·로그하지 않고 고정 오류로 대체합니다.
JWT, provider credential, system instruction을 입력 경계에서 취급하지 않습니다.
후속 adapter도 파일 저장과 로그를 금지해야 하며, native/provider 보관 동작은 별도 검증해야 합니다.

## 남은 blocker 및 실기기 상태

1. STT 방식(온디바이스/OS 서비스/외부 provider), 처리 주체, 지원 언어, 동의·개인정보
   안내, 음성/텍스트 전송 범위, 보관·학습 제외·리전, 최소화/redaction 정책 확정.
2. 정책에 맞는 최소 STT adapter 선택 후 공식 문서 기반 Expo SDK 55/RN 0.83
   호환성 확인, Android/iOS native 설정과 실제 빌드 검증. OS STT가 항상 온디바이스라고
   가정하거나 지원되지 않는 기기에서 원격 인식으로 자동 fallback하지 않음.
3. Android/iOS 기기에서 권한 미결정/허용/거부/영구 거부, 실제 시작/stop/cancel,
   background/unmount, 전화·다른 오디오 interruption, listener/buffer 해제 검증.

2026-09-16 장치 조회: `adb devices -l` 연결 기기 없음. `xcrun xctrace list devices`는
Mac만 온라인이며 iPhone 2대는 offline입니다. 실제 기기 녹음/인식 QA와 native 빌드는
수행하지 않았습니다. mock 테스트는 native 동작 성공 증거가 아닙니다.

## 검증

- 관련 Jest: 지도 FAB·기존 overlay·입력 feature·entry hook 6 suites / 207 tests 통과.
- `npm run check:v2`, `npm run typecheck`: 통과.
- `npm run test:navigation`: 22개 통과.
- `npm run test:regression`: 227개 통과 (최종 validate:pr에 포함).
- `npm run validate:pr`: 통과. 경계/타입, ownership 2개, 전체 Jest 107 suites /
  925 tests, navigation 포함 회귀 227개 통과. 일부 기존 테스트에 React act 경고가 있으나 실패 없음.
- `npm run check:v1-changes -- --base origin/dev`, `git diff --check`: 통과.
- V1 스크립트는 커밋 범위만 검사하므로 작업 트리와 untracked 파일도 별도 확인했습니다.
  총 21개 변경 파일은 V2/docs/.env.example에 한정되며 신규 파일 trailing whitespace 검사도 통과했습니다.
- sandbox에서 tsx IPC가 EPERM으로 차단되어 승인된 sandbox 외부 실행으로 검증했습니다.
- 스타일 정리 중 발생한 theme 회귀 4건은 테스트로 발견해 수정했습니다.

V1 dependency delta: **none**. `legacy-exception`: **불필요**.
