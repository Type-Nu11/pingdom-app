import '../../../configureDomainMocks.ts';
import assert from 'node:assert/strict';
import test from 'node:test';
import { mockApiClient, setMockScenario } from '../../../../shared/api/index.ts';

test('app registry installs Booking availability before the Place fallback', async () => {
  setMockScenario('success');
  const slots = await mockApiClient.get('/places/17/availabilities');
  assert.deepEqual(slots.map(slot => slot.productType), ['GENERAL', 'GENERAL', 'TICKET', 'CLASS']);
  assert.equal(new Set(slots.map(slot => slot.id)).size, 4);
});

test('app registry preserves Booking record, payment, Offer and Coupon handlers', async () => {
  setMockScenario('success');
  const body = { availabilityId: 8801, idempotencyKey: 'registry-test', quantity: 3, bookerName: 'Test' };
  const reservation = await mockApiClient.post('/reservations', body);
  assert.equal(reservation.availabilityId, body.availabilityId);
  assert.equal(reservation.quantity, body.quantity);
  assert.equal(reservation.bookerName, body.bookerName);
  assert.equal(reservation.status, 'PENDING');
  const payments = await mockApiClient.get('/payments');
  assert.deepEqual(payments.payments.map(payment => payment.status), ['PROCESSING', 'PAID', 'REFUND_PROCESSING', 'FAILED', 'REFUNDED']);
  const offer = await mockApiClient.get('/offers/401');
  assert.equal(offer.id, 401);
  const coupon = await mockApiClient.post('/offers/401/coupons');
  assert.equal(coupon.code, '00000000-0000-4000-8000-000000000501');
  assert.equal(coupon.status, 'ISSUED');
  const redeemed = await mockApiClient.post('/merchant-owner/offers/coupons/redeem', { code: coupon.code });
  assert.equal(redeemed.status, 'REDEEMED');
  const owned = await mockApiClient.get('/merchant-owner/reservations');
  assert.equal(owned.totalCount, 1);
});

test('Booking registry preserves empty collections and Offer detail not-found', async () => {
  setMockScenario('empty');
  assert.deepEqual(await mockApiClient.get('/places/17/availabilities'), []);
  for (const [path, key] of [['/reservations', 'reservations'], ['/payments', 'payments'], ['/offers', 'offers'], ['/coupons', 'coupons']]) {
    const page = await mockApiClient.get(path);
    assert.deepEqual(page[key], []);
    assert.equal(page.totalElements, 0);
  }
  await assert.rejects(mockApiClient.get('/offers/401'), error => error.status === 404 && error.code === 'PLACE_NOT_FOUND');
  setMockScenario('success');
});

test('Booking handlers keep generic mock failure and abort handling', async () => {
  setMockScenario('network-error');
  await assert.rejects(mockApiClient.get('/coupons'), error => error.code === 'ERR_NETWORK');
  setMockScenario('success');
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(mockApiClient.get('/reservations', { signal: controller.signal }), error => error.code === 'ERR_CANCELED');
});
