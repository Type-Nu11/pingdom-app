import { getApiErrorUx } from '../../../../shared/api';

export const getBookmarkErrorMessage = (error: unknown) => getApiErrorUx(error).error.message;
