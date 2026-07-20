import axios from 'axios';

import { env } from '../config';
import { toApiError } from './ApiError';

const REQUEST_TIMEOUT_MS = 10_000;

type QueryValue = boolean | number | string | null | undefined;

export type GetRequestOptions = {
  params?: Record<string, QueryValue>;
  signal?: AbortSignal;
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

export const apiClient = {
  async get<TResponse>(path: string, options: GetRequestOptions = {}): Promise<TResponse> {
    assertRelativeApiPath(path);

    try {
      const response = await axiosInstance.get<TResponse>(path, options);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};
