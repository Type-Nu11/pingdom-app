import type {
  CommunityComment,
  CommunityPostDetail,
  CommunityPostSummary,
  CommunityRegion,
} from './types';

export const COMMUNITY_REGIONS: Array<{ id: CommunityRegion; labelKey: string }> = [
  { id: 'kr', labelKey: 'kr' },
  { id: 'us', labelKey: 'us' },
  { id: 'jp', labelKey: 'jp' },
  { id: 'vn', labelKey: 'vn' },
  { id: 'cn', labelKey: 'cn' },
  { id: 'th', labelKey: 'th' },
];

const THUMBNAIL_URL = 'https://cdn.example.test/community/posts/17/thumb.jpg';

export const COMMUNITY_POST_SUMMARIES: CommunityPostSummary[] = [
  {
    authorName: 'woo_sm',
    commentCount: 5,
    id: 1,
    liked: false,
    likeCount: 8,
    location: '구지면',
    region: 'kr',
    photoCount: 4,
    preview: '주말에 가족이랑 갈 만한 곳 찾다가 발견했는데 아직 후기가 없어서요',
    relativeTime: '12분 전',
    tags: ['spot', 'diary', 'ledger'],
    thumbnailUrl: THUMBNAIL_URL,
    title: '구지면에 새로 생긴 로스터리 카페 가보신 분 계신가요? 원두 추천 부탁드려요',
    viewCount: 128,
  },
  {
    authorName: 'moon_light',
    commentCount: 5,
    id: 2,
    liked: true,
    likeCount: 8,
    location: '구지면',
    region: 'kr',
    photoCount: 4,
    preview: '보는내내 눈물이 줄줄났네요ㅠㅠ 내한 다시 간 기분이였어요',
    relativeTime: '12분 전',
    tags: ['spot', 'diary', 'ledger'],
    thumbnailUrl: THUMBNAIL_URL,
    title: '오늘 오아시스 영화뜸',
    viewCount: 128,
  },
  {
    authorName: 'travel_kim',
    commentCount: 5,
    id: 3,
    liked: false,
    likeCount: 8,
    location: '구지면',
    region: 'kr',
    photoCount: 4,
    preview: '주말에 가족이랑 갈 만한 곳 찾다가 발견했는데 아직 후기가 없어서요',
    relativeTime: '12분 전',
    tags: ['spot', 'diary', 'ledger'],
    thumbnailUrl: THUMBNAIL_URL,
    title: '구지면에 새로 생긴 로스터리 카페 가보신 분 계신가요? 원두 추천 부탁드려요',
    viewCount: 128,
  },
  {
    authorName: 'jiyoo_p',
    commentCount: 5,
    id: 4,
    liked: false,
    likeCount: 8,
    location: '구지면',
    region: 'kr',
    photoCount: 4,
    preview: '주말에 가족이랑 갈 만한 곳 찾다가 발견했는데 아직 후기가 없어서요',
    relativeTime: '12분 전',
    tags: ['spot', 'diary', 'ledger'],
    thumbnailUrl: THUMBNAIL_URL,
    title: '구지면에 새로 생긴 로스터리 카페 가보신 분 계신가요? 원두 추천 부탁드려요',
    viewCount: 128,
  },
];

const POST_1_COMMENTS: CommunityComment[] = [
  {
    authorName: '커피러버',
    content: '저 지난주에 다녀왔어요! 에티오피아 예가체프 핸드드립 괜찮았는데 산미 싫어하시면 하우스 블렌드 추천드려요.',
    id: 101,
    isAuthor: false,
    liked: true,
    likeCount: 4,
    parentId: null,
    relativeTime: '8분 전',
  },
  {
    authorName: 'woo_sm',
    content: '오 감사합니다! 하우스 블렌드로 마셔볼게요 😊',
    id: 102,
    isAuthor: true,
    liked: false,
    likeCount: 1,
    parentId: 101,
    relativeTime: '5분 전',
  },
  {
    authorName: '구지주민',
    content: '주차장 넓어서 좋더라고요. 2층 창가 자리 추천해요!',
    id: 103,
    isAuthor: false,
    liked: false,
    likeCount: 0,
    parentId: null,
    relativeTime: '3분 전',
  },
];

export const COMMUNITY_POST_DETAILS: Record<number, CommunityPostDetail> = {
  1: {
    ...COMMUNITY_POST_SUMMARIES[0],
    bodyParagraphs: [
      '주말에 가족이랑 갈 만한 곳 찾다가 발견했는데, 구지면 사거리 쪽에 로스터리 카페가 새로 생겼더라고요.',
      '직접 로스팅한다고 해서 기대하고 갔는데 매장도 넓고 주차도 편했어요. 아이들이랑 같이 가기에도 괜찮았고요.',
      '혹시 가보신 분 계시면 어떤 원두가 괜찮았는지 추천 부탁드립니다! 산미 적은 쪽을 좋아해요 ☕️',
    ],
    comments: POST_1_COMMENTS,
    hiddenCommentCount: 2,
    photoUrls: [
      'https://cdn.example.test/community/posts/1/photo-1.jpg',
      'https://cdn.example.test/community/posts/1/photo-2.jpg',
      'https://cdn.example.test/community/posts/1/photo-3.jpg',
    ],
    placeTag: {
      category: '카페 · 구지면',
      imageUrl: 'https://cdn.example.test/community/places/oasis-popup/thumb.jpg',
      name: '오아시스 팝업 스토어',
      placeId: 17,
      region: '구지면',
    },
  },
};

export function getCommunityPostDetail(postId: number): CommunityPostDetail | null {
  return COMMUNITY_POST_DETAILS[postId] ?? null;
}
