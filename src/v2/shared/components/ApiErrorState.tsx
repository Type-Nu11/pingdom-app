import React from 'react';
import { useTranslation } from 'react-i18next';

import { getApiErrorUx, type ApiErrorUxKind } from '../api';
import ErrorState from './ErrorState';

type ApiErrorStateProps = {
  error: unknown;
  fill?: boolean;
  onBack?: () => void;
  onRetry?: () => void;
  onSignIn?: () => void;
  onUpdate?: () => void;
};

const COPY_KEYS: Record<ApiErrorUxKind, { description: string; title: string }> = {
  authentication: {
    description: 'common.apiError.authentication.description',
    title: 'common.apiError.authentication.title',
  },
  authorization: {
    description: 'common.apiError.authorization.description',
    title: 'common.apiError.authorization.title',
  },
  conflict: {
    description: 'common.apiError.conflict.description',
    title: 'common.apiError.conflict.title',
  },
  expired: {
    description: 'common.apiError.expired.description',
    title: 'common.apiError.expired.title',
  },
  generic: {
    description: 'common.apiError.generic.description',
    title: 'common.apiError.generic.title',
  },
  notFound: {
    description: 'common.apiError.notFound.description',
    title: 'common.apiError.notFound.title',
  },
  outOfRange: {
    description: 'common.apiError.outOfRange.description',
    title: 'common.apiError.outOfRange.title',
  },
  updateRequired: {
    description: 'common.apiError.updateRequired.description',
    title: 'common.apiError.updateRequired.title',
  },
  validation: {
    description: 'common.apiError.validation.description',
    title: 'common.apiError.validation.title',
  },
};

export default function ApiErrorState({
  error,
  fill,
  onBack,
  onRetry,
  onSignIn,
  onUpdate,
}: ApiErrorStateProps) {
  const { t } = useTranslation();
  const ux = getApiErrorUx(error);
  const copy = COPY_KEYS[ux.kind];

  const action = ux.action === 'back'
    ? { label: t('common.apiError.actions.back'), onAction: onBack }
    : ux.action === 'retry'
      ? { label: t('common.apiError.actions.retry'), onAction: onRetry }
      : ux.action === 'signIn'
        ? { label: t('common.apiError.actions.signIn'), onAction: onSignIn }
        : ux.action === 'update'
          ? { label: t('common.apiError.actions.update'), onAction: onUpdate }
          : undefined;

  return (
    <ErrorState
      actionLabel={action?.onAction ? action.label : undefined}
      description={t(copy.description)}
      fill={fill}
      onAction={action?.onAction}
      title={t(copy.title)}
    />
  );
}
