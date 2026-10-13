import { useConfirmedReservation } from '../../booking/reservations/confirmation';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { QueryClient } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { createAvailabilitiesQueryOptions, isSelectableConfirmedSlot, type AvailabilityList, type BookerInput } from '../../booking';
import { createPlaceDetailQueryOptions } from '../../place';
import { projectVoicePlace } from '../model/voiceCommands';
import type { VoicePlaceFacts } from '../model/voiceAssistantCommand.types';
import type { VoiceCommandViewState } from './useVoiceCommands';

export function reservationSlotDate(slot: AvailabilityList[number], timezone: string): string {
  const fields = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date(slot.startsAt)).map(part => [part.type, part.value]));
  return `${fields.year}-${fields.month}-${fields.day}`;
}
function slotTimezone(slot: AvailabilityList[number], fallback: string): string { return slot.reservationTerms?.timezone ?? fallback; }
async function loadSlots(queryClient: QueryClient, placeId: number): Promise<AvailabilityList> {
  return queryClient.fetchQuery({ ...createAvailabilitiesQueryOptions(placeId), staleTime: 0, retry: false });
}
export function useVoiceReservation(accountId: string | null, timezone: string, commandState: VoiceCommandViewState, contextKey = '') {
  const queryClient = useQueryClient();
  const booking = useConfirmedReservation(accountId);
  const [place, setPlace] = useState<VoicePlaceFacts | null>(null);
  const [slots, setSlots] = useState<AvailabilityList>([]);
  const [quantity, setQuantity] = useState(2);
  const [date, setDate] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const revision = useRef(0);
  const latestAccount = useRef(accountId); latestAccount.current = accountId;
  const active = useRef(true);
  const previousContext = useRef({ accountId, contextKey });
  const clearSelection = () => { revision.current++; setPlace(null); setSlots([]); setDate(null); setSelectedId(null); setLoading(false); booking.controller.cancel(); };
  useEffect(() => {
    if (previousContext.current.accountId === accountId && previousContext.current.contextKey !== contextKey) booking.controller.cancel();
    previousContext.current = { accountId, contextKey };
    active.current = true; revision.current++; setPlace(null); setSlots([]); setDate(null); setSelectedId(null); setLoading(false);
    const sub = AppState.addEventListener('change', state => { if (state !== 'active') clearSelection(); });
    return () => { active.current = false; revision.current++; sub.remove(); };
  }, [accountId, contextKey]); // Account-owned selection; submitted recovery is managed by Booking.
  const selectPlace = async (next: VoicePlaceFacts, preferredId?: number, requestedQuantity?: number, requestedDate?: string) => {
    if (booking.state.phase === 'loading' || booking.state.phase === 'unknown' || booking.state.phase === 'submitting' || booking.state.phase === 'checking' || !accountId) return;
    const nextRevision = ++revision.current, capturedAccount = accountId;
    booking.controller.cancel(); setPlace(next); setSlots([]); setDate(null); setSelectedId(null); setLoadError(false); setLoading(true);
    const people = requestedQuantity ?? quantity; setQuantity(people);
    try {
      const data = await loadSlots(queryClient, next.id);
      if (!active.current || revision.current !== nextRevision || latestAccount.current !== capturedAccount || AppState.currentState !== 'active') return;
      // Invalid/missing timezone metadata is never silently interpreted as the device's timezone.
      const eligible = data.filter(slot => slot.placeId === next.id && isSelectableConfirmedSlot(slot, 1, Date.now())
        && typeof slot.reservationTerms?.timezone === 'string' && slot.reservationTerms.timezone.length > 0 && (() => { try { reservationSlotDate(slot, slotTimezone(slot, timezone)); return true; } catch { return false; } })());
      setSlots(eligible);
      const selected = preferredId ? eligible.find(slot => slot.id === preferredId && isSelectableConfirmedSlot(slot, people, Date.now())) : undefined;
      setDate(selected ? reservationSlotDate(selected, slotTimezone(selected, timezone)) : requestedDate && eligible.some(slot => isSelectableConfirmedSlot(slot, people, Date.now()) && reservationSlotDate(slot, slotTimezone(slot, timezone)) === requestedDate) ? requestedDate : null);
      if (selected) { setSelectedId(selected.id); await booking.controller.prepare({ placeId: next.id, placeName: next.name, availability: selected, quantity: people }); }
    } catch { if (revision.current === nextRevision) setLoadError(true); }
    finally { if (revision.current === nextRevision) setLoading(false); }
  };
  useEffect(() => {
    if (commandState.phase !== 'canceled' && !(commandState.phase === 'error' && ['SESSION_EXPIRED', 'AUTHENTICATION_REQUIRED'].includes(commandState.code))) return;
    revision.current++; setPlace(null); setSlots([]); setDate(null); setSelectedId(null); setLoading(false);
    // Do not interrupt the initial secure-storage read; submitted recovery belongs to Booking.
    if (booking.state.phase !== 'loading' || place) booking.controller.cancel();
  }, [commandState]);
  const lastAvailabilityResult = useRef<object | null>(null);
  useEffect(() => {
    if (commandState.phase !== 'result' || commandState.result.command !== 'getAvailabilities' || commandState.result.outcome.status !== 'succeeded') return;
    if (['loading', 'checking', 'submitting', 'unknown', 'success'].includes(booking.state.phase)) return;
    const result = commandState.result;
    if (result === lastAvailabilityResult.current || place) return;
    lastAvailabilityResult.current = result;
    const { placeId: id, quantity: requestedQuantity, date: requestedDate } = commandState.result.outcome.data;
    const account = accountId, revisionAtStart = revision.current;
    void queryClient.fetchQuery({ ...createPlaceDetailQueryOptions(id), staleTime: 0, retry: false }).then(value => {
      if (!active.current || latestAccount.current !== account || revision.current !== revisionAtStart || AppState.currentState !== 'active') return;
      return selectPlace(projectVoicePlace(value, id), undefined, requestedQuantity, requestedDate);
    }).catch(() => { if (revision.current === revisionAtStart) setLoadError(true); });
  }, [commandState, booking.state.phase]);
  const lastDraft = useRef<object | null>(null);
  useEffect(() => {
    if (commandState.phase !== 'result' || commandState.result.command !== 'prepareReservation' || commandState.result.outcome.status !== 'succeeded') return;
    if (['loading', 'checking', 'submitting', 'unknown', 'success'].includes(booking.state.phase)) return;
    const draft = commandState.result.outcome.data.draft;
    if (draft === lastDraft.current || place) return;
    lastDraft.current = draft;
    void selectPlace(draft.place, draft.availability.id, draft.quantity);
  }, [commandState, booking.state.phase]);
  const selectable = slots.filter(slot => isSelectableConfirmedSlot(slot, quantity, Date.now()));
  const dates = [...new Set(selectable.map(slot => reservationSlotDate(slot, slotTimezone(slot, timezone))))].sort();
  const dateSlots = selectable.filter(slot => reservationSlotDate(slot, slotTimezone(slot, timezone)) === date);
  const setPeople = (value: number) => { if (value < 1 || value > 12) return; setQuantity(value); setDate(null); setSelectedId(null); booking.controller.cancel(); };
  const selectDate = (value: string) => { if (!dates.includes(value)) return; setDate(value); setSelectedId(null); booking.controller.cancel(); };
  const selectSlot = async (id: number) => {
    const slot = dateSlots.find(value => value.id === id);
    if (!slot || !place) return;
    setSelectedId(id);
    await booking.controller.prepare({ placeId: place.id, placeName: place.name, availability: slot, quantity });
  };
  return { ...booking, place, quantity, date, dates, dateSlots, selectedId, loading, loadError,
    selectPlace, selectDate, selectSlot, setPeople, clearSelection,
    confirm: (booker: BookerInput) => booking.controller.confirm(booker),
    slotTimezone: (slot: AvailabilityList[number]) => slotTimezone(slot, timezone),
  };
}
export type VoiceReservationFlow = ReturnType<typeof useVoiceReservation>;
