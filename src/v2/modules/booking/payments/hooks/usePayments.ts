import { useQuery } from '@tanstack/react-query';

import { paymentApi } from '../api/paymentApi';
import { paymentQueryKeys } from '../model/paymentQueryKeys';
import type { ListPaymentsParams } from '../model/payment.types';

type PaymentApi = typeof paymentApi;

export function createAllPaymentsQueryOptions(
  api: Pick<PaymentApi, 'listAllPayments'> = paymentApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.listAllPayments(signal),
    queryKey: paymentQueryKeys.allPages(),
  };
}

export function createPaymentsQueryOptions(
  params: ListPaymentsParams = {},
  api: Pick<PaymentApi, 'listPayments'> = paymentApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.listPayments(params, signal),
    queryKey: paymentQueryKeys.list(params),
  };
}

export function createPaymentDetailQueryOptions(
  paymentId: number,
  api: Pick<PaymentApi, 'getPayment'> = paymentApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.getPayment(paymentId, signal),
    queryKey: paymentQueryKeys.detail(paymentId),
  };
}

export function usePayments(params: ListPaymentsParams = {}) {
  return useQuery(createPaymentsQueryOptions(params));
}

export function useAllPayments() {
  return useQuery(createAllPaymentsQueryOptions());
}

export function usePaymentDetail(paymentId: number) {
  return useQuery(createPaymentDetailQueryOptions(paymentId));
}
