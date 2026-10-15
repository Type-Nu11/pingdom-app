# 일반 주변 장소 검색 서버 변경

앱은 일반 검색을 예약 검색과 구분하며 기존 장소 목록 API의 검색어·좌표·반경·거리순 정렬을 사용합니다. 서버도 다음 명령을 생성하고 검증해야 합니다. 기존 wire 필드명은 `args`입니다.

```json
{
  "schemaVersion": 1,
  "id": "request-1",
  "kind": "command_request",
  "command": "searchNearbyPlaces",
  "args": { "keyword": "갈비탕", "limit": 3, "useCurrentLocation": true }
}
```

- `keyword`: 선택 사항, 공백만 있는 값 금지, 최대 100자. 앱이 장소 API 호출 전에 앞뒤 공백을 제거합니다.
- `limit`: 선택 사항, 정수 1–3, 생략 시 앱 기본값 3.
- `touristCategory`: 기존 선택 사항 유지.
- 좌표와 반경은 앱에서 가져옵니다. 날짜·시간·인원은 일반 검색 인자가 아닙니다.
- 사용자가 요청한 지역을 임의로 버리지 않습니다. 현재 명령에 지역 필드는 없으므로 지원할 수 없는 명시적 지역 요청은 추가 확인이 필요합니다.

`voice-ai-general-nearby.patch`는 서버의 validator, Gemini 지침, JSON schema와 관련 테스트를 함께 수정합니다. 서버 저장소에서 다음 순서로 적용합니다.

```sh
git apply --check /Users/oneriver/Developer/PingDom_app/docs/patches/voice-ai-general-nearby.patch
git apply /Users/oneriver/Developer/PingDom_app/docs/patches/voice-ai-general-nearby.patch
```

2026-10-11 검증: 앱 관련 Jest 17개 묶음 634건, typecheck, check:v2 통과. 로컬 서버 소스에 대한 패치 적용 가능 여부 확인 통과. 서버 변경은 적용 안내용 패치로만 제공합니다. 작업 범위를 넘어 로컬 서버에 적용했던 변경은 모두 역패치로 되돌렸고, 서버 Git 작업 트리가 깨끗한 것을 확인했습니다. 서버 커밋·푸시·운영 배포는 수행하지 않았습니다. 배포 후 실제 OpenAPI를 다시 받아 계약을 갱신하고, 실기기에서 “갈비탕집 있어?”가 날짜 질문 없이 검색되는지 확인해야 합니다. 기존 운영 OpenAPI 스냅샷은 배포 전 계약을 유지합니다.

검색 결과는 기존 장소 API에 등록되고 검색어와 일치하는 데이터에 한정됩니다. 실제 근처 갈비탕 가게의 데이터 존재 여부는 별도 확인이 필요합니다.
