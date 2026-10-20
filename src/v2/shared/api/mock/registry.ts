import type { MockHandler } from './handlers';

let domainHandlers: readonly MockHandler[] = [];

/** Application composition installs domain fixtures without a shared-to-domain import. */
export function configureDomainMockHandlers(handlers: readonly MockHandler[]): void {
  domainHandlers = handlers;
}

export function getDomainMockHandlers(): readonly MockHandler[] {
  return domainHandlers;
}
