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
| 숫자·날짜 formatter locale | `es` (국가 없는 CLDR 기본). 예: `30 sept 2026, 14:05`, `1,5 km`, `12.000 ₩` |
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
