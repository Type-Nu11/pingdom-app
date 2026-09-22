export type CommunityCategory = 'all' | 'spot' | 'diary' | 'ledger';

export type CommunityRegion = 'cn' | 'jp' | 'kr' | 'th' | 'us' | 'vn';

export type CommunityPostTag = Exclude<CommunityCategory, 'all'>;

export type CommunityPostSummary = {
  authorName: string;
  commentCount: number;
  id: number;
  liked: boolean;
  likeCount: number;
  location: string;
  photoCount: number;
  region: CommunityRegion;
  relativeTime: string;
  tags: CommunityPostTag[];
  thumbnailUrl: string | null;
  title: string;
  preview: string;
  viewCount: number;
};

export type CommunityPlaceTag = {
  category: string;
  imageUrl: string | null;
  name: string;
  placeId: number;
  region: string;
};

export type CommunityComment = {
  authorName: string;
  content: string;
  id: number;
  isAuthor: boolean;
  liked: boolean;
  likeCount: number;
  parentId: number | null;
  relativeTime: string;
};

export type CommunityPostDetail = CommunityPostSummary & {
  bodyParagraphs: string[];
  comments: CommunityComment[];
  hiddenCommentCount: number;
  photoUrls: string[];
  placeTag: CommunityPlaceTag | null;
};

export type CommunityWriteDraft = {
  body: string;
  photoUris: string[];
  placeId: number | null;
  tags: CommunityPostTag[];
  title: string;
};
