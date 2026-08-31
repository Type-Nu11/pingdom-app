import type { MapMarker } from '../../model/place.types';
import { applyBookmarkStateToMarkers } from '../mapMarkerBookmarks';

const currentMapMarkers: MapMarker[] = [{
  category: 'food',
  id: '11',
  lat: 35.8714,
  lng: 128.6014,
  markerType: 'default',
}];

describe('applyBookmarkStateToMarkers', () => {
  test('현재 지도 결과에 없는 원거리 즐겨찾기 marker를 추가하지 않는다', () => {
    const markers = applyBookmarkStateToMarkers(currentMapMarkers, {
      '11': true,
      '999': true,
    });

    expect(markers).toHaveLength(1);
    expect(markers[0]).toMatchObject({ bookmarked: true, id: '11' });
    expect(markers.some((marker) => marker.id === '999')).toBe(false);
  });
});
