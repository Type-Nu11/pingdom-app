import type { MockScenario } from '../../config/env';

export type MockMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';

export type MockRequest = {
  body?: unknown;
  method: MockMethod;
  path: string;
  scenario: MockScenario;
};

export type MockHandler = {
  method: MockMethod;
  path: string | RegExp;
  resolve(request: MockRequest): unknown;
};

export type MockHandlerResult =
  | { found: false }
  | { found: true; response: unknown };

function matchesPath(matcher: MockHandler['path'], path: string): boolean {
  if (typeof matcher === 'string') return matcher === path;

  matcher.lastIndex = 0;
  return matcher.test(path);
}

export function resolveMockHandler(
  handlers: readonly MockHandler[],
  request: MockRequest,
): MockHandlerResult {
  const handler = handlers.find(
    (candidate) =>
      candidate.method === request.method && matchesPath(candidate.path, request.path),
  );

  return handler
    ? { found: true, response: handler.resolve(request) }
    : { found: false };
}
