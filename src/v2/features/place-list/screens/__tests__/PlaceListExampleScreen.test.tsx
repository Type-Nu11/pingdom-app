import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { usePlaceList } from '../../hooks/usePlaceList';
import { emptyPlaceListPage, placeListPage } from '../../testing/placeListFixtures';
import PlaceListExampleScreen from '../PlaceListExampleScreen';

jest.mock('../../hooks/usePlaceList');

const mockUsePlaceList = jest.mocked(usePlaceList);
type PlaceListQuery = ReturnType<typeof usePlaceList>;

describe('PlaceListExampleScreen', () => {
  test('요청 중에는 로딩 상태를 보여준다', async () => {
    mockUsePlaceList.mockReturnValue({ isPending: true } as PlaceListQuery);

    await renderWithProviders(<PlaceListExampleScreen />);

    expect(screen.getByText('장소를 불러오는 중입니다...')).toBeVisible();
  });

  test('성공했지만 장소가 없으면 빈 상태를 보여준다', async () => {
    mockUsePlaceList.mockReturnValue({
      data: emptyPlaceListPage,
      isError: false,
      isPending: false,
    } as PlaceListQuery);

    await renderWithProviders(<PlaceListExampleScreen />);

    expect(await screen.findByText('아직 등록된 장소가 없습니다')).toBeVisible();
    expect(screen.getByText('장소 데이터가 등록된 후 다시 확인해 주세요.')).toBeVisible();
  });

  test('성공한 장소 목록을 렌더링한다', async () => {
    mockUsePlaceList.mockReturnValue({
      data: placeListPage,
      isError: false,
      isPending: false,
    } as PlaceListQuery);

    await renderWithProviders(<PlaceListExampleScreen />);

    expect(await screen.findByText('진주성')).toBeVisible();
    expect(screen.getByText('장소 1개')).toBeVisible();
    expect(screen.getByText('영업 중')).toBeVisible();
    expect(screen.getByText('신뢰 점수: 84/100')).toBeVisible();
  });

  test('API 실패 시 오류와 재시도 동작을 보여준다', async () => {
    const refetch = jest.fn();
    mockUsePlaceList.mockReturnValue({
      error: new Error('network unavailable'),
      isError: true,
      isPending: false,
      refetch,
    } as unknown as PlaceListQuery);

    const { user } = await renderWithProviders(<PlaceListExampleScreen />);

    expect(await screen.findByText('데이터를 불러오지 못했습니다')).toBeVisible();
    await user.press(screen.getByRole('button', { name: '다시 시도' }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
