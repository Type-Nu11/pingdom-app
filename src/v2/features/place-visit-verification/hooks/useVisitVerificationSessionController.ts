import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  getCurrentCoordinate,
  type CurrentLocationOutcome,
} from '../../../shared/location/currentLocation';
import type { VisitVerificationSession } from '../api/visitVerificationApi';
import {
  getActiveForegroundVisitVerificationSession,
  isTerminalVisitVerificationSession,
  observationDelayMs,
  rememberActiveForegroundVisitVerificationSession,
  sessionErrorPhase,
  subscribeActiveForegroundVisitVerificationSessionClear,
  type VisitVerificationErrorPhase,
} from '../model/visitVerificationSession';
import {
  useRecoverVisitVerificationSession,
  useStartForegroundVisitVerificationSession,
  useStartVisitVerificationSession,
  useSubmitVisitVerificationObservation,
} from './useVisitVerificationSessionMutations';

export type VisitVerificationSessionTarget =
  | { mode: 'foreground' }
  | { mode: 'place'; placeId: number };

export type VisitVerificationSessionPhase =
  | 'idle'
  | 'locating'
  | 'permission-denied'
  | 'location-failed'
  | 'starting'
  | 'recovering'
  | 'observing'
  | 'paused'
  | VisitVerificationErrorPhase;

export type SessionControllerDependencies = {
  getLocation?: () => Promise<CurrentLocationOutcome>;
  now?: () => number;
  setTimer?: (callback: () => void, delayMs: number) => ReturnType<typeof setTimeout>;
  clearTimer?: (timer: ReturnType<typeof setTimeout>) => void;
};

function normalizeTarget(
  target: VisitVerificationSessionTarget | number,
): VisitVerificationSessionTarget {
  return typeof target === 'number' ? { mode: 'place', placeId: target } : target;
}

export function useVisitVerificationSessionController(
  target: VisitVerificationSessionTarget | number,
  dependencies: SessionControllerDependencies = {},
) {
  const normalizedTarget = normalizeTarget(target);
  const isForeground = normalizedTarget.mode === 'foreground';
  const placeId = normalizedTarget.mode === 'place' ? normalizedTarget.placeId : null;
  const getLocation = dependencies.getLocation ?? getCurrentCoordinate;
  const now = dependencies.now ?? Date.now;
  const setTimer = dependencies.setTimer ?? setTimeout;
  const clearTimer = dependencies.clearTimer ?? clearTimeout;
  const placeStartMutation = useStartVisitVerificationSession();
  const foregroundStartMutation = useStartForegroundVisitVerificationSession();
  const recoverMutation = useRecoverVisitVerificationSession();
  const observationMutation = useSubmitVisitVerificationObservation();
  const initialSession = isForeground
    ? getActiveForegroundVisitVerificationSession()
    : null;
  const [phase, setPhase] = useState<VisitVerificationSessionPhase>(
    initialSession
      ? isTerminalVisitVerificationSession(initialSession) ? 'observing' : 'recovering'
      : 'idle',
  );
  const [session, setSession] = useState<VisitVerificationSession | null>(initialSession);
  const requestLocked = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const activeRef = useRef(true);
  const appStateActiveRef = useRef(AppState.currentState === 'active');
  const initialRecoveryAttempted = useRef(false);

  const rememberSession = useCallback((next: VisitVerificationSession) => {
    setSession(next);
    if (isForeground) rememberActiveForegroundVisitVerificationSession(next);
  }, [isForeground]);

  const clearScheduledObservation = useCallback(() => {
    if (timerRef.current) clearTimer(timerRef.current);
    timerRef.current = null;
  }, [clearTimer]);

  const stopRequests = useCallback(() => {
    clearScheduledObservation();
    abortRef.current?.abort();
    abortRef.current = null;
    requestLocked.current = false;
  }, [clearScheduledObservation]);

  const observationRef = useRef<() => Promise<void>>(async () => undefined);

  const submitObservation = useCallback(async () => {
    if (!session?.id || requestLocked.current || isTerminalVisitVerificationSession(session)) return;
    requestLocked.current = true;
    clearScheduledObservation();
    setPhase('locating');
    try {
      const location = await getLocation();
      if (!activeRef.current || !appStateActiveRef.current) return;
      if (location.status === 'denied') {
        setPhase('permission-denied');
        return;
      }
      if (location.status !== 'granted') {
        setPhase('location-failed');
        return;
      }
      const controller = new AbortController();
      abortRef.current = controller;
      setPhase('observing');
      const next = await observationMutation.mutateAsync({
        body: location.coordinate,
        sessionId: session.id,
        signal: controller.signal,
      });
      if (activeRef.current && appStateActiveRef.current) {
        rememberSession(next);
        setPhase('observing');
      }
    } catch (error) {
      if (activeRef.current && appStateActiveRef.current) setPhase(sessionErrorPhase(error));
    } finally {
      requestLocked.current = false;
      abortRef.current = null;
    }
  }, [clearScheduledObservation, getLocation, observationMutation, rememberSession, session]);
  observationRef.current = submitObservation;

  const recover = useCallback(async () => {
    if (!session?.id || requestLocked.current || isTerminalVisitVerificationSession(session)) return;
    requestLocked.current = true;
    clearScheduledObservation();
    const controller = new AbortController();
    abortRef.current = controller;
    setPhase('recovering');
    try {
      const next = await recoverMutation.mutateAsync({
        sessionId: session.id,
        signal: controller.signal,
      });
      if (activeRef.current && appStateActiveRef.current) {
        rememberSession(next);
        setPhase('observing');
      }
    } catch (error) {
      if (activeRef.current && appStateActiveRef.current) setPhase(sessionErrorPhase(error));
    } finally {
      requestLocked.current = false;
      abortRef.current = null;
    }
  }, [clearScheduledObservation, recoverMutation, rememberSession, session]);

  const start = useCallback(async () => {
    if (
      requestLocked.current ||
      placeStartMutation.isPending ||
      foregroundStartMutation.isPending
    ) return;
    if (session?.id && !isTerminalVisitVerificationSession(session)) {
      await recover();
      return;
    }
    requestLocked.current = true;
    clearScheduledObservation();
    setPhase('locating');
    try {
      const location = await getLocation();
      if (!activeRef.current || !appStateActiveRef.current) return;
      if (location.status === 'denied') {
        setPhase('permission-denied');
        return;
      }
      if (location.status !== 'granted') {
        setPhase('location-failed');
        return;
      }
      const controller = new AbortController();
      abortRef.current = controller;
      setPhase('starting');
      const next = isForeground
        ? await foregroundStartMutation.mutateAsync({
            body: location.coordinate,
            signal: controller.signal,
          })
        : await placeStartMutation.mutateAsync({
            body: { placeId: placeId!, ...location.coordinate },
            signal: controller.signal,
          });
      if (activeRef.current && appStateActiveRef.current) {
        rememberSession(next);
        setPhase('observing');
      }
    } catch (error) {
      if (activeRef.current && appStateActiveRef.current) setPhase(sessionErrorPhase(error));
    } finally {
      requestLocked.current = false;
      abortRef.current = null;
    }
  }, [
    clearScheduledObservation,
    foregroundStartMutation,
    getLocation,
    isForeground,
    placeId,
    placeStartMutation,
    recover,
    rememberSession,
    session,
  ]);

  useEffect(() => {
    clearScheduledObservation();
    if (!session || isTerminalVisitVerificationSession(session)) return;
    const delay = observationDelayMs(session.nextObservationRecommendedAt, now());
    if (delay === null || AppState.currentState !== 'active') return;
    timerRef.current = setTimer(() => {
      timerRef.current = null;
      void observationRef.current();
    }, delay);
    return clearScheduledObservation;
  }, [clearScheduledObservation, now, session, setTimer]);

  useEffect(() => {
    if (initialRecoveryAttempted.current) return;
    initialRecoveryAttempted.current = true;
    if (initialSession && !isTerminalVisitVerificationSession(initialSession)) {
      void recover();
    }
  }, [initialSession, recover]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      appStateActiveRef.current = state === 'active';
      if (state !== 'active') {
        stopRequests();
        if (session && !isTerminalVisitVerificationSession(session)) setPhase('paused');
        return;
      }
      if (session && !isTerminalVisitVerificationSession(session)) void recover();
    });
    return () => subscription.remove();
  }, [recover, session, stopRequests]);

  useEffect(() => {
    if (!isForeground) return undefined;
    return subscribeActiveForegroundVisitVerificationSessionClear(() => {
      stopRequests();
      if (!activeRef.current) return;
      setSession(null);
      setPhase('unauthenticated');
    });
  }, [isForeground, stopRequests]);

  useEffect(() => () => {
    activeRef.current = false;
    stopRequests();
  }, [stopRequests]);

  return {
    displayRemainingSeconds: session?.remainingSeconds ?? null,
    error:
      foregroundStartMutation.error ??
      placeStartMutation.error ??
      recoverMutation.error ??
      observationMutation.error,
    isBusy:
      phase === 'locating' ||
      phase === 'starting' ||
      phase === 'recovering' ||
      observationMutation.isPending,
    phase,
    recover,
    retry: session ? submitObservation : start,
    session,
    start,
  };
}
