export function toFavoritePlaceImageUrls(
  imageUrlsByPlaceId: Record<string, string>,
): Record<string, string[]> {
  return Object.entries(imageUrlsByPlaceId).reduce<Record<string, string[]>>(
    (result, [placeId, imageUrl]) => {
      if (/^https:\/\//i.test(imageUrl.trim())) {
        result[placeId] = [imageUrl];
      }
      return result;
    },
    {},
  );
}
