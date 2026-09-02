import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  getCurrentCoordinate,
  type CurrentLocationOutcome,
} from '../../../shared/location/currentLocation';
import type { VisitVerificationSession } from '../api/visitVerificationApi';
import {
  isTerminalVisitVerificationSession,
  observationDelayMs,
  sessionErrorPhase,
} from '../model/visitVerificationSession';
import {
  useStartVisitVerificationSession,
  useSubmitVisitVerificationObservation,
} from './useVisitVerificationSessionMutations';

export type VisitVerificationSessionPhase =
  | 'idle'
  | 'locating'
  | 'permission-denied'
  | 'location-failed'
  | 'starting'
  | 'observing'
  | 'proximity-lost'
  | 'rejected'
  | 'paused'
  | 'error';

export type SessionControllerDependencies = {
  getLocation?: () => Promise<CurrentLocationOutcome>;
  now?: () => number;
  setTimer?: (callback: () => void, delayMs: number) => ReturnType<typeof setTimeout>;
  clearTimer?: (timer: ReturnType<typeof setTimeout>) => void;
};

export function useVisitVerificationSessionController(
  placeId: number,
  dependencies: SessionControllerDependencies = {},
) {
  const getLocation = dependencies.getLocation ?? getCurrentCoordinate;
  const now = dependencies.now ?? Date.now;
  const setTimer = dependencies.setTimer ?? setTimeout;
  const clearTimer = dependencies.clearTimer ?? clearTimeout;
  const startMutation = useStartVisitVerificationSession();
  const observationMutation = useSubmitVisitVerificationObservation();
  const [phase, setPhase] = useState<VisitVerificationSessionPhase>('idle');
  const [session, setSession] = useState<VisitVerificationSession | null>(null);
  const [displayRemainingSeconds, setDisplayRemainingSeconds] = useState<number | null>(null);
  const requestLocked = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const activeRef = useRef(true);
  const appStateActiveRef = useRef(AppState.currentState === 'active');

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
    setPhase('locating');
    try {
      const location = await getLocation();
      if (!activeRef.current) return;
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
        setSession(next);
        setPhase('observing');
      }
    } catch (error) {
      if (activeRef.current && appStateActiveRef.current) setPhase(sessionErrorPhase(error));
    } finally {
      requestLocked.current = false;
      abortRef.current = null;
    }
  }, [getLocation, observationMutation, session]);
  observationRef.current = submitObservation;

  const start = useCallback(async () => {
    if (requestLocked.current || startMutation.isPending) return;
    requestLocked.current = true;
    setPhase('locating');
    try {
      const location = await getLocation();
      if (!activeRef.current) return;
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
      const next = await startMutation.mutateAsync({
        body: { placeId, ...location.coordinate },
        signal: controller.signal,
      });
      if (activeRef.current && appStateActiveRef.current) {
        setSession(next);
        setPhase('observing');
      }
    } catch (error) {
      if (activeRef.current && appStateActiveRef.current) setPhase(sessionErrorPhase(error));
    } finally {
      requestLocked.current = false;
      abortRef.current = null;
    }
  }, [getLocation, placeId, startMutation]);

  useEffect(() => {
    clearScheduledObservation();
    if (!session || isTerminalVisitVerificationSession(session)) return;
    const delay = observationDelayMs(session.nextObservationRecommendedAt, now());
    if (delay === null || AppState.currentState !== 'active') return;
    timerRef.current = setTimer(() => void observationRef.current(), delay);
    return clearScheduledObservation;
  }, [clearScheduledObservation, now, session, setTimer]);

  useEffect(() => {
    setDisplayRemainingSeconds(session?.remainingSeconds ?? null);
    if (session?.remainingSeconds === undefined || isTerminalVisitVerificationSession(session)) return;
    const interval = setInterval(() => {
      setDisplayRemainingSeconds((value) => value === null ? null : Math.max(0, value - 1));
    }, 1_000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      appStateActiveRef.current = state === 'active';
      if (state !== 'active') {
        stopRequests();
        if (session && !isTerminalVisitVerificationSession(session)) setPhase('paused');
      }
      // GET 200 has no contract; foreground recovery deliberately stays paused.
    });
    return () => subscription.remove();
  }, [session, stopRequests]);

  useEffect(() => () => {
    activeRef.current = false;
    stopRequests();
  }, [stopRequests]);

  return {
    displayRemainingSeconds,
    error: startMutation.error ?? observationMutation.error,
    isBusy: phase === 'locating' || phase === 'starting' || observationMutation.isPending,
    phase,
    retry: session ? submitObservation : start,
    session,
    start,
  };
}
