import axios, { type AxiosInstance } from 'axios';

import { env } from '../config';
import { ApiError, toApiError } from './ApiError';
import { mockApiClient } from './mock/mockApiClient';

const REQUEST_TIMEOUT_MS = 10_000;
const FETCH_FALLBACK_TIMEOUT_MS = 10_000;

type QueryValue = boolean | number | string | null | undefined;

export type GetRequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, QueryValue>;
  signal?: AbortSignal;
};

export type MutationRequestOptions = {
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export type ApiAccessTokenProvider = () => Promise<string | null> | string | null;
export type ApiTransport = Pick<AxiosInstance, 'delete' | 'get' | 'patch' | 'post' | 'put'>;
export type HttpTransport = ApiTransport;

export type ApiClient = {
  delete<TResponse, TBody = never>(
    path: string,
    body?: TBody,
    options?: MutationRequestOptions,
  ): Promise<TResponse>;
  get<TResponse>(path: string, options?: GetRequestOptions): Promise<TResponse>;
  patch<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: MutationRequestOptions,
  ): Promise<TResponse>;
  post<TResponse, TBody = never>(
    path: string,
    body?: TBody,
    options?: MutationRequestOptions,
  ): Promise<TResponse>;
  put<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: MutationRequestOptions,
  ): Promise<TResponse>;
};

const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
  },
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true,
});

let accessTokenProvider: ApiAccessTokenProvider = () => null;
let apiTransport: ApiTransport = axiosInstance;

export function configureApiTransport(transport: ApiTransport): () => void {
  apiTransport = transport;

  return () => {
    if (apiTransport === transport) {
      apiTransport = axiosInstance;
    }
  };
}

export function configureApiAccessTokenProvider(provider: ApiAccessTokenProvider): () => void {
  accessTokenProvider = provider;

  return () => {
    if (accessTokenProvider === provider) {
      accessTokenProvider = () => null;
    }
  };
}

async function withAuthorization(
  options: GetRequestOptions | MutationRequestOptions,
): Promise<(GetRequestOptions | MutationRequestOptions) & {
  headers?: Record<string, string>;
}> {
  const token = (await accessTokenProvider())?.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return options;
  }

  return {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  };
}

async function putWithFetchFallback<TResponse, TBody>(
  path: string,
  body: TBody,
  options: MutationRequestOptions,
): Promise<TResponse> {
  const authorizedOptions = await withAuthorization(options);
  const fallbackController = new AbortController();
  const forwardAbort = () => fallbackController.abort();
  const timeoutId = setTimeout(() => fallbackController.abort(), FETCH_FALLBACK_TIMEOUT_MS);
  options.signal?.addEventListener('abort', forwardAbort, { once: true });

  let response: Response;

  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      body: JSON.stringify(body),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...authorizedOptions.headers,
      },
      method: 'PUT',
      signal: fallbackController.signal,
    });
  } catch (error) {
    if (fallbackController.signal.aborted && !options.signal?.aborted) {
      throw new ApiError(
        `PUT 요청이 ${FETCH_FALLBACK_TIMEOUT_MS / 1_000}초 안에 응답하지 않았습니다.`,
        { code: 'REQUEST_TIMEOUT' },
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener('abort', forwardAbort);
  }

  const responseText = await response.text();
  let responseData: unknown;

  try {
    responseData = responseText ? JSON.parse(responseText) : undefined;
  } catch {
    responseData = responseText;
  }

  if (!response.ok) {
    const errorBody = responseData && typeof responseData === 'object'
      ? responseData as { code?: unknown; message?: unknown }
      : undefined;

    throw new ApiError(
      typeof errorBody?.message === 'string'
        ? errorBody.message
        : `API request failed with status ${response.status}`,
      {
        code: typeof errorBody?.code === 'string' ? errorBody.code : undefined,
        responseBody: responseData,
        status: response.status,
      },
    );
  }

  return responseData as TResponse;
}

function assertRelativeApiPath(path: string) {
  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new Error(`V2 API paths must be relative and start with a single slash: ${path}`);
  }
}

export function createApiClient(transport?: ApiTransport): ApiClient {
  const getTransport = () => transport ?? apiTransport;

  return {
    async delete<TResponse, TBody = never>(
      path: string,
      body?: TBody,
      options: MutationRequestOptions = {},
    ): Promise<TResponse> {
      assertRelativeApiPath(path);

      try {
        const authorizedOptions = await withAuthorization(options);
        const response = await getTransport().delete<TResponse>(path, {
          ...authorizedOptions,
          data: body,
        });
        return response.data;
      } catch (error) {
        throw toApiError(error);
      }
    },

    async get<TResponse>(path: string, options: GetRequestOptions = {}): Promise<TResponse> {
      assertRelativeApiPath(path);

      try {
        const response = await getTransport().get<TResponse>(
          path,
          await withAuthorization(options),
        );
        return response.data;
      } catch (error) {
        throw toApiError(error);
      }
    },

    async patch<TResponse, TBody = unknown>(
      path: string,
      body: TBody,
      options: MutationRequestOptions = {},
    ): Promise<TResponse> {
      assertRelativeApiPath(path);

      try {
        const response = await getTransport().patch<TResponse>(
          path,
          body,
          await withAuthorization(options),
        );
        return response.data;
      } catch (error) {
        throw toApiError(error);
      }
    },

    async post<TResponse, TBody = never>(
      path: string,
      body?: TBody,
      options: MutationRequestOptions = {},
    ): Promise<TResponse> {
      assertRelativeApiPath(path);

      try {
        const response = await getTransport().post<TResponse>(
          path,
          body,
          await withAuthorization(options),
        );
        return response.data;
      } catch (error) {
        throw toApiError(error);
      }
    },

    async put<TResponse, TBody = unknown>(
      path: string,
      body: TBody,
      options: MutationRequestOptions = {},
    ): Promise<TResponse> {
      assertRelativeApiPath(path);

      try {
        const response = await getTransport().put<TResponse>(
          path,
          body,
          await withAuthorization(options),
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
          console.info('[V2 API] Axios PUT failed; retrying idempotent request with fetch.', {
            path,
          });

          try {
            return await putWithFetchFallback<TResponse, TBody>(path, body, options);
          } catch (fallbackError) {
            throw toApiError(fallbackError);
          }
        }

        throw toApiError(error);
      }
    },
  };
}

const realApiClient = createApiClient();

export const apiClient: ApiClient = env.apiMode === 'mock' ? mockApiClient : realApiClient;
