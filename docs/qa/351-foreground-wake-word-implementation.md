# #351 Foreground “Hey Pingdy” 네이티브 구현·검증

- 구현 위치: V2. V1 dependency delta: `none`.
- 브랜치: `feat/351-foreground-wake-word-implementation`.
- 기준 커밋: `ee3905f6`. 기존 경로 작업의 미커밋 변경은 가져오지 않았다.
- 사용자 요청에 따라 실제 발화·실기기 측정은 수행하지 않는다.

## 구현한 범위

- `WakeWordAdapter`와 `LocalWakeWordRuntime`으로 전용 로컬 KWS 엔진의 경계를 정의한다. 일반 STT나 서버 음성 인식을 호출어 감지의 대체 수단으로 사용하지 않는다.
- `createLocalWakeWordAdapter`는 모델 초기화 중 취소, 초기화/중지 직렬화, 오디오 사용 가능 여부 확인, 늦은 감지 이벤트 차단, 네이티브 자원 해제를 관리한다.
- `useForegroundWakeWord`는 앱 active/Android focus, 지도 focus, 로그인 계정, AI 입력 상태와 동기화한다. 검색 UI에서 청취 표시가 가려지면 감지도 일시 중지한다.
- 기본값은 꺼짐이며 메모리에만 유지한다. 사용자가 개인정보 안내에 동의해야 청취를 켠다. 계정 변경은 동의를 해제한다. 오디오 중단·권한·엔진 오류 뒤에는 직접 다시 켜야 한다.
- 호출어와 수동 버튼 모두 기존 `useMapAssistantEntry.open()`으로 진입한다. 감지기를 완전히 해제한 다음 기존 안내/자동 STT를 열며, 중복 진입과 해제 실패 시 마이크 경쟁을 막는다.
- AI 입력을 닫은 뒤 2초 동안 재감지를 막는다. 청취 상태와 즉시 중지 컨트롤, 접근성 역할 및 지원 언어 문구를 제공한다.

## 확정한 엔진·모델·호출어

엔진은 sherpa-onnx v1.13.8이다. 소스를 고정하고 TTS·화자 분리를 비활성화해 빌드한다. 공식 통합 바이너리에 포함된 TTS/eSpeak 라이브러리는 복사하지 않는다. Android는 원본 AAR의 Apache Java/Kotlin 래퍼만 사용하고 JNI/ONNX Runtime 라이브러리는 별도로 구성한다.

모델은 sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20의 원본 fp32 epoch-13-avg-2-chunk-16-left-64 encoder/decoder/joiner 및 tokens.txt이다. 파일명만 줄였고 가중치는 변환하지 않았다. 모델·소스·ONNX Runtime의 URL과 SHA-256은 native/wake-word/artifacts.lock.json에 고정했다.

호출어 전체를 다음 한 줄로 등록한다. Hey 또는 Pingdy 단독 키워드는 없다.

    HH EY1 P IH1 NG D IY0 @Hey_Pingdy

고유명사 Pingdy의 영어 음소를 수동 지정한 구성이다. 이는 문구 등록이며 실제 음향 인식 성공의 증거가 아니다. 중국어·영어 모델이며, 한국식 발음 또는 한국어 호출어 인식까지 검증됐다는 의미로 보고하지 않는다.

모델 작성자의 [Apache-2.0 고지](https://github.com/k2-fsa/sherpa-onnx/issues/3802#issuecomment-6052663364), 엔진의 Apache-2.0, ONNX Runtime의 MIT 및 각 의존성 라이선스·저작권 고지를 Android assets와 iOS PingdomWakeWord.bundle에 동봉했다. 원본 음성 샘플·en.phone 사전·TTS 데이터는 동봉하지 않았다.

## 실제 드라이버·기본 주입

- Android: AudioRecord의 16 kHz mono PCM을 KWS에 전달한다. 오디오 포커스·활성 녹음·앱 lifecycle·시작 중 중단, 캡처 스레드 종료와 모델 해제를 처리한다.
- iOS: AVAudioEngine float 입력을 mono로 합쳐 실제 샘플레이트와 함께 KWS에 전달한다. foreground·오디오 중단·경로/엔진 구성 변경 시 캡처를 중지하고 대기 버퍼 수를 제한한다.
- 오디오·전사문은 JS로 보내지 않는다. 세션 ID, 전체 호출어 alias, 오류 이벤트만 전달한다.
- AppProviders가 useSherpaWakeWordAdapter를 통해 createLocalWakeWordAdapter(runtime)을 기본 주입한다.
- ready는 패키지 해시 확인, 실제 엔진·모델 생성 및 합성 무음 입력 처리, 정확한 모델·엔진 버전·문구 일치 이후에만 참이 된다. 준비 검사는 마이크를 열거나 권한을 요청하지 않는다.
- 누락 모듈·모델, 초기화 오류, Expo Go/web은 unavailable로 남는다. 감지 후 해제가 끝나야 기존 autoStart STT가 열린다.

## 네이티브 빌드 결과

| 대상 | 결과 | 확인 범위 |
| --- | --- | --- |
| Android arm64 APK | 성공 | 최종 JNI/ONNX Runtime·모델·키워드·모든 고지 포함. 패키지 파일과 소스 바이트 대조 |
| iOS 기기 arm64 | 성공 | TTS 제외 static XCFramework 및 PingdomWakeWordEngine target 컴파일 |
| iOS Simulator arm64 | 성공 | 별도 simulator slice와 동일 드라이버 target 컴파일 |
| iOS C API 링크 | 성공 | 양쪽 SDK에서 KWS 생성·해제 참조를 포함한 실행 파일 링크 |
| iOS 모델·고지 번들 | 성공 | 두 플랫폼의 PingdomWakeWord.bundle 전체 파일과 소스 일치 |
| iOS 앱 전체 | 차단 | Xcode의 iOS 26.2 Platform Not Installed. scheme 목적지 선택과 SplashScreen.storyboard 처리에서 실패 |

iOS 네이티브 target 성공을 앱 전체 빌드나 실기기 성공으로 확대하지 않는다. x86_64 시뮬레이터 slice는 제공하지 않는다.

검증 APK: android/app/build/outputs/qa-351/pingdom-wake-word-arm64-debug.apk

SHA-256: 7fd676348a19a0cff1a789d6de7602dc6316fb5135484b3f261ec5cceb614669

IDE 빌드 옵션에서는 최신 APK가 intermediates/apk에 생성된다. createDebugApkListingFileRedirect/redirect.txt가 가리키는 output-metadata.json에서 확인한 APK를 위 경로로 복사했다.

## 빌드 준비·재현

Python 3.12+, CMake, Android NDK 27.1.12297006 및 Xcode가 필요하다. 엔진 결과물과 빌드 영수증은 Git에서 제외한 vendor 디렉터리에 생성한다. 소스 빌드 캐시는 ~/.cache/pingdom-wake-word/1.13.8이며 PINGDOM_KWS_CACHE로 지정할 수 있다.

    npm run prepare:wake-word
    npm run check:wake-word
    JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home android/gradlew -p android :app:assembleDebug -Pandroid.injected.build.abi=arm64-v8a -PreactNativeArchitectures=arm64-v8a --console=plain

iOS는 pod install 후 Pods.xcodeproj의 PingdomWakeWordEngine target을 iphoneos/iphonesimulator SDK로 각각 빌드했다. 시뮬레이터는 ARCHS=arm64, 양쪽 모두 CODE_SIGNING_ALLOWED=NO 및 CLANG_ENABLE_EXPLICIT_MODULES=NO를 사용했다. 후자는 정리한 로컬 빌드 캐시의 오래된 explicit module 참조를 피하는 검증 옵션이다. 서명·배포는 하지 않았다.

## 검증 범위

자동 테스트는 드라이버 경계와 앱 수명주기·마이크 인계 순서를 확인한다. 실제 감지율, 한국식 발음, 오탐/미탐, 실제 통화·녹음 충돌, 감지 전 패킷 미전송 측정, CPU/메모리/배터리 비용은 미검증이다.

- `npm run typecheck`: 통과.
- `npm run check:v2`: 경계 검사 및 76개 테스트 통과. 생산 의존성 그래프 갱신, SCC 0개.
- `npm run test:i18n-formatters`: 89개 통과.
- 변경 영역 Jest: 7개 suite / 55개 통과. 세션 ID·전체 키워드·초기화 실패·중단·로딩 중 취소·STT 인계·cooldown·계정 변경·안내·즉시 중지를 검증했다.
- Python 자산 검사: 모델 변조·불완전 호출어·고지 누락 차단 및 실제 모델 검증 통과.
- `git diff --check`: 통과.
- 전체 `npm test -- --runInBand`: 214개 suite / 2,554개 통과.
- 분할 커밋 준비 중 `npm run validate:pr`를 실행했다. 전체 Jest 214개 suite / 2,554개와 V2·타입·ownership·navigation·다국어·notification 검사는 통과했다. 지도 회귀 검사에서 변경 전 2개 인자 호출을 기대하던 소스 단언 1개가 실패해 계정·검색 상태 인자까지 검사하도록 수정했다. 이후 `npm run test:v2-map` 50개와 `npm run test:v2-api` 206개가 통과했다.
- `npm run check:wake-word`, Python 자산 검사 4개 및 `npm run check:v1-changes -- --base origin/dev`: 통과.
- 실제 발화·실기기 측정: 미수행. 커밋·푸시·PR 전달 상태는 해당 Git 이력과 PR을 기준으로 확인한다.
