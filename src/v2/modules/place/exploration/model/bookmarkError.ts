import { getApiErrorUx } from '../../../../shared/api';

/** Returns a translation key, never the server response. */
export const getBookmarkErrorMessage = (error: unknown) => {
  const { kind } = getApiErrorUx(error);
  if (kind === 'canceled') return null;
  return ['network', 'timeout', 'server'].includes(kind)
    ? 'common.apiError.mutationUnknown.description'
    : `common.apiError.${kind}.description`;
};
