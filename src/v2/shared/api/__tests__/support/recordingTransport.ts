import axios, { type InternalAxiosRequestConfig } from 'axios';
import { createApiClient } from '../../apiClient';

/** Real Axios serialization with recorded requests and deterministic HTTP responses. */
export function createRecordingApiTransport(
  respond: (config: InternalAxiosRequestConfig) => { data: unknown; status: number },
) {
  const requests: InternalAxiosRequestConfig[] = [];
  const transport = axios.create({
    headers: { 'Content-Type': 'application/json' },
    adapter: async (config) => {
      requests.push(config);
      return { ...respond(config), statusText: '', headers: {}, config };
    },
  });
  return { client: createApiClient(transport), requests };
}
