import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import {
  usePlaceCard,
  usePlaceMap,
  usePlaceOperatingNotices,
  usePlaceVerificationMedia,
  usePlaceVisitDecision,
  useRecommendationExplanation,
  useRecordMapLinkConversion,
} from '../../../../../v2/features/place-exploration';
import TemporaryPlaceExplorationApiCheckList from '../TemporaryPlaceExplorationApiCheckList';
import TemporaryPlaceExplorationApiCheckPage from '../TemporaryPlaceExplorationApiCheckPage';

jest.mock('../../../../../v2/features/place-exploration', () => ({
  usePlaceCard: jest.fn(),
  usePlaceMap: jest.fn(),
  usePlaceOperatingNotices: jest.fn(),
  usePlaceVerificationMedia: jest.fn(),
  usePlaceVisitDecision: jest.fn(),
  useRecommendationExplanation: jest.fn(),
  useRecordMapLinkConversion: jest.fn(),
}));

const placeHooks: jest.Mock[] = [
  usePlaceCard as jest.Mock,
  usePlaceMap as jest.Mock,
  usePlaceOperatingNotices as jest.Mock,
  usePlaceVerificationMedia as jest.Mock,
  usePlaceVisitDecision as jest.Mock,
  useRecommendationExplanation as jest.Mock,
];

function queryResult(refetch: jest.Mock = jest.fn(async () => ({
  data: { ok: true },
  error: null,
  isError: false,
}))) {
  return { isFetching: false, refetch };
}

function mutationResult(mutate = jest.fn()) {
  return { isPending: false, mutate };
}

describe('TemporaryPlaceExplorationApiCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    for (const hook of placeHooks) {
      hook.mockReturnValue(queryResult());
    }
    jest.mocked(useRecordMapLinkConversion).mockReturnValue(
      mutationResult() as unknown as ReturnType<typeof useRecordMapLinkConversion>,
    );
  });

  test('7개 장소 탐색 endpoint를 목록에 표시하고 선택값을 전달한다', async () => {
    const onSelect = jest.fn();
    await render(<TemporaryPlaceExplorationApiCheckList onSelect={onSelect} />);
    const user = userEvent.setup();

    expect(screen.getAllByRole('button')).toHaveLength(7);
    await user.press(screen.getByRole('button', { name: 'GET /places/map' }));

    expect(onSelect).toHaveBeenCalledWith('GET /places/map');
  });

  test('지도 viewport Query를 자동 호출하지 않고 버튼에서 refetch한다', async () => {
    const refetch = jest.fn(async () => ({
      data: { markers: [], mode: 'MARKERS' },
      error: null,
      isError: false,
    }));
    jest.mocked(usePlaceMap).mockReturnValue(
      queryResult(refetch) as unknown as ReturnType<typeof usePlaceMap>,
    );

    await render(
      <TemporaryPlaceExplorationApiCheckPage endpoint="GET /places/map" onBack={jest.fn()} />,
    );
    const user = userEvent.setup();

    expect(usePlaceMap).toHaveBeenCalledWith({
      east: 127.1,
      north: 37.6,
      south: 37.45,
      west: 126.9,
      zoom: 14,
    }, { enabled: false });
    expect(refetch).not.toHaveBeenCalled();

    await user.press(screen.getByRole('button', { name: '요청 실행' }));

    await waitFor(() => expect(refetch).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('요청 성공')).toBeVisible();
    expect(screen.getByText(/"markers": \[\]/)).toBeVisible();
  });

  test('지도 링크 전환 body와 placeId를 Mutation에 전달한다', async () => {
    const mutate = jest.fn();
    jest.mocked(useRecordMapLinkConversion).mockReturnValue(
      mutationResult(mutate) as unknown as ReturnType<typeof useRecordMapLinkConversion>,
    );

    await render(
      <TemporaryPlaceExplorationApiCheckPage
        endpoint="POST /places/{placeId}/map-link-conversions"
        onBack={jest.fn()}
      />,
    );
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('requestId'), 'request-161');
    await user.press(screen.getByRole('button', { name: 'EXTERNAL_MAP' }));
    await user.press(screen.getByRole('button', { name: '요청 실행' }));

    expect(mutate).toHaveBeenCalledWith({
      body: {
        linkType: 'EXTERNAL_MAP',
        provider: 'KAKAO',
        requestId: 'request-161',
      },
      placeId: 17,
    }, expect.objectContaining({
      onError: expect.any(Function),
      onSuccess: expect.any(Function),
    }));
  });
});
