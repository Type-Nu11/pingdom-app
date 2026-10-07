# 길찾기 앱 점검 — 2026-10-07

구현 위치: **V2** (`src/v2/modules/place/map/routes/**`). V1 dependency delta: **none**.

## 발견한 앱 결함과 수정

현재 위치를 출발 또는 도착 지점으로 사용하면 GPS 갱신 후 화면의 지점은 새 좌표를 표시하지만 기존 경로 결과와 진행 중 요청은 이전 좌표를 유지했습니다. `CarRoutePreview`가 경로 세션을 endpointRevision·이동수단에만 연결하고 실제 좌표에는 연결하지 않은 것이 원인입니다.

출발·도착의 유효 좌표를 세션 식별에 포함했습니다. 좌표 변경 시 이전 경로·거리·시간을 숨기고 진행 중 요청을 취소하며 늦은 응답을 폐기합니다. 사용자가 조회 버튼을 눌러야 새 좌표로 요청합니다. 좌표가 같은 GPS 메타데이터 갱신과 두 장소를 직접 선택한 경로는 유지합니다.

수정 전 재현 테스트 4개가 실패했습니다(현재 위치가 출발/도착인 경우 각각 완료 결과 제거·진행 중 요청 취소). 수정 후 해당 테스트와 보존 동작 테스트 2개를 포함한 길찾기 테스트 83개가 통과했습니다.

이 결함은 운영 서버의 `503 / ROUTE_PROVIDER_UNAVAILABLE`을 일으키는 원인은 아닙니다.

## 검토 결과

| 관점 | 확인한 범위와 결과 |
|---|---|
| 정확성 | 화면 진입, 출발·도착 선택과 교체, 좌표 검증, 성공 응답 변환, 취소·화면 이탈·이동수단 변경 처리 검토. GPS 변경 시 경로 무효화 결함 수정. |
| 보안 | `/routes`는 공통 인증 transport를 사용하며 JWT 및 App·timestamp·version·device-id 헤더를 적용. 외부 네이버지도에는 좌표·장소명 URL만 전달. 실패 진단에는 토큰·좌표·키를 기록하지 않는 경계 확인. |
| 성능 | 경로 자동 조회·재시도 없음. 새 세션에서 이전 요청 취소 및 늦은 응답 폐기. GPS 변경 후 추가 유료 요청 없이 결과를 무효화. |
| 유지보수 | V2 API·모델·hook·화면 경계 유지. Android/iOS의 routeCoordinates prop과 전체 polyline 연결을 코드로 확인. 네이티브 코드는 수정하지 않음. |

## 검증

- `npm run test:v2-routes -- --watchman=false`: 6 suites, 83 tests 통과.
- `npm run test:v2-map`: 50 tests 통과. 최초 샌드박스 IPC 제한(EPERM) 후 제한 밖에서 재실행.
- `npm run test:v2-api`: 206 tests 통과.
- `npm run typecheck`: 통과.
- `npm run check:v2`: 경계 검사 및 76 tests 통과.
- `npm run check:routes-api-types`: 저장된 OpenAPI snapshot과 생성 타입 일치. 운영 서버를 새로 다운로드한 검사는 아님.
- `git diff --check`: 통과.

전체 `npm test -- --runInBand --watchman=false`: **176 suites 중 175 통과·1 실패, 1705 tests 중 1704 통과·1 실패**. 실패는 `src/app/navigation/__tests__/SettingsNavigation.test.tsx`의 `detail route preserves loginInformation param and displays actual identity`이며 5000ms timeout입니다. 이 테스트는 MapScreen을 mock으로 대체하므로 변경한 길찾기 화면을 실행하지 않습니다. 같은 테스트만 단독 재실행했을 때는 통과했습니다(1 passed / 19 skipped). 전체 실행에서의 timeout 원인은 확정하지 않았으며 전체 앱 검사를 모두 통과했다고 판단하지 않습니다. 일부 다른 suite에는 기존 act 관련 경고도 출력됐습니다.

## 실기기·운영 한계

이 대화에서 수정 전 로그인된 Android SM_F966N의 실제 조회는 2026-10-07 13:57:01 KST에 `503 / ROUTE_PROVIDER_UNAVAILABLE`로 실패했습니다. 추적 ID는 `297bdd52-d100-4713-ae36-74d3897081c3`입니다. 서버 이슈: https://github.com/Type-Nu11/pingdom-api/issues/1765.

추가 점검 시 해당 기기(ADB serial R3CY60JJLPP)가 연결 해제됐고 다른 기기만 확인됐습니다. 다른 기기를 대신 조작하지 않았습니다. 이번 수정은 작업 트리에 반영했으며 수정 후 APK 빌드·기기 설치·실기기 검증은 수행하지 않았습니다.

실제 서버 200 응답 → 네이티브 경로선·거리·시간 표시 검증은 서버 오류로 미완료입니다. 자동 테스트의 성공 fixture와 네이티브 코드 검토는 이 실기기 성공 검증을 대신하지 않습니다. iOS 실제 실행도 이번 점검에 포함하지 않았습니다.
