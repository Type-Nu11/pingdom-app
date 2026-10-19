# 앱 확인창 디자인 통일 및 시트 경계 재발 방지

## 구현 위치와 범위

- V2 컴포넌트와 실제 앱의 application composition 경계. V1 dependency delta: none.
- 기존 미커밋 작업을 보존하며 feat/402-offline-place-translation에서 진행. 커밋·푸시·PR 없음.
- 프로필 오류·사진 소스 선택·권한 안내/설정 열기·재시도, 지도 안내/즐겨찾기 오류, 데이터 내보내기 확인, 게시글 작성 취소, 상점 이벤트 종료 확인, 음성 호출어 동의 확인을 공통 AppDialogProvider로 교체함.
- Android 종료 안내 Toast도 V2 및 실제 production navigation에서 앱 토스트로 교체함.
- 번역 언어팩 관리창은 공통 AppModal과 Button 디자인을 사용함.

## 디자인 및 동작

- 앱 테마의 surface/overlay/rim/shadow, 공통 title/body 타이포그래피, 36px 모서리와 pill 버튼 사용.
- 최대 400px 너비 / 85% 높이, 긴 확인 문구 및 버튼은 스크롤 가능. 각 버튼은 기존 공통 Button의 터치 영역/접근성 적용.
- 취소/확인/파괴적 작업의 기존 콜백과 순서를 유지함. 같은 호출자의 같은 확인창은 중복 적재하지 않음.
- 화면을 떠나면 그 화면의 확인창을 제거하고 늦은 콜백은 실행하지 않음. 연속 클릭으로 동일 작업이 두 번 실행되지 않음.
- iOS는 Modal onDismiss 이후 카메라/사진 선택 등의 작업을 실행함.
- 게시글 폐기를 확인하면 dirty 플래그를 해제한 뒤 보류한 navigation action을 실행함.

## 모달 창과 시스템 화면의 구분

- RN Modal은 앱이 그리는 UI를 표시하는 네이티브 창 호스트이며 기본 Alert 디자인과 다름.
- 기존 사진 전체 보기·차량 경로 화면·앵커 메뉴는 이미 앱 디자인을 적용한 창이므로 유지함.
- OS 권한 요청, 카메라/사진 보관함 선택기, 파일 내보내기의 시스템 공유/저장 화면은 OS 소유 UI로 유지함.
- 실행 import graph에 포함되지 않는 V1 settings의 Alert는 수정하지 않음. 현재 production/V2 경로의 Alert/ToastAndroid 사용은 제거함.

## 시트 재발 방지

- 장소·즐겨찾기·커뮤니티·예약이 MapSheetSurface 하나에서 배경과 콘텐츠 viewport의 애니메이션 경계/모서리를 함께 계산함.
- 콘텐츠는 overflow hidden인 native viewport 안에, 고정 내비게이션과 FAB/메뉴는 바깥에 유지함.
- 불투명 상세 화면은 전환 중에도 즉시 모서리/여백 0으로 표시함.
- npm run check:v2에 check:v2-design을 연결함. 기본 Alert/ActionSheet/Toast 재도입, 새 raw Modal 호스트, 공통 surface 밖에서 시트 배경/viewport를 조립하는 코드를 차단함.
- 검사 자체는 alias/namespace/default import 및 예외 창 호스트를 테스트함.
