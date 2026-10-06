# #416 앱 UI 브라질 포르투갈어(pt-BR) 지원 검증 기록

## 기준과 구현 경계

- 브랜치 `feat/413-416-i18n-zh-vi-es-pt-br`, 시작 기준 `origin/dev` `05ed9a68`. #413·#414·#415와 같은 PR이다.
- 구현 위치: **V2**. **V1 dependency delta: `none`** (`src/features/**` 수정 없음).
- 지원 코드 `pt-BR`, 선택지 표기 `Português (Brasil)`. 번역·표기 기준은 브라질 포르투갈어로 확정이다
  (2인칭 você, `celular`/`aparelho`, `cadastro`, `cupom`, `tela`, `arquivo`, 진행형 gerúndio).
- 제외 범위: `pt-PT` 번역팩, 서버 동적 콘텐츠 번역, AI 응답 언어, STT/TTS·Wake Word(음성 입력 locale은 기존대로 `en-US`).

## 기기·프로필·저장값 locale 정규화

판정은 `src/v2/shared/i18n/locale.ts`의 `isBrazilianPortuguese` 한 곳에서 하며 언어 선택과 formatter가 같이 쓴다.

| 입력 | 결과 | 근거 |
|---|---|---|
| `pt`, `PT`, `pt-Latn` | `pt-BR` | 지역이 없는 포르투갈어는 브라질 포르투갈어로 정규화 |
| `pt-BR`, `pt_BR`, `pt-Latn-BR` | `pt-BR` | |
| 언어명 `brazilian portuguese`, `português (brasil)`, `포르투갈어(브라질)` | `pt-BR` | 저장된 프로필·legacy 값 호환 |
| **`pt-PT`, `pt_PT`, `pt-Latn-PT`** | **`null`** | **브라질식 번역으로 자동 매핑하지 않는다** → 기존 fallback(프로필 → 기기 → `en`) |
| `pt-AO`, `pt-MZ` 등 그 밖의 지역 | `null` | 유럽식 표기를 따르는 지역이므로 `pt-PT`와 같이 취급 |
| 지역 없는 언어명 `portuguese`, `português`, 코드 `por`, `br` | `null` | 어느 변형인지 알 수 없어 매핑하지 않음 |

- `pt-PT` 기기에서 저장값·프로필이 없으면 기본 `en`으로 표시된다(기존 미지원 언어와 같은 동작).
- **설정·온보딩에서 `pt-BR`을 직접 고르는 것은 허용**되며, 이후 기기·프로필이 `pt-PT`여도 `pt-BR`이 유지된다.
- 저장된 값이 `pt-PT`인 경우(이 앱은 그런 값을 저장하지 않는다) 저장된 선택이 없는 것으로 처리한다.
- 우선순위(기존 유지): 저장된 명시 선택 > 프로필 언어 > 기기 언어 > 기본 `en`.
- 온보딩 완료 저장(`@pingdom/onboarding-completed:v1`)의 언어 검증 목록에 `pt-BR`을 추가했다.

## formatter

포르투갈어는 이전에 `en-US`로 떨어져 마일(mi)로 표시됐다. `pt`·`pt-BR`에 `pt-BR` 분기와 미터법을 추가했다.
`pt-PT`는 formatter에서도 `pt-BR`로 바꾸지 않는다(`en-US` 유지).

| 항목 | 결과 |
|---|---|
| `resolveLocale` | `pt`, `pt-BR` → `pt-BR` / `pt-PT`, `pt-AO` → `en-US` |
| 날짜·시간 (`2026-09-30 14:05`) | `30 de set. de 2026, 14:05` |
| 날짜 (`formatDate`, Asia/Seoul) | `30/09/26` |
| 숫자 1,234,567 | `1.234.567` |
| 거리 1,500 m | `1,5 km` (이전: `0.9 mi`) |
| 통화 12,000 KRW | `₩ 12.000` (통화·금액 불변, `R$`로 바뀌지 않음) |
| 소요 시간 5–10분 | `5 min–10 min` |
| 상대 시간 | `há 7 minutos`, fallback `há 18 min` · `há 2 h` · `há 2 d` · `agora` |

복수형: 포르투갈어의 CLDR 복수 범주는 `one`·`many`·`other`다. `_other`가 있는 키 13개에 `_many`를 추가했다
(`catalogParity.test.mjs`가 키 존재와 count 0·1·2·5·11·21·100·1,000,000의 결과를 검사).

## 서버 계약

- `SignupRequest.language`: `type: string`, `maxLength: 20`, enum 없음
  (live `https://www.typenull.xyz/v3/api-docs/common`, 2026-10-06 조회). 스키마상 `pt-BR`을 허용한다.
- 계정 언어 변경 API는 없다. 가입 시 `pt-BR`을 그대로 보내며 `pt`·`en` 등 다른 코드로 바꿔 보내지 않는다.
- **실서버의 `pt-BR` 저장·반환은 검증하지 않았다(미검증, 확인 필요).**

## 글꼴

- `PretendardVariable.ttf` cmap 확인: 번역에 쓰인 비ASCII 글자 23자(`ã õ ç á é í ó ú â ê ô à` 등)가 **모두 Pretendard에 있다.**

## 번역 검수

모든 pt-BR 문구는 **기계 번역 초안이며 사람 검수가 필요하다.** 검수 대상 키 전체는
[416-pt-br-translation-review.md](416-pt-br-translation-review.md)에 있다.

## 수동 검증

iOS 시뮬레이터 검증 결과·캡처, Android·실서버 미검증 사유, iOS 기기 언어 fallback 수정은
[413-416-multilingual-i18n.md](413-416-multilingual-i18n.md)에 4개 언어를 묶어 기록했다.
