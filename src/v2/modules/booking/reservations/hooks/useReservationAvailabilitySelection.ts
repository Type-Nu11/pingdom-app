import { useEffect, useMemo, useRef, useState } from 'react';
import { useCalendarDragSelection } from '../../../../shared/hooks/useCalendarDragSelection';
import {
  addLocalMonths,
  availabilityDateKeys,
  availabilityIncludesDate,
  isAvailabilityBookable,
  isAvailabilityUpcoming,
  localDateFromKey,
  localDateKey,
  startOfLocalMonth,
  type Availability,
} from '../model/reservationAvailability';
import { isSelectableAvailability, summarizeAvailabilityPresentations } from '../model/reservationProduct';

export type TimePeriod = 'morning' | 'afternoon';

type Options = {
  availabilityData: Availability[];
  isError: boolean;
  isPending: boolean;
  now: Date;
  onIntentChange: () => void;
};

export function useReservationAvailabilitySelection({ availabilityData, isError, isPending, now, onIntentChange }: Options) {
  const initializedFromAvailability = useRef(false);
  const [month, setMonth] = useState(() => startOfLocalMonth(now));
  const [quantity, setQuantity] = useState(2);
  const [selectedDate, setSelectedDate] = useState<string | null>(() => localDateKey(now));
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState<number | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(
    now.getHours() < 12 ? 'morning' : 'afternoon',
  );

  // Only selectable place reservations drive the calendar dots and nearest-date jump.
  // Ticket and class slots still render as disabled rows.
  const selectDate = (date: string) => {
    onIntentChange();
    setSelectedDate(date);
    setSelectedAvailabilityId(null);
  };
  const dateDrag = useCalendarDragSelection({
    onPress: selectDate,
    onCommit: (_, endpoint) => selectDate(endpoint),
  });
  const bookableAvailabilities = useMemo(
    () => availabilityData.filter(
      (item) => isSelectableAvailability(item) && isAvailabilityBookable(item, quantity, now),
    ),
    [availabilityData, now, quantity],
  );
  const availableDates = useMemo(
    () => new Set(bookableAvailabilities.flatMap(availabilityDateKeys)),
    [bookableAvailabilities],
  );
  const availabilitySummary = useMemo(
    () => summarizeAvailabilityPresentations(availabilityData),
    [availabilityData],
  );
  const scheduledDates = useMemo(
    () => new Set(availabilityData.flatMap(availabilityDateKeys)),
    [availabilityData],
  );
  const remainingCapacityByDate = useMemo(() => {
    const totals = new Map<string, number>();

    availabilityData.forEach((item) => {
      if (!isSelectableAvailability(item)
        || item.status !== 'ACTIVE'
        || !isAvailabilityUpcoming(item, now)) return;

      const remainingCapacity = Number.isFinite(item.remainingCapacity)
        ? Math.max(0, item.remainingCapacity)
        : 0;
      availabilityDateKeys(item).forEach((dateKey) => {
        totals.set(dateKey, (totals.get(dateKey) ?? 0) + remainingCapacity);
      });
    });

    return totals;
  }, [availabilityData, now]);
  const selectedAvailability = availabilityData.find(
    (item) => item.id === selectedAvailabilityId,
  );
  const selectedDateSlots = selectedDate
    ? availabilityData
      .filter((item) => availabilityIncludesDate(item, selectedDate))
      .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())
    : [];
  const periodDate = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedDate || selectedDateSlots.length === 0 || periodDate.current === selectedDate) {
      return;
    }
    periodDate.current = selectedDate;
    setTimePeriod(slotTimePeriod(selectedDateSlots[0]));
  }, [selectedDate, selectedDateSlots]);

  useEffect(() => {
    if (initializedFromAvailability.current || isPending || isError) {
      return;
    }
    const todayKey = localDateKey(now);
    const nearestDateKey = [...availableDates]
      .filter((dateKey) => dateKey >= todayKey)
      .sort()[0]
      ?? [...scheduledDates]
        .filter((dateKey) => dateKey >= todayKey)
        .sort()[0];
    if (!nearestDateKey) return;
    const nearestDate = localDateFromKey(nearestDateKey);
    if (!nearestDate) return;
    initializedFromAvailability.current = true;
    setMonth(startOfLocalMonth(nearestDate));
    setSelectedDate(nearestDateKey);
    setSelectedAvailabilityId(null);
  }, [isError, isPending, availableDates, now, scheduledDates]);

  useEffect(() => {
    if (selectedAvailabilityId !== null
      && (!selectedAvailability
        || !isSelectableAvailability(selectedAvailability)
        || !isAvailabilityBookable(selectedAvailability, quantity, now)
        || !selectedDate
        || !availabilityIncludesDate(selectedAvailability, selectedDate))) {
      setSelectedAvailabilityId(null);
    }
  }, [now, quantity, selectedAvailability, selectedAvailabilityId, selectedDate]);

  const moveMonth = (offset: number) => {
    onIntentChange();
    setMonth((current) => addLocalMonths(current, offset));
    setSelectedDate(null);
    setSelectedAvailabilityId(null);
  };

  const selectQuantity = (count: number) => {
    onIntentChange();
    setQuantity(count);
  };
  const selectAvailability = (id: number) => {
    onIntentChange();
    setSelectedAvailabilityId(id);
  };

  return {
    month, moveMonth, quantity, selectQuantity, dateDrag, selectedDate, availableDates,
    scheduledDates, remainingCapacityByDate, bookableCount: bookableAvailabilities.length,
    availabilitySummary, selectedAvailability, selectedAvailabilityId, selectedDateSlots,
    selectAvailability, timePeriod, setTimePeriod,
  };
}

export function slotTimePeriod(availability: Availability): TimePeriod {
  return new Date(availability.startsAt).getHours() < 12 ? 'morning' : 'afternoon';
}
