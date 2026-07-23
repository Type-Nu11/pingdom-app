import { screen, waitFor } from '@testing-library/react-native';

import {
  emptyPlaceListPage,
  placeListPage,
} from '../../../../../../test/fixtures/placeList';
import { renderWithProviders } from '../../../../../../test/utils/testProviders';
import { placeListApi } from '../../api/placeListApi';
import PlaceListExampleScreen from '../PlaceListExampleScreen';

describe('PlaceListExampleScreen', () => {
  test('요청 중에는 로딩 상태를 보여준다', async () => {
    jest.spyOn(placeListApi, 'getPlaceList').mockReturnValue(new Promise(() => undefined));

    await renderWithProviders(<PlaceListExampleScreen />);

    expect(screen.getByText('장소를 불러오는 중입니다...')).toBeVisible();
  });

  test('성공했지만 장소가 없으면 빈 상태를 보여준다', async () => {
    jest.spyOn(placeListApi, 'getPlaceList').mockResolvedValue(emptyPlaceListPage);

    await renderWithProviders(<PlaceListExampleScreen />);

    expect(await screen.findByText('아직 등록된 장소가 없습니다')).toBeVisible();
    expect(screen.getByText('장소 데이터가 등록된 후 다시 확인해 주세요.')).toBeVisible();
  });

  test('성공한 장소 목록을 렌더링한다', async () => {
    jest.spyOn(placeListApi, 'getPlaceList').mockResolvedValue(placeListPage);

    await renderWithProviders(<PlaceListExampleScreen />);

    expect(await screen.findByText('진주성')).toBeVisible();
    expect(screen.getByText('장소 1개')).toBeVisible();
    expect(screen.getByText('영업 중')).toBeVisible();
    expect(screen.getByText('신뢰 점수: 84/100')).toBeVisible();
  });

  test('API 실패 시 오류와 재시도 동작을 보여준다', async () => {
    const getPlaceList = jest
      .spyOn(placeListApi, 'getPlaceList')
      .mockRejectedValueOnce(new Error('network unavailable'))
      .mockResolvedValueOnce(placeListPage);

    const { user } = await renderWithProviders(<PlaceListExampleScreen />);

    expect(await screen.findByText('데이터를 불러오지 못했습니다')).toBeVisible();
    await user.press(screen.getByRole('button', { name: '다시 시도' }));

    await waitFor(() => expect(getPlaceList).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('진주성')).toBeVisible();
  });
});
