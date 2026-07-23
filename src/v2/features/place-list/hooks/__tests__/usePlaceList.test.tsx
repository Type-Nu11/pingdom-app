import { renderHook, waitFor } from '@testing-library/react-native';

import { emptyPlaceListPage } from '../../../../../../test/fixtures/placeList';
import { createTestWrapper } from '../../../../../../test/utils/testProviders';
import { placeListApi } from '../../api/placeListApi';
import { usePlaceList } from '../usePlaceList';

describe('usePlaceList', () => {
  test('기본 페이지 조건으로 API 성공 결과를 반환한다', async () => {
    const getPlaceList = jest
      .spyOn(placeListApi, 'getPlaceList')
      .mockResolvedValue(emptyPlaceListPage);
    const { wrapper } = createTestWrapper();

    const { result } = await renderHook(() => usePlaceList(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(emptyPlaceListPage);
    expect(getPlaceList).toHaveBeenCalledWith(
      { limit: 10, page: 1 },
      expect.any(AbortSignal),
    );
  });

  test('API 실패를 재시도 없이 오류 상태로 노출한다', async () => {
    const apiError = new Error('network unavailable');
    const getPlaceList = jest
      .spyOn(placeListApi, 'getPlaceList')
      .mockRejectedValue(apiError);
    const { wrapper } = createTestWrapper();

    const { result } = await renderHook(
      () => usePlaceList({ limit: 5, page: 2 }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(apiError);
    expect(getPlaceList).toHaveBeenCalledTimes(1);
  });
});
