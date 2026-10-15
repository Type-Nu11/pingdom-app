# Foreground Hey Pingdy KWS

- 엔진: sherpa-onnx v1.13.8. TTS와 화자 분리를 비활성화해 소스에서 빌드합니다.
- 모델: sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20의 원본 fp32 epoch-13-avg-2-chunk-16-left-64 가중치와 tokens.txt입니다.
- 전체 호출어: HH EY1 P IH1 NG D IY0 @Hey_Pingdy. Hey 또는 Pingdy 단독으로 등록하지 않습니다.
- 고유명사의 영어 음소를 수동 지정한 구성입니다. 한국식 발음, 인식률·오탐률, 소비 전력은 검증하지 않았습니다.
- 모델 해시·출처·빌드 설정·라이선스 고지를 확인한 다음 네이티브 빌드를 수행합니다. 앱 실행 중 모델을 다운로드하지 않습니다.

## 준비

Python 3.12+, CMake, Android NDK 27.1.12297006 및 iOS 빌드용 Xcode가 필요합니다.

    npm run prepare:wake-word
    python3 scripts/prepare-wake-word.py --platform android
    python3 scripts/prepare-wake-word.py --platform ios
    npm run check:wake-word

첫 준비는 고정한 소스를 컴파일합니다. 다운로드와 중간 결과는 ~/.cache/pingdom-wake-word/1.13.8에 캐시하며 PINGDOM_KWS_CACHE로 변경할 수 있습니다. 엔진과 빌드 영수증은 Git에서 제외한 vendor 디렉터리에 생성합니다. --check는 네트워크와 컴파일 없이 파일을 검사합니다. Android preBuild와 pod install에는 검사를 통과한 결과가 필요합니다.

Android AAR은 원본의 Apache Java/Kotlin 래퍼와 새로 빌드한 JNI/ONNX Runtime 라이브러리를 포함합니다. 원본 통합 네이티브/TTS 바이너리는 복사하지 않습니다. 지원 엔진은 Android arm64-v8a, iOS 기기 arm64 및 iOS Simulator arm64입니다. 소스와 ONNX Runtime 다운로드 SHA-256은 artifacts.lock.json에, 하위 소스의 버전과 해시는 고정한 sherpa-onnx CMake 파일에 명시돼 있습니다.

## 앱 주입과 오디오

AppProviders는 useSherpaWakeWordAdapter로 네이티브 준비 상태를 확인합니다. 준비 검사는 마이크를 열지 않고 패키지 모델 해시 확인, KWS 생성 및 합성 무음 입력 처리를 수행합니다. 모델·엔진·전체 문구가 일치해야 ready가 참이 됩니다. Expo Go, web, 누락 모듈/모델 및 초기화 오류는 unavailable입니다.

명시적인 청취 동의 후 Android는 AudioRecord의 16 kHz mono PCM을 전달합니다. iOS는 AVAudioEngine float 입력을 mono로 합쳐 실제 샘플레이트를 KWS에 전달합니다. 오디오와 추론은 네이티브에 머물고, JS 이벤트에는 세션 ID·감지 alias·오류 사유만 있습니다. foreground 이탈과 오디오 중단 시 캡처를 멈춥니다. 감지기 해제가 완료돼야 기존 AI 입력/STT가 시작됩니다.

모델·호출어·고지 전체를 Android assets 및 iOS PingdomWakeWord.bundle에 포함합니다. 모델 작성자의 Apache-2.0 고지, 엔진 Apache-2.0, ONNX Runtime MIT 및 하위 의존성 저작권·라이선스는 해당 번들의 NOTICE.txt와 LICENSE-*에 동봉합니다. 학습 데이터, 원본 녹음, en.phone 사전과 TTS 데이터는 동봉하지 않습니다.

플랫폼별 빌드 성공 범위와 iOS 앱 전체 빌드의 Xcode 환경 차단 사유는 docs/qa/351-foreground-wake-word-implementation.md에 기록했습니다.
