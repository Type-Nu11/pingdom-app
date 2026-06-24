export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type ApiFieldErrors = Record<string, string>;

export type ApiFieldErrorResponse = {
  errors?: ApiFieldErrors;
  message: string;
};

export type ApiCodeErrorResponse<TCode extends string = string> = {
  code: TCode;
  message: string;
};
