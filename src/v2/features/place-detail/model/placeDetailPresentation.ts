import type { PlaceReviewPage } from '../../place-visit-verification/api/visitVerificationApi';
import type {
  PlaceCard,
  PlaceExplorationMedia,
  PlaceOperatingNotices,
  PlaceVisitDecision,
} from '../../place-exploration/model/placeExploration.types';
import type { PlaceAvailabilities, PlaceDetail } from './placeDetail.types';
import {
  selectPlaceOperatingSummary,
  type PlaceOperatingSummary,
} from './placeOperatingSummary';

export type ResourceState<T> = {
  data?: T;
  error?: unknown;
  isError: boolean;
  isPending: boolean;
};

export type ReservationCtaState =
  | { kind: 'loading'; disabled: true; message: '예약 가능 여부를 확인하고 있습니다' }
  | { kind: 'available'; disabled: false; message: '예약하기' }
  | { kind: 'empty'; disabled: false; message: '현재 예약 가능한 일정이 없습니다' }
  | { kind: 'full'; disabled: false; message: '예약 가능한 인원이 없습니다' }
  | { kind: 'auth-error'; disabled: true; message: '로그인이 필요합니다' }
  | { kind: 'error'; disabled: true; message: '예약 가능 여부를 불러오지 못했습니다' };

export type PlaceDetailPresentation = {
  address: string | null;
  category: string | null;
  coupons: Array<{ period: string; title: string }>;
  description: string | null;
  englishName: string | null;
  events: Array<{ period: string; title: string }>;
  imageState: 'empty' | 'error' | 'loading' | 'ready';
  imageUrls: string[];
  informationVerificationStatus: PlaceDetail['informationVerificationStatus'] | null;
  isCurrentlyOperating: boolean | null;
  merchant: {
    businessName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    description: string | null;
    displayName: string | null;
    reservationUrl: string | null;
    websiteUrl: string | null;
  } | null;
  name: string | null;
  notice: string | null;
  operatingStatus: PlaceDetail['operatingStatus'] | null;
  operatingSummary: PlaceOperatingSummary | null;
  placeId: number;
  reservation: ReservationCtaState;
  reviewState: 'empty' | 'error' | 'loading' | 'ready';
  reviews: Array<{
    author: string;
    createdAt: string;
    imageUrls: string[];
    tags: string[];
    text: string;
  }>;
  reviewTotal: number | null;
  roadAddress: string | null;
  jibunAddress: string | null;
  touristSummary: string | null;
  verificationLabel: string | null;
};

export type PlaceDetailPresentationResources = {
  availabilities: ResourceState<PlaceAvailabilities>;
  card: ResourceState<PlaceCard>;
  detail: ResourceState<PlaceDetail>;
  media: ResourceState<PlaceExplorationMedia>;
  notices: ResourceState<PlaceOperatingNotices>;
  reviews: ResourceState<PlaceReviewPage>;
  visitDecision: ResourceState<PlaceVisitDecision>;
};

const clean = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

const isAuthError = (error: unknown): boolean =>
  Boolean(error && typeof error === 'object' && 'status' in error
    && ((error as { status?: unknown }).status === 401));

function formatDateRange(startsAt: unknown, endsAt: unknown): string {
  const start = clean(startsAt);
  const end = clean(endsAt);
  if (start && end) return `${start} ~ ${end}`;
  return start ?? end ?? '';
}

export function selectReservationCta(
  resource: ResourceState<PlaceAvailabilities>,
  now: Date = new Date(),
): ReservationCtaState {
  if (resource.isPending) {
    return { kind: 'loading', disabled: true, message: '예약 가능 여부를 확인하고 있습니다' };
  }
  if (resource.isError) {
    return isAuthError(resource.error)
      ? { kind: 'auth-error', disabled: true, message: '로그인이 필요합니다' }
      : { kind: 'error', disabled: true, message: '예약 가능 여부를 불러오지 못했습니다' };
  }

  const items = Array.isArray(resource.data) ? resource.data : [];
  const futureActive = items.filter((item) => item.status === 'ACTIVE'
    && typeof item.endsAt === 'string'
    && Number.isFinite(Date.parse(item.endsAt))
    && Date.parse(item.endsAt) > now.getTime());
  if (futureActive.some((item) => typeof item.remainingCapacity === 'number'
    && item.remainingCapacity > 0)) {
    return { kind: 'available', disabled: false, message: '예약하기' };
  }
  if (futureActive.some((item) => (item.remainingCapacity ?? 0) <= 0)) {
    return { kind: 'full', disabled: false, message: '예약 가능한 인원이 없습니다' };
  }
  return { kind: 'empty', disabled: false, message: '현재 예약 가능한 일정이 없습니다' };
}

export function buildPlaceDetailPresentation(
  placeId: number,
  resources: PlaceDetailPresentationResources,
  now: Date = new Date(),
): PlaceDetailPresentation {
  const detail = resources.detail.data?.id === placeId ? resources.detail.data : undefined;
  const decision = resources.visitDecision.data?.place?.id === placeId
    ? resources.visitDecision.data
    : undefined;
  const card = resources.card.data?.id === placeId ? resources.card.data : undefined;
  const notices = resources.notices.data?.placeId === placeId ? resources.notices.data : undefined;
  const media = resources.media.data?.placeId === placeId ? resources.media.data : undefined;
  const base = detail ?? decision?.place;
  const mediaUrls = (media?.media ?? [])
    .slice()
    .sort((left, right) => (left.displayOrder - right.displayOrder) || (left.id - right.id))
    .map((item) => clean(item.imageUrl))
    .filter((url): url is string => Boolean(url));
  const imageUrls = [...new Set([...mediaUrls, clean(card?.imageUrl)].filter(
    (url): url is string => Boolean(url),
  ))];
  const reviewItems = (resources.reviews.data?.content ?? []).filter(
    (review) => review.placeId === undefined || review.placeId === placeId,
  );
  const owner = base?.merchantOwner;
  const operatingSource = base ?? card;
  const merchantInformation = decision?.merchantInformation;
  const merchant = owner || merchantInformation ? {
    businessName: clean(owner?.businessName),
    contactEmail: clean(owner?.contactEmail),
    contactPhone: clean(merchantInformation?.contactPhone) ?? clean(owner?.contactPhone),
    description: clean(merchantInformation?.description) ?? clean(owner?.description),
    displayName: clean(owner?.displayName),
    reservationUrl: clean(merchantInformation?.reservationUrl),
    websiteUrl: clean(merchantInformation?.websiteUrl),
  } : null;

  return {
    address: clean(base?.address) ?? clean(card?.address),
    category: clean(card?.category) ?? base?.touristCategories?.[0] ?? null,
    coupons: (decision?.availableOffers?.offers ?? []).flatMap((offer) => {
      const title = clean(offer.title);
      return title ? [{ period: formatDateRange(offer.startsAt, offer.endsAt), title }] : [];
    }),
    description: clean(base?.description),
    englishName: clean(base?.englishName) ?? clean(card?.englishName),
    events: (decision?.ongoingEvents ?? []).flatMap((event) => {
      const title = clean(event.title);
      return title ? [{ period: formatDateRange(event.startAt, event.endAt), title }] : [];
    }),
    imageState: resources.media.isPending ? 'loading'
      : resources.media.isError ? 'error'
        : imageUrls.length ? 'ready' : 'empty',
    imageUrls,
    informationVerificationStatus: base?.informationVerificationStatus ?? card?.informationVerificationStatus ?? null,
    isCurrentlyOperating: notices?.currentlyOperating ?? base?.currentlyOperating ?? card?.currentlyOperating ?? null,
    merchant,
    name: clean(base?.name) ?? clean(card?.name),
    notice: clean((notices?.notices ?? base?.activeOperatingNotices ?? [])
      .filter((item) => item.visibleNow && item.status === 'ACTIVE')
      .sort((left, right) => {
        const priority = (noticeType: string) => noticeType === 'TEMPORARY_CLOSURE'
          ? 0 : noticeType === 'HOURS_CHANGE' ? 1 : 2;
        return priority(left.noticeType) - priority(right.noticeType);
      })[0]?.message),
    operatingStatus: base?.operatingStatus ?? card?.operatingStatus ?? null,
    operatingSummary: operatingSource ? selectPlaceOperatingSummary({
      ...operatingSource,
      currentlyOperating: notices?.currentlyOperating ?? operatingSource.currentlyOperating,
    }, now) : null,
    placeId,
    reservation: selectReservationCta(resources.availabilities, now),
    reviewState: resources.reviews.isPending ? 'loading'
      : resources.reviews.isError ? 'error'
        : reviewItems.length ? 'ready' : 'empty',
    reviews: reviewItems.map((review) => ({
      author: '사용자',
      createdAt: clean(review.createdAt) ?? '',
      imageUrls: (review.imageUrls ?? []).map(clean).filter((url): url is string => Boolean(url)),
      tags: [clean(review.recommendReason)].filter((tag): tag is string => Boolean(tag)),
      text: clean(review.content) ?? '',
    })),
    reviewTotal: resources.reviews.isError || resources.reviews.isPending
      ? null : Math.max(0, resources.reviews.data?.totalElements ?? reviewItems.length),
    roadAddress: clean(base?.roadAddress) ?? clean(card?.roadAddress),
    jibunAddress: clean(base?.jibunAddress),
    touristSummary: clean(base?.touristSummary) ?? clean(card?.touristSummary),
    verificationLabel: (() => {
      const status = base?.informationVerificationStatus ?? card?.informationVerificationStatus;
      if (status === 'ADMIN_VERIFIED') return '관리자 확인 정보';
      if (status === 'SOURCE_CONFIRMED') return '출처 확인 정보';
      if (status === 'OWNER_SUBMITTED') return '사업자 제공 정보';
      return null;
    })(),
  };
}
