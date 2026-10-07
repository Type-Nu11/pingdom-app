# #413 #414 #415 #416 다국어 4종 통합 검증 기록

중국어 간체·번체(`zh-CN`·`zh-TW`), 베트남어(`vi`), 스페인어(`es`), 브라질 포르투갈어(`pt-BR`)를 한 PR로 추가했다.
언어별 정책·formatter·서버 계약은 각 문서에 있다:
[413 중국어](413-chinese-i18n.md) · [414 베트남어](414-vietnamese-i18n.md) ·
[415 스페인어](415-spanish-i18n.md) · [416 브라질 포르투갈어](416-pt-br-i18n.md).

- 브랜치 `feat/413-416-i18n-zh-vi-es-pt-br`, 시작 기준 `origin/dev` `05ed9a68`.
- 구현 위치: **V2**. **V1 dependency delta: `none`** — `src/features/**` 변경 0건, `legacy-exception` 라벨 불필요.
- V2 밖 변경: `ios/Naviapp/Info.plist`·`app.json`의 `CFBundleLocalizations`(아래 "iOS 기기 언어 fallback").

## 자동 검증 (한 번의 연속 실행)

| 명령 | 결과 |
|---|---|
| `npm run check:v2` | PASS: 경계 906 source files, 테스트 76/76 |
| `npm run typecheck` | PASS |
| `npm run test:i18n-formatters` | PASS: 89/89 |
| `npm run check:a11y-i18n` | PASS: production render graph 549 files |
| `npm run test:ownership-harness` | PASS |
| `npm run validate:pr` | PASS: Jest 170 suites / 1,692 tests, 실패 0 |
| `git diff --check origin/dev...HEAD` | PASS |
| `npm run lint` | 해당 없음: 저장소에 lint 스크립트가 없다 |

`catalogParity.test.mjs`는 지원 언어마다 en과의 키 집합, 빈 값, 보간 변수, `<accent>` 태그, 줄 수, 앞뒤 공백,
복수형(count 0·1·2·5·11·21·100·1,000,000이 CLDR 범주에 맞는 자기 언어 문구로 나오는지), 다른 문자 체계 혼입,
영어 미번역, 간체·번체 글자 혼입을 검사한다.

### 가짜 통과 방지 (일부러 깨뜨려 실패 확인 후 원복)

| 변조 | 실패한 테스트 |
|---|---|
| zh-TW 키 1개 삭제 | `zh-TW catalog has exactly the en key set` |
| zh-CN `{{name}}` → `{{nombre}}` | `zh-CN interpolation variables and markup tags match the source copy` |
| zh-TW 값에 간체 문구 삽입 | `zh-TW copy is translated and contains no other language` |
| zh-CN 값에 영어 잔존 + 빈 값 | `no empty values`, `copy is translated…` |
| zh-TW `_other` 삭제 / es `_many` 삭제 | `key set`, `plural forms resolve to its own copy for every count` |
| vi 값에 영어·한자 삽입, 변수명 변경 | `vi copy is translated…`, `vi interpolation variables…` |
| pt-BR 변수명 변경 + 키 삭제 | `pt-BR catalog has exactly the en key set`, `pt-BR interpolation variables…` |
| `pt-PT`를 `pt-BR`로 매핑 | `#416 normalizes…`, `#416 a pt-PT device or profile is never mapped…`, `#416 an unsupported stored pt-PT value…` |
| `zh-Hant`를 간체로 판정 | `#413 Chinese locales split…`, `#413 a chosen … variant is never overwritten…`, `#413 restores the exact stored Chinese variant…` |

## iOS 시뮬레이터 수동 검증

### 환경과 한계

- iPhone 17 Pro (iOS 26.3.1)와 iPhone SE 3세대 (iOS 26.5), 이미 설치돼 있던 Debug dev client + Metro. 조작은 AXe CLI.
  이번 변경은 JS와 `Info.plist` 선언뿐이라 native 재빌드 없이 Metro 번들로 확인했다.
- 로그인 이후 화면(17 Pro)은 `EXPO_PUBLIC_API_MODE=mock`과 시뮬레이터 키체인에 남아 있던 이전 QA의 stub 세션으로 확인했다.
  **mock 데이터이며 실서버 로그인 성공이 아니다.** mock에 `/users/me`가 없어 프로필 영역은 오류 상태로 표시된다.
- 온보딩은 새로 만든 SE 시뮬레이터(세션 없음)에서 확인했다. 가입·로그인 요청은 보내지 않았다.
- 화면 문구는 접근성 트리에서 덤프해 원시 키 패턴·다른 문자 체계 혼입을 자동 스캔했다(화면 약 20종 × 5언어 × 라이트·다크·큰 글씨).
- QA용 mock 환경 변수 외에 저장소 파일을 바꾼 것은 없다(로컬 stub 코드 없음).

### 결과 (5개 언어 공통, 예외는 표기)

| 시나리오 | 결과 | 캡처 |
|---|---|---|
| 온보딩 언어 목록에 8개 언어가 자체 표기로 표시, SE에서 스크롤로 전부 선택 가능 | PASS | `*-01` |
| 온보딩에서 선택 → 다음 단계(국가·생년·성별·여행 목적)부터 즉시 해당 언어 | PASS | `*-02` |
| 온보딩 도중 앱 재실행 → 선택 언어 유지, 저장값이 선택한 코드 그대로(`zh-TW`, `pt-BR` 등) | PASS | `*-03` |
| 지도 튜토리얼 9단계 | PASS (es·pt-BR·vi 줄바꿈 **보정 후**) | `*-04` |
| 지도 홈·카테고리 칩·피드 세그먼트·하단 탭 | PASS (es·pt-BR·vi 세그먼트 라벨 **보정 후**) | `*-05` |
| 즐겨찾기·커뮤니티·예약·장소추천 탭의 빈 상태·오류 상태 | PASS | – |
| 방문 검증 목록·작성 화면 | PASS (zh `0/5 已选` 어순 **보정 후**) | `*-06` |
| 마이페이지(통계·여행 달력·요일 머리글·검증한 장소), 쿠폰함 | PASS | `*-07` |
| 설정 루트·알림 설정·언어 설정 | PASS (pt-BR 화면 모드 값 말줄임 **보정 후**) | `*-08` |
| 설정에서 ko → 대상 언어 선택 → 즉시 반영 → 재실행 후 유지 | PASS | `*-09` |
| 프로필 재조회가 저장된 선택을 덮어쓰지 않음(mock 프로필 없음 + 단위 테스트의 프로필 `ko`/`en` 재조회) | PASS | – |
| 다크 모드: 지도·예약·마이페이지·설정·언어 설정 | PASS | `*-10` |
| 표준 최대 글꼴(xxxL): 튜토리얼·지도·예약·커뮤니티·마이페이지·설정·언어 설정 | PASS (탭·세그먼트 **보정 후**, 아래 참고) | `*-11` |
| 작은 화면(SE): 온보딩 전 단계 | PASS | `*-01`–`*-03` |
| 글꼴: vi·es·pt-BR은 Pretendard 한 글꼴, zh는 시스템 글꼴 fallback. 두부 문자 없음 | PASS | 전체 |
| 원시 번역 키·의도치 않은 언어 혼용 | 0건 | 전체 |
| 기기 언어 fallback(저장값·프로필 없음) | **FAIL → 수정** (아래) | – |

### 이번 작업에서 발견해 고친 문제 (신규 언어로 생긴 것)

| 문제 | 조치 |
|---|---|
| es·pt-BR·vi 피드 세그먼트 라벨(`Lugares de moda locales` 등)이 반쪽 칸을 넘어 옆 탭과 겹침 | 라벨 축약(`Populares cerca`/`Tendencias`, `Em alta perto`/`Tendências`, `Hot quanh đây`/`Xu hướng cả nước`) + 라벨을 한 줄 축소 맞춤으로 변경 |
| xxxL 글꼴에서 pt-BR 탭 라벨 `Comunidade`가 두 줄로 꺾이고 es 탭 라벨이 서로 겹침 | 하단 탭 라벨을 한 줄 축소 맞춤으로 변경 (ko 기본·xxxL 표시는 그대로) |
| es·pt-BR·vi 튜토리얼 문구가 카드 폭을 넘어 의도치 않은 위치에서 줄바꿈 | 줄마다 42자 안쪽으로 다시 작성 |
| pt-BR 설정의 화면 모드 값 `Usar a configuração do sis…` 말줄임 | `Padrão do sistema`로 축약(es도 `Ajuste del sistema`) |
| xxxL에서 pt-BR 위치 안내 카드 제목이 두 줄이 되어 `Verificar` 버튼을 가림 (`before-fix-pt-BR-map-xxxl.jpg`) | 제목 축약(`Localização não encontrada`) |
| zh 방문 검증 선택 수 `0/已選 5 項` 어순 | `0/5 已選` |
| 설정 언어 화면: 선택지 8개가 작은 화면 높이를 넘음 | 목록을 스크롤 가능하게 변경 |
| 온보딩 완료 저장 검증 목록에 새 코드가 없어 재실행 시 온보딩이 반복될 수 있음 | 목록에 추가 + 지원 언어 전체에 대한 복원 테스트 |

### iOS 기기 언어 fallback

- 재현: 저장값·프로필 없이 기기 언어를 `zh-Hant-TW`·`vi-VN`·`es-MX`·`pt-BR`·`ja-JP`로 바꿔도 앱이 영어로 표시됐다.
  iOS는 번들이 선언한 localization(`en`, `ko`)에 없는 언어를 앱에 영어 locale로 알려 주기 때문이다. **ja(#389)도 같은 상태였다.**
- 수정: `ios/Naviapp/Info.plist`와 `app.json`에 `CFBundleLocalizations`(`en ko ja zh-Hans zh-Hant vi es pt-BR`)를 선언하고,
  지원 언어와 선언이 어긋나면 실패하는 테스트를 추가했다.
- 확인 방법: 시뮬레이터에 설치된 앱 번들의 `Info.plist`에 같은 선언을 넣어 실행했다(native 재빌드는 하지 않았다).

| 기기 언어 / 지역 | 결과 |
|---|---|
| `zh-Hant-TW`, `zh-Hant-HK` | 번체 |
| `zh-Hans-CN`, `zh-Hans-SG`, `zh-Hans-CN` + 지역 `en_US` | 간체 |
| `vi-VN` | 베트남어 |
| `es-MX`, `es-ES`, `es-419` | 스페인어 |
| `pt-BR` + 지역 `pt_BR` | 브라질 포르투갈어 |
| `pt-PT` + 지역 `pt_PT` | 영어(자동 매핑 없음, 기존 fallback) |
| `ja-JP` | 일본어 |
| `fr-FR` | 영어 |
| `ko-KR` | 한국어 |

- **알려진 한계**: iOS가 앱에 주는 locale은 "언어 + 기기 지역"이라, 기기 언어가 `Português (Brasil)`이어도 지역이 브라질이 아니면
  (`pt_US`, `pt_KR` 등) `pt-BR`로 판정하지 않고 영어로 표시한다. `pt-PT`를 자동 매핑하지 않는 정책과 같은 판정을 쓰기 때문이다.
  이 경우 온보딩·설정에서 직접 고르면 된다.

### 새 언어와 무관한 기존 문제 (ko에서도 동일, 이번 범위에서 수정하지 않음)

- 접근성 글꼴(AX-XL 이상)에서 하단 탭 라벨·위치 안내 카드·피드 시트가 겹친다
  (`preexisting-ko-map-ax-xl.jpg`, `preexisting-es-map-ax-xl.jpg`). #389 기록과 같다.
- 지도 튜토리얼 1단계(환영)는 카드 배경 없이 지도 위에 문구가 겹쳐 보인다(ko 동일).
- 설정 언어 화면의 헤더가 다른 설정 화면보다 아래에 그려진다(#389 캡처 09와 동일).
- 커뮤니티 카테고리 칩(`장소`·`여행`·`돈`)과 게시글 제목은 서버(mock fixture)가 주는 문자열이라 번역 대상이 아니다
  (`server-content-community-es.jpg`).
- 음성 입력 locale은 `ko` 외 언어에서 `en-US`다(STT 범위 제외).
- iOS 권한 안내(InfoPlist.strings)는 `en`/`ko`만 있다. `CFBundleLocalizations` 선언 뒤에도 새 언어 기기에서는 영어 문구가 나온다.

### 미검증

- **Android**: 빌드·실행하지 않았다(이 개발 환경에 Android SDK·에뮬레이터가 없다).
- **실서버**: 가입 시 새 언어 코드의 저장·반환, 실제 로그인·프로필 재조회는 확인하지 않았다(테스트 계정 없음).
- **native 재빌드**: `CFBundleLocalizations`가 들어간 정식 빌드는 만들지 않았다(이 환경은 MLKit simulator slice 문제로 빌드 불가).
- VoiceOver 읽기 순서, 실기기, 로그인 이후 화면의 작은 화면(SE) 표시.
- CJK 지역별 글리프: zh는 시스템 글꼴 fallback이라 기기 언어 순서에 따라 같은 한자의 지역 변형 글리프가 달라질 수 있다.
  한국어 기기에서 간체·번체 모두 정상 표시되는 것만 확인했다.

## 번역 검수 현황

| 언어 | 초안 | 사람 검수 | 검수 대상 목록 |
|---|---|---|---|
| zh-CN · zh-TW | 기계 번역 초안 | **미완료** | [413-zh-translation-review.md](413-zh-translation-review.md) |
| vi | 기계 번역 초안 | **미완료** | [414-vi-translation-review.md](414-vi-translation-review.md) |
| es | 기계 번역 초안 | **미완료** | [415-es-translation-review.md](415-es-translation-review.md) |
| pt-BR | 기계 번역 초안 | **미완료** | [416-pt-br-translation-review.md](416-pt-br-translation-review.md) |

## 캡처

파일은 [413-416-multilingual-i18n/](413-416-multilingual-i18n/)에 있고 이름은 `<언어>-<번호>-<화면>.jpg`다.

| # | 화면 | zh-CN | zh-TW | vi | es | pt-BR |
|---|---|---|---|---|---|---|
| 01 | 온보딩 언어 선택 (SE) | ![](413-416-multilingual-i18n/zh-CN-01-onboarding-select-se.jpg) | ![](413-416-multilingual-i18n/zh-TW-01-onboarding-select-se.jpg) | ![](413-416-multilingual-i18n/vi-01-onboarding-select-se.jpg) | ![](413-416-multilingual-i18n/es-01-onboarding-select-se.jpg) | ![](413-416-multilingual-i18n/pt-BR-01-onboarding-select-se.jpg) |
| 02 | 선택 직후 다음 단계 (SE) | ![](413-416-multilingual-i18n/zh-CN-02-onboarding-applied-se.jpg) | ![](413-416-multilingual-i18n/zh-TW-02-onboarding-applied-se.jpg) | ![](413-416-multilingual-i18n/vi-02-onboarding-applied-se.jpg) | ![](413-416-multilingual-i18n/es-02-onboarding-applied-se.jpg) | ![](413-416-multilingual-i18n/pt-BR-02-onboarding-applied-se.jpg) |
| 03 | 재실행 후 유지 (SE) | ![](413-416-multilingual-i18n/zh-CN-03-onboarding-relaunch-se.jpg) | ![](413-416-multilingual-i18n/zh-TW-03-onboarding-relaunch-se.jpg) | ![](413-416-multilingual-i18n/vi-03-onboarding-relaunch-se.jpg) | ![](413-416-multilingual-i18n/es-03-onboarding-relaunch-se.jpg) | ![](413-416-multilingual-i18n/pt-BR-03-onboarding-relaunch-se.jpg) |
| 04 | 지도 튜토리얼 | ![](413-416-multilingual-i18n/zh-CN-04-tutorial.jpg) | ![](413-416-multilingual-i18n/zh-TW-04-tutorial.jpg) | ![](413-416-multilingual-i18n/vi-04-tutorial.jpg) | ![](413-416-multilingual-i18n/es-04-tutorial.jpg) | ![](413-416-multilingual-i18n/pt-BR-04-tutorial.jpg) |
| 05 | 지도 홈 | ![](413-416-multilingual-i18n/zh-CN-05-map.jpg) | ![](413-416-multilingual-i18n/zh-TW-05-map.jpg) | ![](413-416-multilingual-i18n/vi-05-map.jpg) | ![](413-416-multilingual-i18n/es-05-map.jpg) | ![](413-416-multilingual-i18n/pt-BR-05-map.jpg) |
| 06 | 방문 검증 작성 | ![](413-416-multilingual-i18n/zh-CN-06-visit-verification.jpg) | ![](413-416-multilingual-i18n/zh-TW-06-visit-verification.jpg) | ![](413-416-multilingual-i18n/vi-06-visit-verification.jpg) | ![](413-416-multilingual-i18n/es-06-visit-verification.jpg) | ![](413-416-multilingual-i18n/pt-BR-06-visit-verification.jpg) |
| 07 | 마이페이지 | ![](413-416-multilingual-i18n/zh-CN-07-mypage.jpg) | ![](413-416-multilingual-i18n/zh-TW-07-mypage.jpg) | ![](413-416-multilingual-i18n/vi-07-mypage.jpg) | ![](413-416-multilingual-i18n/es-07-mypage.jpg) | ![](413-416-multilingual-i18n/pt-BR-07-mypage.jpg) |
| 08 | 설정 | ![](413-416-multilingual-i18n/zh-CN-08-settings.jpg) | ![](413-416-multilingual-i18n/zh-TW-08-settings.jpg) | ![](413-416-multilingual-i18n/vi-08-settings.jpg) | ![](413-416-multilingual-i18n/es-08-settings.jpg) | ![](413-416-multilingual-i18n/pt-BR-08-settings.jpg) |
| 09 | 설정에서 선택 직후 | ![](413-416-multilingual-i18n/zh-CN-09-settings-language-applied.jpg) | ![](413-416-multilingual-i18n/zh-TW-09-settings-language-applied.jpg) | ![](413-416-multilingual-i18n/vi-09-settings-language-applied.jpg) | ![](413-416-multilingual-i18n/es-09-settings-language-applied.jpg) | ![](413-416-multilingual-i18n/pt-BR-09-settings-language-applied.jpg) |
| 10 | 마이페이지 (다크) | ![](413-416-multilingual-i18n/zh-CN-10-mypage-dark.jpg) | ![](413-416-multilingual-i18n/zh-TW-10-mypage-dark.jpg) | ![](413-416-multilingual-i18n/vi-10-mypage-dark.jpg) | ![](413-416-multilingual-i18n/es-10-mypage-dark.jpg) | ![](413-416-multilingual-i18n/pt-BR-10-mypage-dark.jpg) |
| 11 | 지도 홈 (xxxL 글꼴) | ![](413-416-multilingual-i18n/zh-CN-11-map-xxxl.jpg) | ![](413-416-multilingual-i18n/zh-TW-11-map-xxxl.jpg) | ![](413-416-multilingual-i18n/vi-11-map-xxxl.jpg) | ![](413-416-multilingual-i18n/es-11-map-xxxl.jpg) | ![](413-416-multilingual-i18n/pt-BR-11-map-xxxl.jpg) |

기준·참고: ![](413-416-multilingual-i18n/ko-baseline-map.jpg) ![](413-416-multilingual-i18n/ko-baseline-map-xxxl.jpg)
![](413-416-multilingual-i18n/before-fix-pt-BR-map-xxxl.jpg) ![](413-416-multilingual-i18n/preexisting-ko-map-ax-xl.jpg)
![](413-416-multilingual-i18n/preexisting-es-map-ax-xl.jpg) ![](413-416-multilingual-i18n/server-content-community-es.jpg)

SE 캡처 01의 목록 위쪽은 스크롤된 상태다. 캡처 09의 한국어 선택지 등은 각 언어의 자체 표기다.
