import { apiClient, type ApiClient } from '../../../shared/api';
import type { ListPaymentsParams, Payment, PaymentPage } from '../model/payment.types';

export function createPaymentApi(client: ApiClient = apiClient) {
  return {
    getPayment: (paymentId: number, signal?: AbortSignal): Promise<Payment> =>
      client.get<Payment>(`/payments/${paymentId}`, { signal }),

    listPayments: (
      params: ListPaymentsParams = {},
      signal?: AbortSignal,
    ): Promise<PaymentPage> =>
      client.get<PaymentPage>('/payments', { params, signal }),
  };
}

export const paymentApi = createPaymentApi();
