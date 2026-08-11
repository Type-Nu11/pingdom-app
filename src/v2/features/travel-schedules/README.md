# Travel schedules API integration

`Screen → Hook → API → Server` 경계를 유지한다. 화면은 이 feature의 Hook만 사용하고,
Hook은 `travelScheduleApi`를 통해서만 transport에 접근한다.

## Contract notes

- `startDate`와 `endDate`는 서버 OpenAPI의 `format: date` 문자열(`YYYY-MM-DD`)이다.
- 이 feature는 날짜를 `Date`로 만들거나 UTC로 변환하지 않는다.
- 현재 서버 계약에는 일정 timezone 필드가 없다.
- 서버 일정 오류 코드는 공통 `ApiError.code`에 그대로 유지된다. 현재 계약의 일정 전용 코드는
  `INVALID_TRAVEL_SCHEDULE_PERIOD`, `TRAVEL_SCHEDULE_NOT_FOUND`,
  `TRAVEL_SCHEDULE_NOT_EDITABLE`, `TRAVEL_SCHEDULE_CONCURRENT_MODIFICATION`이다.

## PR verification

```sh
npm run check:api-contract
npm run check:api-types
npm run typecheck
npm run test:v2-api
```

수동 검증에서는 유효한 날짜 문자열로 생성한 뒤 목록 반영, 기간 변경, 취소와 빈 목록을 확인한다.
오류 응답은 HTTP status와 함께 `ApiError.code`가 유지되는지 확인한다.
