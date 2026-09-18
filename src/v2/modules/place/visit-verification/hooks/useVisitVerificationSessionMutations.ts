import { useMutation, useQueryClient } from '@tanstack/react-query';

import { checkInQueryKeys } from '../../check-ins';
import {
  visitVerificationApi,
  type ForegroundVisitVerificationStartBody,
  type VisitVerificationObservationBody,
  type VisitVerificationSession,
  type VisitVerificationStartBody,
} from '../api/visitVerificationApi';
import { visitVerificationSessionQueryKeys } from '../model/visitVerificationSession';

type SessionApi = Pick<
  typeof visitVerificationApi,
  'getSession' | 'startForegroundSession' | 'startSession' | 'submitObservation'
>;

export function createStartSessionMutationOptions(api: SessionApi = visitVerificationApi) {
  return {
    mutationFn: ({ body, signal }: { body: VisitVerificationStartBody; signal?: AbortSignal }) =>
      api.startSession(body, signal),
    retry: false as const,
  };
}

export function createStartForegroundSessionMutationOptions(
  api: SessionApi = visitVerificationApi,
) {
  return {
    mutationFn: ({
      body,
      signal,
    }: {
      body: ForegroundVisitVerificationStartBody;
      signal?: AbortSignal;
    }) => api.startForegroundSession(body, signal),
    retry: false as const,
  };
}

export function createRecoverSessionMutationOptions(api: SessionApi = visitVerificationApi) {
  return {
    mutationFn: ({ sessionId, signal }: { sessionId: number; signal?: AbortSignal }) =>
      api.getSession(sessionId, signal),
    retry: false as const,
  };
}

export function createObservationMutationOptions(api: SessionApi = visitVerificationApi) {
  return {
    mutationFn: ({
      body,
      sessionId,
      signal,
    }: {
      body: VisitVerificationObservationBody;
      sessionId: number;
      signal?: AbortSignal;
    }) => api.submitObservation(sessionId, body, signal),
    retry: false as const,
  };
}

export async function applyVisitVerificationSessionResult(
  queryClient: ReturnType<typeof useQueryClient>,
  session: VisitVerificationSession,
) {
  if (session.id !== undefined) {
    queryClient.setQueryData(visitVerificationSessionQueryKeys.detail(session.id), session);
  }
  if (session.status === 'COMPLETED' && session.completedCheckInId != null) {
    await queryClient.invalidateQueries({ queryKey: checkInQueryKeys.all });
  }
}

export function useStartVisitVerificationSession() {
  const queryClient = useQueryClient();
  return useMutation({
    ...createStartSessionMutationOptions(),
    onSuccess: (session) => applyVisitVerificationSessionResult(queryClient, session),
  });
}

export function useStartForegroundVisitVerificationSession() {
  const queryClient = useQueryClient();
  return useMutation({
    ...createStartForegroundSessionMutationOptions(),
    onSuccess: (session) => applyVisitVerificationSessionResult(queryClient, session),
  });
}

export function useRecoverVisitVerificationSession() {
  const queryClient = useQueryClient();
  return useMutation({
    ...createRecoverSessionMutationOptions(),
    onSuccess: (session) => applyVisitVerificationSessionResult(queryClient, session),
  });
}

export function useSubmitVisitVerificationObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...createObservationMutationOptions(),
    onSuccess: (session) => applyVisitVerificationSessionResult(queryClient, session),
  });
}
