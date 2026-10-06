export const paymentResources = {
  en: { payment: {
        statuses: {
          FAILED: 'Payment failed',
          PAID: 'Paid',
          PROCESSING: 'Payment in progress',
          REFUNDED: 'Refunded',
          REFUND_PROCESSING: 'Refund in progress',
          UNKNOWN: 'Status needs review',
        },
      } },
  ko: { payment: {
        statuses: {
          FAILED: '결제 실패',
          PAID: '결제 완료',
          PROCESSING: '결제 진행 중',
          REFUNDED: '환불 완료',
          REFUND_PROCESSING: '환불 진행 중',
          UNKNOWN: '상태 확인 필요',
        },
      } },
  ja: { payment: {
        statuses: {
          FAILED: '決済失敗',
          PAID: '決済完了',
          PROCESSING: '決済処理中',
          REFUNDED: '返金完了',
          REFUND_PROCESSING: '返金処理中',
          UNKNOWN: '状態の確認が必要です',
        },
      } },
  'zh-CN': {
    payment: {
      statuses: { FAILED: '支付失败', PAID: '已支付', PROCESSING: '支付处理中', REFUNDED: '已退款', REFUND_PROCESSING: '退款处理中', UNKNOWN: '状态待确认' },
    },
  },
  'zh-TW': {
    payment: {
      statuses: { FAILED: '付款失敗', PAID: '已付款', PROCESSING: '付款處理中', REFUNDED: '已退款', REFUND_PROCESSING: '退款處理中', UNKNOWN: '狀態待確認' },
    },
  },
  vi: {
    payment: {
      statuses: {
        FAILED: 'Thanh toán thất bại',
        PAID: 'Đã thanh toán',
        PROCESSING: 'Đang thanh toán',
        REFUNDED: 'Đã hoàn tiền',
        REFUND_PROCESSING: 'Đang hoàn tiền',
        UNKNOWN: 'Cần kiểm tra trạng thái',
      },
    },
  },
} as const;
