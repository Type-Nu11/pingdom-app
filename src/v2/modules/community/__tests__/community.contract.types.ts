import type { CommunitySchema } from '../../../shared/api';
import type {
  CommunityCategory,
  CommunityComment,
  CommunityPostSummary,
} from '../api/communityApi';

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false;
type Assert<Condition extends true> = Condition;

// The array item types must match the scoped live-server schema exactly — this
// is the regression the community sync exists to catch (the array items used
// to reference the unrelated nationwide-trending-place `Item` schema).
export type CategoryMatchesSchema = Assert<
  Equal<CommunityCategory, CommunitySchema<'CommunityCategoryItem'>>
>;
export type PostSummaryMatchesSchema = Assert<
  Equal<CommunityPostSummary, CommunitySchema<'CommunityPostSummary'>>
>;
export type CommentMatchesSchema = Assert<
  Equal<CommunityComment, CommunitySchema<'CommunityCommentSummary'>>
>;

// Literal samples the hooks/screens will actually construct, checked at
// compile time against the live contract.
export const categorySample: CommunityCategory = {
  categoryId: 'PLACE',
  categoryName: '장소',
};

export const postSummarySample: CommunityPostSummary = {
  postId: 1,
  title: '대소고 다녀왔어요',
};

export const commentSample: CommunityComment = {
  authorId: 7,
  authorName: 'pingdom',
  commentId: 1,
  content: '저도 가보고 싶네요!',
  createdAt: '2026-09-01T09:00:00Z',
};
