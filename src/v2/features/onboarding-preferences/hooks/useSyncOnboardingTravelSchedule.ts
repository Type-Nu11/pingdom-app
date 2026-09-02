import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { invalidateTravelScheduleDependencies } from '../../travel-schedules';
import { syncOnboardingTravelScheduleToServer } from '../services/syncOnboardingTravelSchedule';

/**
 * 로그인 상태가 되면 온보딩에서 로컬에 저장해 둔 여행 일정을 서버로 한 번 올린다.
 * 성공하면 로컬 값이 비워지므로 다음 로그인부터는 조용히 skip 된다. 실패하면 로컬 값을
 * 남겨 두고 다음 진입에서 재시도한다.
 */
export function useSyncOnboardingTravelSchedule(isLoggedIn: boolean): void {
  const queryClient = useQueryClient();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || hasSyncedRef.current) {
      return undefined;
    }

    hasSyncedRef.current = true;
    let isMounted = true;

    void (async () => {
      try {
        const result = await syncOnboardingTravelScheduleToServer();

        if (isMounted && result.status === 'created') {
          await invalidateTravelScheduleDependencies(queryClient);
        }
      } catch {
        hasSyncedRef.current = false;
        console.warn('[onboarding] travel schedule sync failed.');
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, queryClient]);
}
