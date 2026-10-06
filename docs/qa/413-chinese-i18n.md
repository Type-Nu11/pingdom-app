# #413 앱 UI 중국어 간체(zh-CN)·번체(zh-TW) 지원 검증 기록

## 기준과 구현 경계

- 브랜치 `feat/413-416-i18n-zh-vi-es-pt-br`, 시작 기준 `origin/dev` `05ed9a68`. #414·#415·#416과 같은 PR이다.
- 구현 위치: **V2** (`src/v2/shared/i18n`, 도메인 i18n 카탈로그, User 설정, 온보딩 완료 저장 검증).
- **V1 dependency delta: `none`.** `src/features/**` 수정 없음. 온보딩 언어 선택은 #396에서 V2로 이관되어
  `supportedLanguages`만 늘리면 선택지가 생긴다.
- 지원 코드는 `zh-CN`(간체)·`zh-TW`(번체) 두 개이며 선택지·번역 리소스·저장값이 모두 분리되어 있다.
- 제외 범위: 서버 동적 콘텐츠(장소명·메뉴·리뷰) 번역, AI 응답 언어, STT/TTS·Wake Word
  (음성 입력 locale은 기존대로 `ko` 외 언어에서 `en-US`), 광둥어(`yue`) 등 별도 언어, 지도 SDK.

## 기기·프로필·저장값 locale 매핑

판정은 `src/v2/shared/i18n/locale.ts`의 `isTraditionalChinese` 한 곳에서 하며, 언어 선택(`language.ts`)과
formatter(`formatters.ts`의 `resolveLocale`)가 같은 함수를 쓴다.

| 입력 | 결과 | 근거 |
|---|---|---|
| `zh`, `zh-CN`, `zh_CN` | `zh-CN` | script·지역이 없으면 간체. 기존 formatter의 `zh` → `zh-CN`과 같은 정책 |
| `zh-Hans`, `zh-Hans-CN`, `zh-Hans-SG`, `zh-Hans-TW`, `zh-Hans-HK`, `zh-Hans-MO` | `zh-CN` | **script가 지역보다 우선** |
| `zh-SG`, `zh-MY`, 그 밖의 지역(`zh-US` 등) | `zh-CN` | 번체 지역 목록에 없는 지역은 간체 |
| `zh-TW`, `zh_TW` | `zh-TW` | 번체 지역 |
| `zh-HK`, `zh-MO` | `zh-TW` | 번체 지역(홍콩·마카오 전용 번역팩은 없으므로 대만 번체 리소스 사용) |
| `zh-Hant`, `zh-Hant-TW`, `zh-Hant-HK`, `zh-Hant-MO`, `zh-Hant-CN`, `zh-Hant-SG` | `zh-TW` | **script가 지역보다 우선** |
| 언어명 `chinese`, `simplified chinese`, `简体中文`, `中文`, `중국어` | `zh-CN` | 저장된 프로필·legacy 값 호환 |
| 언어명 `traditional chinese`, `繁體中文`, `중국어(번체)` | `zh-TW` | 〃 |
| `yue-HK`, `cn`, `tw`, `hk`, `zho`, `chi` | `null` | 중국어 코드가 아니므로 기존 fallback(프로필 → 기기 → `en`) |

- 우선순위(기존 유지): 저장된 명시 선택 > 프로필 언어 > 기기 언어 > 기본 `en`.
- **상호 덮어쓰기 없음**: 저장값이 `zh-TW`이면 프로필·기기가 `zh-CN`/`zh-Hans`여도 `zh-TW`이고, 반대도 같다.
  저장 키 `language`에는 선택한 코드(`zh-CN` 또는 `zh-TW`)가 그대로 들어간다.
- 온보딩 완료 저장(`@pingdom/onboarding-completed:v1`)의 언어 검증 목록에 `zh-CN`·`zh-TW`를 추가했다.
  빠져 있으면 앱 재실행 때 온보딩이 다시 시작된다. 과거 저장값 `zh`는 그대로 유효하며 `zh-CN`으로 해석한다.
- fallback(기존 유지): `fallbackLng: en`. 간체 ↔ 번체 사이의 fallback은 없다. 누락 키는 `common.missingTranslation`.

## formatter

| 항목 | zh-CN | zh-TW |
|---|---|---|
| `resolveLocale` | `zh-CN` | `zh-TW` |
| 날짜·시간 (`2026-09-30 14:05`) | `2026年9月30日 14:05` | `2026年9月30日 下午2:05` |
| 거리 1,500 m | `1.5公里` | `1.5 公里` |
| 통화 12,000 KRW | `₩12,000` | `￦12,000` |
| 상대 시간 fallback(`Intl.RelativeTimeFormat` 없음) | `18分钟前`, `现在` | `18分鐘前`, `現在` |

통화 코드·금액·장소 timezone 날짜는 언어와 무관하다(`formatters.test.ts`에서 자릿수·날짜 동일성 검증).

## 서버 계약

- `SignupRequest.language`: `type: string`, `maxLength: 20`, enum 없음, 설명 "언어 코드 또는 언어명"
  (live `https://www.typenull.xyz/v3/api-docs/common`, 2026-10-06 조회). 스키마상 `zh-CN`·`zh-TW`를 허용한다.
- `UserResponse`/`LoginResponse`/`MyPageResponse.language`: `string`.
- 계정 언어를 바꾸는 API는 명세에 없다. 설정의 언어 변경은 기기에만 저장된다(기존 동작).
- 가입 시 온보딩에서 고른 코드(`zh-CN`/`zh-TW`)를 그대로 보낸다. `zh`·`en` 등 다른 코드로 바꿔 보내지 않는다.
- **실서버가 `zh-CN`·`zh-TW`를 저장·반환하는지는 검증하지 않았다(미검증, 확인 필요).**

## 글꼴

- `PretendardVariable.ttf`(Std)에는 한자 글리프가 없다(cmap 확인: zh-CN 655자·zh-TW 667자 전부 미포함).
  일본어·한국어와 마찬가지로 시스템 글꼴로 fallback한다.

## 번역 검수

모든 zh-CN·zh-TW 문구는 **기계 번역 초안이며 사람 검수가 필요하다.** 번체는 간체를 변환한 것이 아니라
대만 용어 기준으로 따로 작성했고, `catalogParity.test.mjs`가 번체 카탈로그의 간체 전용 글자(및 반대)를 막는다.
검수 대상 키 전체는 [413-zh-translation-review.md](413-zh-translation-review.md)에 있다.
