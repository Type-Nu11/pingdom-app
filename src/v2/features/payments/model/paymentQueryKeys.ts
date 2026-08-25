import type { ListPaymentsParams } from './payment.types';

export const paymentQueryKeys = {
  all: ['v2', 'payments'] as const,
  list: (params: ListPaymentsParams) => [...paymentQueryKeys.all, 'list', params] as const,
  detail: (paymentId: number) => [...paymentQueryKeys.all, 'detail', paymentId] as const,
};
