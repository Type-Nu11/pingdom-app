# #414 앱 UI 베트남어(vi) 지원 검증 기록

## 기준과 구현 경계

- 브랜치 `feat/413-416-i18n-zh-vi-es-pt-br`, 시작 기준 `origin/dev` `05ed9a68`. #413·#415·#416과 같은 PR이다.
- 구현 위치: **V2**. **V1 dependency delta: `none`** (`src/features/**` 수정 없음).
- 지원 코드 `vi`, 선택지 표기 `Tiếng Việt`.
- 제외 범위: 서버 동적 콘텐츠 번역, AI 응답 언어, STT/TTS·Wake Word(음성 입력 locale은 기존대로 `en-US`), 지도 SDK.

## 언어 해석 규칙

| 항목 | 동작 |
|---|---|
| 정규화 | `vi`, `VI`, `vi-VN`, `vi_VN`, `vi-Latn-VN`, 그 밖의 `vi-*`, `vietnamese`, `tiếng việt`, `베트남어` → `vi` |
| 매핑하지 않는 값 | `vn`(국가 코드), `vie`, `vietnam` → `null` → 기존 fallback(프로필 → 기기 → `en`) |
| 우선순위(기존 유지) | 저장된 명시 선택 > 프로필 언어 > 기기 언어 > 기본 `en` |
| 기존 선택 보호 | 저장된 선택이 있으면 프로필·기기가 `vi`여도 덮어쓰지 않는다 |
| fallback(기존 유지) | `fallbackLng: en`, 누락 키는 `common.missingTranslation` |
| 온보딩 완료 저장 | 검증 목록에 `vi`가 이미 있었고 그대로 유효하다 |

## formatter (기존 `vi` 분기 확인)

`resolveLocale`의 `vi` → `vi-VN` 분기와 거리 단위 목록(`METRIC_LOCALES`)의 `vi`는 이미 있었고 변경하지 않았다.
`Intl.RelativeTimeFormat`이 없을 때 쓰는 fallback만 "지금"(`bây giờ`) 한 단어에서 전체 문구로 채웠다.

| 항목 | 결과 |
|---|---|
| 날짜·시간 (`2026-09-30 14:05`) | `14:05 30 thg 9, 2026` |
| 날짜 (`formatDate`, Asia/Seoul) | `30/09/26` (일/월/연) |
| 숫자 1,234,567 | `1.234.567` |
| 거리 1,500 m | `1,5 km` |
| 통화 12,000 KRW | `12.000 ₩` (통화·금액 불변, `₫`로 바뀌지 않음) |
| 소요 시간 5–10분 | `5 phút–10 phút` |
| 상대 시간 | `7 phút trước`, fallback `18 phút trước` · `2 giờ trước` · `2 ngày trước` · `bây giờ` |

복수형: 베트남어는 CLDR 복수 범주가 `other` 하나다. `_one` 키도 같은 문구로 채워 `Intl.PluralRules`가 없는
환경에서도 영어로 떨어지지 않게 했다(`catalogParity.test.mjs`가 count 0·1·2·5·11·21·100·1,000,000을 검사).

## 서버 계약

- `SignupRequest.language`: `type: string`, `maxLength: 20`, enum 없음
  (live `https://www.typenull.xyz/v3/api-docs/common`, 2026-10-06 조회). 스키마상 `vi`를 허용한다.
- 계정 언어 변경 API는 없다. 가입 시 `vi`를 그대로 보내며 다른 코드로 바꿔 보내지 않는다.
- **실서버의 `vi` 저장·반환은 검증하지 않았다(미검증, 확인 필요).**

## 글꼴

- `PretendardVariable.ttf` cmap 확인: 번역에 쓰인 비ASCII 글자 81자(성조 결합형 `ệ`, `ữ`, `ặ`, `ở` 등 포함)가
  **모두 Pretendard에 있다.** 시스템 글꼴 fallback 없이 한 글꼴로 렌더링된다.

## 번역 검수

모든 vi 문구는 **기계 번역 초안이며 사람 검수가 필요하다.** 검수 대상 키 전체는
[414-vi-translation-review.md](414-vi-translation-review.md)에 있다.

## 수동 검증

iOS 시뮬레이터 검증 결과·캡처, Android·실서버 미검증 사유, iOS 기기 언어 fallback 수정은
[413-416-multilingual-i18n.md](413-416-multilingual-i18n.md)에 4개 언어를 묶어 기록했다.
