import { apiClient, type ApiClient } from '../../../shared/api';
import type { ListPaymentsParams, Payment, PaymentPage } from '../model/payment.types';

const MAX_PAYMENT_PAGE_SIZE = 100;

export function createPaymentApi(client: ApiClient = apiClient) {
  const listPayments = (
    params: ListPaymentsParams = {},
    signal?: AbortSignal,
  ): Promise<PaymentPage> =>
    client.get<PaymentPage>('/payments', { params, signal });

  return {
    getPayment: (paymentId: number, signal?: AbortSignal): Promise<Payment> =>
      client.get<Payment>(`/payments/${paymentId}`, { signal }),

    listAllPayments: async (signal?: AbortSignal): Promise<Payment[]> => {
      const payments: Payment[] = [];
      let page = 1;

      while (true) {
        const response = await listPayments({ limit: MAX_PAYMENT_PAGE_SIZE, page }, signal);
        payments.push(...response.payments);

        if (!response.hasNext) return payments;
        page += 1;
      }
    },

    listPayments,
  };
}

export const paymentApi = createPaymentApi();
