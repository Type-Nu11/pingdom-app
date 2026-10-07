# #350 — #349 병합 후 실기기 검증 (2026-10-07)

**전체 완료 아님.** PR #418 병합은 예약 초안·일반 조회 앱 구현의 반영이며 최종 예약 확인·생성 완료가 아닙니다. #349와 #350은 조회 시 OPEN입니다. 실제 예약 생성·결제·외부 메시지 전송은 하지 않았습니다.

## 시작 상태

- 브랜치 `test/350-ai-agent-failure-recovery-e2e`, HEAD `0c77d5c`. 작업 트리 깨끗함.
- `git fetch origin` 후 `origin/dev` = `9b22697` (PR #418). 현재 HEAD는 ahead 6 / behind 0으로 이미 dev를 포함합니다. 추가 merge/reset/브랜치 전환 없음. 기존 #350 커밋 보존.
- Android SM-N981N / Android 13 / R3CRC0DV7WM. 실제 앱 지도 화면 및 실제 Expo native speech adapter 사용. 임시 로컬 입력 UI/mock 음성/AI 응답을 사용하지 않음.
- 기존 Metro 8082 보존, QA Metro 8083에서 현재 작업 트리의 index.ts 로드. 시작 시 reverse는 8081→8081 및 8083→8083.

## 실제 기기 결과

| 항목 | 결과 | 근거·한계 |
|---|---|---|
| “안녕” 인식·실서버 AI 답변 | 통과 | 실제 사용자 발화, 인식문과 AI 인사 응답을 화면에서 확인하고 사용자가 확인. AppOps 녹음 종료 확인. 발화 종료→해제 정확한 1초는 계측하지 않음. 인증 토큰·계정 정보는 추출하지 않음. |
| 같은 패널에서 재발화 | 부분 통과/실패 | “내일…” 2초 쉼 후 “오후 두 시에” 전체 인식은 사용자·화면 확인. 이후 녹음 자동 종료 실패, AppOps 31초 이상 running 및 약 56초 녹음 이력. |
| 조용히 5초 기다려도 자동 종료 안 됨 | 실패(재현) | 같은 패널 두 번째 발화에서 사용자 재확인. 원문 없는 임시 VAD 진단에서 최종 인식 뒤 speaking true/false 반복, 3초 quiet clock이 초기화됨. 실제 오디오를 저장하지 않아 오탐의 음향 원인을 확정하지 않음. |
| VERY_AGGRESSIVE 비교 빌드의 두 번째 발화 | 통과(사용자 확인/한 기기) | 사용자가 앱 재실행 후 “내일 오전 2시에” 성공을 확인. AppOps 녹음 running 없음, 최근 duration 7.774초. 총 녹음 시간이며 발화 후 정확한 종료 지연은 아님. 작은 목소리는 아래 사용자 확인 결과로 구분하며, 통제된 소음·다른 기기 회귀는 미검증. |
| background 마이크 해제 | 통과(현재 capture) | HOME 이후 AppOps running이 사라짐, 녹음 이력 duration 45.190초. 복귀 자동 재청취·늦은 서버 응답 E2E는 별도 검증 필요. |
| AI 일시적 오류 안내 | 관찰/서버 원인 미확정 | 조정 후 정상 음성 종료 뒤에도 같은 안내를 사용자가 확인. 앱 문구는 PROVIDER_UNAVAILABLE에 대응(HTTP 502/code 또는 protocol_error envelope). 실제 HTTP/status·공급자 timeout/제한 원인은 확보하지 못함. 현재 공개 OpenAPI는 HTTP 200으로 응답하므로 서버 전체 중단으로 단정하지 않음. |
| 작은 목소리 | 통과(사용자 확인) | 사용자가 인식·자동 종료 정상 확인. 이후 AppOps running 없음, 최근 duration 9.352초. 발화 내용·음량·거리의 표준 계측은 하지 않아 문장별 정확도·음향 성능 전체 통과로 판정하지 않음. |
| 주변 소음 | 미검증 | 통제한 소음 조건·비교군 없음. |
| 패널 닫기·AI 실패 후 터치 검색 진입 | 통과(UI 범위) | 닫기 후 실제 접근성 트리에서 AI 열기 버튼 복귀, 기존 터치 검색의 EditText 및 검색 화면/키보드 확인. 실제 검색 결과·예약 서버 성공은 증명하지 않음. |
| Android 권한 dialog 허용·거부 | 미검증(이번 후속) | 병합 전 자동/임시 QA 기록과 구분. |
| iOS | 미검증 | 이번 후속은 Android만 사용. |
| 실제 availability/견적·예약 확인·생성 | 미검증 | 최종 생성 경로는 미구현. 예약 요청 성공이나 결제 성공으로 보고하지 않음. |

원본 캡처는 `/private/tmp/350-post349-*.png` 등에만 보관했습니다. 지도 위치가 포함되므로 저장소에 추가하지 않습니다. 임시 진단은 VAD boolean/quietForMs 및 result-final boolean만 출력했으며 원문·좌표·JWT·예약자 정보가 없습니다. 진단 3줄은 제거했고 adapter가 계측 전 보관본과 동일함을 cmp로 확인했습니다.

## 앱·native 변경과 검증

- V2 hook 회귀의 이전 advisory 기대값을 #349의 assistant plain-text 상태에 맞춤. 이전 세션 시작 결과가 최신 상태를 덮지 않는 검증 유지.
- 일반 조회 미구현 거부 테스트를 일반 조회 confirmation/좌표 injection 거부로 변경. canonical Place만 읽고 availability/quote/예약 mutation 0회 및 안전한 facts projection 검증 추가.
- 기존 native migration bridge patch의 WebRTC VAD NORMAL→AGGRESSIVE 비교는 두 번째 발화 자동 종료 실패. VERY_AGGRESSIVE 비교에서 사용자 종료 성공 확인. 현재 patch는 VERY_AGGRESSIVE이며 framing/debounce(60/200ms)·1초/3초 정책·동일 PCM recorder·60초 상한은 유지합니다. APK를 `install -r -t`로 설치했고 데이터·계정을 지우지 않았습니다. 작은 목소리는 사용자 확인으로 통과했지만 통제된 음향 조건은 미검증이며 전체 음향 검증 완료로 판정하지 않음.
- 별도의 V2 복구 결함: 60초 capture 상한에서 이미 확정된 인식문이 지워지고 noSpeech로 처리됐습니다. stable text만 편집 가능한 interrupted 상태로 보존하고 partial은 폐기하며 자동 전송하지 않게 수정. 조기 native 종료도 같은 복구 함수를 사용합니다.
- 최초 통합 validate:pr: 기존 기대값 두 건 실패 (Jest 2 failed / 2,024 passed). 앱 런타임을 이전 계약으로 되돌리지 않고 테스트를 현재 구현에 맞춰 보완.
- 보완 후 관련 Jest: 2 suites / 45 tests 통과.
- 보완 후 validate:pr: Jest 183 suites / 2,028 tests, regression 375 tests (22/89/7/50/207) 통과. V2 boundary 76, ownership 2, typecheck 통과. 로그 `/private/tmp/350-post349-validate-final.log`.
- capture 복구 테스트 2건이 수정 전 실패했고 수정 후 기존 endpointing과 함께 75 tests 통과. 확정 text 보존, 불확정 partial 폐기, listener/마이크 취소, 자동 전송 0회 및 명시적 재제출을 확인.
- capture 복구 포함 최종 validate:pr: **183 suites / 2,030 tests, regression 375 tests 통과**, V2 boundary 76·ownership 2·typecheck 통과. 로그 `/private/tmp/350-post349-recovery-validate.log`. 기기 실서버 결과와 이 합성 자동 검증은 구분함.
- native `:expo-speech-recognition:testDebugUnitTest :app:assembleDebug`: 통과, PingdyVadFrames 3 tests. 합성 classifier/frame 검증이며 실제 음향 정확도 증거는 아님.
- 임시 진단 제거 후 별도 check:v2(76 fixtures)/typecheck/관련 회귀(4 suites / 120 tests) 통과. V1 policy 및 git diff --check 통과. 작업 트리 name-status를 동일 V1 policy helper에 별도 입력해 V1 소스 추가·수정 0개 확인.

## 서버·남은 blocker

- 서버 #1764는 조회 시 OPEN. 실제 `GET /v3/api-docs/app`는 83 paths이고 AI paths와 searchNearbyPlaces가 없음. 앱 일반 조회 구현 존재와 서버 배포 완료는 구분함.
- 인증된 인사 답변은 이번 기기에서 확인했지만 일반 조회 카드·선택 맥락·조건 보존·견적 성공을 증명하지 않음.
- #349의 최종 확인 직전 재조회·예약 mutation 연결·응답 유실 복구는 여전히 미구현/미검증. 이번 작업에서 임의 구현하지 않음.
- 한 기기의 자동 종료·작은 목소리 개선은 확인했으나 통제된 소음·음량/거리·다른 기기, Android 추가 lifecycle/권한, iOS E2E, 실서버 일반 조회·견적 회귀와 AI 공급자 오류 원인이 남음. assistant_message의 실제 텍스트 표시가 추가됐으므로 모델의 예약 성공·가격·취소 주장에 대한 표시 안전성도 병합 전 판정을 그대로 승격하지 않고 별도 검증해야 함. #350 전체 완료 또는 이슈 종료로 보고하지 않음.

기기에서 최신 앱을 계속 사용할 수 있도록 QA Metro 8083 및 reverse 8081→8083/8083→8083은 유지합니다. 기존 8082 Metro는 중단하지 않았습니다. 마이크는 녹음 종료·granted 상태이며 권한을 변경하지 않았습니다.

V1 dependency delta: **none**. 기존 native infrastructure bridge patch 수정이며 V1 소스·새 V1 import·새 경계 예외 없음. `legacy-exception` 불필요. 이번 후속에서 커밋·푸시·PR·이슈 변경 없음.
