import { useEffect, useState } from 'react';

import type { Profile } from '../../../../features/my-page/profile';
import type { RecentSearchOwner } from '../services/recentSearchStorage';

type ProfileRefetch = () => PromiseLike<Readonly<{
  data?: Pick<Profile, 'id'> | null;
  isSuccess: boolean;
}>>;

export function useConfirmedRecentSearchOwner(
  refetchProfile: ProfileRefetch,
): RecentSearchOwner | undefined {
  const [owner, setOwner] = useState<RecentSearchOwner>();

  useEffect(() => {
    let isActive = true;
    setOwner(undefined);

    void Promise.resolve()
      .then(() => refetchProfile())
      .then(({ data, isSuccess }) => {
        if (
          isActive
          && isSuccess
          && data
          && Number.isSafeInteger(data.id)
          && data.id > 0
        ) {
          setOwner({ kind: 'user', userId: data.id });
        }
      })
      .catch(() => {
        // Search remains available without history when the account boundary cannot be confirmed.
      });

    return () => {
      isActive = false;
    };
  }, [refetchProfile]);

  return owner;
}
