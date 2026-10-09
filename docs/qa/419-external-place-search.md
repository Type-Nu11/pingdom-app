# #419 검색 결과의 핑덤 미등록 장소 선택 검증 기록

- 브랜치 `fix/419-unregistered-place-search-result`, 시작 기준 `origin/dev` `9b226978`.
- 구현 위치: **V2** (`src/v2/modules/place/map/**`, `src/v2/modules/place/search/**`).
- **V1 dependency delta: `none`** — V1 소스 변경 0건, `legacy-exception` 라벨 불필요.
- 새 API 0건, 서버 계약 변경 0건.

## 원인

`MapScreen`의 검색 선택 처리가 출처(`isRegisteredPlace`)를 보지 않고 현재 지도 목록(`allPlaces`)에서
문자열 ID가 같은 장소를 찾았다.

| 선택 | 이전 동작 | 문제 |
|---|---|---|
| 외부(Kakao) 결과 | 장소명만 넘겨 DB 결과 화면으로 전환 | 결과 0건의 빈 화면, 주소·좌표 유실 |
| 외부 결과의 ID가 핑덤 장소 ID와 같은 숫자 | 그 핑덤 장소 상세를 엶 | 무관한 등록 장소로 연결 |
| 현재 지도 목록에 없는 등록 장소 | 외부 결과와 같은 분기 | 상세에 진입하지 못함 |

지도 목록은 현재 뷰포트의 `GET /places/map` 마커에서 만들어지므로, 화면 밖 등록 장소는 항상 세 번째 경우에 해당했다.

## 변경 후 동작

- 출처로만 대상을 정한다(`resolveMapSearchSelection`). 등록 장소는 canonical ID로 `place-preview`를 열고
  상세는 기존 `GET /places/{id}` 조회가 채운다. 외부 결과는 공급자 ID를 가진 별도 장소가 되며 핑덤 ID로 읽지 않는다.
- 외부 장소는 지도에 검색 마커를 찍고 카메라를 옮긴 뒤 기본 정보 카드를 보여준다.
  카드는 이름·주소·출처·`핑덤 미등록 장소`·`핑덤 예약 지원 여부 미확인`을 표시하고 출발·도착·길찾기만 제공한다.
  예약·즐겨찾기·공유·상세 진입은 없다.
- 길찾기는 좌표만 쓰는 기존 `CarRoutePreview` 흐름을 `placeId: 0` 목적지로 재사용한다.
- 좌표가 유효하지 않으면 마커·카메라 이동·길찾기를 제공하지 않고 안내 문구를 보여준다.
- 등록 장소 상세 조회가 실패하면 조용히 홈으로 돌아가지 않고 시트의 재시도 상태를 유지한다.

## UI 기준

이슈에 Figma와 첨부 이미지가 없다. 작업 중 확인을 거쳐 **기존 등록 장소 미리보기(`PreviewContent`)의 스타일과
토큰을 재사용**하기로 했다. 따라서 Figma 오버레이 비교는 해당 없음이며 아래 수치는 기존 미리보기와의 일치 여부다.

| 항목 | 값 | 기준 |
|---|---|---|
| 좌우 여백 | 16 | `previewContent` |
| 장소명 | 21 / 900 / line-height 27 | `previewName` |
| 주소 | 13 / 600 / line-height 18 | `previewAddress` |
| 닫기 버튼 | 44×44, 상단 9 | `previewCloseButton` |
| 액션 칩 | 높이 36, 간격 7, 하단 12 | `previewActionChip`, `previewActionRow` |
| 배지·안내 박스 | `surfaceMuted` 배경, radius 10 | 검색 오버레이 `registeredStatus` |
| 시트 높이 | 핸들 20 + 측정된 카드 높이 + 하단 safe area + 8 | 안내 문구가 줄바꿈되면 따라 늘어남 |

iPhone 17 Pro(402×874)에서 측정한 실제 프레임: 한국어 카드 218(시트 상단 y=594), 영어 카드 236(y=576).
칩 하단은 두 경우 모두 하단 safe area 바로 위에 놓인다.

## 자동 검증

| 명령 | 결과 |
|---|---|
| `npm run check:v2` | PASS: 경계 947 source files, 테스트 76/76 |
| `npm run typecheck` | PASS |
| `npm run validate:pr` | PASS: Jest 184 suites / 2,035 tests, 회귀 스위트 실패 0 |
| `npm run check:a11y-i18n` | PASS: production render graph 595 files |
| `V1_CHANGE_BASE=origin/dev npm run check:v1-changes` | PASS: V1 소스 추가·수정 없음 |
| `git diff --check origin/dev...HEAD` | PASS |
| `npm run lint` | 해당 없음: 저장소에 lint 스크립트가 없다 |

첫 번째 커밋만 체크아웃한 상태에서도 `typecheck`, `check:v2`, 관련 Jest가 통과한다.
Jest 출력의 `overlapping act()` 경고는 변경 전에도 같은 수로 나오며 새 테스트는 경고를 내지 않는다.

추가·갱신한 테스트:

- `externalPlace.test.ts`: canonical ID 판별(빈 값·0·음수·소수·문자 혼합·안전 정수 초과), 같은 ID·같은 이름의
  출처 구분, 주소 fallback, 유효하지 않은 좌표, 검색 마커가 등록 장소 미리보기를 열지 않음, 좌표 전용 길찾기 목적지.
- `MapBottomSheet.test.tsx`: 카드 내용, 예약·즐겨찾기·공유·상세 callback 0회, 경로 callback 연결, 좌표 없음 안내와
  비활성화, 다른 외부 장소로 바뀔 때 이전 상태 미잔존, 영어 문구.
- `MapSearchOverlay.test.tsx`: 같은 ID·이름의 등록 장소와 외부 결과가 출처와 함께 각각 전달됨.

## 수동 검증 (iOS 시뮬레이터)

환경: iPhone 17 Pro, iOS 27.0, dev client. **테스트 계정이 없어 로컬 스텁으로 검증했다.**
앱 코드는 실제 API 클라이언트를 그대로 쓰고, API 서버만 로컬 스텁(`/users/me`, `/places/map`,
`/places/autocomplete`, `/places/{id}` 응답, 나머지 404)으로 대체했으며 로그인은 로컬에서만 세션을 주입했다.
외부 검색은 실제 Kakao Local API 응답이다. 스텁과 세션 주입은 커밋에 포함하지 않았다.
시뮬레이터에서는 네이버 지도 타일이 그려지지 않아 캡처의 지도 배경이 비어 있다.

| # | 확인 항목 | 결과 | 캡처 |
|---|---|---|---|
| 1 | 등록 장소와 외부 결과가 구분되어 표시됨 | PASS | [01](419-external-place-search/01-search-results-light.jpg) |
| 2 | 외부 결과 선택 시 카드와 검색 마커 표시, `/places/{id}` 요청 0회 | PASS | [02](419-external-place-search/02-external-card-light.jpg) |
| 3 | 도착 칩으로 길찾기 미리보기 진입(출발: 현재 위치, 도착: 외부 장소) 후 닫기 | PASS | [03](419-external-place-search/03-external-route-light.jpg) |
| 4 | 다크 모드 카드 | PASS | [04](419-external-place-search/04-external-card-dark.jpg) |
| 5 | 재검색 후 다른 외부 장소 선택 시 이전 장소 정보 미잔존 | PASS | [05](419-external-place-search/05-reselect-other-external-dark.jpg) |
| 6 | 영어 문구와 2줄 안내에 맞춘 시트 높이 | PASS | [06](419-external-place-search/06-external-card-en.jpg) |
| 7 | 지도 목록(`/places/map` 마커 1건)에 없는 등록 장소 선택 시 `GET /places/9001` 후 미리보기 | PASS | [07](419-external-place-search/07-registered-off-map-list.jpg) |
| 8 | 상세 조회 500 응답 시 재시도 상태 유지, 재시도 성공 시 미리보기 | PASS | [08](419-external-place-search/08-registered-detail-error.jpg) · [09](419-external-place-search/09-registered-detail-retry.jpg) |
| 9 | 카드 닫기 후 홈 시트와 하단 내비게이션 복귀, 마커 제거 | PASS | [10](419-external-place-search/10-after-close-home.jpg) |
| 10 | 지도 목록에 있는 등록 장소 선택(기존 동작) | PASS | 미리보기 열림 확인 |
| 11 | 핸들을 눌러도 외부 카드 시트가 medium 위로 올라가지 않음 | PASS | 프레임 y=594 유지 |
| 12 | 외부 장소 흐름 전체에서 쓰기 요청(POST·PUT·PATCH·DELETE) | 0회 | 스텁 로그. 주기적인 `visit-verification-sessions/foreground`는 기존 동작으로 제외 |

변경 전 기준 화면: [00](419-external-place-search/00-map-home-baseline.jpg).

### 검증하지 못한 것

- **Android**: 이 환경에 Android SDK·에뮬레이터·기기가 없어 실행하지 못했다. 미검증.
- **실서버·실계정**: 테스트 계정이 없어 스텁 응답으로 대체했다. 실서버 자동완성 응답으로는 확인하지 못했다.
- **실기기**: 시뮬레이터만 사용했다. 네이버 지도 타일 위 마커 모양과 카메라 위치는 실기기 확인이 필요하다.
- **좌표 없는 외부 장소**: Kakao 응답은 좌표가 없으면 목록에서 걸러지므로 앱에서 재현할 수 없었다. 단위·컴포넌트 테스트로만 확인했다.
- **ko·en 이외 언어의 화면 캡처**: 문구와 키 집합은 자동 검증했지만 화면은 캡처하지 못했다(아래 범위 밖 항목 참고).
- **작은·큰 화면**: iPhone 17 Pro 한 기종만 확인했다.

## 범위 밖 (후속 제안)

- 검색 오버레이의 카테고리 칩은 번역된 라벨을 그대로 Kakao 검색어로 쓴다. 스페인어에서 `Música`로 검색되어
  외부 결과가 0건이었다. 기존 동작이며 이번 변경과 무관하다.
- 외부 장소의 공급자 ID와 핑덤 Place ID를 잇는 서버 매핑 계약이 없다. 계약이 생기기 전까지 앱은 두 ID를 연결하지 않는다.
- 다크 모드에서 지도 상단 카테고리 칩의 대비가 낮다. 기존 동작이다.
