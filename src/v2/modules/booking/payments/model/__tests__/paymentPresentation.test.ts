import { PAYMENT_STATUSES } from '../payment.types';
import { getPaymentAmount, getPaymentStatusView } from '../paymentPresentation';

describe('getPaymentStatusView', () => {
  it.each(PAYMENT_STATUSES)('gives %s a label key and text cue', (status) => {
    const view = getPaymentStatusView(status);

    expect(view.known).toBe(true);
    expect(view.status).toBe(status);
    expect(view.labelKey).toBe(`payment.statuses.${status}`);
    expect(view.symbol).not.toBe('');
  });

  it('marks in-flight server states as warnings, not as settled outcomes', () => {
    expect(getPaymentStatusView('PROCESSING').tone).toBe('warning');
    expect(getPaymentStatusView('REFUND_PROCESSING').tone).toBe('warning');
    expect(getPaymentStatusView('PAID').tone).toBe('success');
    expect(getPaymentStatusView('FAILED').tone).toBe('error');
    expect(getPaymentStatusView('REFUNDED').tone).toBe('neutral');
  });

  it('falls back for an unknown or missing server status', () => {
    expect(getPaymentStatusView('CHARGEBACK').known).toBe(false);
    expect(getPaymentStatusView('CHARGEBACK').labelKey).toBe('payment.statuses.UNKNOWN');
    expect(getPaymentStatusView(undefined).labelKey).toBe('payment.statuses.UNKNOWN');
    expect(getPaymentStatusView(null).labelKey).toBe('payment.statuses.UNKNOWN');
  });
});

describe('getPaymentAmount', () => {
  it('returns the pair only when the server reported both halves', () => {
    expect(getPaymentAmount(12000, 'KRW')).toEqual({ amountMinor: 12000, currency: 'KRW' });
  });

  it('returns null rather than 0 for an unsettled payment', () => {
    expect(getPaymentAmount(null, null)).toBeNull();
    expect(getPaymentAmount(null, 'KRW')).toBeNull();
    expect(getPaymentAmount(12000, null)).toBeNull();
    expect(getPaymentAmount(undefined, undefined)).toBeNull();
    expect(getPaymentAmount(12000, '')).toBeNull();
  });

  it('keeps a genuine zero amount', () => {
    expect(getPaymentAmount(0, 'KRW')).toEqual({ amountMinor: 0, currency: 'KRW' });
  });
});
