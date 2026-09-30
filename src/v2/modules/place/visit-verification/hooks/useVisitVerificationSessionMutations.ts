import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';

import { checkInQueryKeys, type LocationCheckInPage, type LocationCheckInListItem } from '../../check-ins';
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
    if (
      session.placeId != null && Number.isInteger(session.placeId) && session.placeId > 0 &&
      Number.isInteger(session.completedCheckInId) && session.completedCheckInId > 0 &&
      session.completedAt && Number.isFinite(Date.parse(session.completedAt)) &&
      session.latestDistanceMeters != null && Number.isFinite(session.latestDistanceMeters) && session.latestDistanceMeters >= 0
    ) {
      const checkIn: LocationCheckInListItem = {
        id: session.completedCheckInId, placeId: session.placeId,
        distanceMeters: session.latestDistanceMeters, observedAt: session.completedAt,
        status: 'DWELL_VERIFIED',
      };
      // The server already issued this check-in ID. Display it immediately, even if
      // the independent list endpoint is unavailable or has not caught up yet.
      queryClient.setQueryData<InfiniteData<LocationCheckInPage>>(
        checkInQueryKeys.infinite(20),
        (previous) => {
          if (previous?.pages.some(page => page.checkIns.some(item => item.id === checkIn.id))) return previous;
          const first = previous?.pages[0] ?? { checkIns: [], page: 1, limit: 20, totalCount: 0, totalPages: 1, hasNext: false };
          return {
            pageParams: previous?.pageParams ?? [1],
            pages: [{ ...first, checkIns: [checkIn, ...first.checkIns], totalCount: first.totalCount + 1 }, ...(previous?.pages.slice(1) ?? [])],
          };
        },
      );
    }
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
