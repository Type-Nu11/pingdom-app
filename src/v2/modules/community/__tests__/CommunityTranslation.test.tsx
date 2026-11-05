import React from 'react';
import { NativeModules } from 'react-native';
import { screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../app/testing/testProviders';
import { communityApi } from '..';
import CommunityDetailScreen from '../screens/CommunityDetailScreen';
import CommentItem from '../components/CommentItem';

const previousBridge = NativeModules.MLKitTranslation;
beforeEach(() => {
  NativeModules.MLKitTranslation = {
    getTranslationPlan: jest.fn(async () => ({ sourceLanguage: 'en', targetLanguage: 'ko', shouldTranslate: true })),
    getOfflineModels: jest.fn(async () => ['ko']),
    translate: jest.fn(async (text: string) => ({ translatedText: `번역:${text}` })),
  };
});
afterEach(() => { NativeModules.MLKitTranslation = previousBridge; jest.restoreAllMocks(); });

test('글 상세의 제목과 본문을 함께 번역하고 원문의 문단과 작성자 정보는 보존한다', async () => {
  jest.spyOn(communityApi, 'getPost').mockResolvedValue({ postId: 902, title: 'Detail title', content: 'First paragraph\n\nSecond paragraph', author: { authorId: 3, authorName: '원문 작성자' }, places: [] });
  jest.spyOn(communityApi, 'getLikeStatus').mockResolvedValue({ postId: 902, liked: false, likeCount: 0 });
  jest.spyOn(communityApi, 'listComments').mockResolvedValue({ comments: [], hasNext: false, page: 1, limit: 20, totalCount: 0, totalPages: 0 });
  const { user } = await renderWithProviders(<CommunityDetailScreen onBack={jest.fn()} postId={902} />);
  await waitFor(() => expect(screen.getByText('Detail title')).toBeVisible());
  expect(screen.queryByRole('button', { name: '번역하기' })).toBeNull();
  await user.longPress(screen.getByText('Detail title'));
  await user.press(screen.getByRole('button', { name: '번역하기' }));
  expect(await screen.findByText('번역:Detail title')).toBeVisible();
  expect(screen.getByTestId('v2-community-detail-body').props.children).toBe('번역:First paragraph\n\nSecond paragraph');
  expect(screen.getByText('원문 작성자')).toBeVisible();
  await user.longPress(screen.getByTestId('v2-community-detail-body'));
  await user.press(screen.getByRole('button', { name: '원문 보기' }));
  expect(screen.getByTestId('v2-community-detail-body').props.children).toBe('First paragraph\n\nSecond paragraph');
});

test.each(['comment', 'reply'] as const)('%s 번역은 작성자 표시와 답글 액션을 유지하며 원문으로 돌아간다', async variant => {
  const content = `Helpful ${variant} content`;
  const onReply = jest.fn();
  const { user } = await renderWithProviders(<CommentItem variant={variant} isPostAuthor onReply={onReply}
    comment={{ commentId: 903, authorName: '댓글 작성자', content }} now={new Date()} />);
  expect(screen.queryByRole('button', { name: '번역하기' })).toBeNull();
  await user.longPress(screen.getByLabelText(/댓글 작성자, 작성자/));
  await user.press(screen.getByRole('button', { name: '번역하기' }));
  expect(await screen.findByText(`번역:${content}`)).toBeVisible();
  expect(screen.getByText('댓글 작성자')).toBeVisible();
  expect(screen.getByTestId('v2-community-comment-903-author-badge')).toHaveTextContent('작성자');
  expect(onReply).not.toHaveBeenCalled();
  await user.longPress(screen.getByLabelText(/댓글 작성자, 작성자/));
  await user.press(screen.getByRole('button', { name: '원문 보기' }));
  expect(screen.getByText(content)).toBeVisible();
});
