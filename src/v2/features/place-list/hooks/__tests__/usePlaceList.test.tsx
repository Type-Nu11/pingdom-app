import { renderHook, waitFor } from '@testing-library/react-native';

import { emptyPlaceListPage } from '../../../../../../test/fixtures/placeList';
import { createTestWrapper } from '../../../../../../test/utils/testProviders';
import { placeListApi } from '../../api/placeListApi';
import {
  normalizePlaceListParams,
  usePlaceList,
} from '../usePlaceList';

describe('usePlaceList', () => {
  test('기본 페이지 조건과 요청 필터를 보존해 API 성공 결과를 반환한다', async () => {
    const getPlaceList = jest
      .spyOn(placeListApi, 'getPlaceList')
      .mockResolvedValue(emptyPlaceListPage);
    const { wrapper } = await createTestWrapper();

    const { result } = await renderHook(
      () => usePlaceList({ keyword: '진주성', sort: 'POPULAR' }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(emptyPlaceListPage);
    expect(getPlaceList).toHaveBeenCalledWith(
      { keyword: '진주성', limit: 10, page: 1, sort: 'POPULAR' },
      expect.any(AbortSignal),
    );
  });

  test('API 실패를 재시도 없이 오류 상태로 노출한다', async () => {
    const apiError = new Error('network unavailable');
    const getPlaceList = jest
      .spyOn(placeListApi, 'getPlaceList')
      .mockRejectedValue(apiError);
    const { wrapper } = await createTestWrapper();

    const { result } = await renderHook(
      () => usePlaceList({ limit: 5, page: 2 }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(apiError);
    expect(getPlaceList).toHaveBeenCalledTimes(1);
  });
});

describe('normalizePlaceListParams', () => {
  test('유효하지 않은 페이지 범위를 거부한다', () => {
    expect(() => normalizePlaceListParams({ page: 0 })).toThrow(RangeError);
    expect(() => normalizePlaceListParams({ limit: 101 })).toThrow(RangeError);
  });

  test('위치 검색 파라미터는 세 값을 함께 요구한다', () => {
    expect(() =>
      normalizePlaceListParams({ latitude: 35.18, longitude: 128.1 }),
    ).toThrow(TypeError);
  });
});
