import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createPaymentApi } from '../../../features/payments/api/paymentApi.ts';
import {
  createAllPaymentsQueryOptions,
  createPaymentDetailQueryOptions,
  createPaymentsQueryOptions,
} from '../../../features/payments/hooks/usePayments.ts';
import { PAYMENT_STATUSES } from '../../../features/payments/model/payment.types.ts';
import { createReservationApi } from '../../../features/reservations/api/reservationApi.ts';
import {
  createReservationDetailQueryOptions,
  reservationQueryKeys,
} from '../../../features/reservations/hooks/useReservations.ts';
import { ApiError, mockApiClient, setMockScenario } from '../index.ts';

test('reservation detail and tourist payment APIs forward identifiers, params, and AbortSignal', async () => {
  const calls = [];
  const response = { contract: 'response' };
  const client = {
    delete: async () => response,
    get: async (path, options) => { calls.push({ options, path }); return response; },
    patch: async () => response,
    post: async () => response,
    put: async () => response,
  };
  const signal = new AbortController().signal;
  const reservations = createReservationApi(client);
  const payments = createPaymentApi(client);

  assert.equal(await reservations.getReservation(901, signal), response);
  assert.equal(await payments.listPayments({ limit: 50, page: 2 }, signal), response);
  assert.equal(await payments.getPayment(1002, signal), response);
  assert.deepEqual(calls, [
    { options: { signal }, path: '/reservations/901' },
    { options: { params: { limit: 50, page: 2 }, signal }, path: '/payments' },
    { options: { signal }, path: '/payments/1002' },
  ]);
});

test('all-payments API follows hasNext until the final page and forwards one AbortSignal', async () => {
  const calls = [];
  const signal = new AbortController().signal;
  const client = {
    delete: async () => undefined,
    get: async (path, options) => {
      calls.push({ options, path });
      const page = options.params.page;
      return {
        hasNext: page === 1,
        limit: 100,
        page,
        payments: [{ id: page, reservationId: 901 }],
        totalElements: 2,
        totalPages: 2,
      };
    },
    patch: async () => undefined,
    post: async () => undefined,
    put: async () => undefined,
  };

  const result = await createPaymentApi(client).listAllPayments(signal);

  assert.deepEqual(result.map(({ id }) => id), [1, 2]);
  assert.deepEqual(calls, [
    { options: { params: { limit: 100, page: 1 }, signal }, path: '/payments' },
    { options: { params: { limit: 100, page: 2 }, signal }, path: '/payments' },
  ]);
});

test('reservation and payment Query options use stable keys and forward AbortSignal', async () => {
  const calls = [];
  const signal = new AbortController().signal;
  const response = { id: 1 };
  const reservation = createReservationDetailQueryOptions(901, {
    getReservation: async (id, receivedSignal) => {
      calls.push(['reservation', id, receivedSignal]); return response;
    },
  });
  const payments = createPaymentsQueryOptions({ page: 1 }, {
    listPayments: async (params, receivedSignal) => {
      calls.push(['payments', params, receivedSignal]); return response;
    },
  });
  const payment = createPaymentDetailQueryOptions(1002, {
    getPayment: async (id, receivedSignal) => {
      calls.push(['payment', id, receivedSignal]); return response;
    },
  });
  const allPayments = createAllPaymentsQueryOptions({
    listAllPayments: async (receivedSignal) => {
      calls.push(['allPayments', receivedSignal]); return [response];
    },
  });

  assert.equal(await reservation.queryFn({ signal }), response);
  assert.equal(await payments.queryFn({ signal }), response);
  assert.equal(await payment.queryFn({ signal }), response);
  assert.deepEqual(await allPayments.queryFn({ signal }), [response]);
  assert.deepEqual(reservation.queryKey, reservationQueryKeys.detail(901));
  assert.deepEqual(payments.queryKey, ['v2', 'payments', 'list', { page: 1 }]);
  assert.deepEqual(payment.queryKey, ['v2', 'payments', 'detail', 1002]);
  assert.deepEqual(allPayments.queryKey, ['v2', 'payments', 'all-pages']);
  assert.deepEqual(calls, [
    ['reservation', 901, signal],
    ['payments', { page: 1 }, signal],
    ['payment', 1002, signal],
    ['allPayments', signal],
  ]);
});

test('mock responses preserve every payment state and distinguish an empty list', async () => {
  setMockScenario('success');
  const reservation = await mockApiClient.get('/reservations/901');
  const page = await mockApiClient.get('/payments');
  const failedPayment = await mockApiClient.get('/payments/1004');

  assert.equal(reservation.status, 'CONFIRMED');
  assert.deepEqual(page.payments.map(({ status }) => status), PAYMENT_STATUSES);
  assert.equal(page.payments[0].amountMinor, null);
  assert.equal(page.payments[0].currency, null);
  assert.equal(failedPayment.status, 'FAILED');
  assert.equal(failedPayment.failureCode, 'PAYMENT_DECLINED');

  setMockScenario('empty');
  const emptyPage = await mockApiClient.get('/payments');
  assert.deepEqual(emptyPage, {
    hasNext: false,
    limit: 20,
    page: 1,
    payments: [],
    totalElements: 0,
    totalPages: 0,
  });
  setMockScenario('success');
});

test('reservation and payment API errors remain the common ApiError instance', async () => {
  const endpointCases = [
    [createReservationApi, 'getReservation', [901], [401, 403, 404]],
    [createPaymentApi, 'listPayments', [{}], [400, 401, 403]],
    [createPaymentApi, 'getPayment', [1002], [401, 403, 404]],
  ];

  for (const [factory, method, args, statuses] of endpointCases) {
    for (const status of statuses) {
      const expected = new ApiError('contract error', { code: `HTTP_${status}`, status });
      const client = {
        delete: async () => { throw expected; },
        get: async () => { throw expected; },
        patch: async () => { throw expected; },
        post: async () => { throw expected; },
        put: async () => { throw expected; },
      };
      await assert.rejects(factory(client)[method](...args), (error) => error === expected);
    }
  }
});

test('checked-in OpenAPI snapshot keeps current response fields, enums, and error statuses', async () => {
  const document = JSON.parse(await readFile(
    new URL('../../../../../docs/api/reservation-payment.openapi.json', import.meta.url),
    'utf8',
  ));
  const schemas = document.components.schemas;

  assert.deepEqual(schemas.ReservationResponse.properties.status.enum, [
    'PENDING', 'CONFIRMED', 'REJECTED', 'CANCELED',
  ]);
  assert.deepEqual(schemas.ReservationCreateRequest.required, [
    'availabilityId', 'bookerName', 'bookerPhone', 'idempotencyKey',
  ]);
  assert.equal(schemas.ReservationCreateRequest.properties.bookerPhone.pattern, '^[0-9+()\\- ]+$');
  assert.equal(schemas.ReservationCreateRequest.properties.bookerName.maxLength, 100);
  assert.equal(schemas.ReservationCreateRequest.properties.requestNote.maxLength, 500);
  for (const field of ['reservationStartsAt', 'reservationEndsAt', 'bookerName', 'bookerPhone', 'requestNote']) {
    assert.equal(schemas.ReservationResponse.properties[field].nullable, true, field);
  }
  assert.deepEqual(Object.keys(document.paths['/reservations'].post.responses), [
    '201', '400', '401', '403',
  ]);
  assert.deepEqual(Object.keys(document.paths['/reservations'].get.responses), [
    '200', '400', '401', '403',
  ]);
  assert.deepEqual(Object.keys(document.paths['/places/{placeId}/availabilities'].get.responses), [
    '200', '401', '403',
  ]);
  assert.deepEqual(schemas.PaymentResponse.properties.status.enum, PAYMENT_STATUSES);
  assert.equal(schemas.PaymentResponse.properties.amountMinor.format, 'int64');
  assert.equal(schemas.PaymentResponse.properties.amountMinor.nullable, true);
  assert.equal(schemas.PaymentResponse.properties.currency.nullable, true);
  assert.deepEqual(Object.keys(document.paths['/reservations/{reservationId}'].get.responses), [
    '200', '401', '403', '404',
  ]);
  assert.deepEqual(Object.keys(document.paths['/payments'].get.responses), [
    '200', '400', '401', '403',
  ]);
  assert.deepEqual(Object.keys(document.paths['/payments/{paymentId}'].get.responses), [
    '200', '401', '403', '404',
  ]);
});
