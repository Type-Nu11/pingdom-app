export type RecordItem = {
  id: string;
  placeId: string;
  memo: string;
};

export type Post = {
  createdAt: string;
  description?: string | null;
  id: number;
  imageUrl: string;
  likeCount: number;
  placeId: number;
  placeName: string;
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
