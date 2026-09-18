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
} as const;
