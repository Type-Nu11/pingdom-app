/**
 * Shared shape for every server-state badge in V2.
 *
 * The enums themselves always come from the OpenAPI generated types; this module
 * only owns the presentation mapping (label key, badge tone, non-color cue) and
 * the fallback used when the server sends a value the generated contract does
 * not know yet. Nothing here declares a server enum.
 */

export type StatusTone = 'neutral' | 'success' | 'warning' | 'error';

/**
 * Every tone ships a text cue so a badge never conveys state by color alone.
 * Mirrors the symbols used by the shared `StatusBadge`.
 */
export const STATUS_TONE_SYMBOLS: Readonly<Record<StatusTone, string>> = {
  error: '×',
  neutral: '●',
  success: '✓',
  warning: '!',
};

export type StatusPresentation = Readonly<{ labelKey: string; tone: StatusTone }>;

export type StatusView<TStatus extends string> = Readonly<{
  /** The contract value, or `null` when the server sent something unmapped. */
  status: TStatus | null;
  /** The raw server value, kept for logging. `null` when nothing was sent. */
  raw: string | null;
  /** `false` when the fallback presentation was used. */
  known: boolean;
  labelKey: string;
  tone: StatusTone;
  /** Text cue paired with `tone`, so color is never the only signal. */
  symbol: string;
}>;

/** Compile-time guard: `Value` must be `never`, i.e. nothing was left unlisted. */
export type AssertNever<Value extends never> = Value;

/**
 * Builds a pure resolver over an exhaustive presentation map. `Record<TStatus, …>`
 * makes a missing state a type error, and an unrecognised runtime value resolves
 * to `fallback` instead of throwing, so one unknown row cannot blank a screen.
 */
export function createStatusViewResolver<TStatus extends string>(
  presentations: Readonly<Record<TStatus, StatusPresentation>>,
  fallback: StatusPresentation,
): (status: TStatus | string | null | undefined) => StatusView<TStatus> {
  // A Map, not the record itself: a server value such as `toString` would
  // otherwise hit `Object.prototype` and be mistaken for a mapped state.
  const byValue = new Map<string, StatusPresentation>(Object.entries(presentations));

  return function resolveStatusView(status) {
    const raw = typeof status === 'string' ? status : null;
    const presentation = raw === null ? undefined : byValue.get(raw);

    if (presentation === undefined) {
      return {
        known: false,
        labelKey: fallback.labelKey,
        raw,
        status: null,
        symbol: STATUS_TONE_SYMBOLS[fallback.tone],
        tone: fallback.tone,
      };
    }

    return {
      known: true,
      labelKey: presentation.labelKey,
      raw,
      status: raw as TStatus,
      symbol: STATUS_TONE_SYMBOLS[presentation.tone],
      tone: presentation.tone,
    };
  };
}

/**
 * Same contract as `createStatusViewResolver` for server enums that carry no
 * state semantics (policies), where a tone would be meaningless.
 */
export function createLabelKeyResolver<TValue extends string>(
  labelKeys: Readonly<Record<TValue, string>>,
  fallbackLabelKey: string,
): (value: TValue | string | null | undefined) => string {
  const byValue = new Map<string, string>(Object.entries(labelKeys));

  return function resolveLabelKey(value) {
    if (typeof value !== 'string') {
      return fallbackLabelKey;
    }

    return byValue.get(value) ?? fallbackLabelKey;
  };
}
