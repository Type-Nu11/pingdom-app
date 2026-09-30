import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { foregroundPermission } from '../../../../shared/location/foregroundPermission';
import { getCurrentCoordinate } from '../../../../shared/location/currentLocation';
import { visitVerificationApi } from '../api/visitVerificationApi';
import {
  getActiveForegroundVisitVerificationSession,
  isTerminalVisitVerificationSession,
  observationDelayMs,
  rememberActiveForegroundVisitVerificationSession,
  sessionErrorPhase,
  subscribeActiveForegroundVisitVerificationSessionClear,
} from '../model/visitVerificationSession';
import { applyVisitVerificationSessionResult } from './useVisitVerificationSessionMutations';

const DISCOVERY_INTERVAL_MS = 10_000;
const COMPLETED_DISCOVERY_INTERVAL_MS = 30_000;

/** Collect real GPS observations before the verification UI opens. Dwell is server-owned. */
export function useForegroundVisitVerification() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let session = getActiveForegroundVisitVerificationSession();
    let timer: ReturnType<typeof setTimeout> | null = null;
    let request: AbortController | null = null;
    let generation = 0;
    let disposed = false;
    let halted = false;
    let recovering = session !== null;

    const cancel = () => {
      generation += 1;
      if (timer !== null) clearTimeout(timer);
      timer = null;
      request?.abort();
      request = null;
    };

    const schedule = (delay: number) => {
      if (disposed || halted || AppState.currentState !== 'active') return;
      timer = setTimeout(() => { timer = null; void observe(); }, delay);
    };

    const observe = async () => {
      if (disposed || halted || request || AppState.currentState !== 'active') return;
      const currentGeneration = generation;
      const controller = new AbortController();
      request = controller;
      const isCurrent = () => !disposed && !halted &&
        generation === currentGeneration && AppState.currentState === 'active';
      let nextDelay = DISCOVERY_INTERVAL_MS;
      try {
        // Startup owns permission prompts; passive observation must never re-prompt.
        const permission = await foregroundPermission.get();
        if (!isCurrent() || permission.status !== 'granted') return;
        const location = await getCurrentCoordinate({ requestPermission: false });
        if (!isCurrent() || location.status !== 'granted') return;

        const next = session?.id
          ? recovering
            ? await visitVerificationApi.getSession(session.id, controller.signal)
            : await visitVerificationApi.submitObservation(session.id, location.coordinate, controller.signal)
          : await visitVerificationApi.startForegroundSession(location.coordinate, controller.signal);
        if (!isCurrent()) return;
        recovering = false;
        rememberActiveForegroundVisitVerificationSession(next);
        session = isTerminalVisitVerificationSession(next) ? null : next;
        await applyVisitVerificationSessionResult(queryClient, next);
        nextDelay = next.status === 'COMPLETED'
          ? COMPLETED_DISCOVERY_INTERVAL_MS
          : Math.max(1_000, observationDelayMs(next.nextObservationRecommendedAt, Date.now()) ?? DISCOVERY_INTERVAL_MS);
      } catch (error) {
        if (!isCurrent()) return;
        const phase = sessionErrorPhase(error);
        if (phase === 'unauthenticated' || phase === 'inactive-tourist') halted = true;
        if (phase === 'no-place' || phase === 'proximity-lost') {
          session = null;
          rememberActiveForegroundVisitVerificationSession(null);
        }
        else recovering = session !== null;
      } finally {
        if (generation === currentGeneration) {
          request = null;
          schedule(nextDelay);
        }
      }
    };

    const subscription = AppState.addEventListener('change', (state) => {
      cancel();
      recovering = session !== null;
      if (state === 'active') void observe();
    });
    const unsubscribe = subscribeActiveForegroundVisitVerificationSessionClear(() => {
      halted = true;
      session = null;
      cancel();
    });
    void observe();

    return () => {
      disposed = true;
      cancel();
      subscription.remove();
      unsubscribe();
    };
  }, [queryClient]);
}
