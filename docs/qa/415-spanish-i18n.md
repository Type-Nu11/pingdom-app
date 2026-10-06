# #415 앱 UI 스페인어(es) 지원 검증 기록

## 번역 지역 기준 (구현 전 확정, 2026-10-06)

**기본 스페인어 번역은 특정 국가에 치우치지 않은 중립 국제 스페인어로 한다.** 선택지는 `Español` 하나이고
지원 코드는 `es`다. 지역별 번역팩(`es-ES`, `es-419`, `es-MX` 전용)은 만들지 않는다.

| 항목 | 기준 |
|---|---|
| 2인칭 단수 | **tú** (`Toca`, `Revisa`, `Inténtalo`). usted 미사용 |
| 2인칭 복수 | ustedes. **vosotros 미사용** |
| 어휘 | 지역색이 강한 단어를 피한다. `móvil`/`celular` 대신 `dispositivo`, `ordenador`/`computadora` 미사용, 입력 안내는 `Ingresa`/`Introduce` 대신 `Escribe` |
| 앱 용어 | app, cupón, reserva, lugar, ajustes, iniciar sesión, reseña, verificar |
| 요일 약자 | `D L M M J V S` (스페인식 `X` 미사용) |
| 문장 부호 | 여는 `¿` `¡` 사용, 인용은 `«»` |
| 숫자·날짜 formatter locale | `es` (국가 없는 CLDR 기본). 예: `30 sept 2026, 14:05`, `1,5 km`, `12.000 KRW` |
| 거리 단위 | 미터법(km) |

## 기기·프로필·저장값 locale 정규화

| 입력 | 결과 |
|---|---|
| `es`, `ES`, `es-ES`, `es_ES` | `es` |
| `es-419`, `es-MX`, `es-US`, `es-AR`, `es-CO`, 그 밖의 `es-*` | `es` |
| 언어명 `spanish`, `español`, `스페인어` | `es` |
| `esp`, `spa`, `ca-ES`(카탈루냐어), `gl-ES`, `eu-ES` | `null` → 기존 fallback(프로필 → 기기 → `en`) |

- 모든 스페인어 지역 locale은 단일 선택지 `es`로 정규화한다. 지역에 따라 다른 문구를 보여 주지 않는다.
- 우선순위(기존 유지): 저장된 명시 선택 > 프로필 언어 > 기기 언어 > 기본 `en`.
- 기존 선택 보호: 저장된 선택이 있으면 프로필·기기가 `es-*`여도 덮어쓰지 않는다.
- fallback(기존 유지): `fallbackLng: en`, 누락 키는 `common.missingTranslation`.
- 온보딩 완료 저장(`@pingdom/onboarding-completed:v1`)의 언어 검증 목록에 `es`를 추가했다(없으면 재실행 때 온보딩 반복).

## 기준과 구현 경계

- 브랜치 `feat/413-416-i18n-zh-vi-es-pt-br`, 시작 기준 `origin/dev` `05ed9a68`. #413·#414·#416과 같은 PR이다.
- 구현 위치: **V2**. **V1 dependency delta: `none`** (`src/features/**` 수정 없음).
- 제외 범위: 지역별 번역팩, 서버 동적 콘텐츠 번역, AI 응답 언어, STT/TTS·Wake Word(음성 입력 locale은 기존대로 `en-US`).

## formatter

스페인어는 이전에 `en-US`로 떨어져 마일(mi)로 표시됐다. `es` 분기와 미터법을 추가했다.

| 항목 | 결과 (`es`, `es-ES`, `es-419`, `es-MX` 모두 동일) |
|---|---|
| `resolveLocale` | `es` |
| 날짜·시간 (`2026-09-30 14:05`) | `30 sept 2026, 14:05` |
| 날짜 (`formatDate`, Asia/Seoul) | `30/09/26` |
| 숫자 1,234,567 | `1.234.567` |
| 거리 1,500 m | `1,5 km` (이전: `0.9 mi`) |
| 통화 12,000 KRW | `12.000 KRW` (통화·금액 불변, `€`·`$`로 바뀌지 않음) |
| 소요 시간 5–10분 | `5 min–10 min` |
| 상대 시간 | `hace 7 minutos`, fallback `hace 18 min` · `hace 2 h` · `hace 2 d` · `ahora` |

복수형: 스페인어의 CLDR 복수 범주는 `one`·`many`·`other`다. `_other`가 있는 키 12개에 `_many`를 추가해
1,000,000 같은 수에서 영어로 떨어지지 않게 했다(`catalogParity.test.mjs`가 키 존재와 count별 결과를 검사).

## 서버 계약

- `SignupRequest.language`: `type: string`, `maxLength: 20`, enum 없음
  (live `https://www.typenull.xyz/v3/api-docs/common`, 2026-10-06 조회). 스키마상 `es`를 허용한다.
- 계정 언어 변경 API는 없다. 가입 시 `es`를 그대로 보내며 기기 지역(`es-MX` 등)이나 다른 코드로 바꿔 보내지 않는다.
- **실서버의 `es` 저장·반환은 검증하지 않았다(미검증, 확인 필요).**

## 글꼴

- `PretendardVariable.ttf` cmap 확인: 번역에 쓰인 비ASCII 글자 17자(`á é í ó ú ñ ü ¿ ¡ « »` 등)가 **모두 Pretendard에 있다.**

## 번역 검수

모든 es 문구는 **기계 번역 초안이며 사람 검수가 필요하다.** 검수 대상 키 전체는
[415-es-translation-review.md](415-es-translation-review.md)에 있다.
