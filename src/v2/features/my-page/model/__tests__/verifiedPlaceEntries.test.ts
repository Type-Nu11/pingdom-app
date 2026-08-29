import {
  toVerifiedPlaceEntries,
  toVerifiedPlaceListState,
} from '../verifiedPlaceEntries';

type QueryState = {
  data?: { address: string; id: number; name: string; thumbnailUrl: string | null };
  isError: boolean;
  isLoading: boolean;
};

function place(id: number) {
  return { address: `주소 ${id}`, id, name: `장소 ${id}`, thumbnailUrl: null };
}

const loading: QueryState = { isError: false, isLoading: true };
const failed: QueryState = { isError: true, isLoading: false };
const loaded = (id: number): QueryState => ({
  data: place(id),
  isError: false,
  isLoading: false,
});

describe('toVerifiedPlaceEntries', () => {
  test('place detail 응답 순서와 무관하게 placeId 순서로 슬롯을 만든다', () => {
    const entries = toVerifiedPlaceEntries(
      [11, 22, 33],
      // 가운데 항목만 아직 로딩 중이다.
      [loaded(11), loading, loaded(33)] as never,
    );

    expect(entries.map((entry) => entry.placeId)).toEqual([11, 22, 33]);
    expect(entries[1].isLoading).toBe(true);
    expect(entries[1].place).toBeNull();
    expect(entries[2].place).toEqual(place(33));
  });

  test('아직 쿼리가 생성되지 않은 슬롯은 로딩으로 취급한다', () => {
    const entries = toVerifiedPlaceEntries([11, 22], [loaded(11)] as never);

    expect(entries[1]).toEqual({
      isError: false,
      isLoading: true,
      place: null,
      placeId: 22,
    });
  });
});

describe('toVerifiedPlaceListState', () => {
  test('체크인이 없으면 empty를 반환한다', () => {
    expect(toVerifiedPlaceListState([])).toEqual({ kind: 'empty' });
  });

  test('모든 place detail이 실패하면 empty가 아니라 error를 반환한다', () => {
    const entries = toVerifiedPlaceEntries([11, 22], [failed, failed] as never);

    expect(toVerifiedPlaceListState(entries)).toEqual({ kind: 'error' });
  });

  test('일부만 실패하면 나머지를 순서대로 렌더한다', () => {
    const entries = toVerifiedPlaceEntries(
      [11, 22, 33],
      [loaded(11), failed, loading] as never,
    );
    const state = toVerifiedPlaceListState(entries);

    expect(state.kind).toBe('ready');
    if (state.kind !== 'ready') return;
    expect(state.entries.map((entry) => entry.placeId)).toEqual([11, 33]);
    expect(state.entries[1].isLoading).toBe(true);
  });
});
