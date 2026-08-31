import {
  findMapPreviewPlace,
  mergeMapPreviewPlaces,
  shouldPresentMapSelection,
} from '../mapPreviewSelection';

describe('shouldPresentMapSelection', () => {
  test('바텀시트가 내려가면 지도 선택 표현을 해제하고 다시 올리면 복원한다', () => {
    expect(shouldPresentMapSelection('collapsed')).toBe(false);
    expect(shouldPresentMapSelection('medium')).toBe(true);
    expect(shouldPresentMapSelection('expanded')).toBe(true);
  });
});

describe('map preview selection', () => {
  test('추천과 실제 API 장소를 중복 없이 선택 가능한 목록으로 합친다', () => {
    const recommendation = { id: 17, source: 'recommendation' };
    const apiPlace = { id: 18, source: 'api' };

    expect(mergeMapPreviewPlaces([recommendation], [apiPlace, { id: 17, source: 'api' }]))
      .toEqual([recommendation, apiPlace]);
  });

  test('현재 선택 가능한 장소에 없는 임시 마커 ID는 미리보기를 열지 않는다', () => {
    const apiPlace = { id: 18, name: '실제 장소' };

    expect(findMapPreviewPlace('18', [apiPlace])).toBe(apiPlace);
    expect(findMapPreviewPlace('138001', [apiPlace])).toBeNull();
    expect(findMapPreviewPlace('not-a-place', [apiPlace])).toBeNull();
  });

  test('실제 장소와 임시 장소 모두 실제 마커 ID로 미리보기를 선택한다', () => {
    const apiPlace = { id: 18, name: '실제 장소' };
    const temporaryPlace = { id: 138001, name: '대성반점' };
    const selectablePlaces = [apiPlace, temporaryPlace];

    expect(findMapPreviewPlace('18', selectablePlaces)).toBe(apiPlace);
    expect(findMapPreviewPlace('138001', selectablePlaces)).toBe(temporaryPlace);
  });
});
