import type { PropsWithChildren } from 'react';
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ApiError } from '../../../../v2/shared/api';
import { checkInApi } from '../../../../v2/features/check-ins';
import { useCurrentLocation } from '../../../../v2/features/map/hooks/useCurrentLocation';
import {
  classifyCheckInError,
  createLocationCheckInBody,
  useLocationCheckIn,
} from '../useLocationCheckIn';

jest.mock('../../../../v2/features/map/hooks/useCurrentLocation', () => ({
  useCurrentLocation: jest.fn(),
}));

const coordinate = {
  accuracyMeters: 8.4,
  lat: 37.551,
  lng: 126.988,
  observedAt: '2026-08-18T05:20:00.000Z',
};

const createdCheckIn = {
  checkInDate: '2026-08-18',
  distanceMeters: 12.5,
  id: 701,
  observedAt: coordinate.observedAt,
  placeId: 17,
  recordedAt: '2026-08-18T05:20:01.000Z',
  status: 'PROXIMITY_MATCHED' as const,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { gcTime: Infinity, retry: false },
      queries: { gcTime: Infinity, retry: false },
    },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

describe('useLocationCheckIn', () => {
  beforeEach(() => {
    jest.mocked(useCurrentLocation).mockReturnValue({
      canAskAgain: true,
      coordinate,
      refresh: jest.fn(),
      status: 'granted',
    });
    jest.spyOn(checkInApi, 'listCheckIns').mockResolvedValue({
      checkIns: [],
      hasNext: false,
      limit: 20,
      page: 1,
      totalCount: 0,
      totalPages: 0,
    });
  });

  test('실제 위치 메타데이터와 선택 placeId를 API body로 전달하고 연속 탭을 잠근다', async () => {
    let resolveCreate!: (value: typeof createdCheckIn) => void;
    const createPromise = new Promise<typeof createdCheckIn>((resolve) => {
      resolveCreate = resolve;
    });
    const create = jest.spyOn(checkInApi, 'createCheckIn').mockReturnValue(createPromise);
    const { queryClient, wrapper } = createWrapper();
    queryClient.setQueryData(['v2', 'places', 'list', { page: 1 }], { places: [] });
    const { result, unmount } = await renderHook(() => useLocationCheckIn(17), { wrapper });

    await waitFor(() => expect(result.current.isListLoading).toBe(false));

    let first!: ReturnType<typeof result.current.submit>;
    let secondResult: Awaited<ReturnType<typeof result.current.submit>> | undefined;
    await act(async () => {
      first = result.current.submit();
      secondResult = await result.current.submit();
      resolveCreate(createdCheckIn);
      await first;
    });

    expect(secondResult).toBeNull();
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      accuracyMeters: 8.4,
      latitude: 37.551,
      longitude: 126.988,
      observedAt: '2026-08-18T05:20:00.000Z',
      placeId: 17,
    });

    await waitFor(() => expect(result.current.successfulCheckIn).toEqual(createdCheckIn));
    expect(checkInApi.listCheckIns).toHaveBeenCalledTimes(2);
    expect(
      queryClient.getQueryState(['v2', 'places', 'list', { page: 1 }])?.isInvalidated,
    ).toBe(true);
    unmount();
    queryClient.clear();
  });

  test('서버 계약 오류와 네트워크 오류를 별도 상태로 유지한다', () => {
    expect(classifyCheckInError(new ApiError('far', {
      code: 'CHECK_IN_OUT_OF_RANGE', status: 422,
    }))).toBe('out-of-range');
    expect(classifyCheckInError(new ApiError('duplicate', {
      code: 'CHECK_IN_ALREADY_EXISTS', status: 409,
    }))).toBe('duplicate');
    expect(classifyCheckInError(new ApiError('expired', {
      code: 'TOKEN_EXPIRED', status: 401,
    }))).toBe('authentication');
    expect(classifyCheckInError(new ApiError('offline', {
      isNetworkError: true,
    }))).toBe('network');
  });

  test('서버 pagination 응답의 다음 페이지를 최근 방문 목록에 이어 붙인다', async () => {
    jest.spyOn(checkInApi, 'listCheckIns').mockImplementation(async (params = {}) => {
      const page = params.page ?? 1;
      return {
        checkIns: [{ ...createdCheckIn, id: page }],
        hasNext: page === 1,
        limit: 20,
        page,
        totalCount: 2,
        totalPages: 2,
      };
    });
    const { queryClient, wrapper } = createWrapper();
    const { result, unmount } = await renderHook(() => useLocationCheckIn(17), { wrapper });

    await waitFor(() => expect(result.current.checkIns.map(({ id }) => id)).toEqual([1]));
    await act(async () => {
      await result.current.fetchNextPage();
    });
    await waitFor(() => expect(result.current.checkIns.map(({ id }) => id)).toEqual([1, 2]));
    expect(checkInApi.listCheckIns).toHaveBeenLastCalledWith(
      { limit: 20, page: 2 },
      expect.any(AbortSignal),
    );

    unmount();
    queryClient.clear();
  });

  test('정확도나 관측 시각이 없는 지도 좌표는 체크인 요청으로 추정 변환하지 않는다', () => {
    expect(createLocationCheckInBody(17, { lat: 37.5, lng: 127 })).toBeNull();
  });
});
