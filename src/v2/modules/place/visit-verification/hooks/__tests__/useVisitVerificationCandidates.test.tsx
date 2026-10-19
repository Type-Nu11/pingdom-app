import { renderHook } from '@testing-library/react-native';
import { useVisitVerificationCandidates } from '../useVisitVerificationCandidates';

const mockPages = [
  { checkIns: [
    { id: 10, placeId: 17, observedAt: '2026-10-19T09:00:00Z', distanceMeters: 5 },
    { id: 20, placeId: 22, observedAt: '2026-10-19T08:00:00Z', distanceMeters: 10 },
  ] },
  { checkIns: [
    { id: 9, placeId: 17, observedAt: '2026-10-18T09:00:00Z', distanceMeters: 15 },
    { id: 11, placeId: 17, observedAt: '2026-10-19T10:00:00Z', distanceMeters: 3 },
    { id: 10, placeId: 17, observedAt: '2026-10-19T09:00:00Z', distanceMeters: 5 },
  ] },
];
jest.mock('../../../check-ins', () => ({ useInfiniteCheckIns: () => ({ data: { pages: mockPages } }) }));
jest.mock('../../../exploration', () => ({
  createPlaceCardQueryOptions: (id: number) => ({ queryKey: ['card', id] }),
  createPlaceExplorationMediaQueryOptions: (id: number) => ({ queryKey: ['media', id] }),
}));
jest.mock('@tanstack/react-query', () => ({
  useQueries: ({ queries }: { queries: { queryKey: [string, number] }[] }) => queries.map(({ queryKey }) => ({
    data: queryKey[0] === 'card'
      ? { id: queryKey[1], name: '같은 이름', address: '주소', touristCategories: [], imageUrl: null }
      : { media: [] },
  })),
}));

test('shows one card per place across pages and selects the newest check-in without merging names', async () => {
  const { result } = await renderHook(() => useVisitVerificationCandidates());
  expect(result.current.candidates.map(({ placeId, checkInId, distanceMeters, name }) =>
    ({ placeId, checkInId, distanceMeters, name }))).toEqual([
    { placeId: 17, checkInId: 11, distanceMeters: 3, name: '같은 이름' },
    { placeId: 22, checkInId: 20, distanceMeters: 10, name: '같은 이름' },
  ]);
});
