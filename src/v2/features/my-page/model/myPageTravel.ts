import {
  isServerTravelDate,
  type ServerTravelDate,
} from '../../onboarding-preferences/model/onboardingPreference';

export type FeaturedTravelSchedule = Readonly<{
  endDate: ServerTravelDate;
  id: number;
  startDate: ServerTravelDate;
}>;

type TravelScheduleCandidate = Readonly<{
  endDate?: string;
  id?: number;
  startDate?: string;
}>;

export function selectFeaturedTravelSchedule(
  schedules: readonly TravelScheduleCandidate[],
  today: ServerTravelDate,
): FeaturedTravelSchedule | null {
  const valid: FeaturedTravelSchedule[] = schedules
    .filter((schedule): schedule is Required<TravelScheduleCandidate> =>
      isServerTravelDate(schedule.startDate)
      && isServerTravelDate(schedule.endDate)
      && typeof schedule.id === 'number')
    .map((schedule) => ({
      endDate: schedule.endDate as ServerTravelDate,
      id: schedule.id,
      startDate: schedule.startDate as ServerTravelDate,
    }));

  if (valid.length === 0) {
    return null;
  }

  const ongoing = valid.find(
    (schedule) => schedule.startDate <= today && today <= schedule.endDate,
  );
  if (ongoing) {
    return ongoing;
  }

  const upcoming = [...valid]
    .filter((schedule) => schedule.startDate > today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  if (upcoming) {
    return upcoming;
  }

  return [...valid].sort((a, b) => b.endDate.localeCompare(a.endDate))[0];
}

export function getTodayServerTravelDate(today: Date = new Date()): ServerTravelDate {
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const value = `${year}-${month}-${day}`;

  if (!isServerTravelDate(value)) {
    throw new Error(`Invalid today date: ${value}`);
  }

  return value;
}
