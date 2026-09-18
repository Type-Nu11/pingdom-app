import {
  useEffect,
  useRef,
} from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { accountApi } from '../api/accountApi';
import type { GoogleUnlinkRequest } from '../model/account.types';
import {
  accountUserQueryKeys,
  oauthAccountQueryKeys,
  userDataExportQueryKeys,
} from '../model/accountQueryKeys';
import { openGoogleAuthorization, type OpenUrl } from '../services/googleOAuth';
import {
  writeUserDataExport,
  type ExportArtifact,
  type UserDataExportWriter,
} from '../services/userDataExport';

type AccountApi = typeof accountApi;
let isWaitingForGoogleOAuthReturn = false;

export function createGoogleLinkMutationOptions(
  api: Pick<AccountApi, 'startGoogleLink'> = accountApi,
  openUrl: OpenUrl = async (url) => {
    const { Linking } = await import('react-native');
    return Linking.openURL(url);
  },
) {
  return {
    mutationFn: async () => {
      const response = await api.startGoogleLink();
      isWaitingForGoogleOAuthReturn = true;

      try {
        const authorizationUrl = await openGoogleAuthorization(response, openUrl);
        return { authorizationUrl, response };
      } catch (error) {
        isWaitingForGoogleOAuthReturn = false;
        throw error;
      }
    },
  };
}

export function createGoogleUnlinkMutationOptions(
  api: Pick<AccountApi, 'unlinkGoogle'> = accountApi,
) {
  return {
    mutationFn: (body: GoogleUnlinkRequest = {}) => api.unlinkGoogle(body),
  };
}

export function createUserDataExportQueryOptions(
  api: Pick<AccountApi, 'getUserDataExport'> = accountApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.getUserDataExport(signal),
    queryKey: userDataExportQueryKeys.mine(),
    staleTime: 0,
  };
}

export async function refreshOAuthAccountQueries(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: oauthAccountQueryKeys.all,
      refetchType: 'active',
    }),
    queryClient.invalidateQueries({
      exact: true,
      queryKey: accountUserQueryKeys.me(),
      refetchType: 'active',
    }),
  ]);
}

export function shouldRefreshAfterOAuthReturn(
  previousState: string,
  nextState: string,
  isWaiting: boolean,
): boolean {
  return previousState !== 'active' && nextState === 'active' && isWaiting;
}

export async function downloadUserDataExport(
  queryClient: QueryClient,
  writer?: UserDataExportWriter,
): Promise<ExportArtifact> {
  const data = await queryClient.fetchQuery(createUserDataExportQueryOptions());
  return writeUserDataExport(data, writer);
}

export function useGoogleLink() {
  const queryClient = useQueryClient();
  const previousAppState = useRef('active');

  useEffect(() => {
    let removeListener: (() => void) | undefined;
    let isDisposed = false;

    void import('react-native').then(({ AppState }) => {
      if (isDisposed) return;

      previousAppState.current = AppState.currentState;
      const subscription = AppState.addEventListener('change', (nextState) => {
        const shouldRefresh = shouldRefreshAfterOAuthReturn(
          previousAppState.current,
          nextState,
          isWaitingForGoogleOAuthReturn,
        );
        previousAppState.current = nextState;

        if (shouldRefresh) {
          isWaitingForGoogleOAuthReturn = false;
          void refreshOAuthAccountQueries(queryClient);
        }
      });
      removeListener = () => subscription.remove();
    });

    return () => {
      isDisposed = true;
      removeListener?.();
    };
  }, [queryClient]);

  return useMutation(createGoogleLinkMutationOptions());
}

export function useGoogleUnlink() {
  const queryClient = useQueryClient();

  return useMutation({
    ...createGoogleUnlinkMutationOptions(),
    onSuccess: async (response) => {
      queryClient.setQueryData(oauthAccountQueryKeys.google(), response);
      await queryClient.invalidateQueries({
        exact: true,
        queryKey: accountUserQueryKeys.me(),
      });
    },
  });
}

export function useUserDataExport(enabled = false) {
  return useQuery({
    ...createUserDataExportQueryOptions(),
    enabled,
  });
}

export function useDownloadUserDataExport() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: () => downloadUserDataExport(queryClient) });
}
