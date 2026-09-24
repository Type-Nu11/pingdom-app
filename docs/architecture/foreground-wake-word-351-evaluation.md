# #351 foreground “헤이 핑디” Wake Word 엔진 검토

검토일: 2026-09-23. 기준: `feat/351-foreground-wake-word` = `origin/dev` (`f9b4e27`, PR #380 병합).
구현 위치는 **V2**이며 V1 dependency delta 목표와 현재 결과는 `none`이다.

## 결정

현 시점에 제품에 넣을 엔진을 확정할 수 없다. 따라서 감지기, 네이티브 의존성, 모델, 접근성 상태를 실제 기능처럼 추가하지 않는다. 호출 전 음성을 서버나 일반 STT로 보내는 대체 구현도 하지 않는다. #351의 구현과 실기기 검증은 미완료이다.

| 후보 | 현재 SDK 계약 및 장점 | #351 차단 조건 |
| --- | --- | --- |
| Picovoice Porcupine | [React Native SDK](https://picovoice.ai/docs/quick-start/porcupine-react-native/)는 RN 0.73+, Android API 21+, iOS 16+를 명시한다. 이 프로젝트는 RN 0.83.6 / Expo 55이고 Expo는 [개발·네이티브 빌드에서 외부 네이티브 라이브러리](https://docs.expo.dev/workflow/customizing/)를 허용한다. [SDK 소스의 `PorcupineManager.fromKeywordPaths`](https://github.com/Picovoice/porcupine/blob/master/binding/react-native/src/porcupine_manager.tsx)는 AccessKey, 플랫폼별 `.ppn`, 감지 callback, 오류 callback, 한국어 `.pv` 경로를 받고 `start`/`stop`/`delete`로 오디오를 관리한다. [한국어 지원](https://picovoice.ai/docs/faq/porcupine/)과 [기기 내 음성 처리](https://picovoice.ai/docs/privacy-policy/)가 명시되어 있다. | Android·iOS용 “헤이 핑디” `.ppn`이 없으며 Console에서 실제 문구의 검증·생성이 필요하다. `.ppn`은 [플랫폼별로 다르고](https://picovoice.ai/docs/porcupine/), 한국어 `.pv`도 앱에 포함해야 하므로 실제 앱 크기 증가는 파일과 빌드 후 측정해야 한다. 초기화에 AccessKey가 필수인데 [비밀 유지가 요구](https://picovoice.ai/docs/porcupine/)되고 이 프로젝트는 새 장기 API Key 앱 포함을 제외한다. [무료 체험은 상용 계약의 대체가 아니며](https://picovoice.ai/docs/terms-of-use/) 상용 사용 조건·배포 권한도 확정되지 않았다. RN/Expo 조합의 실제 Android·iOS 빌드 및 성능도 미검증이다. |
| openWakeWord + React Native 브리지 | [커뮤니티 RN 브리지](https://github.com/Incognitol07/react-native-openwakeword)는 RN 0.74+, Android API 24+, iOS 15.1+와 로컬 TFLite 추론을 표방한다. 16 kHz PCM을 별도 마이크 구현에서 공급하고 3개 모델 파일을 기기 파일 경로에 배치해야 한다. | [원 프로젝트는 영어만 지원](https://github.com/dscripka/openWakeWord#language-support)하며 “헤이 핑디” 한국어 모델이 없다. 포함된 사전학습 모델은 [비상업적 CC BY-NC-SA 4.0](https://github.com/dscripka/openWakeWord#license)이다. 한국어 모델의 독립 학습·권리 확인, 네이티브 녹음 경로와 Expo 빌드 검증이 선행되어야 한다. 브리지의 예시 메모리 수치는 특정 Android 앱 전체 PSS이므로 이 앱의 CPU·메모리·배터리 값으로 사용할 수 없다. |
| sherpa-onnx KWS | [전용 keyword spotting](https://k2-fsa.github.io/sherpa/onnx/kws/index.html)은 작은 키워드 디코더를 사용하고 로컬 추론이 가능하다. | 공개 [KWS 모델은 중국어·영어](https://k2-fsa.github.io/sherpa/onnx/kws/pretrained_models/index.html)이며 한국어 “헤이 핑디”를 검증할 모델이 없다. 공식 KWS 안내는 CLI·Android 앱을 제공하고 RN/Expo/iOS 통합 계약은 제공하지 않는다. 모델별 상용 재배포 권한도 [공개 질의가 남아 있다](https://github.com/k2-fsa/sherpa-onnx/issues/3760). |

Porcupine의 `PorcupineManager`는 감지 전 PCM을 앱 서버나 AI provider에 전송하는 API를 요구하지 않는다. 다만 SDK의 사용량 인증·네트워크 동작과 오디오 패킷 미전송은 제품 빌드의 네트워크 검사로 별도 확인해야 한다. [공식 안내](https://picovoice.ai/docs/quick-start/porcupine-react-native/)는 Android `RECORD_AUDIO`와 `INTERNET`, iOS `NSMicrophoneUsageDescription`, 두 플랫폼의 네이티브 모델 번들링을 요구한다. 이 프로젝트에는 마이크 권한 설명이 이미 있으나 Porcupine 패키지와 모델은 없다. 공식 문서에는 이 앱과 기기별 foreground 대기 CPU·메모리·배터리 수치가 없으므로 수치를 추정하지 않는다.

## 구현 재개 조건

1. 한국어 발음의 “헤이 핑디”가 Console에서 허용되는지 확인하고 Android·iOS `.ppn`과 한국어 `.pv`를 확보한다. 또는 동등한 한국어 로컬 모델과 상용 배포 권한을 갖춘 엔진을 확인한다.
2. 엔진·모델의 상업적 사용과 앱 번들 배포 권한, AccessKey를 앱에 장기 보관하지 않는 운영 방식을 확정한다. 이 결정에는 공급자와 제품 책임자의 확인이 필요하다.
3. 선택한 SDK 버전을 RN 0.83.6 / Expo 55 프로젝트에서 Android·iOS 네이티브 빌드로 검증하고, 모델 크기와 실제 앱 증가량 및 기기별 CPU·메모리·배터리를 측정한다.

## V2 연결 지점과 검증 계획

- `MapScreen`은 `useIsFocused()`를 쓰고 `useMapAssistantEntry`가 수동 AI 버튼, 최초 안내, 중복 진입 방지를 관리한다. Wake Word도 이 `open()`을 사용해야 한다. `MapAssistantModal`은 이미 `VoiceCommandScreen`과 `autoStart` STT 흐름을 연다. 새 AI 화면이나 STT 구현은 필요 없다.
- 감지는 앱 active, 지도 focus, 로그인·권한 유효, AI UI 닫힘, 다른 오디오 세션 없음, 사용자 활성화 상태일 때만 시작한다. `unavailable`, `disabled`, `initializing`, `listening`, `detected`, `cooldown`, `suspended`, `error`를 모델 상태로 사용한다. 앱 blur/background, 지도 이탈, 로그아웃, 통화·녹음·오디오 interruption, AI 열림, 중지·unmount 때 네이티브 listener와 오디오를 해제한다. 세대 번호와 단일 진입 잠금으로 늦은 callback·중복 감지를 무시하고 AI 세션 종료 후 cooldown을 둔다.
- 테스트 전용 adapter로 lifecycle, 한 번만 열리는 오버레이·STT, 권한·초기화·모델 오류, 수동 버튼 회귀, ko/en 상태와 접근성을 검증한다. 실기기에서 조용한 환경·생활 소음·유사 발음·거리·속도·화자·통화·음악·STT 충돌, 지연, CPU·메모리·배터리를 기록한다. 서버가 정상일 때만 후속 AI 응답 성공을 판정한다.

## 이번 변경 범위

이 문서만 추가한다. 네이티브 설정·의존성·모델·런타임 코드는 변경하지 않았다. 따라서 자동 Wake Word 동작과 Android·iOS 실기기 측정값은 없고 #351 완료 조건을 충족하지 않는다. V1 dependency delta는 `none`, `legacy-exception` 라벨은 필요하지 않다.
