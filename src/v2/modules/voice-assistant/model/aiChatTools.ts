import type { components } from '../../../shared/api/generated/aiChat';

// Mirrors the app command schema; execution still passes the normative command parser.
// General search uses app-owned location permission, never provider-supplied coordinates.
export const AI_CHAT_TOOLS = [
  {
    "type": "function",
    "function": {
      "name": "searchNearbyPlaces",
      "description": "현재 위치 주변 장소를 검색합니다. keyword와 카테고리는 선택이며 날짜, 시간, 인원은 필요하지 않습니다.",
      "parameters": {
        "type": "object",
        "additionalProperties": false,
        "required": [],
        "properties": {
          "keyword": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100,
            "pattern": "\\S"
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 3
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
