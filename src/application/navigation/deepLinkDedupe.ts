export const DEEP_LINK_EVENT_DEDUPE_WINDOW_MS = 750;

export type DeepLinkEventReceipt = Readonly<{
  receivedAt: number;
  url: string;
}>;

/** Collapses duplicate callbacks for one native open without blocking a later reopen. */
export function claimDeepLinkEvent(
  url: string,
  receivedAt: number,
  previous: DeepLinkEventReceipt | null,
  windowMs = DEEP_LINK_EVENT_DEDUPE_WINDOW_MS,
): DeepLinkEventReceipt | null {
  if (
    previous?.url === url
    && receivedAt >= previous.receivedAt
    && receivedAt - previous.receivedAt <= windowMs
  ) {
    return null;
  }

  return { receivedAt, url };
}
