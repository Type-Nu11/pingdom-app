import { toFavoritePlaceImageUrls } from '../favoritePlaceImages';

describe('toFavoritePlaceImageUrls', () => {
  test('서버 장소 미디어의 HTTPS URL만 Saved 카드 형식으로 변환한다', () => {
    expect(toFavoritePlaceImageUrls({
      '1': 'https://cdn.example.com/place.jpg',
      '2': 'file:///private/user-photo.jpg',
    })).toEqual({
      '1': ['https://cdn.example.com/place.jpg'],
    });
  });
});
