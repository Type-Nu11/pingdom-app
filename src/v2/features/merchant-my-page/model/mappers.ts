import type {
  MerchantOwnerMedia,
  MerchantOwnerOperating,
  MerchantOwnerPlaceDetail,
  MerchantPlaceInformation,
  Offer,
  PlaceReview,
  RegularOperatingHour,
} from '../api/merchantOwnerApi';
import type {
  MerchantEvent,
  MerchantEventStatus,
  MerchantReview,
  MerchantStore,
  MerchantStorePhoto,
} from './types';

const DAY_ORDER = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

/** "09:00:00" -> "09:00" */
function trimSeconds(time: string): string {
  return time.length >= 5 ? time.slice(0, 5) : time;
}

/**
 * The screen shows one hours line. If every listed day keeps the same window we
 * collapse it to that window; otherwise we fall back to the earliest day so the
 * merchant still sees a concrete value rather than nothing.
 */
export function formatBusinessHours(hours: readonly RegularOperatingHour[]): string {
  if (hours.length === 0) return '';

  const windows = new Set(hours.map((h) => `${trimSeconds(h.opensAt)} ~ ${trimSeconds(h.closesAt)}`));
  if (windows.size === 1) {
    return [...windows][0];
  }

  const earliest = [...hours].sort(
    (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek),
  )[0];
  return `${trimSeconds(earliest.opensAt)} ~ ${trimSeconds(earliest.closesAt)}`;
}

function toStorePhotos(media: MerchantOwnerMedia | undefined): MerchantStorePhoto[] {
  if (!media) return [];
  return [...media.media]
    .filter((item) => item.purpose === 'EXPLORATION' || media.media.length <= 4)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((item) => ({ id: String(item.id), url: item.thumbnailUrl ?? item.imageUrl }));
}

export function toMerchantStore(input: {
  detail: MerchantOwnerPlaceDetail;
  information?: MerchantPlaceInformation;
  media?: MerchantOwnerMedia;
  operating?: MerchantOwnerOperating;
  verifiedCount?: number;
}): MerchantStore {
  const { detail, information, media, operating, verifiedCount } = input;
  const hours = operating?.regularHours.length ? operating.regularHours : detail.regularHours;

  return {
    address: detail.roadAddress || detail.address,
    businessHours: formatBusinessHours(hours),
    category: detail.category,
    features: [],
    name: detail.name,
    phoneNumber: information?.contactPhone ?? '',
    photos: toStorePhotos(media),
    verifiedCount: verifiedCount ?? 0,
  };
}

function toRelativeTime(createdAt: string, now: Date = new Date()): string {
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const dateLabel = createdAt.slice(2, 10).replace(/-/g, '.');

  if (minutes < 1) return `${dateLabel} · 방금 전`;
  if (minutes < 60) return `${dateLabel} · ${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${dateLabel} · ${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${dateLabel} · ${days}일 전`;
}

export function toMerchantReviews(
  reviews: readonly PlaceReview[],
  now: Date = new Date(),
): MerchantReview[] {
  return reviews.map((review) => ({
    authorName: `이용인 #${review.userId}`,
    authorProfileImageUrl: null,
    content: review.content,
    id: String(review.reviewId),
    photoUrls: review.imageUrls,
    relativeTime: toRelativeTime(review.createdAt, now),
    tags: review.recommendReason ? [{ label: review.recommendReason }] : [],
  }));
}

export function toEventStatus(offer: Offer, now: Date = new Date()): MerchantEventStatus {
  if (offer.status === 'CLOSED') return 'ended';
  const nowMs = now.getTime();
  if (new Date(offer.endsAt).getTime() < nowMs) return 'ended';
  if (offer.status === 'DRAFT' || new Date(offer.startsAt).getTime() > nowMs) return 'upcoming';
  return 'ongoing';
}

function toPeriodLabel(startsAt: string, endsAt: string): string {
  return `${startsAt.slice(2, 10).replace(/-/g, '.')}~${endsAt.slice(2, 10).replace(/-/g, '.')}`;
}

export function toMerchantEvents(
  offers: readonly Offer[],
  placeId: number,
  now: Date = new Date(),
): MerchantEvent[] {
  return offers
    .filter((offer) => offer.placeId === placeId)
    .map((offer) => ({
      benefit: offer.benefitDescription,
      id: String(offer.id),
      period: toPeriodLabel(offer.startsAt, offer.endsAt),
      status: toEventStatus(offer, now),
      title: offer.title,
    }));
}
