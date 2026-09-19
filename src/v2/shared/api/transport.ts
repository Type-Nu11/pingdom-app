type QueryValue = boolean | number | string | null | undefined;

export type GetRequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, QueryValue>;
  signal?: AbortSignal;
};

export type MutationRequestOptions = {
  /** Opt-in raw final response; existing JSON callers are unchanged. */
  responseType?: 'text';
  maxContentLength?: number;
  onDownloadProgress?: (event: { loaded: number }) => void;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};


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
