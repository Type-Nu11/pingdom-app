import { useMemo } from 'react';

type PreviewPlace = {
  id: number;
  imageUrl?: string;
  images?: Array<{ imageUrl?: string; url?: string } | string>;
  mediaUrls?: string[];
  thumbnailUrl?: string;
};

export function getInlinePreviewImage(place: PreviewPlace) {
  const imageUrl = place.imageUrl ?? place.thumbnailUrl;

  if (imageUrl) {
    return imageUrl;
  }

  const imageFromImages = place.images?.find((image) => (
    typeof image === 'string' ? Boolean(image) : Boolean(image.imageUrl ?? image.url)
  ));

  if (typeof imageFromImages === 'string') {
    return imageFromImages;
  }

  return imageFromImages?.imageUrl ?? imageFromImages?.url ?? place.mediaUrls?.[0];
}

/** Place previews only consume media included in the place contract. */
export function usePlacePreviewImages(places: PreviewPlace[], enabled = true) {
  return useMemo(() => {
    const imageUrlsByPlaceId: Record<string, string> = {};
    const isLoadingByPlaceId: Record<string, boolean> = {};

    places.forEach((place) => {
      const placeKey = String(place.id);
      const imageUrl = getInlinePreviewImage(place);

      if (enabled && imageUrl) {
        imageUrlsByPlaceId[placeKey] = imageUrl;
      }

      isLoadingByPlaceId[placeKey] = false;
    });

    return {
      imageUrlsByPlaceId,
      isLoadingByPlaceId,
    };
  }, [enabled, places]);
}
