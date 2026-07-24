import axios from 'axios';

import { env } from '../config';
import { toApiError } from './ApiError';
import { mockApiClient } from './mock/mockApiClient';

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

const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: REQUEST_TIMEOUT_MS,
});

function assertRelativeApiPath(path: string) {
  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new Error(`V2 API paths must be relative and start with a single slash: ${path}`);
  }
}

const realApiClient: ApiClient = {
  async get<TResponse>(path: string, options: GetRequestOptions = {}): Promise<TResponse> {
    assertRelativeApiPath(path);

    try {
      const response = await axiosInstance.get<TResponse>(path, options);
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
      const response = await axiosInstance.patch<TResponse>(path, body, options);
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
      const response = await axiosInstance.post<TResponse>(path, body, options);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};

export const apiClient: ApiClient = env.apiMode === 'mock' ? mockApiClient : realApiClient;
