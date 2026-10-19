import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../app/testing/testProviders';
import { profileApi } from '../../user/profile/__tests__';
import { communityApi } from '../api/communityApi';
import CommunityEditScreen from '../screens/CommunityEditScreen';

beforeEach(() => {
  jest.spyOn(profileApi, 'getProfile').mockResolvedValue({ id: 42 } as never);
  jest.spyOn(communityApi, 'listCategories').mockResolvedValue({ categories: [{ categoryId: 'PLACE', categoryName: '장소' }, { categoryId: 'TRAVEL', categoryName: '여행' }] });
  jest.spyOn(communityApi, 'getPost').mockResolvedValue({
    postId: 7, title: '내가 작성한 실제 글', content: '기존 본문', author: { authorId: 42 },
    category: { categoryId: 'PLACE', categoryName: '장소' },
    images: [{ imageId: 70, imageUrl: 'https://cdn.test/70.jpg', position: 0 }],
    places: [{ placeId: 17, placeName: '실제 연결 장소', category: '공원', imageUrl: 'https://cdn.test/place.jpg' }],
  });
});

test('본인 글의 제목·본문·분류·사진·연결 장소로 수정 폼을 채운다', async () => {
  const create = jest.spyOn(communityApi, 'createPost');
  const remove = jest.spyOn(communityApi, 'deleteImage');
  const upload = jest.spyOn(communityApi, 'uploadImage');
  const view = await renderWithProviders(<CommunityEditScreen postId={7} onBack={jest.fn()} />);
  await screen.findByTestId('content-edit-screen');
  expect(screen.getByLabelText('제목').props.value).toBe('내가 작성한 실제 글');
  expect(screen.getByLabelText('본문').props.value).toBe('기존 본문');
  expect(screen.getByText('실제 연결 장소')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: '사진 1 삭제' }));
  await fireEvent.press(screen.getByRole('button', { name: '장소 삭제' }));
  await fireEvent.press(screen.getByTestId('content-edit-submit'));
  expect(create).not.toHaveBeenCalled();
  expect(remove).not.toHaveBeenCalled();
  expect(upload).not.toHaveBeenCalled();
  expect(view.queryClient.getQueryCache().getAll().some(query => (query.state.data as { title?: string } | undefined)?.title === '내가 작성한 실제 글')).toBe(true);
});

test('타인 글과 작성자를 확인할 수 없는 글은 수정 폼을 열지 않는다', async () => {
  jest.spyOn(profileApi, 'getProfile').mockResolvedValue({ id: 99 } as never);
  await renderWithProviders(<CommunityEditScreen postId={7} onBack={jest.fn()} />);
  expect(await screen.findByText('작성자 본인으로 로그인해야 수정할 수 있어요.')).toBeTruthy();
  expect(screen.queryByTestId('content-edit-screen')).toBeNull();
});

test('글 조회 실패는 빈 편집기를 만들지 않고 재시도를 제공한다', async () => {
  jest.spyOn(communityApi, 'getPost').mockRejectedValue(new Error('offline'));
  await renderWithProviders(<CommunityEditScreen postId={7} onBack={jest.fn()} />);
  expect(await screen.findByText('다시 시도')).toBeTruthy();
  expect(screen.queryByTestId('content-edit-screen')).toBeNull();
});


test.each([undefined, 0, -1])('사용자 ID가 %s이면 작성자 정보 누락을 본인으로 판단하지 않는다', async id => {
  jest.spyOn(profileApi, 'getProfile').mockResolvedValue({ id } as never);
  jest.spyOn(communityApi, 'getPost').mockResolvedValue({ postId: 7, title: '원문', content: '본문' });
  await renderWithProviders(<CommunityEditScreen postId={7} onBack={jest.fn()} />);
  expect(await screen.findByText('작성자 본인으로 로그인해야 수정할 수 있어요.')).toBeTruthy();
  expect(screen.queryByTestId('content-edit-screen')).toBeNull();
});
