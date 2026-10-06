# #349 일반 주변 장소 검색과 대화 표시 후속 계약

## 확인 결과 (2026-10-05)

- `voiceAssistantCommandParser.ts`에서 `searchNearbyReservablePlaces`의
  `touristCategory`는 선택 사항입니다. 앱 Registry/validator는 카테고리를 필수로
  요구하지 않습니다.
- 저장된 `docs/api/voice-ai.openapi.json`과 생성 타입에도 카테고리는 optional입니다.
  이 검색 명령의 필수 조건은 날짜, 시작/종료 시간, 인원, 현재 위치 사용 여부입니다.
- AI 명령 allowlist에는 예약 가능한 장소 검색, 장소 상세, availability 조회,
  예약 초안, 세션 종료만 있습니다. 날짜·시간·인원 없이 주변을 탐색하는 명령은 없습니다.
- 기존 Place 공개 목록 API `GET /places`는 `touristCategory` 없이 호출할 수 있고,
  위치·거리 범위·`NEAREST` 정렬을 지원합니다. 목록의 거리·liveStatus와 상세의
  operatingStatus는 서로 다른 정보입니다. `OPERATING`만으로 지금 영업 중이라고
  단정해서는 안 됩니다.
- 화면은 서버의 `clarification_request.field = touristCategory`를 받으면 고정된
  카테고리 질문으로 표시합니다. 서버가 그 field를 선택한 이유(모델/프롬프트)는
  실제 응답 및 서버 입력 로그가 있어야 판별할 수 있습니다.
- 실서버 OpenAPI URL `https://www.typenull.xyz/v3/api-docs`는 조회 시 301,
  리다이렉트를 따라가면 404였습니다. 따라서 최신 서버 계약과 인증된 AI 응답은
  이번 작업에서 검증하지 못했습니다. 위 계약 설명은 저장된 snapshot 기준입니다.

## 필요한 서버·앱 공동 후속 작업

1. 일반 주변 탐색용 읽기 명령을 ProviderEnvelope에 합의해 추가합니다.
   예시 이름은 `searchNearbyPlaces`이며 확정 계약이 아닙니다. 카테고리는 optional,
   날짜·시간·인원은 일반 검색의 필수 조건으로 넣지 않습니다.
2. “근처에 뭐 있어?”, “아무 종류나 보여줘”를 해당 명령으로 매핑하고 카테고리
   질문으로 막지 않도록 서버 모델 입력과 도구 설명을 수정합니다. 위치가 없으면
   지역/위치 사용을 물으며, AI가 좌표나 임의 API를 결정하게 하지 않습니다.
3. OpenAPI에 명령/args를 반영한 뒤 앱의 생성 타입, parser, Registry, 읽기 정책을
   함께 추가합니다. 기존 예약 검색과 예약 초안 validator는 보존합니다.
4. 앱은 실제 목록에서 최대 3곳을 고릅니다. 거리, 검증 가능한 현재 영업 정보,
   카테고리 다양성의 우선순위와 missing/unknown 처리 정책을 정의합니다.
   영업 정보가 없으면 이를 추측하지 않습니다.
5. “음식점만”, “카페만”, “다른 곳 보기”는 같은 읽기 명령으로 처리합니다.
   다음 후보를 위한 cursor/이미 표시한 ID의 처리와 조회 결과 출처를 검증합니다.

현재 앱에서 새 AI 명령이나 가짜 조회 결과를 임의 추가하지 않았습니다.
카테고리 생략을 날짜·시간·인원 생략과 혼동하거나 예약 가능하다는 의미로 바꾸지 않습니다.

## 이번 앱 변경

- 전송 시 입력 초안을 지우고, 해당 사용자 발화는 패널 내 오른쪽 말풍선에 보존합니다.
- 사용자/AI 이름과 정렬을 구분하고, 이전 답변은 패널 메모리에만 최대 32턴 보존합니다.
- 선택기 답변은 사용자가 선택한 값으로 표시하고, 기존 요청·조건을 합친 전송은 유지합니다.
- 현재 실패 요청만 기존 transport의 명시적 재시도를 사용합니다. 과거 기록에는
  재시도 버튼을 표시하지 않고, 지도 보기 동작도 비활성화합니다.
- 새 세션 소비자/계정으로 바뀌면 화면 기록을 지웁니다. 기록을 서버 대화 맥락으로
  새로 전송하거나, 장소 ID의 권한/예약 확인 증거로 사용하지 않습니다.

## 검증 결과

- 관련 Voice Assistant/리소스 테스트 606개 통과.
- 별도 지도 파일을 제외한 임시 스냅샷: V2 경계 검사와 타입 검사 통과.
- 임시 스냅샷의 전체 Jest: 1,704개 통과, ReservationBoxScreen 테스트 1개가
  5초 제한을 초과. 해당 파일의 테스트 3개를 단독 재실행하면 모두 통과했습니다.
  전체 validate:pr 실행 자체를 통과로 보고하지 않습니다.
- 별도 회귀 검사 291개 통과. V1 정책 및 git diff --check 통과.
- 현재 작업 트리의 check:v2/typecheck/validate:pr는 별도 사용자 지도 파일의
  누락 import/StyleSheet 위반 때문에 실패하며, 해당 파일은 변경하지 않았습니다.
- 실기기에서 영어 일반 주변 탐색 문장을 앱 경로로 전송하고, 입력창 placeholder,
  오른쪽 사용자 발화와 왼쪽 Pingdy/생각 중 안내를 확인했습니다. 답변 대기 중
  기기 연결이 해제되어 인증된 세션 생성 성공 및 실제 AI 답변은 확인하지 못했습니다.

## 일반 탐색 확장 구현 (2026-10-06, 서버 배포 대기)

- V2 parser·정책·Registry에 읽기 전용 `searchNearbyPlaces`를 추가했습니다.
  `useCurrentLocation`만 필수이며 `touristCategory`는 선택입니다. 날짜·시간·인원,
  좌표·route·확인 여부 등 추가 필드는 거부합니다.
- 기존 Place 공개 목록 쿼리를 위치·반경·NEAREST·limit=3으로 사용합니다.
  필요한 장소 상세만 보충하고 최대 3개 기존 카드를 표시합니다. availability·quote·
  예약 mutation을 호출하지 않습니다. 현재 영업 여부·예약 가능 여부는 추측하지 않습니다.
- 조회 결과 ID는 기존 provenance에 기록합니다. 후속 availability 조회는 이 출처를
  검증하며, 새 검색·취소·맥락 변경 및 기존 replay 경계는 보존합니다.
- `docs/patches/voice-ai-general-nearby.patch`는 서버 `PingDom_api` 기반 커밋
  `4e3996c33d3806390734d24b98534d1e2f80107f`에 적용할 검토용 패치입니다.
  validator, 공급자 JSON Schema, Gemini 모델 지침과 테스트를 함께 확장합니다.
  서버 원본 저장소와 운영 서버는 변경하지 않았습니다.
- 모델 지침은 일반 탐색 예문을 새 명령으로 매핑하고 예약 조건/카테고리를 묻지
  않도록 합니다. 명시적 예약 검색은 기존 명령·필수 조건을 유지합니다. “여기로”에서
  검증된 선택을 모르면 ID를 만들지 않고 장소를 확인하도록 합니다.
- `docs/api/voice-ai.openapi.json`과 생성 타입은 실서버 snapshot 그대로 보존했습니다.
  로컬 제안 스키마는 확장했으나 배포된 계약으로 보고하지 않습니다. 타입 검사는
  기존 계약의 양방향 일치를 계속 확인하고 새 명령이 미배포임을 별도로 확인합니다.

### 서버 적용 후 필요한 확인

1. 서버 패치를 별도 브랜치에서 검토·적용하고 테스트 후 배포합니다.
2. 정상 OpenAPI URL에서 새 명령을 확인하고 앱 snapshot·생성 타입을 갱신합니다.
   이때 미배포 계약 전용 타입/스키마 테스트를 전체 계약 일치 검사로 바꿉니다.
3. 인증된 실기기에서 “근처에 뭐 있는지 알려줘”가 예약 조건 질문 없이 실제 장소
   카드 최대 3개로 이어지는지 확인합니다. 위치 권한 미승인과 빈 결과도 확인합니다.
4. 서버의 대화·도구 결과 맥락 연결과 사용자의 명시적 장소 선택은 별도 확인이
   필요합니다. 이번 패치는 “여기로”의 임의 ID 추정을 허용하지 않습니다.

### 이번 검증

- Voice Assistant 관련 Jest 607개 통과.
- 별도 지도 파일을 제외한 임시 사본: V2 경계·타입·ownership 검사 통과,
  전체 Jest 159개 suite / 1,721개 테스트 통과, 별도 회귀 291개 통과.
- 현재 작업 트리의 check:v2/typecheck/validate:pr는 기존 지도 파일의 누락 import와
  StyleSheet 위반으로 실패합니다. 임시 사본의 validate:pr는 회귀 단계의 tsx IPC
  권한 제한으로 중단돼 test:regression을 권한 허용 후 별도 실행했습니다.
- 서버 임시 사본에서 validator·Gemini HTTP 입력·OpenAPI 단위 테스트를 실행했습니다.
  실제 Gemini와 PostgreSQL 기반 VoiceAiContractIntegrationTest는 실행하지 않았습니다.
- 실서버 OpenAPI는 계속 404이며 실제 인증된 AI/장소 응답을 검증하지 못했습니다.
  mock/단위 테스트 통과를 실서버 일반 탐색 성공으로 보고하지 않습니다.
- V1 dependency delta: none. legacy-exception 불필요. 커밋·푸시·배포 없음.

## Pingdy 검색 결과 화면 디자인 (Figma 8509:11294)

- 결과 수신 후 패널은 386px 폭·557px 기준 높이(화면 높이 제한 적용), 36px 모서리,
  32px 헤더, 요청 인용문·164px 가로 카드·안내·34px 액션·하단 입력창 배치로 전환합니다.
  추가 질문에서는 기존 대화 기록과 날짜·시간·인원 선택기를 유지합니다.
- Figma 패널 에셋 8개를 내려받아 기존 파일과 바이트 동일성을 확인했습니다.
  기존 로컬 에셋을 재사용하며 임시 Figma URL을 앱 코드에 남기지 않습니다.
- 서버가 반환한 distanceMeters만 거리로 표시합니다. 사진은 Place의 공개 미디어
  훅을 사용하고, 사진이 없으면 기존 Figma 이미지를 예시 이미지로 명시합니다.
- 공유는 사용자가 버튼을 누른 경우에만 조회한 이름·주소로 네이티브 공유를 엽니다.
  평점 4.8점·지금 영업 중 등 디자인 예시 문구는 실제 필터/근거가 없으므로 넣지 않습니다.
- 공개 Place 미디어 의존성 1개를 검토하고 production dependency graph를 갱신했습니다.
  V1 dependency delta는 none입니다. 길찾기·즐겨찾기 버튼의 새 동작은 추가하지 않았습니다.
- 실기기에서 실제 AI 결과를 받은 뒤의 화면과 픽셀 비교는 미검증입니다.
  운영 서버에 일반 탐색 명령이 적용된 뒤 완료 기준을 실제 기기에서 확인해야 합니다.
- 디자인 변경 검증 사본의 validate:pr 통과: 전체 Jest 1,724개·회귀 291개.
  마지막 입력 아이콘의 23px 규격 교체 후 관련 Jest 625개, V2 경계 76개,
  타입 검사를 다시 실행해 통과했습니다. 작업 트리 전체는 기존 지도 오류가 남아 있습니다.

## Android 실기기 확인 (2026-10-06)

- SM-F966N / Android 16, 현재 개발 번들을 Reload하여 확인했습니다. 앱 데이터·로그인을
  초기화하거나 예약 생성·결제·커밋·푸시·PR 작업을 하지 않았습니다.
- 실제 앱 요청 `Show nearby places of any category` 전송 후 입력창 초기화,
  사용자/AI 구분, `AI가 생각 중이에요.` 표시와 서버 응답 수신을 확인했습니다.
  일반 탐색인데 서버 응답 후 날짜 → 시간 → 인원을 질문했습니다. 장소 카드는 나오지
  않아 새 Figma 결과 화면의 실제 서버 데이터 기반 렌더링 검증은 완료하지 못했습니다.
- 날짜 10월 7일 선택은 원형으로 표시됐고 다음 달/이전 달 버튼을 눌러 돌아온 뒤에도
  원형을 유지했습니다. 날짜 확인 후 선택값·수정 칩, 시간 선택기와 오후 2시 확인,
  인원 2명 → 3명 선택·확인과 3명 칩 유지, 날짜 수정 시 기존 선택 유지를 확인했습니다.
- 대화 진행 중 세션 만료 안내가 나타났습니다. 별도의 만료 사례에서 `다시 시도`를
  누르면 요청이 다시 처리되어 위치 사용 확인 질문을 받았습니다. 만료 안내의
  “닫고 다시 시작” 문구와 실제 재시도 동작은 정리가 필요합니다.
- 재개 후 테스트 요청은 ADB 입력 완료 전에 Enter가 실행되어 화면에
  `Show nearby places witho`까지만 전송됐습니다. 이 요청을 완전한
  `Show nearby places without booking` 성공/실패 증거로 사용하지 않습니다.
  해당 요청 재시도 → 위치 사용 질문 → `yes` 답변 뒤 카테고리 질문이 나타났습니다.
- 실제 음성 중지 후 STT 인식문이 전송되고 assistant_message의 실제 텍스트가
  표시되는 것은 확인했습니다. 주변 소리가 인식된 사례이므로 통제된 발화의
  VAD 정확도나 1초/3초 종료 시간 검증으로 보고하지 않습니다.
- background/복귀 후 조건과 수정 달력은 유지됐고 요청 종료 안내가 표시됐습니다.
  패널 닫기 후 지도 상태와 AI 버튼 복귀를 확인했습니다. 진행 중 응답의 늦은 도착
  폐기·마이크 자원 해제는 계측하지 않았으므로 그 검증을 완료했다고 보고하지 않습니다.
- 한글 원문 입력, 실제 장소 카드·미디어·거리·공유 화면, iOS, 작은 목소리·소음·
  중간 쉼의 음향 테스트, 최종 예약 생성 및 중복 방지 E2E는 미검증입니다.
- 서버 #1764는 확인 시 OPEN입니다. 배포 여부를 이슈 상태만으로 단정하지 않으며,
  일반 탐색에서 예약 조건/카테고리를 묻지 않는 완료 기준은 이번 실기기 테스트에서
  통과하지 못했습니다. `git diff --check` 통과. V1 dependency delta: none.
- 증거 스크린샷은 로컬 `/private/tmp/pingdy-qa-date-selected.png`,
  `/private/tmp/pingdy-qa-date-return.png`, `/private/tmp/pingdy-qa-date-reply.png`,
  `/private/tmp/pingdy-qa-quantity.png`, `/private/tmp/pingdy-qa-conditions-reply.png`,
  `/private/tmp/pingdy-qa-edit-date.png`, `/private/tmp/pingdy-qa-background-return.png`,
  `/private/tmp/pingdy-qa-map-return.png`, `/private/tmp/pingdy-qa-location-reply.png`에
  있습니다. 주변 음성·사용자 정보가 포함될 수 있는 캡처는 외부에 게시하지 않았습니다.

## 검사 오류 수정 및 결과 화면 검증 (2026-10-06 후속)

- 현재 작업 트리 전체 검사 오류를 해결했습니다. 사용되지 않는 즐겨찾기 시안은
  `src/v2/features/map/components/FavoritePlacesBottomSheet.tsx`에서 Place 모듈의
  `sheet/components/FavoritePlacesBottomSheetDraft.tsx`로 이동해 보존했습니다.
  현재 화면이 사용하는 FavoritePlacesBottomSheet와 연결을 교체하지 않았습니다.
- 끊어진 import를 기존 공개 sheet/presentation 경계로 연결하고 GlassSurface의
  기존 지원 여부 함수를 명시적으로 공개했습니다. StyleSheet 대신 styled-components
  native attrs로 기존 수치·동적 스타일·애니메이션을 유지했습니다. 시안의 문구·필터·
  콜백을 보존했으며 선택 스타일과 pending 해제 방지 회귀 테스트를 추가했습니다.
- 임시 사본 `/private/tmp/pingdy-device-screen-preview`의 Metro 8083에서만 예시
  장소 3개를 넣어 실기기 결과 화면을 검증했습니다. QA 코드와 데이터는 작업 트리에
  추가하지 않았으며 AI 전송·결과 미디어 조회·예약 생성 없이 UI를 검증했습니다.
  지도 배경의 기존 조회는 평소대로 실행됐습니다.
- SM-F966N의 다크 모드에서 요청 인용문, 헤더, 가로 카드 3개 스크롤, 긴 이름의
  2줄 표시, 예시 이미지 표기, 거리 0.12/0.78/1.23km, 안내·액션·입력창 배치를
  확인했습니다. 키보드 표시 때 입력창이 위로 이동하고 본문은 스크롤 영역으로
  줄어듭니다. 공유창에서 예시 장소 이름·주소를 확인하고 실제 전송 없이 닫았습니다.
- 실제 사진 응답과 일반 탐색 서버 성공, iOS·라이트 모드·큰 글꼴·폴더블 내부 화면,
  Figma와의 픽셀 단위 비교는 미검증입니다. 이 확인은 서버 #1764 완료 증거가 아닙니다.
- 최종 작업 트리의 `validate:pr` 통과: V2 경계 fixture 76개, ownership 2개,
  타입 검사, Jest 160 suites / 1,726 tests, 회귀 291개(22/27/7/50/185).
  관련 즐겨찾기 검사 2 suites / 5 tests도 통과했습니다.
- `check:v1-changes -- --base origin/dev`, `git diff --check` 통과.
  V1 dependency delta: none, legacy-exception 불필요. 커밋·푸시·PR 생성 없음.
- 화면 증거: `/private/tmp/pingdy-preview-scroll.png`,
  `/private/tmp/pingdy-preview-third-verified.png`, `/private/tmp/pingdy-preview-keyboard.png`.
  검증 후 개발 번들 주소는 원래 `localhost:8081`로 복구했습니다.

## 후속 승인: 기능·화면별 로컬 커밋

사용자가 rcp로 분할 커밋을 요청하고 아래 메시지를 명시적으로 승인했습니다.
앞선 구현·검증 단계의 미커밋 기록은 당시 상태이며, 이번에 다음 단위로 정리합니다.

1. `Fix: 지도 즐겨찾기 초안 컴포넌트 V2 경계 및 타입 오류 수정`
2. `Feat: AI 일반 주변 장소 조회 명령 및 검증 추가`
3. `Feat: Pingdy 장소 결과 패널 Figma 디자인 적용`
4. `Docs: 일반 장소 조회 서버 계약 제안 및 실기기 검증 기록`

커밋 전 `check:v2`, `typecheck`, V1 변경 정책과 `git diff --check`를 다시 확인했습니다.
푸시·PR 생성·서버 배포는 수행하지 않습니다. 일반 장소 조회의 실서버 성공과
#349의 최종 예약 확인·생성 흐름은 여전히 완료되지 않았습니다.
