import { getInlinePreviewImage } from '../usePlacePreviewImages';
import { getInlineRegistrantUsername } from '../usePlaceRegistrantUsernames';

describe('place inline metadata', () => {
  it('장소 응답에 포함된 이미지 필드만 우선순위대로 사용한다', () => {
    expect(getInlinePreviewImage({
      id: 1,
      imageUrl: 'https://example.test/image.jpg',
      thumbnailUrl: 'https://example.test/thumb.jpg',
    })).toBe('https://example.test/image.jpg');
    expect(getInlinePreviewImage({
      id: 2,
      images: [{ url: 'https://example.test/images.jpg' }],
    })).toBe('https://example.test/images.jpg');
    expect(getInlinePreviewImage({ id: 3 })).toBeUndefined();
  });

  it('장소 응답에 포함된 등록자 필드만 사용한다', () => {
    expect(getInlineRegistrantUsername({
      address: '',
      distanceMeters: 0,
      id: 1,
      latitude: 0,
      longitude: 0,
      name: 'Place',
      username: 'inline-user',
    })).toBe('inline-user');
    expect(getInlineRegistrantUsername({
      address: '',
      distanceMeters: 0,
      id: 2,
      latitude: 0,
      longitude: 0,
      name: 'Place without registrant',
    })).toBeUndefined();
  });
});
