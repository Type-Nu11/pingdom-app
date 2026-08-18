import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import { ApiError } from '../../../../../v2/shared/api';
import { useMapPlaceRankings } from '../../../../place/hooks/useMapPlaceRankings';
import TemporaryMapRankingApiCheckList from '../TemporaryMapRankingApiCheckList';
import TemporaryMapRankingApiCheckPage from '../TemporaryMapRankingApiCheckPage';

jest.mock('../../../../place/hooks/useMapPlaceRankings', () => ({
  useMapPlaceRankings: jest.fn(),
}));

function rankingsResult(refetch: jest.Mock) {
  return {
    appliedRadiusKm: 20,
    criteria: 'POST_LIKE_COUNT',
    isFetching: false,
    period: 'WEEK',
    periodEnd: '2026-08-18T00:00:00Z',
    periodStart: '2026-08-11T00:00:00Z',
    radiusExpanded: true,
    refetch,
    totalCount: 1,
  };
}

const successRefetch = () => jest.fn(async () => ({
  data: { items: [], scope: 'NATIONAL' },
  error: null,
  isError: false,
}));

describe('TemporaryMapRankingApiCheck', () => {
  beforeEach(() => {
    jest.mocked(useMapPlaceRankings).mockReturnValue(
      rankingsResult(successRefetch()) as unknown as ReturnType<typeof useMapPlaceRankings>,
    );
  });

  test('우리 지역과 전국 endpoint를 목록에 표시하고 선택값을 전달한다', async () => {
    const onSelect = jest.fn();
    await render(<TemporaryMapRankingApiCheckList onSelect={onSelect} />);
    const user = userEvent.setup();

    expect(screen.getByText('GET /map/place-rankings (LOCAL)')).toBeTruthy();
    expect(screen.getByText('GET /map/place-rankings (NATIONAL)')).toBeTruthy();

    await user.press(screen.getByText('GET /map/place-rankings (NATIONAL)'));

    expect(onSelect).toHaveBeenCalledWith('GET /map/place-rankings (NATIONAL)');
  });

  test('전국 요청 화면에는 좌표 입력을 노출하지 않는다', async () => {
    await render(
      <TemporaryMapRankingApiCheckPage
        endpoint="GET /map/place-rankings (NATIONAL)"
        onBack={jest.fn()}
      />,
    );

    expect(screen.queryByLabelText('latitude')).toBeNull();
    expect(screen.getByLabelText('category')).toBeTruthy();
  });

  test('우리 지역 요청 화면에는 좌표와 반경 입력을 노출한다', async () => {
    await render(
      <TemporaryMapRankingApiCheckPage
        endpoint="GET /map/place-rankings (LOCAL)"
        onBack={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('latitude')).toBeTruthy();
    expect(screen.getByLabelText('longitude')).toBeTruthy();
    expect(screen.getByLabelText('radiusKm')).toBeTruthy();
  });

  test('서버 미확정 계약임을 화면에 안내한다', async () => {
    await render(
      <TemporaryMapRankingApiCheckPage
        endpoint="GET /map/place-rankings (NATIONAL)"
        onBack={jest.fn()}
      />,
    );

    expect(screen.getByText(/서버가 아직 이 계약을 확정하지 않았습니다/)).toBeTruthy();
  });

  test('요청 실행은 수동 refetch로 호출하고 응답과 집계 메타를 보여준다', async () => {
    const refetch = successRefetch();
    jest.mocked(useMapPlaceRankings).mockReturnValue(
      rankingsResult(refetch) as unknown as ReturnType<typeof useMapPlaceRankings>,
    );
    await render(
      <TemporaryMapRankingApiCheckPage
        endpoint="GET /map/place-rankings (NATIONAL)"
        onBack={jest.fn()}
      />,
    );
    const user = userEvent.setup();

    expect(jest.mocked(useMapPlaceRankings).mock.calls[0][1]).toEqual({ enabled: false });

    await user.press(screen.getByText('요청 실행'));

    await waitFor(() => expect(refetch).toHaveBeenCalledTimes(1));
    expect(screen.getByText('요청 성공')).toBeTruthy();
    expect(screen.getByText(/criteria: POST_LIKE_COUNT/)).toBeTruthy();
    expect(screen.getByText(/반경 확장: 있음/)).toBeTruthy();
  });

  test('요청이 실패하면 오류 디버그 정보를 보여준다', async () => {
    const refetch = jest.fn(async () => ({
      data: undefined,
      error: new ApiError('요청한 경로를 찾을 수 없습니다.', { code: 'NOT_FOUND', status: 404 }),
      isError: true,
    }));
    jest.mocked(useMapPlaceRankings).mockReturnValue(
      rankingsResult(refetch) as unknown as ReturnType<typeof useMapPlaceRankings>,
    );
    await render(
      <TemporaryMapRankingApiCheckPage
        endpoint="GET /map/place-rankings (NATIONAL)"
        onBack={jest.fn()}
      />,
    );
    const user = userEvent.setup();

    await user.press(screen.getByText('요청 실행'));

    await waitFor(() => expect(screen.getByText(/HTTP: 404/)).toBeTruthy());
  });
});
