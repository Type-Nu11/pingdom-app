# 앱 제공 도구 기반 AI chat 연동

## 구현 범위

V2 음성 어시스턴트의 마이크/STT·텍스트 입력을 `POST /ai/chat`에 연결합니다. 서버가 앱의 모델 지정을 요구한다는 사용자 확인에 따라 GPT-OSS 20B의 모델 ID `openai/gpt-oss-20b`를 최초 요청과 모든 도구 결과 후속 요청에 함께 보냅니다. 서버 코드는 변경하지 않습니다. 기존 `/voice-ai/sessions` 어댑터는 별도 계약으로 유지하며, 활성 `useVoiceCommands`는 새 chat 어댑터를 주입합니다.

앱이 user/assistant/tool 대화와 도구 정의를 전송하고, 모델의 tool 호출을 기존 Command Registry·parser·provenance 검증을 거쳐 실행합니다. 모든 호출의 이름·인자를 배치 전체에서 먼저 검증하고, 결과를 같은 `tool_call_id`로 연결한 tool 메시지에 담아 후속 답변을 요청합니다. 여러 호출은 순차 실행합니다.

등록 도구는 일반 주변 검색, 예약 가능 장소 검색, 장소 상세, 실제 일정 조회, 예약 초안 준비, 대화 종료입니다. 일반 검색의 `keyword`·카테고리·`limit`은 선택이며 위치 권한·좌표·반경은 앱 런타임에서 확인합니다. 일반 검색 도구에는 날짜·시간·인원이 없습니다. 예약 생성·결제 도구는 등록하지 않으며 `prepareReservation`의 성공은 초안 준비만 뜻합니다. 예약 최종 제출은 별도 #349 구현입니다.

## 대화와 안전 경계

- 대화는 계정별 어댑터 메모리에만 보관합니다. 취소·닫기·계정 변경·background·앱 맥락 변경 시 초기화합니다. 장기 provider key와 좌표는 chat 요청에 추가하지 않습니다.
- 호출 ID 중복·미등록 도구·추가 인자·잘못된 schema는 실행 전에 거부합니다. 앱 결과는 기존 실행기가 투영한 공개 사실·실패 상태만 전달합니다. 확인 토큰·예약 본문·인증정보는 보내지 않습니다.
- 한 사용자 입력은 기존 30초 deadline을 공유하고 모델 왕복은 최대 4회, 응답당 도구 호출은 최대 8개, 원본 응답은 최대 16KiB입니다. 서버 messages 최대 50개 중 배치 여유를 확보하기 위해 모델 요청 직전 40개를 넘으면 새 대화가 필요합니다.
- 일반 답변과 도구 호출이 함께 오면 답변을 표시한 뒤 검증한 도구를 실행합니다. 후속 답변·후속 모델 장애가 실제 장소 카드와 조회 결과를 지우지 않습니다.
- 실패한 최초 모델 요청은 기존 사용자 동작 기반 재시도 정책을 사용합니다. 실행한 도구가 있는 후속 모델 요청은 자동 재실행하지 않습니다.

## 계약과 재생성

운영 공개 `https://www.typenull.xyz/v3/api-docs/app`에서 `/ai/chat`과 참조 스키마만 `docs/api/ai-chat.openapi.json`에 고정하고 원본 SHA-256을 기록했습니다. 생성 파일은 직접 수정하지 않습니다.

```sh
npm run sync:ai-chat-openapi
npm run generate:ai-chat-api-types
npm run check:ai-chat-api-types
npm run check:api-contract
```

현재 공개 문서의 `Message.content`는 object 타입 `JsonNode`를 참조하지만, 같은 operation의 공식 예시는 user 문자열 및 assistant null을 사용합니다. 어댑터 경계에서만 이 예시에 맞춰 content를 문자열/null/객체로 보정했습니다. 내부 함수 인자는 객체만 허용하며 런타임 parser로 검증합니다. 서버 명세가 보완되면 스냅샷과 생성 타입을 다시 확인해야 합니다.

공개 `AiChatRequest`에는 아직 `model`이 없지만 운영 응답은 모델 지정을 요구하며 사용자가 GPT-OSS 20B를 지정했습니다. 생성 파일이나 원본 스냅샷을 임의 수정하지 않고 어댑터의 요청 타입에서 `model`을 필수로 보완했습니다. 모델 ID 출처: https://console.groq.com/docs/models . 모델 누락만으로 프록시 오라우팅이나 서버 수정이 필요하다고 단정했던 판단은 정정합니다.

모델 포함 후 실기기에서는 문서의 평탄한 응답 대신 OpenAI 호환 `chat.completion`의 `choices[].message`와 Groq 메타데이터(`usage_breakdown` 포함)가 반환됐습니다. 두 응답 형식을 지원하되 completion은 단일 choice, assistant role, stop/tool_calls 완료 상태만 수용합니다. reasoning과 사용량 등 메타데이터는 UI와 후속 대화에서 제외합니다. provider 함수 인자 문자열은 JSON 객체로 해석한 후 기존 parser로 검증합니다. 내부 이력은 정규화된 객체를 유지하며 provider 응답이 확인된 대화의 후속 전송에서만 함수 인자와 tool 결과를 JSON 문자열로 직렬화합니다.

모델·completion 호환성 보완 후 음성 어시스턴트 18개 묶음 655건과 타입·V2 검사가 통과했습니다. 이후 provider 형식의 실제 Hook/Query 실행기 통합 사례를 추가하여 chat 관련 30건이 통과했습니다. Note20 최신 네이티브 개발 빌드 설치·번들 로딩, 모델 포함 요청의 정상 completion 수신은 확인했습니다. 최종 메타데이터 호환 코드의 답변 화면과 한국어 검색·도구 결과 후속 대화는 아직 실기기 성공 미확인입니다. 임시 진단은 제거했으며 이 보완은 아직 커밋·푸시하지 않았습니다.

## 검증 및 남은 확인

- 테스트 대역을 사용하는 chat 왕복·도구 배치·변조 응답·반복 호출 ID·취소·대화 초기화·후속 실패 테스트와 실제 Query/Command 실행기 통합 검증을 수행합니다.
- `npm run validate:pr` 통과: Jest 187개 묶음 2,083건, 회귀 374건, V2 경계 76건, ownership 2건 및 타입 검사. API 계약 검사와 AI chat 생성 타입 재검증도 통과했습니다.
- Android Hermes JS 번들 export와 Android debug 네이티브 빌드·Galaxy Z Fold7 설치가 통과했습니다. iOS 검증은 수행하지 않았습니다.
- 2026-10-12 11:24 KST, 로그인된 Galaxy Z Fold7에서 `Hello`를 직접 전송하여 운영 `POST /ai/chat` 호출을 확인했습니다. 3회 모두 HTTP 400이며 응답 오류는 `model : property model is missing`입니다. 공개 `AiChatRequest`와 릴리즈 커밋 `0a7990096a08c8a0ae9660ccd1cb58ca42acfcaf`의 같은 DTO는 `messages`·`tools`만 정의하고 `model`을 요구하지 않습니다. 운영 계약 불일치로 일반 답변·한국어 검색·도구 결과 후속 대화 성공은 미검증입니다.
- 해당 3회 요청 추적 ID: `req_01m4pys9q7e1yt8gfjc3qgxj4e`, `req_01m4pyscceem8ra24twxj4xpnr`, `req_01m4pysdv5ezf8bjw1zx7v00g2`. 인증정보와 대화 원문을 출력하지 않는 임시 진단으로 오류 필드만 확인한 후 진단 코드를 제거했습니다. 예약 생성·결제 테스트는 수행하지 않았습니다.
- 최초 조사에서는 위 추적 ID로 프록시/L7 처리 경로 확인을 요청했습니다. 기존 LLM 직접 프록시가 응답했을 가능성은 추정이었으며 확인되지 않았습니다. 이후 서버가 앱 모델 지정을 요구한다는 사용자 확인을 받아 앱 요청에 모델을 추가했습니다. 모델 포함 후 운영 성공은 별도 실기기 검증으로 판단해야 합니다.
- 실제 기기 후속 QA: 인사 → “갈비탕집 있어?” → 실제 장소 카드/빈 결과 → 후속 질문 → 취소·재시작. 예약 생성·결제 없이 먼저 일반 검색을 확인합니다.

관련 서버 이슈: https://github.com/Type-Nu11/pingdom-api/issues/1770

V1 dependency delta: none.

## 실기기 없이 보완한 앱 계약

- 두 장소 검색 도구의 `touristCategory`에 `type: string`을 명시했습니다. 릴리즈의 `AiChatService.validValue`는 인자의 타입으로 검증을 분기하므로 enum만 있는 스키마에서는 정상 카테고리 인자도 거부됩니다. 카테고리는 계속 선택 사항입니다. 이 변경은 운영에서 관측한 `model` 누락 오류를 해결하지 않습니다.
- chat의 HTTP 400·422는 `REQUEST_REJECTED`로 분류합니다. 성공 응답의 JSON/schema 오류인 `INVALID_RESPONSE`와 구분하고, 8개 지원 언어에 앱 소유 안내를 추가했습니다. 거절된 요청은 재시도 대상으로 저장하지 않으며 서버 원문이나 provider 필드를 사용자에게 표시하지 않습니다.
- 회귀 테스트는 두 카테고리 스키마의 서버 검증 호환성, HTTP 요청 거절과 응답 검증 오류 구분, 도구 미실행, 원문 미노출, 거절 요청 재시도 차단을 확인합니다. 네트워크는 테스트 대역이므로 운영 성공 증거로 취급하지 않습니다.
- 보완 후 검증: 음성 어시스턴트 18개 묶음 649건, 타입 검사, `npm run check:v2`의 76건 및 `git diff --check` 통과. 마지막 재시도 차단 assertion 추가 후 chat 어댑터 20건도 재검증했습니다. 커밋 전 전체 Jest 187개 묶음 2,090건, ownership 2건 및 API 계약·생성 타입 재검증도 통과했습니다. 회귀 테스트는 샌드박스의 tsx IPC 제한으로 중단된 뒤 동일 명령을 샌드박스 밖에서 재실행하여 374건 모두 통과했습니다.
- 사용자 승인 후 API 계약(`b0c1586`), AI 연동(`c9e1b70`), 요청 거절 안내(`927eaf2`), 이 QA 문서를 각각 로컬 커밋으로 분리했습니다. `work/` 초안은 제외했습니다. 서버 코드·운영 설정 변경과 푸시는 수행하지 않았습니다.
