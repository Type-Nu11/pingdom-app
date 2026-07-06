export type RecordItem = {
  id: string;
  placeId: string;
  memo: string;
};

export type Post = {
  createdAt: string;
  description?: string | null;
  bookmarked?: boolean;
  id: number;
  imageUrl: string;
  isLiked?: boolean;
  likeCount: number;
  liked?: boolean;
  likedByMe?: boolean;
  placeId: number;
  placeName: string;
  notificationId?: number;
  notificationsId?: number;
  title: string;
  userId: number;
  username: string;
};

export type PostsPage = {
  hasNext: boolean;
  limit: number;
  page: number;
  posts: Post[];
  totalCount: number;
  totalPages: number;
};

export type RecordUploadFile = {
  name?: string;
  type?: string;
  uri: string;
};
