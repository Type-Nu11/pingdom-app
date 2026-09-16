# #321 위치·개인정보 설정 구현 보고

## 범위와 기준

- 구현 위치: **V2**, 네이티브 권한 경계는 `src/v2/shared/location`.
- 작업 브랜치: `feat/321-location-privacy-settings`.
- 시작 시 `git fetch origin` 수행. HEAD와 최신 `origin/dev`는 모두 `ff2a9fbcc10e23920513d2b5a5d2c5b452544309`.
- `AGENTS.md`, GitHub #321, #228, #197 본문 확인 후 구현.
- #228의 헤더·섹션·스크롤 구조와 기존 설정 진입 경로 유지. 지원되지 않는 토글은 설명 행으로 교체.
- #197의 주기적 수집·전송, background 추적, #356 구조 개편 제외.
- V1 dependency delta: **none**. `legacy-exception` 불필요.
- 최초 구현 완료 시 커밋·푸시하지 않았으며, 후속 사용자 요청에 따라 아래 단위의 로컬 커밋으로 정리한다. 푸시는 하지 않는다.

## 실서버 계약 확인

- URL: <https://www.typenull.xyz/v3/api-docs>
- 직접 GET 완료 시각: **2026-09-16 07:40:11 UTC / 16:40:11 KST**.
- HTTP 상태: **200**.
- 받은 응답 SHA-256: `9129edde1977b1e5c75176fbdd3bc1aa2e9069eb9d2f00707d9aae03f8e3da3a`.
- 저장소 snapshot이 아니라 위 응답의 paths, 설명, request/response schema를 확인함. 인증된 사용자 API 호출이나 데이터 변경을 수행한 것은 아님.

확인한 주요 계약:

| 계약 | 확인 결과 | 이번 사용 |
|---|---|---|
| `GET /users/me/export` | `UserDataExportResponse`: user, bookmarks, likedMapImageIds, travelSchedules, currentActivityIntent, merchantOwnerProfile, merchantVerification, touristOffers, touristCoupons. 위치 이력 필드 없음 | 기존 `DataExportScreen`으로 이동. “내 데이터 내보내기”로 표시 |
| `DELETE /users/me` | 개인정보 익명화 및 회원탈퇴 | 호출하지 않음 |
| `GET/POST /location-check-ins` | 사용자 체크인 목록 / 좌표 기반 단건 체크인 | 설정 저장이나 위치 추적에 재사용하지 않음 |
| `POST /visit-verification-sessions`, `/foreground`, `/{sessionId}/observations`; `GET /visit-verification-sessions/{sessionId}` | 방문 인증 시작·관측·상태 조회 | 기존 앱 capability 근거. 설정 화면에서 호출하지 않음 |
| 프로필·닉네임 공개, 위치 수집 설정, 위치 기록 전용 삭제 | 공개 계약 확인되지 않음 | 미지원 안내 |

일반 사용자 데이터 export를 위치 기록 export로 해석하지 않는다. 서버 설명에 나열된 데이터와 schema 필드가 완전히 동일하지 않으므로 화면은 지원되는 일반 사용자 데이터라고 설명하며 모든 데이터의 포함을 보장하지 않는다.

## 항목별 조사 및 연결 결과

| 설정 항목 | OS 권한 | 앱 기능 | 서버 API | 저장 가능 여부 | 이번 구현 |
|---|---|---|---|---|---|
| 기기 위치 권한 | foreground | Expo 조회·명시적 요청·OS 설정 이동 | 불필요 | OS에서 관리 | 실제 권한 및 서비스 사용 가능 여부 표시 |
| 기록할 때만 위치 수집 | 권한과 별개인 수집 정책 | 저장 기능 없음 | 확인되지 않음 | 불가 | 정책 미지원 이유, 주기 수집과 별개임을 표시 |
| GPS 현장 인증 | foreground 필요 | 기존 방문 인증 구현 | 인증 세션·체크인 존재, preference API 아님 | 설정으로 저장 불가 | 위치 권한에 따른 capability 표시 |
| 발자국 지도 | 설정과 별개 | 전용 V2 화면·데이터 연결 없음 | 해당 지도/공개 설정 계약 없음 | 불가 | 준비 중 설명 |
| 프로필 공개 | 무관 | 공개 범위 저장 없음 | 확인되지 않음 | 불가 | 미지원 설명 |
| 닉네임 표시 | 무관 | 표시 여부 저장 없음 | 확인되지 않음 | 불가 | 미지원 설명 |
| 위치 기록 다운로드 | 불필요 | 기존 일반 사용자 데이터 export 화면 | `GET /users/me/export`, 위치 이력 schema 없음 | 일반 사용자 JSON 파일 준비 가능 | “내 데이터 내보내기”로 정정 후 기존 화면 연결 |
| 개인정보 처리방침 | 무관 | 승인된 V2 문서/URL 없음 | 불필요 | 해당 없음 | 문서 연결 준비 중 설명 |
| 위치 기록 삭제 | 무관 | 전용 삭제 없음 | 전용 계약 확인되지 않음 | 불가 | 버튼·삭제 alert 없이 미지원 설명 |

미지원 항목에는 Switch, 임의 AsyncStorage preference, 성공 alert, 삭제 mutation이 없다. V1에는 정적 정책 문구가 있으나 승인 여부가 확인되지 않고 V2 정책 route도 아니므로 이를 import하거나 정책으로 복제하지 않았다.

## 권한 경계와 OS 상태 매핑

`foregroundPermission.ts`가 네이티브 foreground 권한 접근을 모은다. 설정용 `readForegroundPermission`은 adapter 주입 가능하며 좌표 API를 갖지 않는다. 기존 지도·체크인·방문 인증은 같은 네이티브 getter/requester를 사용하지만 기존 요청 정책과 좌표 정확도 설정을 유지한다.

| 내부 상태 | OS/조회 결과 | 화면 | CTA |
|---|---|---|---|
| loading | 초기 조회 또는 재조회 진행 | 확인 중, 접근성 busy | 완료 전 액션 없음 |
| granted | 서비스 사용 가능 + granted | 허용됨 | 기기 설정 열기(변경·해제) |
| denied | denied 또는 undetermined + canAskAgain=true | 권한 필요 | 위치 권한 요청 |
| restricted | restricted 또는 미허용 + canAskAgain=false | 설정에서 허용 필요 | 기기 설정 열기 |
| unavailable | hasServicesEnabledAsync=false | 사용할 수 없음 | 기기 설정 열기 |
| error | 네이티브 조회·요청 오류 | 확인 실패 | 다시 확인 |

Expo가 restricted를 별도 status로 주지 않는 경우 `canAskAgain=false`를 통해 같은 표시로 매핑한다. 서비스가 꺼져 있으면 permission이 granted여도 unavailable을 우선 표시한다. 앱 설정 열기는 OS 전역 위치 서비스 자체를 켜는 API가 아니다.

- 화면 mount: foreground 권한과 서비스 활성 여부만 조회. 권한 팝업·좌표 조회·추적·체류 측정 없음.
- 요청: 사용자가 요청 버튼을 누른 뒤 현재 권한을 다시 읽어 재요청 가능한 경우에만 OS 요청. 중복 요청 방지.
- granted 권한을 앱 Switch로 철회하는 UI 없음. 변경은 OS 설정에서 수행.
- OS 설정 열기 실패: 내부 오류를 노출하지 않고 번역된 재시도 안내. 실패해도 현재 권한 상태를 허용으로 바꾸지 않음.
- AppState가 background/inactive에서 active로 돌아오면 다시 조회.
- OS 요청 팝업의 inactive→active 이벤트가 요청 결과를 덮어쓰지 않도록 요청 중 재조회를 억제하고 팝업의 응답을 사용.
- unmount 시 listener 해제, mounted/generation 검사로 늦은 응답과 이전 조회의 결과 무시.
- 내보내기는 기존 설정 화면 내부 탐색 패턴을 유지하며 뒤로가기 및 Android hardware back으로 위치 화면 복귀. 내보내기 진입만으로 다운로드하지 않고 기존 사용자 확인 이후 API 요청.
- ko/en 문구, theme 색상, 상태별 문구·색상, accessibility label/role/state, 상태 변경 live region 적용.

## 변경 파일

| 파일 | 변경 |
|---|---|
| `src/v2/shared/location/foregroundPermission.ts` | 네이티브 adapter 및 설정용 상태 매핑 |
| `src/v2/shared/location/useForegroundPermission.ts` | mount·foreground 조회, 요청·설정 이동, 비동기 정리 |
| `src/v2/shared/location/currentLocation.ts` | 체크인 권한 접근을 공통 adapter로 변경 |
| `src/v2/features/map/services/locationService.ts` | 지도 권한 접근을 공통 adapter로 변경 |
| `src/v2/features/place-visit-verification/services/locationPermission.ts` | 방문 인증 상태 조회를 공통 adapter로 변경 |
| `src/v2/features/settings/screens/LocationPrivacyScreen.tsx` | 실제 권한, capability, 미지원 설명 및 내보내기 연결 |
| `src/v2/features/settings/screens/SettingsScreen.tsx` | 하드코딩 권한 presentation prop 제거 |
| `src/v2/shared/i18n/resources.ts` | ko/en 지원 상태·오류·액션 문구 |
| `src/v2/features/settings/screens/__tests__/LocationPrivacy.test.tsx` | 실제 화면 권한·오류·내보내기·미지원·접근성·다크모드 테스트 |
| `src/v2/features/settings/screens/__tests__/SettingsScreen.test.tsx` | 이전 미연결 골격 기대값을 새 화면 기대값으로 교체 |
| `src/v2/shared/location/__tests__/foregroundPermission.test.tsx` | adapter, lifecycle, 오래된 응답, 설정 이동 정리 테스트 |
| `src/v2/shared/location/__tests__/locationConsumers.test.ts` | 실제 지도·체크인·방문 인증 소비자 회귀 테스트 |
| `docs/issue-321-location-privacy-settings.md` | 이 조사·검증 보고서 |

## 검증

핵심 화면 테스트 13개가 기존 구현에서 실패하는 것을 먼저 확인했다. 추가로 권한 팝업과 foreground 경합 테스트가 실패하는 것을 확인한 뒤 수정했다.

| 실행 | 결과 |
|---|---|
| `npm run check:v2` | 통과 |
| `npm run typecheck` | 통과 |
| `npm run test:navigation` | 22개 통과 |
| `npm run test:regression` | 232개 통과: navigation 22, i18n 11, V2 navigation 7, map 47, API 145 |
| `npm run validate:pr` | 통과: ownership 2, Jest 119 suites / 1,056 tests, regression 232 포함 |
| `npm run check:v1-changes -- --base origin/dev` | 통과, V1 추가·수정 없음 |
| `git diff --check` | 통과 |
| 위치·설정·방문 인증 별도 Jest 실행 | 최종 12 suites / **92 tests 통과** |

별도 실행 명령:

```bash
node node_modules/jest/bin/jest.js \
  src/v2/shared/location/__tests__ \
  src/v2/features/settings/screens/__tests__ \
  src/v2/features/place-visit-verification --runInBand
```

새 테스트는 화면 16개 + 권한 경계/lifecycle 8개 + 기존 소비자 회귀 5개 = 29개. 후속 커밋 준비 단계에서 마지막 소비자 회귀 5개까지 포함한 전체 validate:pr을 다시 실행하여 119 suites / 1,056 tests와 후속 regression 232개가 통과했다. 별도 실행 수 92는 전체 테스트에 포함되므로 단순 합산하지 않는다.

tsx 실행은 최초 샌드박스 IPC 소켓 제한(EPERM)으로 실패했고, 같은 필수 명령을 권한을 높여 재실행하여 통과했다. 전체 Jest 실행의 기존 MapBottomSheet 등 테스트에서 React act 경고가 출력되었으나 실패는 없었으며, 변경 영역 별도 실행에서는 해당 경고가 없었다.

## 기기 검증과 남은 blocker

| 확인 항목 | Android | iOS |
|---|---|---|
| 환경 확인 | SM_N981N 1대 연결, 현재 전면 앱은 다른 앱 | 실행 중인 시뮬레이터 없음 |
| 최초 미결정·허용·거부·다시 묻지 않음 | 현재 변경 빌드로 수동 검증하지 않음 | 수동 검증하지 않음 |
| OS 설정 변경 후 복귀·위치 서비스 비활성 | 현재 변경 빌드로 수동 검증하지 않음 | 수동 검증하지 않음 |
| 작은 화면·VoiceOver/TalkBack·실제 다크모드 렌더링 | 수동 검증하지 않음 | 수동 검증하지 않음 |

코드 테스트는 실기기 검증을 대신한 결과로 표시하지 않는다. 출시 전 위 OS별 시나리오의 수동 확인이 남아 있다. Android 기기 데이터/권한을 초기화하거나 다른 실행 중 앱을 변경하지 않았다.

기능 blocker는 위치 수집 정책·설정 저장 계약, 발자국 지도 제품/데이터 계약, 프로필·닉네임 공개 preference 계약, 위치 기록만 삭제하는 전용 API, 승인된 정책 문서의 V2 연결이다. 이러한 계약이 확정되기 전에는 미지원 안내를 유지한다. #197의 주기 수집·배치 전송은 별도 이슈이며 이 화면의 허용 상태가 수집 동의나 기능 활성화를 의미하지 않는다.

## 후속 요청: 기능·페이지별 커밋 분할

`rcp` 스킬과 저장소 README, V2 README, AGENTS.md, PR template, CI workflow를 확인했다. 저장소 문서에는 별도 커밋 메시지 형식 규정이 없으며 최근 이력의 대문자 타입·이슈 번호·한국어 제목 형식을 따른다. 메시지는 rcp의 명시적 승인 절차를 따른다.

| 순서 | 커밋 메시지 | 포함 범위 |
|---|---|---|
| 1 | `Feat: #321 공통 위치 권한 조회 및 요청 경계 구현` | foregroundPermission.ts, useForegroundPermission.ts, foregroundPermission.test.tsx |
| 2 | `Refactor: #321 지도 및 방문 인증 권한 접근 공통화` | currentLocation.ts, 지도 locationService.ts, 방문 인증 locationPermission.ts, locationConsumers.test.ts |
| 3 | `Feat: #321 위치·개인정보 설정 페이지 실제 권한 및 지원 상태 연결` | LocationPrivacyScreen.tsx, SettingsScreen.tsx, ko/en resources.ts, LocationPrivacy.test.tsx, SettingsScreen.test.tsx |
| 4 | `Docs: #321 위치·개인정보 계약 조사 및 검증 결과 정리` | 이 보고서 |

각 구현 커밋에 관련 테스트를 함께 포함하고 공통 경계 → 소비자 → 페이지 순서로 의존성을 유지한다.
