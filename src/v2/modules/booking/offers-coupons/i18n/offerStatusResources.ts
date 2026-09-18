export const offerStatusResources = {
  en: { offer: {
        cta: {
          ended: 'Offer ended',
          issue: 'Get coupon',
          notStarted: 'Not started yet',
          soldOut: 'All claimed',
          unavailable: 'Cannot be claimed',
        },
        eligibility: {
          ACTIVE_TRAVEL_SCHEDULE: 'Accounts with an active trip',
          PUBLIC: 'Anyone',
          UNKNOWN: 'Conditions need review',
        },
        expiry: {
          ISSUE_PLUS_DAYS: 'Valid for a set number of days after issue',
          ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END: 'Valid for a set number of days after issue, up to the offer end date',
          OFFER_END: 'Valid until the offer ends',
          UNKNOWN: 'Validity needs review',
        },
        inventory: {
          LIMITED: 'Limited quantity',
          UNKNOWN: 'Quantity needs review',
          UNLIMITED: 'No quantity limit',
        },
        remaining: {
          limited_one: '{{count}} left',
          limited_other: '{{count}} left',
          unknown: 'Remaining quantity not provided',
          unlimited: 'No quantity limit',
        },
        statuses: {
          CLOSED: 'Closed',
          DRAFT: 'Draft',
          PUBLISHED: 'Available',
          UNKNOWN: 'Status needs review',
        },
      } },
  ko: { offer: {
        cta: {
          ended: '종료된 혜택',
          issue: '쿠폰 받기',
          notStarted: '아직 시작 전',
          soldOut: '수량 모두 소진',
          unavailable: '받을 수 없는 혜택',
        },
        eligibility: {
          ACTIVE_TRAVEL_SCHEDULE: '여행 일정이 있는 계정',
          PUBLIC: '누구나',
          UNKNOWN: '조건 확인 필요',
        },
        expiry: {
          ISSUE_PLUS_DAYS: '발급일로부터 정해진 기간',
          ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END: '발급일로부터 정해진 기간, 혜택 종료일까지',
          OFFER_END: '혜택 종료일까지',
          UNKNOWN: '유효 기간 확인 필요',
        },
        inventory: {
          LIMITED: '수량 한정',
          UNKNOWN: '수량 확인 필요',
          UNLIMITED: '수량 제한 없음',
        },
        remaining: {
          limited_one: '{{count}}개 남음',
          limited_other: '{{count}}개 남음',
          unknown: '남은 수량 미제공',
          unlimited: '수량 제한 없음',
        },
        statuses: {
          CLOSED: '종료됨',
          DRAFT: '작성 중',
          PUBLISHED: '받을 수 있음',
          UNKNOWN: '상태 확인 필요',
        },
      } },
} as const;
