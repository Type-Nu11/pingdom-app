# Figma 장소 시트 간격·편의 정보 스타일 반영

- 기준: https://www.figma.com/design/XJ4uL6zQmulzrD7VQjpP5G?node-id=5142-37353
- 구현 위치: V2. 기존 미커밋 작업 보존. V1 dependency delta: none. 커밋/푸시/PR 없음.
- Figma design context 및 스크린샷으로 기준 확인. 변경 대상은 중간 높이 장소 시트이며 지도/상단 검색/AI·검증하기 디자인은 이번 작업에서 변경하지 않음.

## 반영

- 제목 24px/31px, 업종 18px를 제목 흐름에 배치. 검증·영업·주소 문구는 16px/21px.
- 편의시설 칩은 글자 14px, 아이콘 16px 원본 크기, 아이콘·문구 gap 6px, 칩 간격 8px, 좌우 padding 12px, 상하 padding 8px 및 Figma 유리 테마·그림자 사용.
- 동작 칩은 글자 14px, gap 8px, 좌우 padding 16px, 유리 배경/선택 테두리. 작은 외형을 유지하면서 세로 44px 터치 영역 확보.
- 헤더/편의·동작 그룹/사진 사이는 14px, 편의시설과 동작은 8px. 사진은 242×182 비율로 통일하고 사진 간격은 16px.
- 북마크/닫기 외형은 32px이고 터치 영역은 44px. 기존 공통 별 아이콘 및 19px 닫기 에셋 재사용.
- 영어응대 Group.svg와 Park.svg의 실제 원본은 16×16이며 임의 20×20 확대를 제거함. 공유/예약/길찾기는 기존 Figma 상세 에셋의 원본 크기(스트로크 포함 약 13.5px)를 재사용함.
- 서버 사진은 실제 URL을 계속 사용하며 Figma 예시 이미지/장소명을 넣지 않음.

## 기능 및 데이터

- 번역 실행/언어팩 관리/원문 전환/Google 표시는 유지. 인라인 업종 표시에서는 번역 버튼 아래에 기존 attribution 공간을 예약해 본문을 밀지 않게 함.
- 기존 번역 세대 검사, 캐시, 다운로드와 번역 분리 로직은 유지.
- 현재 place detail API 및 presentation에는 주차·영어 응대 가능 여부 필드가 없고 기존 MapScreen도 amenities: []을 전달함. 가능 여부를 임의 생성하지 않음. 실제 amenities가 전달되면 두 칩을 새 스타일로 렌더링하며 해당 상태는 light/dark 테스트로 검증함.
- 불투명 전체 상세/외부 장소 동작/API 계약은 유지함. 공통 시트 clipping 경계 재발 방지 구성도 유지함.

## 검증

- 관련 Jest 3 suites / 64 tests 통과: 인라인 업종, 번역/원문 전환 시 예약 높이 유지, 두 사진 크기, 편의시설 light/dark 및 기존 동작 회귀 포함.
- npm run typecheck 통과. npm run check:v2 통과 (디자인 fixture 8 + 경계 fixture 76). 지도 회귀 test:v2-map 50개 통과. git diff --check 통과.
- Android SM-F966N 실제 장소 70128로 밝은/어두운 테마의 제목·버튼·사진 및 시트 하단 clipping 확인. 밝은 테마 비교는 런타임 상태만 잠시 바꿨으며 저장하지 않고 원래 SYSTEM으로 복원함.
- iOS 실기기 화면 검증은 하지 않음.
- [밝은 테마](402-figma-place-sheet/light.png)
- 실제 일본어 모델로 장소명 대구예술발전소 → 大邱美術発電所를 실행하고 원문 전환 버튼과 attribution 표시 확인. 번역문이 두 줄이 되어도 검증·주소·동작·사진 영역 위치가 유지됨. 이번 디자인 검증에서는 네트워크를 끄지 않았으며 과거 오프라인 검증과 구분함.
- [어두운 테마 번역 후](402-figma-place-sheet/translated-dark.png)
