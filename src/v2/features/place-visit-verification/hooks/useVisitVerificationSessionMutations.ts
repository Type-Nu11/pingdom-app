import { useMutation, useQueryClient } from '@tanstack/react-query';

import { checkInQueryKeys } from '../../check-ins';
import {
  visitVerificationApi,
  type VisitVerificationObservationBody,
  type VisitVerificationSession,
  type VisitVerificationStartBody,
} from '../api/visitVerificationApi';
import { visitVerificationSessionQueryKeys } from '../model/visitVerificationSession';

type SessionApi = Pick<typeof visitVerificationApi, 'startSession' | 'submitObservation'>;

export function createStartSessionMutationOptions(api: SessionApi = visitVerificationApi) {
  return {
    mutationFn: ({ body, signal }: { body: VisitVerificationStartBody; signal?: AbortSignal }) =>
      api.startSession(body, signal),
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

export function useSubmitVisitVerificationObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...createObservationMutationOptions(),
    onSuccess: (session) => applyVisitVerificationSessionResult(queryClient, session),
  });
}
