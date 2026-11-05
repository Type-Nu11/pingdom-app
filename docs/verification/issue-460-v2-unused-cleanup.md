# #460 V2 미사용 파일·에셋·의존성 점검

- 날짜: 2026-11-05
- 브랜치: `feat/460-v2-unused-cleanup` (기준 브랜치 `newdev`)
- 담당/구현 위치: App / V2. V1 dependency delta: **none**.
- 작업 시작 전부터 존재한 번역 UI, iOS 프로젝트, production 그래프 변경은 보존했다. 검증은 해당 변경이 포함된 현재 작업 트리 기준이다.

## 판단 기준과 조사 방법

1. 기존 `scripts/v2-boundaries/graph.mjs`의 `buildGraph`로 V1·V2 및 application/root 진입점의 import/export, 타입 참조, 문자열 dynamic import와 require를 조사했다. V2 소스 1,031개(삭제 전), 테스트/테스트 지원 333개, `/mock/` 소스 49개를 구분했다. 비문자열 import/require는 전체 그래프에서 0개였다.
2. inbound edge 부재는 후보 선정에만 사용했다. 파일명·컴포넌트명을 저장소 전체에서 검색하여 테스트, 공개 index, 기존 설계 문서, 설정·스크립트·네이티브 참조를 확인했다. 기존 그래프의 도달 여부만으로 삭제하지 않았다.
3. 공용 `src/assets/v2`와 기능 내부 assets를 모두 조사했다. Expo 앱 아이콘 설정, Metro SVG 처리, 플랫폼별 소스와 Xcode/Gradle 리소스 설정, 생성/밀도별 자산을 구분했다. 소스의 runtime glob/비문자열 로더가 없는 현재 상태에서 참조 없는 파일만 제거했다.
4. 의존성은 소스 외에 package scripts, Expo plugins, 패치, 네이티브 autolinking/Pod lock, 패키지 간 의존성을 확인했다. 이름이나 소스 import 유무만으로 제거하지 않았다.

재현에 사용하는 기존 도구:

```sh
node scripts/v2-boundaries/audit.mjs
npm explain react-native-element-dropdown
npm explain lodash
```

## 삭제

- `PlusIcon.tsx`: import/export·테스트·composition 연결 없음. 이전 마이그레이션 inventory의 기록만 남아 있다. 현재 화면의 plus 표시는 다른 컴포넌트/에셋을 사용한다.
- V2 `KakaoMapAdapter.tsx`: import/export·테스트 연결 없음. 현재 지도는 `MapCanvas → NaverMapAdapter`를 사용한다. shared Kakao host와 Android/iOS Kakao SDK·초기화는 V1 호환 참조가 있어 유지했다.
- 에셋 27개: 현재 소스·테스트·설정·네이티브 리소스 참조 없음. 아래 전체 목록 참조.
- `react-native-element-dropdown`: 앱 전체 소스·테스트·설정·네이티브 직접 참조와 patch 없음. `npm explain` 결과 root 단독 의존성이고 JS 패키지이며 native module/config plugin이 없다. `npm uninstall --ignore-scripts --no-audit --no-fund`로 manifest/lock과 설치 트리를 동기화했다. `lodash`는 `jest-expo`가 사용하므로 유지하며 lock에서 dev 전용으로 바뀐다.

| 삭제 경로 | 원본 bytes |
| --- | ---: |
| `src/assets/v2/icons/actions/Saved.svg` | 369 |
| `src/assets/v2/icons/community/filter-button.svg` | 1,360 |
| `src/assets/v2/icons/community/heart-active.svg` | 499 |
| `src/assets/v2/icons/community/heart-outline.svg` | 484 |
| `src/assets/v2/icons/escape.svg` | 231 |
| `src/assets/v2/icons/ion_call.svg` | 1,453 |
| `src/assets/v2/icons/place/Camera.svg` | 3,939 |
| `src/assets/v2/icons/place/Clean.svg` | 2,338 |
| `src/assets/v2/icons/place/Delicious.svg` | 1,531 |
| `src/assets/v2/icons/place/Down.svg` | 264 |
| `src/assets/v2/icons/place/Kind.svg` | 1,737 |
| `src/assets/v2/icons/place/Pin.svg` | 823 |
| `src/assets/v2/icons/place/profile_svg.svg` | 727 |
| `src/assets/v2/icons/place/star_svg.svg` | 850 |
| `src/assets/v2/images/pingDomBackGround.png` | 5,419,677 |
| `src/v2/modules/merchant/components/PlusIcon.tsx` | 876 |
| `src/v2/modules/place/map/native/components/KakaoMapAdapter.tsx` | 1,310 |
| `src/v2/modules/place/map/routes/assets/detail_back.svg` | 314 |
| `src/v2/modules/place/map/routes/assets/mode_bike.svg` | 982 |
| `src/v2/modules/place/map/routes/assets/timeline_bus.svg` | 2,136 |
| `src/v2/modules/place/map/routes/assets/timeline_destination.svg` | 917 |
| `src/v2/modules/place/map/routes/assets/timeline_dots.svg` | 308 |
| `src/v2/modules/place/map/routes/assets/timeline_origin.svg` | 261 |
| `src/v2/modules/place/map/routes/assets/timeline_transfer.svg` | 444 |
| `src/v2/modules/place/map/routes/assets/timeline_walk.svg` | 1,800 |
| `src/v2/modules/voice-assistant/assets/assistant.svg` | 2,295 |
| `src/v2/modules/voice-assistant/assets/edge-glow.png` | 75,015 |
| `src/v2/modules/voice-assistant/assets/edge-glow.svg` | 10,861 |
| `src/v2/modules/voice-assistant/assets/place-card-alt.png` | 137,861 |

삭제한 소스·에셋 합계: **5,671,662 bytes (5.41 MiB), 29개 파일**. 패키지 크기는 이 합계에서 제외한다.

## 유지 및 추가 확인 대상

| 대상 | 판단 근거 |
| --- | --- |
| `FavoritePlacesBottomSheetDraft.tsx`와 전용 테스트 | #349 후속 기록에서 시안 보존을 명시했고 필터/pending/콜백 테스트가 있다. production 미연결이지만 무용한 파일로 단정하지 않는다. 제품에서 시안 폐기를 결정할 때 함께 삭제한다. |
| `MapDiscoverySearch.tsx` | inbound import는 없으나 이번 작업 전부터 수정 중이다. 동시 작업을 보존하며 향후 사용/폐기 결정을 확인한다. |
| `app/App.tsx`, User/Scout/Claims/Conversion 공개 index | standalone V2 진입점 또는 공개 계약 경계이다. 현재 production 미연결만으로 삭제하지 않는다. |
| 테스트에서만 참조되는 data/index, 훅, navigation/selection, MapSelectedPlaceCard | 계약 검증·통합 테스트 및 기능 보존 대상이다. 해당 기능 폐기 결정 없이 제거하지 않는다. |
| mock/fixture, `app/testing`, API generated | domain mock registry와 contract/integration tests에서 사용한다. API 계약·생성 코드와 테스트 지원 파일은 유지한다. |
| 번역 attribution의 `color-short@2x/@3x`, `white-short@2x/@3x` | React Native가 기본 PNG의 화면 밀도 변형으로 자동 선택한다. 직접 import 부재는 미사용 근거가 아니다. |
| `expo-asset` | Expo의 의존성이며 iOS ExpoAsset autolinking 존재. |
| `react-native-screens` | native-stack의 peer 의존성이며 iOS RNScreens autolinking 존재. |
| `patch-package` | postinstall script와 실제 patches가 사용한다. |
| 그 외 dependencies | 앱 소스·설정·네이티브·빌드/도구 참조가 확인되어 유지한다. |

## 크기 측정의 범위

위 수치는 저장소 파일 원본의 감소량이다. 삭제 대상은 기존 production import graph에 연결되어 있지 않아 이 수치가 앱 번들/설치 크기 감소로 이어진다고 주장하지 않는다. 동일 조건의 변경 전/후 release 빌드·설치 크기는 미측정이다. 작업 시작 전 동시 수정이 있는 트리를 보존했으며 비교용 release baseline을 생성하지 않았다. Android debug와 iOS simulator 빌드 확인은 아래 별도로 기록한다. 실기기 설치·실행은 수행하지 않았다.

## 검증

- `npm run check:v2`: 통과. 디자인 정책 테스트 8개 및 boundary 테스트 76개 통과.
- `npm run typecheck`: 통과.
- `npm run test:v2-map`: 51개 통과.
- 즐겨찾기 두 suite: 본체 11개 통과. 시안 2개 중 최초 실행 1개가 기본 5초 timeout으로 실패했고, `--testTimeout=30000` 재실행에서는 2개 모두 통과했다. 테스트 소스는 수정하지 않았다.
- 경로 안내 suite: 13 suites, 196개 중 193개 통과. `CarRoutePreview`의 3개 테스트 실패. 동일 suite 재실행에서도 72/75 통과. `git archive HEAD` 사본은 75개 모두 통과했다. 같은 사본에 작업 시작 전 미커밋 변경만 복사하고 이번 삭제/manifest 변경을 제외하면 동일한 3개가 실패했다(72/75 통과). 따라서 이번 정리로 발생한 회귀가 아니라 기존 작업 트리의 별도 실패로 기록하며 해당 UI는 수정하지 않았다.
- import 그래프의 로컬 target 존재 검사: 끊어진 참조 0개.
- Android: `cd android && ./gradlew :app:assembleDebug` 통과 (`BUILD SUCCESSFUL in 7m 7s`). 실기기 실행 미수행.
- iOS simulator: `xcodebuild -workspace ios/PingDom.xcworkspace -scheme PingDom -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath /tmp/pingdom-460-ios CODE_SIGNING_ALLOWED=NO build` 통과 (`BUILD SUCCEEDED`). simulator용 arm64/x86_64 빌드이며 실기기 서명·설치·실행 검증은 아니다.
- `git diff --check`: 통과.

로그: `/tmp/pingdom-460-{boundaries,types,map,jest,draft-retry,routes,car-retry,baseline-test,existing-changes-test,android,ios}.log`. 로그와 비교용 사본은 저장소에 포함하지 않는다.


## PR 범위 단독 검증

2026-11-05, `newdev`의 `d353d8c0`에서 만든 별도 worktree에 #460 삭제 29개·package manifest/lock·본 문서만 적용했다. 기존 번역 UI, production graph, iOS 프로젝트 변경은 포함하지 않았다.

- `npm run validate:pr`: **통과**. V2 경계·디자인, ownership harness, 타입 검사, Jest 및 전체 `test:regression`이 완료됐다.
- Jest: **263 suites / 3,124 tests 통과**, 기존 skip 3 suites / 5 tests.
- regression: navigation, i18n formatters, V2 notifications/map/API 테스트 전체 통과. 마지막 V2 API 묶음 216개 통과.
- `npm run check:v1-changes -- --base origin/newdev`: 통과.
- 앞서 기록한 `CarRoutePreview` 3개 실패는 PR 범위 단독 검증에서 재현되지 않았으며 해당 suite 75개 모두 통과했다.
- 로그: `/tmp/pingdom-460-pr-validation.log`.
