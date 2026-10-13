import type { components } from '../../../shared/api/generated/aiChat';
import { VOICE_PLACE_CATEGORIES } from './voiceAssistantCommand.types';

// Mirrors the app command schema; execution still passes the normative command parser.
// General search uses app-owned location permission, never provider-supplied coordinates.
export const AI_CHAT_TOOLS = [
  {
    "type": "function",
    "function": {
      "name": "searchNearbyPlaces",
      "description": "현재 위치 주변 장소를 검색합니다. 일반 음식점·식당 검색은 category=RESTAURANT만 사용하고 keyword나 touristCategory=FOOD를 추가하지 않습니다. 장소명·메뉴명은 keyword로 검색하며, 주변 아무거나 검색은 keyword·category·touristCategory를 모두 생략합니다. category는 일반 장소 분류, touristCategory는 별개 관광 태그이며 서로 치환하지 않습니다. 앱이 좌표와 최대 3개 제한을 붙이므로 위치나 개수를 묻지 않습니다. 날짜, 시간, 인원은 필요하지 않습니다.",
      "parameters": {
        "type": "object",
        "additionalProperties": false,
        "required": [],
        "properties": {
          "category": {
            "type": "string",
            "enum": [...VOICE_PLACE_CATEGORIES],
            "description": "일반 장소 분류. 현재 운영 API에서 검증된 음식점 값은 RESTAURANT입니다. 관광 FOOD 태그와 다릅니다."
          },
          "keyword": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100,
            "pattern": "\\S"
          },
          "touristCategory": {
            "type": "string",
            "enum": [
              "K_POP",
              "BEAUTY",
              "FASHION",
              "CAFE",
              "FOOD",
              "POP_UP",
              "EXHIBITION",
              "NIGHTLIFE",
              "OTHER"
            ]
          }
        }
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "searchNearbyReservablePlaces",
      "description": "명시적인 예약 의도가 있을 때만 희망 날짜, 시간, 인원으로 예약 가능한 장소를 조회합니다.",
      "parameters": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "date",
          "startTime",
          "endTime",
          "quantity",
          "useCurrentLocation"
        ],
        "properties": {
          "touristCategory": {
            "type": "string",
            "enum": [
              "K_POP",
              "BEAUTY",
              "FASHION",
              "CAFE",
              "FOOD",
              "POP_UP",
              "EXHIBITION",
              "NIGHTLIFE",
              "OTHER"
            ]
          },
          "date": {
            "type": "string",
            "format": "date",
            "pattern": "^(?!0000)[0-9]{4}-[0-9]{2}-[0-9]{2}$"
          },
          "startTime": {
            "type": "string",
            "pattern": "^(?:[01][0-9]|2[0-3]):[0-5][0-9]$"
          },
          "endTime": {
            "type": "string",
            "pattern": "^(?:[01][0-9]|2[0-3]):[0-5][0-9]$"
          },
          "quantity": {
            "type": "integer",
            "minimum": 1,
            "maximum": 12
          },
          "useCurrentLocation": {
            "type": "boolean"
          }
        }
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "getPlaceDetails",
      "description": "최근 검색 결과에 있는 장소의 상세 정보를 조회합니다. 임의 장소 ID를 추측하지 않습니다.",
      "parameters": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "placeId"
        ],
        "properties": {
          "placeId": {
            "type": "integer",
            "minimum": 1,
            "maximum": 9007199254740991
          }
        }
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "getAvailabilities",
      "description": "최근 검색한 장소의 실제 일정과 잔여 정원을 조회합니다.",
      "parameters": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "placeId",
          "date",
          "quantity"
        ],
        "properties": {
          "placeId": {
            "type": "integer",
            "minimum": 1,
            "maximum": 9007199254740991
          },
          "date": {
            "type": "string",
            "format": "date",
            "pattern": "^(?!0000)[0-9]{4}-[0-9]{2}-[0-9]{2}$"
          },
          "quantity": {
            "type": "integer",
            "minimum": 1,
            "maximum": 12
          }
        }
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "prepareReservation",
      "description": "조회된 일정의 예약 조건을 다시 확인해 초안만 준비합니다. 예약 생성이나 결제는 하지 않습니다.",
      "parameters": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "placeId",
          "availabilityId",
          "quantity"
        ],
        "properties": {
          "placeId": {
            "type": "integer",
            "minimum": 1,
            "maximum": 9007199254740991
          },
          "availabilityId": {
            "type": "integer",
            "minimum": 1,
            "maximum": 9007199254740991
          },
          "quantity": {
            "type": "integer",
            "minimum": 1,
            "maximum": 12
          }
        }
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "cancelVoiceSession",
      "description": "사용자가 요청할 때 현재 대화를 종료합니다.",
      "parameters": {
        "type": "object",
        "additionalProperties": false,
        "required": [],
        "properties": {}
      }
    }
  }
] satisfies components['schemas']['Tool'][];
