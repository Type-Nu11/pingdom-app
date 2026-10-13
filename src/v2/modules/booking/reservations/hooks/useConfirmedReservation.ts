import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';
import { reservationApi } from '../api/reservationApi';
import { createConfirmedReservation } from '../model/confirmedReservation';
import { reservationIntentStorage } from '../adapters/reservationIntentStorage';
import { invalidateReservationCreateDependencies, useCreateReservation } from './useReservations';

export function useConfirmedReservation(accountId: string | null) {
  const latest = useRef(accountId); latest.current = accountId;
  const mounted = useRef(true);
  const mutation = useCreateReservation();
  const queryClient = useQueryClient();
  const mutate = useRef(mutation.mutateAsync); mutate.current = mutation.mutateAsync;
  const controller = useMemo(() => createConfirmedReservation({
    accountId: accountId ?? '',
    isCurrent: () => mounted.current && accountId !== null && latest.current === accountId && AppState.currentState === 'active',
    storage: reservationIntentStorage,
    list: placeId => reservationApi.listAvailabilities(placeId),
    quote: (placeId, availabilityId, quantity) => reservationApi.getReservationQuote(placeId, availabilityId, quantity),
    create: async (body, placeId) => {
      const result = await mutate.current(body);
      void invalidateReservationCreateDependencies(queryClient, placeId);
      return result;
    },
  }), [accountId, queryClient]);
  const activeController = useRef(controller); activeController.current = controller;
  const [hydratedController, setHydratedController] = useState<typeof controller | null>(null);
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  useEffect(() => {
    mounted.current = true;
    void controller.restore().then(() => { if (mounted.current && activeController.current === controller) setHydratedController(controller); });
    const subscription = AppState.addEventListener('change', value => {
      if (value !== 'active') controller.cancel();
      else void controller.restore();
    });
    return () => { mounted.current = false; controller.cancel(); subscription.remove(); };
  }, [controller]);
  return { controller, state: hydratedController === controller ? state : { phase: 'loading' as const } };
}
