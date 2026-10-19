# 지도 장소명 오프라인 번역

## 범위와 책임

- 기준: `origin/design/402-app-wide-ui-ux`의 `9f0713dd`; 작업 브랜치 `feat/402-offline-place-translation`.
- 구현 위치: `src/v2/modules/place/translation/**`, 지도 `MapBottomSheet` 미리보기·확장 상세·외부 장소 카드의 실제 `place.name`.
- 인프라 경계: 기존 Android/iOS `MLKitTranslation` 브리지에 V2 전용 메서드 추가. 기존 V1 브리지 메서드와 동작은 유지.
- V1 dependency delta: **none**. V1 소스 수정 없음. API 계약, 서버 원문, 앱 표시 언어 변경 없음.
- 주소·설명 번역과 앱 전체 적용은 제외. 서비스는 문자열을 받아 나중에 확장 가능하지만 현재 UI는 장소명만 전달.

## 국가와 언어 정책

국가는 ISO 국가 코드이며 언어 코드와 별도로 취급한다. 프로필 `country`로 초기 추천만 결정한다.

| 국가 | 추천 번역 언어 |
| --- | --- |
| US, GB | en |
| CN | zh (중국어 단일 모델, 간체 안내) |
| JP | ja |
| TH | th |
| VN | vi |
| AR, ES | es |
| BR, PT | pt (지역별 모델이 아님) |
| CA, SG | 다언어 국가이므로 사용자가 직접 선택 |
| KR | 한국어 원문 표시를 기본값으로 사용. 다른 번역 언어 직접 선택 가능 |
| 누락·알 수 없는 국가 | 직접 선택; 영어로 임의 확정하지 않음 |

한국어를 직접 선택하면 모델 다운로드나 번역 실행 없이 서버 원문을 표시하고 Google 출처를 숨긴다. 선택값은 계정별로 유지하며, 진행 중이던 번역이 늦게 완료돼도 한국어 원문을 덮어쓰지 않는다.

선택 가능 언어는 한국어 원문 표시와 공식 지원 목록 중 en, ja, zh, th, vi, es, pt, fr, ms, ta로 제한한다. 캐나다의 영어·프랑스어, 싱가포르의 영어·중국어·말레이어·타밀어를 선택할 수 있다. 모든 ML Kit 지원 언어를 제공한다고 주장하지 않는다. zh-TW 전용 모델이나 중국어 번체 출력을 보장하지 않는다.

수동 선택은 `@pingdom/place-translation/target/<profile id>`에 저장한다. 계정별 수동 선택이 국가 추천보다 우선하며 게스트 선택은 계정으로 복사하지 않는다. 프로필의 앱 표시 언어 필드는 수정하지 않는다. 전환 버튼은 제거했으며, 다운로드·모델 관리 안내는 앱 표시 언어로 표시한다. 정적 UI 문구는 `copy.ts`, 동적 번역은 네이티브 모델 실행 서비스로 분리한다. 정적 문구는 언어팩이 아니다.

## 사용자 흐름 및 상태

2026-10-19 최신 요청으로 수동 전환 방식에서 진입 시 자동 번역으로 변경했다. 아래 흐름이 이전 QA의 수동 버튼 설명보다 우선한다.

1. 장소 진입 시 프로필 국가 추천 또는 계정별 수동 선택으로 대상을 결정하고 모델을 확인한다. 언어가 결정되지 않으면 언어 선택 안내를 제공한다.
2. 모델이 준비됐으면 현재 장소명만 자동 번역해 제목을 교체한다. 전환/원문 보기 버튼은 표시하지 않는다.
3. 모델이 없으면 원문과 다운로드 안내를 유지한다. 사용자가 관리창에서 언어·예상 용량을 확인하고 Wi-Fi 다운로드를 직접 선택해야 한다. 자동 다운로드는 하지 않는다.
4. 다운로드 완료 후 현재 장소명만 자동 번역한다. 모델 다운로드와 문장 번역은 별도 네이티브 작업이며 모든 장소 데이터를 일괄 번역하지 않는다.
5. 원문 확인과 언어·모델 관리는 장소명 길게 누르기/접근성 longpress로 연다. 짧게 누르기는 기존 상세 진입 동작을 유지한다. 원문·API는 변경하지 않고 기계 번역 안내와 공식 출처 배지는 유지한다.

6. 한국어 공용 모델과 개별 모델을 삭제할 수 있다. 한국어 삭제는 모든 대상 언어의 한국어 원문 번역에 영향을 준다는 안내를 표시한다. 내장 영어 모델은 삭제 목록에서 제외한다.

상태: 다운로드 전(`idle`), 모델 조회(`checking`), 다운로드 중(`downloading`), 사용 가능(`ready`), 번역 중(`translating`), 실패(`failed`). 실패해도 원문 제목은 유지된다. 버튼은 최소 44pt/dp 터치 영역, busy/disabled 접근성 상태를 사용한다. 제목은 두 줄까지 표시하며 동일한 제목 행 높이를 유지한다. 긴 이름은 말줄임하고 전체 문자열을 접근성 레이블에 제공한다. 별도 결과 패널/120 높이의 빈 공간은 제거했다. Android의 진입 시 자동 번역과 버튼 제거는 실제 장소로 확인했다. iOS 및 모든 화면 크기의 실기기 검증은 남아 있다.

## 네이티브 계약 및 제약

기존에 설치된 SDK를 사용한다. 추가 유료 API, 클라우드 fallback, 새 패키지 의존성은 없다.

| 항목 | Android | iOS |
| --- | --- | --- |
| 기존 SDK | `com.google.mlkit:translate:17.0.3` | `GoogleMLKit/Translate 8.0.0` |
| 목록 | `RemoteModelManager.getDownloadedModels` | `ModelManager.downloadedTranslateModels` |
| 다운로드 | `RemoteModelManager.download`, Wi-Fi 필수 | 영어→해당 언어 translator의 `downloadModelIfNeeded`, cellular 비허용 |
| 삭제 | `deleteDownloadedModel` | `deleteDownloadedModel` |
| 문장 실행 | `Translator.translate`만 호출 | `Translator.translate`만 호출 |
| 모델 수명 | 각 명시적 번역 작업에서 생성, 성공/실패 시 close | 작업 완료까지 translator 참조 유지 후 해제 |

새 브리지: `getOfflineModels()`, `downloadOfflineModel(language)`, `deleteOfflineModel(language)`, `translateOffline(text, target)`.

- 원문 언어는 서버 한국어 계약에 맞춰 `ko`로 고정한다. 짧은 고유명사에서 언어 감지를 추측하지 않는다.
- 영어는 내장 중간 언어다. 한국어→영어는 한국어 모델, 한국어→기타 언어는 한국어 및 대상 언어 모델이 필요하다.
- 비영어 간 번역은 SDK 내부 영어 중간 번역을 거쳐 품질이 저하될 수 있다.
- 모델당 **약 30MB**라는 공식 안내를 사용한다. 실제 전송량·디스크 사용량과 다를 수 있다. 설치된 모델은 예상 다운로드에서 제외한다.
- 양 플랫폼 공통으로 정확한 사전 다운로드 바이트 수와 진행률을 노출하는 계약을 만들지 않았다. Android 관리 API는 Task 완료/실패를 제공하고 iOS는 Progress를 제공하지만, UI는 플랫폼 공통의 불확정 진행 표시를 사용한다. 가짜 퍼센트나 정확한 용량을 표시하지 않는다.
- Wi-Fi가 없으면 SDK 다운로드 작업이 대기할 수 있다. 다운로드 중 언어 변경을 막으며 화면을 떠나도 SDK 작업 자체를 취소하지 않는다. 재진입 후 상태는 설치 목록에서 다시 확인한다.
- 설치 여부를 JS에 저장해 추정하지 않는다. 앱 재시작 후 SDK 모델 목록으로 확인한다. 앱 데이터 삭제·앱 제거 시 모델 유지까지 보장하지 않는다.
- 문장 실행은 설치 모델을 확인한 뒤 번역 API만 호출한다. 네트워크 다운로드 함수를 호출하지 않는다. 없으면 `MODEL_DOWNLOAD_REQUIRED`로 원문을 유지한다.
- 원문 언어·정확한 원문·대상 언어로 200건 메모리 캐시, 동일 키 진행 요청 공유. 모델 삭제 시 캐시를 비운다. 캐시는 앱 종료 후 유지하지 않는다.
- 모델 변경과 진행 중 번역을 서비스 수준에서 상호 배제한다. 화면 요청 세대 번호와 결과의 원문/대상 키로 늦은 결과를 버린다.
- 네이티브 코드가 없는 Expo Go/이전 앱 빌드에서는 사용 불가 안내. 새 네이티브 빌드가 필요하다.

## 공식 근거

2026-10-19 확인:

- [Android 구현·모델 다운로드 및 삭제](https://developers.google.com/ml-kit/language/translation/android)
- [iOS 구현·모델 다운로드 및 삭제](https://developers.google.com/ml-kit/language/translation/ios)
- [지원 언어](https://developers.google.com/ml-kit/language/translation/translation-language-support)
- [오프라인 실행과 영어 중간 번역 제약](https://developers.google.com/ml-kit/language/translation)
- [iOS 모델 관리/Progress](https://developers.google.com/ml-kit/reference/ios/mlkittranslate/api/reference/Classes/MLKModelManager)
- [사용 지침](https://developers.google.com/ml-kit/language/translation/translation-terms), [번역 출처 표시 지침과 공식 배지](https://cloud.google.com/translate/attribution)

공식 짧은 출처 배지(translated by Google)를 원본 PNG 및 @2x/@3x로 포함한다. 지도 장소 시트의 미리보기와 펼친 상세 화면에서는 제목 옆 대신 사진 바로 아래에 표시한다. 번역된 제목을 표시할 때만 배지를 노출하며, 번역 완료 시 사진이 밀리지 않도록 출처 영역 높이를 미리 확보한다. 사진 영역이 없는 외부 장소는 제목 옆 출처를 유지한다. 출시 시 앱 소개/도움말의 번역 사용 안내도 점검해야 한다.

## 검증 결과와 미검증 범위

- Android `:app:assembleDebug`: 통과. 새 Kotlin 브리지 컴파일 포함.
- iOS generic iOS unsigned Debug `xcodebuild`: 통과. 새 Swift/Objective-C 브리지 컴파일 포함.
- `npm run check:v2`: 경계 검사와 76개 테스트 통과. 프로덕션 의존성 그래프 갱신.
- `npm run typecheck`: 통과.
- 기존 장소 시트 및 오프라인 재조회 회귀 Jest 51개 + 새 번역 서비스/컴포넌트 11개: 총 62개 통과. 기존 장소 시트 테스트에서 비동기 act 경고는 남아 있으나 테스트 실패는 없다.
- `npm run test:regression`: 382개 통과. 최초 실행은 샌드박스의 tsx IPC 제한으로 실행 불가였고 권한 허용 후 재실행했다.
- 새 테스트의 번역 브리지는 **모의 구현**이다. 상태/요청/캐시/화면 경합을 검증하며 번역 모델의 품질이나 오프라인 실행 증거가 아니다.
- 사용자가 Android 실기기를 연결하고 검증 재개를 요청해 **SM-F966N (Android 16 / API 36)** 에서 실제 모델 실행을 검증했다. 상세 증거는 [Android 실기기 기록](../qa/402-offline-place-translation-android.md).
- 기본 인터넷 네트워크 `none`, 실제 외부 fetch 실패 상태에서 한국어→일본어 첫 번역 성공. 앱 강제 종료/재실행 후 모델과 대상 언어 유지, 다른 실제 장소의 UI 버튼 번역도 성공했다.
- 네트워크 차단 시 재조회 오류 화면이 기존 장소 카드 위에 추가되어 번역 버튼을 밀어내는 문제를 발견했다. `selectedPlace`가 있으면 로드된 카드를 유지하도록 수정하고 회귀 테스트를 추가했다. 데이터가 전혀 없는 장소의 오류/재시도 UI는 유지한다.
- 검증 중 기존 인증 세션 갱신 401로 로그인 화면으로 이동해 사용자가 직접 재로그인했다. 인증 로직은 수정하지 않았다.
- **iOS 실기기 번역, 작은 화면/큰 글꼴/라이트 테마, 모든 대상 언어의 모델 품질, 실기기 다운로드 실패 복구는 미검증**이다. iOS 빌드 성공은 오프라인 번역 성공의 증거가 아니다.

## 단일 장소명 전환 UI 보정

사용자의 후속 요청에 따라 별도 번역문 영역을 제거하고 제목 자체를 교체하도록 수정했다. [최신 실기기 화면과 검증](../qa/402-inline-place-name-translation.md)을 기준으로 한다. 이전 실기기 기록의 별도 결과 영역 스크린샷은 이 변경 이전 증거다.
