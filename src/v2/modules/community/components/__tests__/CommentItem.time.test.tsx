import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../app/testing/testProviders';
import CommentItem from '../CommentItem';

test.each([
  '2026-10-20T12:00:00',
  '2026-10-20T12:00:00.123456',
  '2026-10-20T12:00:00Z',
  '2026-10-20T21:00:00+09:00',
])('a freshly written reply displays now for server timestamp %s', async createdAt => {
  await renderWithProviders(<CommentItem variant="reply"
    comment={{ commentId: 4, authorName: '답글 작성자', content: '방금 쓴 답글', createdAt }}
    now={new Date('2026-10-20T12:00:30Z')} />);
  expect(screen.getByText('현재 분')).toBeVisible();
  expect(screen.queryByText('9시간 전')).toBeNull();
});

test('an invalid comment timestamp is omitted rather than showing a fabricated relative time', async () => {
  await renderWithProviders(<CommentItem
    comment={{ commentId: 4, authorName: '작성자', content: '댓글', createdAt: 'not-a-date' }}
    now={new Date('2026-10-20T12:00:30Z')} />);
  expect(screen.getByText('댓글')).toBeVisible();
  expect(screen.queryByText(/NaN/)).toBeNull();
});
