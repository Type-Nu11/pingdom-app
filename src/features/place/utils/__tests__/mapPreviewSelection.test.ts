import {
  findMapPreviewPlace,
  mergeMapPreviewPlaces,
} from '../mapPreviewSelection';

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
});
