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
  ja: { offer: {
        cta: {
          ended: '終了した特典',
          issue: 'クーポンを受け取る',
          notStarted: 'まだ開始していません',
          soldOut: '配布終了',
          unavailable: '受け取れません',
        },
        eligibility: {
          ACTIVE_TRAVEL_SCHEDULE: '有効な旅行日程があるアカウント',
          PUBLIC: 'どなたでも',
          UNKNOWN: '条件の確認が必要です',
        },
        expiry: {
          ISSUE_PLUS_DAYS: '発行後、一定の日数のあいだ有効',
          ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END: '発行後、一定の日数のあいだ有効（特典終了日まで）',
          OFFER_END: '特典終了まで有効',
          UNKNOWN: '有効期間の確認が必要です',
        },
        inventory: {
          LIMITED: '数量限定',
          UNKNOWN: '数量の確認が必要です',
          UNLIMITED: '数量制限なし',
        },
        remaining: {
          limited_one: '残り{{count}}枚',
          limited_other: '残り{{count}}枚',
          unknown: '残り数量の情報がありません',
          unlimited: '数量制限なし',
        },
        statuses: {
          CLOSED: '終了',
          DRAFT: '下書き',
          PUBLISHED: '受け取り可能',
          UNKNOWN: '状態の確認が必要です',
        },
      } },
  'zh-CN': {
    offer: {
      cta: { ended: '优惠已结束', issue: '领取优惠券', notStarted: '尚未开始', soldOut: '已全部领完', unavailable: '无法领取' },
      eligibility: { ACTIVE_TRAVEL_SCHEDULE: '有进行中行程的账号', PUBLIC: '所有人', UNKNOWN: '条件待确认' },
      expiry: { ISSUE_PLUS_DAYS: '自领取之日起在规定天数内有效', ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END: '自领取之日起在规定天数内有效，最晚至优惠结束日', OFFER_END: '有效期至优惠结束', UNKNOWN: '有效期待确认' },
      inventory: { LIMITED: '数量有限', UNKNOWN: '数量待确认', UNLIMITED: '数量不限' },
      remaining: { limited_one: '剩余 {{count}} 张', limited_other: '剩余 {{count}} 张', unknown: '未提供剩余数量', unlimited: '数量不限' },
      statuses: { CLOSED: '已结束', DRAFT: '草稿', PUBLISHED: '可领取', UNKNOWN: '状态待确认' },
    },
  },
  'zh-TW': {
    offer: {
      cta: { ended: '優惠已結束', issue: '領取優惠券', notStarted: '尚未開始', soldOut: '已全數領完', unavailable: '無法領取' },
      eligibility: { ACTIVE_TRAVEL_SCHEDULE: '有進行中行程的帳號', PUBLIC: '所有人', UNKNOWN: '條件待確認' },
      expiry: { ISSUE_PLUS_DAYS: '自領取日起於指定天數內有效', ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END: '自領取日起於指定天數內有效，最晚至優惠結束日', OFFER_END: '有效至優惠結束', UNKNOWN: '有效期限待確認' },
      inventory: { LIMITED: '數量有限', UNKNOWN: '數量待確認', UNLIMITED: '數量不限' },
      remaining: { limited_one: '剩餘 {{count}} 張', limited_other: '剩餘 {{count}} 張', unknown: '未提供剩餘數量', unlimited: '數量不限' },
      statuses: { CLOSED: '已結束', DRAFT: '草稿', PUBLISHED: '可領取', UNKNOWN: '狀態待確認' },
    },
  },
  vi: {
    offer: {
      cta: { ended: 'Ưu đãi đã kết thúc', issue: 'Nhận phiếu ưu đãi', notStarted: 'Chưa bắt đầu', soldOut: 'Đã hết lượt', unavailable: 'Không thể nhận' },
      eligibility: { ACTIVE_TRAVEL_SCHEDULE: 'Tài khoản có chuyến đi đang diễn ra', PUBLIC: 'Mọi người', UNKNOWN: 'Cần kiểm tra điều kiện' },
      expiry: {
        ISSUE_PLUS_DAYS: 'Có hiệu lực trong số ngày quy định kể từ khi nhận',
        ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END: 'Có hiệu lực trong số ngày quy định kể từ khi nhận, tối đa đến ngày ưu đãi kết thúc',
        OFFER_END: 'Có hiệu lực đến khi ưu đãi kết thúc',
        UNKNOWN: 'Cần kiểm tra thời hạn',
      },
      inventory: { LIMITED: 'Số lượng có hạn', UNKNOWN: 'Cần kiểm tra số lượng', UNLIMITED: 'Không giới hạn số lượng' },
      remaining: {
        limited_one: 'Còn {{count}}',
        limited_other: 'Còn {{count}}',
        unknown: 'Chưa có thông tin số lượng còn lại',
        unlimited: 'Không giới hạn số lượng',
      },
      statuses: { CLOSED: 'Đã kết thúc', DRAFT: 'Bản nháp', PUBLISHED: 'Có thể nhận', UNKNOWN: 'Cần kiểm tra trạng thái' },
    },
  },
} as const;
