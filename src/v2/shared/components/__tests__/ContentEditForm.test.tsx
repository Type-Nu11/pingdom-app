import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../app/testing/testProviders';
import ContentEditForm, { type EditPhotoPicker } from '../ContentEditForm';

const base = {
  heading: '글 수정하기', selectionTitle: '카테고리', selectionHint: '분류를 선택하세요',
  options: [{ id: 'PLACE', label: '장소' }, { id: 'TRAVEL', label: '여행' }],
  initialSelectedIds: ['PLACE'], initialTitle: '서버의 실제 제목', initialContent: '서버의 실제 본문',
  initialPhotos: [{ key: 'server:1', uri: 'https://cdn.test/1.jpg' }],
  maxPhotos: 10, maxContentLength: 5000, onBack: jest.fn(),
  pickPhotos: jest.fn<ReturnType<EditPhotoPicker>, Parameters<EditPhotoPicker>>(async () => ({ status: 'cancelled', uris: [] })),
};

test.each(['LIGHT', 'DARK'] as const)('%s 수정 폼은 원문과 기존 사진을 채우고 Figma 입력 구조를 유지한다', async appearancePreference => {
  await renderWithProviders(<ContentEditForm {...base} />, { appearancePreference });
  expect(screen.getByLabelText('제목').props.value).toBe(base.initialTitle);
  expect(screen.getByLabelText('본문').props.value).toBe(base.initialContent);
  expect(screen.getByRole('radio', { name: '장소' })).toBeChecked();
  expect(screen.getByLabelText('사진 1').props.source).toEqual({ uri: base.initialPhotos[0].uri });
  expect(screen.getByTestId('content-edit-body')).toHaveStyle({ height: 139, paddingTop: 14, paddingLeft: 12 });
  expect(screen.getByTestId('content-edit-submit')).toHaveStyle({ minHeight: 64 });
});

test('수정 후 원본 prop은 유지하고 API 없을 때 저장 완료로 표시하지 않는다', async () => {
  const dirty = jest.fn();
  const view = await renderWithProviders(<ContentEditForm {...base} onDirtyChange={dirty} />);
  await fireEvent.changeText(screen.getByLabelText('제목'), '로컬 수정 제목');
  await fireEvent.changeText(screen.getByLabelText('본문'), '로컬 수정 본문');
  await fireEvent.press(screen.getByRole('radio', { name: '여행' }));
  await fireEvent.press(screen.getByRole('button', { name: '사진 1 삭제' }));
  expect(base.initialTitle).toBe('서버의 실제 제목');
  expect(base.initialPhotos).toHaveLength(1);
  expect(dirty).toHaveBeenLastCalledWith(true);
  await fireEvent.press(screen.getByTestId('content-edit-submit'));
  expect(screen.getByLabelText('제목').props.value).toBe('로컬 수정 제목');
  expect(screen.getAllByText('수정 저장 기능을 준비 중이에요. 현재 변경 내용은 저장되지 않아요.').length).toBeGreaterThan(0);
  await view.rerender(<ContentEditForm {...base} initialContent="뒤늦은 서버 응답" onDirtyChange={dirty} />);
  expect(screen.getByLabelText('본문').props.value).toBe('로컬 수정 본문');
});

test('리뷰는 제목을 만들지 않고 추천 이유를 복수 선택한다', async () => {
  await renderWithProviders(<ContentEditForm {...base} initialTitle={undefined} selectionLimit={2} />);
  expect(screen.queryByLabelText('제목')).toBeNull();
  await fireEvent.press(screen.getByRole('checkbox', { name: '여행' }));
  expect(screen.getByRole('checkbox', { name: '장소' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: '여행' })).toBeChecked();
});

test('선택 사진은 로컬에서만 추가하고 허용 장수를 넘기지 않는다', async () => {
  const pickPhotos = jest.fn<ReturnType<EditPhotoPicker>, Parameters<EditPhotoPicker>>(async () => ({ status: 'selected', uris: ['file://1.jpg', 'file://1.jpg', 'file://2.jpg', 'file://3.jpg'] }));
  await renderWithProviders(<ContentEditForm {...base} maxPhotos={3} pickPhotos={pickPhotos} />);
  await fireEvent.press(screen.getByRole('button', { name: '사진 추가' }));
  expect(pickPhotos).toHaveBeenCalledWith(2);
  expect(await screen.findByLabelText('사진 3')).toBeTruthy();
  expect(screen.queryByLabelText('사진 4')).toBeNull();
});

test('사진 선택 중 중복 실행을 막고 이동 후 응답은 새 편집기에 반영하지 않는다', async () => {
  let resolve!: (result: Awaited<ReturnType<EditPhotoPicker>>) => void;
  const pickPhotos = jest.fn<ReturnType<EditPhotoPicker>, Parameters<EditPhotoPicker>>(() => new Promise(done => { resolve = done; }));
  const view = await renderWithProviders(<ContentEditForm {...base} pickPhotos={pickPhotos} />);
  await fireEvent.press(screen.getByRole('button', { name: '사진 추가' }));
  await fireEvent.press(screen.getByRole('button', { name: '사진 추가' }));
  expect(pickPhotos).toHaveBeenCalledTimes(1);
  await view.rerender(<ContentEditForm {...base} key="another-post" />);
  await act(() => resolve({ status: 'selected', uris: ['file://late.jpg'] }));
  expect(screen.queryByLabelText('사진 2')).toBeNull();
});
