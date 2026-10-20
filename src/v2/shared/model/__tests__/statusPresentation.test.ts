import {
  createLabelKeyResolver,
  createStatusViewResolver,
  STATUS_TONE_SYMBOLS,
} from '../statusPresentation';

type Fixture = 'OPEN' | 'CLOSED';

const resolve = createStatusViewResolver<Fixture>(
  {
    CLOSED: { labelKey: 'fixture.CLOSED', tone: 'neutral' },
    OPEN: { labelKey: 'fixture.OPEN', tone: 'success' },
  },
  { labelKey: 'fixture.UNKNOWN', tone: 'neutral' },
);

describe('createStatusViewResolver', () => {
  it('maps a known status to its label key, tone, and text cue', () => {
    expect(resolve('OPEN')).toEqual({
      known: true,
      labelKey: 'fixture.OPEN',
      raw: 'OPEN',
      status: 'OPEN',
      symbol: STATUS_TONE_SYMBOLS.success,
      tone: 'success',
    });
  });

  it('falls back for a server value this build does not know', () => {
    const view = resolve('SUSPENDED');

    expect(view.known).toBe(false);
    expect(view.status).toBeNull();
    expect(view.raw).toBe('SUSPENDED');
    expect(view.labelKey).toBe('fixture.UNKNOWN');
  });

  it.each([[null], [undefined]])('falls back for %p without a raw value', (status) => {
    const view = resolve(status);

    expect(view.known).toBe(false);
    expect(view.raw).toBeNull();
    expect(view.labelKey).toBe('fixture.UNKNOWN');
  });

  it('always pairs a tone with a text cue so color is never the only signal', () => {
    for (const status of ['OPEN', 'CLOSED', 'SUSPENDED', null]) {
      const view = resolve(status);
      expect(view.symbol).toBe(STATUS_TONE_SYMBOLS[view.tone]);
      expect(view.symbol).not.toBe('');
    }
  });

  it('does not treat inherited Object keys as known statuses', () => {
    expect(resolve('toString').known).toBe(false);
    expect(resolve('constructor').labelKey).toBe('fixture.UNKNOWN');
  });
});

describe('createLabelKeyResolver', () => {
  const resolveLabelKey = createLabelKeyResolver<Fixture>(
    { CLOSED: 'fixture.CLOSED', OPEN: 'fixture.OPEN' },
    'fixture.UNKNOWN',
  );

  it('maps known values and falls back otherwise', () => {
    expect(resolveLabelKey('CLOSED')).toBe('fixture.CLOSED');
    expect(resolveLabelKey('SOMETHING_NEW')).toBe('fixture.UNKNOWN');
    expect(resolveLabelKey(undefined)).toBe('fixture.UNKNOWN');
    expect(resolveLabelKey(null)).toBe('fixture.UNKNOWN');
  });
});
