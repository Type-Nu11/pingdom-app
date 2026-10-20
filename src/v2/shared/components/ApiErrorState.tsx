import React, { useRef, useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { getApiErrorUx, type ApiErrorUxKind } from '../api';
import ErrorState from './ErrorState';

type ApiErrorStateProps = {
  error: unknown;
  fill?: boolean;
  busy?: boolean;
  onBack?: () => unknown;
  onRetry?: () => unknown;
  onSignIn?: () => unknown;
  onUpdate?: () => unknown;
};

const COPY_KEYS: Record<ApiErrorUxKind, { description: string; title: string }> = {
  canceled: { description: 'common.apiError.generic.description', title: 'common.apiError.generic.title' },
  timeout: { description: 'common.apiError.timeout.description', title: 'common.apiError.timeout.title' },
  server: { description: 'common.apiError.server.description', title: 'common.apiError.server.title' },
  rateLimited: { description: 'common.apiError.rateLimited.description', title: 'common.apiError.rateLimited.title' },
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
  network: {
    description: 'common.apiError.network.description',
    title: 'common.apiError.network.title',
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
  busy = false,
  onBack,
  onRetry,
  onSignIn,
  onUpdate,
}: ApiErrorStateProps) {
  const { t } = useTranslation();
  const lock = useRef(false);
  const mounted = useRef(true);
  const [pending, setPending] = useState(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
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

  if (ux.kind === 'canceled') return null;

  const runAction = async () => {
    if (lock.current || busy || !action?.onAction) return;
    lock.current = true;
    setPending(true);
    try { await action.onAction(); } catch { /* The owner retains and presents the request error. */ }
    finally { lock.current = false; if (mounted.current) setPending(false); }
  };

  const state = (
    <ErrorState
      actionLabel={action?.onAction ? action.label : undefined}
      description={t(copy.description, { defaultValue: t('common.apiError.generic.description') })}
      actionBusy={busy || pending}
      fill={fill}
      onAction={action?.onAction ? () => { void runAction(); } : undefined}
      title={t(copy.title, { defaultValue: t('common.apiError.generic.title') })}
    />
  );
  return fill ? (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>{state}</ScrollView>
  ) : state;
}
