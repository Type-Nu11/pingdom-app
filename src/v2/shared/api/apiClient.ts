import axios, { type AxiosInstance } from 'axios';

import { env } from '../config';
import { toApiError } from './ApiError';

const REQUEST_TIMEOUT_MS = 10_000;

type QueryValue = boolean | number | string | null | undefined;

export type GetRequestOptions = {
  params?: Record<string, QueryValue>;
  signal?: AbortSignal;
};

export type MutationRequestOptions = {
  signal?: AbortSignal;
};

export type ApiClient = {
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
};

export type HttpTransport = Pick<AxiosInstance, 'get' | 'patch' | 'post'>;

let defaultTransport: HttpTransport = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: REQUEST_TIMEOUT_MS,
});

export function configureApiTransport(transport: HttpTransport): void {
  defaultTransport = transport;
}

function assertRelativeApiPath(path: string) {
  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new Error(`V2 API paths must be relative and start with a single slash: ${path}`);
  }
}

export function createApiClient(
  transport?: HttpTransport,
): ApiClient {
  const getTransport = () => transport ?? defaultTransport;

  return {
    async get<TResponse>(path: string, options: GetRequestOptions = {}): Promise<TResponse> {
      assertRelativeApiPath(path);

      try {
        const response = await getTransport().get<TResponse>(path, options);
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
        const response = await getTransport().patch<TResponse>(path, body, options);
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
        const response = await getTransport().post<TResponse>(path, body, options);
        return response.data;
      } catch (error) {
        throw toApiError(error);
      }
    },
  };
}

export const apiClient = createApiClient();
