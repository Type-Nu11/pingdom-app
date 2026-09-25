import type {
  CommunityCommentPage,
  CommunityLikeStatus,
  CommunityPostDetail,
  CommunityPostPage,
  CreateCommentResponse,
  CreatePostResponse,
  ListCategoriesResponse,
  RecordPlaceViewResponse,
  ReportResponse,
} from '../api/communityApi';

export const categoriesFixture = {
  categories: [
    { categoryId: 'PLACE', categoryName: '장소' },
    { categoryId: 'TRAVEL', categoryName: '여행' },
    { categoryId: 'MONEY', categoryName: '돈' },
  ],
} satisfies ListCategoriesResponse;

export const postPageFixture = {
  hasNext: false,
  limit: 20,
  page: 1,
  posts: [
    { postId: 1, title: '대소고 다녀왔어요' },
    { postId: 2, title: '오늘 오아시스 영화 봤어요' },
  ],
  totalCount: 2,
  totalPages: 1,
} satisfies CommunityPostPage;

export const emptyPostPageFixture = {
  hasNext: false,
  limit: 20,
  page: 1,
  posts: [],
  totalCount: 0,
  totalPages: 0,
} satisfies CommunityPostPage;

export const postDetailFixture = {
  content: '즐거운 경험이었습니다.',
  places: [{ deleted: false, placeId: 17, placeName: '대소고' }],
  postId: 1,
  title: '대소고 다녀왔어요',
} satisfies CommunityPostDetail;

export const commentPageFixture = {
  comments: [
    {
      authorId: 7,
      authorName: 'pingdom',
      commentId: 101,
      content: '저도 가보고 싶네요!',
      createdAt: '2026-09-01T09:00:00Z',
    },
  ],
  hasNext: false,
  limit: 20,
  page: 1,
  totalCount: 1,
  totalPages: 1,
} satisfies CommunityCommentPage;

export const createPostResponseFixture = {
  placeIds: [17],
  postId: 9001,
} satisfies CreatePostResponse;

export const createCommentResponseFixture = {
  commentId: 9101,
  content: '저도 가보고 싶네요!',
  postId: 1,
} satisfies CreateCommentResponse;

export const likeStatusFixture = {
  likeCount: 12,
  liked: false,
  postId: 1,
} satisfies CommunityLikeStatus;

export const likedStatusFixture = {
  ...likeStatusFixture,
  likeCount: 13,
  liked: true,
} satisfies CommunityLikeStatus;

export const reportResponseFixture = {
  reportId: 1,
  status: 'PENDING',
} satisfies ReportResponse;

// Recording a view returns the standard place detail payload with the
// community-attributed view count folded in (`communityViewCount`).
export const placeViewFixture = {
  activeOperatingNotices: [],
  address: '대구광역시 달성군 다사읍 대실로 33',
  communityViewCount: 13,
  currentlyOperating: true,
  currentlyOperatingCheckedAt: '2026-09-01T09:00:00Z',
  description: null,
  englishName: null,
  geocodingSource: 'KAKAO',
  id: 17,
  informationEvidenceUpdatedAt: null,
  informationVerificationStatus: 'UNVERIFIED',
  informationVerifiedAt: null,
  jibunAddress: null,
  lastVerifiedAt: null,
  lastVerifiedSourceType: null,
  latitude: 35.85,
  longitude: 128.47,
  merchantOwner: null,
  name: '대소고',
  operatingExceptions: [],
  operatingStatus: 'OPERATING',
  operatingStatusCheckedAt: null,
  postalCode: null,
  primaryInformationSource: 'LEGACY',
  registrant: 'system',
  regularHours: [],
  roadAddress: null,
  touristCategories: [],
  touristSummary: null,
  verifiedEvidenceCount: 0,
} satisfies RecordPlaceViewResponse;
