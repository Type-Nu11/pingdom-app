import React from 'react';
import { Linking } from 'react-native';
import { act, screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../app/testing/testProviders';
import { ApiError } from '../../../shared/api';
import { usePlaceAutocomplete } from '../../place/search';
import type { MediaPickerResult, SelectedPhoto } from '../../place/visit-verification';
import { communityApi } from '../api/communityApi';
import CommunityWriteScreen from '../screens/CommunityWriteScreen';

jest.mock('../../place/search', () => ({
  ...jest.requireActual('../../place/search'),
  usePlaceAutocomplete: jest.fn(),
}));

const categoriesFixture = {
  categories: [
    { categoryId: 'TRAVEL', categoryName: '여행' },
    { categoryId: 'PLACE', categoryName: '장소' },
  ],
};

function renderScreen(props: Partial<React.ComponentProps<typeof CommunityWriteScreen>> = {}) {
  const defaultProps: React.ComponentProps<typeof CommunityWriteScreen> = {
    onBack: jest.fn(),
    onSubmitSuccess: jest.fn(),
    ...props,
  };
  return renderWithProviders(<CommunityWriteScreen {...defaultProps} />, { language: 'ko' });
}

type TestUser = Awaited<ReturnType<typeof renderScreen>>['user'];

async function fillValidGeneralForm(user: TestUser) {
  await user.type(screen.getByTestId('v2-community-write-title'), '제목입니다');
  await user.type(screen.getByTestId('v2-community-write-body'), '본문입니다');
}

describe('CommunityWriteScreen', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(communityApi, 'listCategories').mockResolvedValue(categoriesFixture);
    jest.mocked(usePlaceAutocomplete).mockReturnValue({
      data: undefined,
      isError: false,
      isFetching: false,
      refetch: jest.fn(),
    } as never);
  });

  test('장소 태그 제목 옆에 선택한 카테고리 이름을 보여준다', async () => {
    const { user } = await renderScreen();

    await waitFor(() => expect(screen.getByTestId('v2-community-write-place-category')).toHaveTextContent('여행'));
    await user.press(screen.getByTestId('v2-community-write-category-PLACE'));
    expect(screen.getByTestId('v2-community-write-place-category')).toHaveTextContent('장소');
  });

  test('Figma처럼 글자 수 카운터 없이 입력 길이만 제한한다', async () => {
    await renderScreen();

    await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());
    // The only n/m text on the screen is the Figma photo counter.
    expect(screen.queryAllByText(/^\d+\/\d+$/).map((node) => node.props.testID))
      .toEqual(['v2-community-write-photo-count']);
    expect(screen.getByTestId('v2-community-write-title').props.maxLength).toBeGreaterThan(0);
    expect(screen.getByTestId('v2-community-write-body').props.maxLength).toBeGreaterThan(0);
  });

  test('일반 카테고리는 장소 없이도 제출할 수 있다', async () => {
    const createPost = jest.spyOn(communityApi, 'createPost').mockResolvedValue({ placeIds: [], postId: 9001 });
    const onSubmitSuccess = jest.fn();
    const { user } = await renderScreen({ onSubmitSuccess });

    await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-write-category-TRAVEL'));
    await fillValidGeneralForm(user);
    await user.press(screen.getByTestId('v2-community-write-submit'));

    await waitFor(() => expect(createPost).toHaveBeenCalledWith({
      categoryId: 'TRAVEL',
      content: '본문입니다',
      title: '제목입니다',
    }));
    await waitFor(() => expect(onSubmitSuccess).toHaveBeenCalledWith({ placeIds: [], postId: 9001 }));
  });

  test('PLACE 카테고리는 장소를 선택하지 않으면 제출되지 않는다', async () => {
    const createPost = jest.spyOn(communityApi, 'createPost');
    const { user } = await renderScreen();

    await waitFor(() => expect(screen.getByTestId('v2-community-write-category-PLACE')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-write-category-PLACE'));
    await user.type(screen.getByTestId('v2-community-write-title'), '제목입니다');
    await user.type(screen.getByTestId('v2-community-write-body'), '본문입니다');
    await user.press(screen.getByTestId('v2-community-write-submit'));

    await waitFor(() => expect(screen.getByTestId('v2-community-write-place-error')).toBeVisible());
    expect(createPost).not.toHaveBeenCalled();
  });

  test('PLACE 카테고리에서 장소를 선택하면 placeIds와 함께 제출된다', async () => {
    jest.mocked(usePlaceAutocomplete).mockReturnValue({
      data: { places: [{ address: '서울', category: '카페', id: 17, name: '대소고' }] },
      isError: false,
      isFetching: false,
      refetch: jest.fn(),
    } as never);
    const createPost = jest.spyOn(communityApi, 'createPost').mockResolvedValue({ placeIds: [17], postId: 9002 });
    const onSubmitSuccess = jest.fn();
    const { user } = await renderScreen({ onSubmitSuccess });

    await waitFor(() => expect(screen.getByTestId('v2-community-write-category-PLACE')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-write-category-PLACE'));
    await user.type(screen.getByTestId('v2-community-write-title'), '제목입니다');
    await user.type(screen.getByTestId('v2-community-write-body'), '본문입니다');
    await user.press(screen.getByTestId('v2-community-write-add-place'));
    await user.type(screen.getByTestId('v2-community-place-picker-input'), '대소고');
    await waitFor(() => expect(screen.getByTestId('v2-community-place-picker-result-17')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-place-picker-result-17'));

    await waitFor(() => expect(screen.getByText('대소고')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-write-submit'));

    await waitFor(() => expect(createPost).toHaveBeenCalledWith({
      categoryId: 'PLACE',
      content: '본문입니다',
      placeIds: [17],
      title: '제목입니다',
    }));
    await waitFor(() => expect(onSubmitSuccess).toHaveBeenCalledWith({ placeIds: [17], postId: 9002 }));
  });

  test('일반 카테고리에서 PLACE로 전환해도 선택한 장소는 유지된다', async () => {
    jest.mocked(usePlaceAutocomplete).mockReturnValue({
      data: { places: [{ address: '서울', category: '카페', id: 17, name: '대소고' }] },
      isError: false,
      isFetching: false,
      refetch: jest.fn(),
    } as never);
    const { user } = await renderScreen({ initialCategoryId: 'TRAVEL' });

    await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-write-add-place'));
    await user.type(screen.getByTestId('v2-community-place-picker-input'), '대소고');
    await waitFor(() => expect(screen.getByTestId('v2-community-place-picker-result-17')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-place-picker-result-17'));
    await waitFor(() => expect(screen.getByText('대소고')).toBeVisible());

    await user.press(screen.getByTestId('v2-community-write-category-PLACE'));

    expect(screen.getByText('대소고')).toBeVisible();
    expect(screen.queryByTestId('v2-community-write-place-error')).toBeNull();
  });

  test('실패하면 입력이 초기화되지 않고 유지된다', async () => {
    jest.spyOn(communityApi, 'createPost').mockRejectedValue(new ApiError('실패', { status: 500 }));
    const { user } = await renderScreen();

    await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-write-category-TRAVEL'));
    await fillValidGeneralForm(user);
    await user.press(screen.getByTestId('v2-community-write-submit'));

    await waitFor(() => expect(screen.getByTestId('v2-community-write-error-banner')).toBeVisible());
    expect(screen.getByTestId('v2-community-write-title').props.value).toBe('제목입니다');
    expect(screen.getByTestId('v2-community-write-body').props.value).toBe('본문입니다');
  });

  test('제출이 진행 중일 때 연타해도 요청은 한 번만 발생한다', async () => {
    let resolveCreate!: (value: { placeIds: number[]; postId: number }) => void;
    const createPost = jest.spyOn(communityApi, 'createPost').mockImplementation(
      () => new Promise((resolve) => { resolveCreate = resolve; }),
    );
    const { user } = await renderScreen();

    await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-write-category-TRAVEL'));
    await fillValidGeneralForm(user);

    const submitButton = screen.getByTestId('v2-community-write-submit');
    // Fired back-to-back before the in-flight request settles: the second tap
    // must be swallowed by the submission guard, not queued as a new request.
    await user.press(submitButton);
    await user.press(submitButton);
    await user.press(submitButton);

    expect(createPost).toHaveBeenCalledTimes(1);
    resolveCreate({ placeIds: [], postId: 1 });
    await waitFor(() => expect(screen.queryByTestId('v2-community-write-submit')).toBeTruthy());
  });

  test('400 필드 오류는 해당 입력 아래 서버 메시지를 보여준다', async () => {
    jest.spyOn(communityApi, 'createPost').mockRejectedValue(new ApiError('검증 실패', {
      code: 'VALIDATION_FAILED',
      fieldErrors: [{ field: 'title', reason: '제목이 중복됩니다.' }],
      status: 400,
    }));
    const { user } = await renderScreen();

    await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-write-category-TRAVEL'));
    await fillValidGeneralForm(user);
    await user.press(screen.getByTestId('v2-community-write-submit'));

    await waitFor(() => expect(screen.getByTestId('v2-community-write-title-error')).toHaveTextContent('입력한 정보를 확인한 후 다시 시도해 주세요.'));
  });

  test('필드 정보 없는 400 오류는 배너와 재시도 버튼을 보여준다', async () => {
    const createPost = jest.spyOn(communityApi, 'createPost').mockRejectedValue(new ApiError('실패', { status: 400 }));
    const { user } = await renderScreen();

    await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-write-category-TRAVEL'));
    await fillValidGeneralForm(user);
    await user.press(screen.getByTestId('v2-community-write-submit'));

    await waitFor(() => expect(screen.getByTestId('v2-community-write-retry')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-write-retry'));
    await waitFor(() => expect(createPost).toHaveBeenCalledTimes(2));
  });

  test('401 오류는 배너와 재로그인 버튼을 보여준다', async () => {
    jest.spyOn(communityApi, 'createPost').mockRejectedValue(new ApiError('만료', { status: 401 }));
    const onSignIn = jest.fn();
    const { user } = await renderScreen({ onSignIn });

    await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-write-category-TRAVEL'));
    await fillValidGeneralForm(user);
    await user.press(screen.getByTestId('v2-community-write-submit'));

    await waitFor(() => expect(screen.getByTestId('v2-community-write-sign-in')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-write-sign-in'));
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });

  test('403 오류는 버튼 없이 배너만 보여주고, 제출을 막는다', async () => {
    const createPost = jest.spyOn(communityApi, 'createPost')
      .mockRejectedValue(new ApiError('권한 없음', { status: 403 }));
    const { user } = await renderScreen();

    await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-write-category-TRAVEL'));
    await fillValidGeneralForm(user);
    await user.press(screen.getByTestId('v2-community-write-submit'));

    await waitFor(() => expect(screen.getByTestId('v2-community-write-error-banner')).toBeVisible());
    expect(screen.queryByTestId('v2-community-write-sign-in')).toBeNull();
    expect(screen.queryByTestId('v2-community-write-retry')).toBeNull();

    expect(screen.getByTestId('v2-community-write-submit').props.accessibilityState.disabled).toBe(true);
    await user.press(screen.getByTestId('v2-community-write-submit'));
    expect(createPost).toHaveBeenCalledTimes(1);
  });

  test('404 오류는 연결 장소 안내 문구를 보여주고 화면을 벗어나지 않는다', async () => {
    jest.spyOn(communityApi, 'createPost').mockRejectedValue(
      new ApiError('연결 장소 없음', { code: 'PLACE_NOT_FOUND', status: 404 }),
    );
    const onBack = jest.fn();
    const { user } = await renderScreen({ onBack });

    await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-write-category-TRAVEL'));
    await fillValidGeneralForm(user);
    await user.press(screen.getByTestId('v2-community-write-submit'));

    await waitFor(() => expect(screen.getByText('연결한 장소 중 하나를 찾을 수 없어요. 삭제하고 다시 선택해 주세요.')).toBeVisible());
    expect(onBack).not.toHaveBeenCalled();
    expect(screen.getByTestId('v2-community-write-title').props.value).toBe('제목입니다');
  });

  test('네트워크 오류는 중복 경고와 재시도 버튼을 보여주고, 재시도하면 다시 요청한다', async () => {
    const createPost = jest.spyOn(communityApi, 'createPost').mockRejectedValue(
      new ApiError('네트워크 실패', { isNetworkError: true }),
    );
    const { user } = await renderScreen();

    await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-write-category-TRAVEL'));
    await fillValidGeneralForm(user);
    await user.press(screen.getByTestId('v2-community-write-submit'));

    await waitFor(() => expect(screen.getByTestId('v2-community-write-retry')).toBeVisible());
    expect(screen.getByText('이미 게시글이 등록되었을 수 있어요. 다시 시도하기 전에 목록을 확인해 주세요.')).toBeVisible();

    await user.press(screen.getByTestId('v2-community-write-retry'));
    await waitFor(() => expect(createPost).toHaveBeenCalledTimes(2));
  });

  test('입력이 있으면 onDirtyChange(true)를, 초기에는 false를 알린다', async () => {
    const onDirtyChange = jest.fn();
    const { user } = await renderScreen({ onDirtyChange });

    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
    await user.type(screen.getByTestId('v2-community-write-title'), '제');
    await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(true));
  });

  test('initialCategoryId로 전달된 카테고리가 기본 선택된다', async () => {
    await renderScreen({ initialCategoryId: 'PLACE' });

    await waitFor(() => expect(screen.getByTestId('v2-community-write-category-PLACE'))
      .toHaveProp('accessibilityState', { selected: true }));
  });

  test('선택한 장소를 공통 장소 카드로 보여주고 X로 삭제한다', async () => {
    jest.mocked(usePlaceAutocomplete).mockReturnValue({
      data: { places: [{ address: '서울', category: '카페', id: 17, name: '대소고' }] },
      isError: false,
      isFetching: false,
      refetch: jest.fn(),
    } as never);
    const { user } = await renderScreen();

    await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-write-add-place'));
    await user.type(screen.getByTestId('v2-community-place-picker-input'), '대소고');
    await waitFor(() => expect(screen.getByTestId('v2-community-place-picker-result-17')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-place-picker-result-17'));

    // The search contract has a category but no thumbnail or region.
    await waitFor(() => expect(screen.getByTestId('v2-community-write-place-17-meta')).toHaveTextContent('카페'));
    expect(screen.queryByTestId('v2-community-write-place-17-thumbnail')).toBeNull();
    expect(screen.getByLabelText('대소고 삭제')).toHaveStyle({ height: 32, width: 32 });

    await user.press(screen.getByTestId('v2-community-write-remove-place-17'));

    await waitFor(() => expect(screen.queryByTestId('v2-community-write-place-17')).toBeNull());
  });

  describe('사진 첨부', () => {
    const picked = (count: number): SelectedPhoto[] => Array.from({ length: count }, (_value, index) => ({
      fileName: `photo-${index}.jpg`,
      height: 100,
      mimeType: 'image/jpeg',
      uri: `file:///photos/photo-${index}.jpg`,
      width: 100,
    }));

    function createPicker(...results: MediaPickerResult[]) {
      const pickPhotos = jest.fn<Promise<MediaPickerResult>, [number]>();
      results.forEach((result) => pickPhotos.mockResolvedValueOnce(result));
      return { pickPhotos };
    }

    function mockUploads() {
      let nextId = 100;
      return jest.spyOn(communityApi, 'uploadImage').mockImplementation(async () => {
        nextId += 1;
        return { imageId: nextId, imageUrl: `https://cdn.test/${nextId}.jpg` };
      });
    }

    beforeEach(() => {
      jest.spyOn(communityApi, 'deleteImage').mockResolvedValue(undefined);
    });

    test('사진이 없으면 0/10을 보여주고 imageIds 없이 등록한다', async () => {
      const createPost = jest.spyOn(communityApi, 'createPost').mockResolvedValue({ placeIds: [], postId: 1 });
      const { user } = await renderScreen({ mediaPicker: createPicker() });
      await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());

      expect(screen.getByTestId('v2-community-write-photo-count')).toHaveTextContent('0/10');
      expect(screen.getByText('최대 10장까지 첨부할 수 있어요')).toBeVisible();
      await fillValidGeneralForm(user);
      await user.press(screen.getByTestId('v2-community-write-submit'));

      await waitFor(() => expect(createPost).toHaveBeenCalledTimes(1));
      expect(createPost.mock.calls[0][0]).not.toHaveProperty('imageIds');
    });

    test('고른 사진을 72px 미리보기로 보여주고 업로드한 ID를 고른 순서대로 등록한다', async () => {
      const uploadImage = mockUploads();
      const createPost = jest.spyOn(communityApi, 'createPost').mockResolvedValue({ placeIds: [], postId: 1 });
      const mediaPicker = createPicker({ photos: picked(2), status: 'selected' });
      const { user } = await renderScreen({ mediaPicker });
      await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());

      await user.press(screen.getByTestId('v2-community-write-photo-picker'));

      await waitFor(() => expect(screen.getByTestId('v2-community-write-photo-count')).toHaveTextContent('2/10'));
      expect(mediaPicker.pickPhotos).toHaveBeenCalledWith(10);
      expect(screen.getByTestId('v2-community-write-photo-0')).toHaveStyle({ height: 72, width: 72 });
      expect(screen.getByTestId('v2-community-write-photo-picker')).toHaveStyle({ backgroundColor: '#EFEFEF', height: 72, width: 73 });
      expect(screen.getByTestId('v2-community-write-photo-0-remove')).toHaveStyle({ height: 20, right: 4, top: 4, width: 20 });
      expect(screen.getByLabelText('첨부한 사진 2').props.source).toEqual({ uri: 'file:///photos/photo-1.jpg' });
      await waitFor(() => expect(uploadImage).toHaveBeenCalledTimes(2));
      await waitFor(() => expect(screen.queryByTestId('v2-community-write-photo-1-uploading')).toBeNull());

      await fillValidGeneralForm(user);
      await user.press(screen.getByTestId('v2-community-write-submit'));

      await waitFor(() => expect(createPost).toHaveBeenCalledTimes(1));
      expect(createPost.mock.calls[0][0]).toMatchObject({ imageIds: [101, 102] });
    });

    test('선택을 취소하면 첨부가 그대로이고 업로드하지 않는다', async () => {
      const uploadImage = mockUploads();
      const { user } = await renderScreen({ mediaPicker: createPicker({ photos: [], status: 'cancelled' }) });
      await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());

      await user.press(screen.getByTestId('v2-community-write-photo-picker'));

      await waitFor(() => expect(screen.getByTestId('v2-community-write-photo-picker')).not.toBeDisabled());
      expect(screen.getByTestId('v2-community-write-photo-count')).toHaveTextContent('0/10');
      expect(uploadImage).not.toHaveBeenCalled();
      expect(screen.queryByTestId('v2-community-write-photo-permission')).toBeNull();
    });

    test('사진을 삭제하면 미리보기와 장수가 줄고 서버 이미지를 정리한다', async () => {
      mockUploads();
      const { user } = await renderScreen({ mediaPicker: createPicker({ photos: picked(2), status: 'selected' }) });
      await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());
      await user.press(screen.getByTestId('v2-community-write-photo-picker'));
      await waitFor(() => expect(screen.queryByTestId('v2-community-write-photo-1-uploading')).toBeNull());

      await user.press(screen.getByTestId('v2-community-write-photo-0-remove'));

      await waitFor(() => expect(screen.getByTestId('v2-community-write-photo-count')).toHaveTextContent('1/10'));
      expect(screen.queryByTestId('v2-community-write-photo-1')).toBeNull();
      expect(communityApi.deleteImage).toHaveBeenCalledWith(101);
    });

    test('10장이 차면 선택 버튼을 막고 남은 장수만큼만 고르게 한다', async () => {
      mockUploads();
      const mediaPicker = createPicker(
        { photos: picked(7), status: 'selected' },
        { photos: picked(5), status: 'selected' },
      );
      const { user } = await renderScreen({ mediaPicker });
      await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());

      await user.press(screen.getByTestId('v2-community-write-photo-picker'));
      await waitFor(() => expect(screen.getByTestId('v2-community-write-photo-count')).toHaveTextContent('7/10'));
      await user.press(screen.getByTestId('v2-community-write-photo-picker'));

      await waitFor(() => expect(screen.getByTestId('v2-community-write-photo-count')).toHaveTextContent('10/10'));
      expect(mediaPicker.pickPhotos).toHaveBeenLastCalledWith(3);
      expect(screen.getByTestId('v2-community-write-photo-picker')).toBeDisabled();
      expect(screen.queryByTestId('v2-community-write-photo-10')).toBeNull();
    });

    test('업로드가 실패하면 등록을 막고, 재시도에 성공하면 등록할 수 있다', async () => {
      const uploadImage = jest.spyOn(communityApi, 'uploadImage')
        .mockRejectedValueOnce(new ApiError('Network error', { isNetworkError: true }))
        .mockResolvedValueOnce({ imageId: 301, imageUrl: 'https://cdn.test/301.jpg' });
      const createPost = jest.spyOn(communityApi, 'createPost').mockResolvedValue({ placeIds: [], postId: 1 });
      const { user } = await renderScreen({ mediaPicker: createPicker({ photos: picked(1), status: 'selected' }) });
      await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());
      await fillValidGeneralForm(user);

      await user.press(screen.getByTestId('v2-community-write-photo-picker'));
      await waitFor(() => expect(screen.getByTestId('v2-community-write-photo-error')).toBeVisible());
      await user.press(screen.getByTestId('v2-community-write-submit'));
      expect(createPost).not.toHaveBeenCalled();

      await user.press(screen.getByTestId('v2-community-write-photo-0-failed'));

      await waitFor(() => expect(screen.queryByTestId('v2-community-write-photo-error')).toBeNull());
      expect(uploadImage).toHaveBeenCalledTimes(2);
      await user.press(screen.getByTestId('v2-community-write-submit'));
      await waitFor(() => expect(createPost).toHaveBeenCalledTimes(1));
      expect(createPost.mock.calls[0][0]).toMatchObject({ imageIds: [301] });
    });

    test('업로드 중에는 등록 요청을 보내지 않고 안내한다', async () => {
      let finishUpload: (value: { imageId: number; imageUrl: string }) => void = () => {};
      jest.spyOn(communityApi, 'uploadImage').mockImplementation(
        () => new Promise((resolve) => { finishUpload = resolve; }),
      );
      const createPost = jest.spyOn(communityApi, 'createPost').mockResolvedValue({ placeIds: [], postId: 1 });
      const { user } = await renderScreen({ mediaPicker: createPicker({ photos: picked(1), status: 'selected' }) });
      await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());
      await fillValidGeneralForm(user);
      await user.press(screen.getByTestId('v2-community-write-photo-picker'));
      await waitFor(() => expect(screen.getByTestId('v2-community-write-photo-0-uploading')).toBeVisible());

      await user.press(screen.getByTestId('v2-community-write-submit'));
      await user.press(screen.getByTestId('v2-community-write-submit'));

      expect(createPost).not.toHaveBeenCalled();
      expect(screen.getByTestId('v2-community-write-photo-in-progress')).toBeVisible();

      await act(async () => { finishUpload({ imageId: 401, imageUrl: 'https://cdn.test/401.jpg' }); });
      await waitFor(() => expect(screen.queryByTestId('v2-community-write-photo-in-progress')).toBeNull());
      await user.press(screen.getByTestId('v2-community-write-submit'));
      await waitFor(() => expect(createPost).toHaveBeenCalledTimes(1));
    });

    test('게시글 등록이 실패하면 입력과 사진을 유지하고 같은 사진으로 다시 등록한다', async () => {
      mockUploads();
      const createPost = jest.spyOn(communityApi, 'createPost')
        .mockRejectedValueOnce(new ApiError('실패', { status: 500 }))
        .mockResolvedValueOnce({ placeIds: [], postId: 1 });
      const { user } = await renderScreen({ mediaPicker: createPicker({ photos: picked(2), status: 'selected' }) });
      await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());
      await fillValidGeneralForm(user);
      await user.press(screen.getByTestId('v2-community-write-photo-picker'));
      await waitFor(() => expect(screen.queryByTestId('v2-community-write-photo-1-uploading')).toBeNull());

      await user.press(screen.getByTestId('v2-community-write-submit'));

      await waitFor(() => expect(screen.getByTestId('v2-community-write-error-banner')).toBeVisible());
      expect(screen.getByTestId('v2-community-write-title').props.value).toBe('제목입니다');
      expect(screen.getByTestId('v2-community-write-photo-count')).toHaveTextContent('2/10');
      expect(communityApi.deleteImage).not.toHaveBeenCalled();

      await user.press(screen.getByTestId('v2-community-write-retry'));

      await waitFor(() => expect(createPost).toHaveBeenCalledTimes(2));
      expect(createPost.mock.calls[1][0]).toMatchObject({ imageIds: [101, 102] });
      expect(communityApi.uploadImage).toHaveBeenCalledTimes(2);
    });

    test('등록에 성공하면 첨부한 이미지를 지우지 않고, 등록 없이 나가면 정리한다', async () => {
      mockUploads();
      jest.spyOn(communityApi, 'createPost').mockResolvedValue({ placeIds: [], postId: 1 });
      const onSubmitSuccess = jest.fn();
      const first = await renderScreen({
        mediaPicker: createPicker({ photos: picked(1), status: 'selected' }),
        onSubmitSuccess,
      });
      await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());
      await fillValidGeneralForm(first.user);
      await first.user.press(screen.getByTestId('v2-community-write-photo-picker'));
      await waitFor(() => expect(screen.queryByTestId('v2-community-write-photo-0-uploading')).toBeNull());
      await first.user.press(screen.getByTestId('v2-community-write-submit'));
      await waitFor(() => expect(onSubmitSuccess).toHaveBeenCalledTimes(1));
      await act(async () => { first.unmount(); });
      expect(communityApi.deleteImage).not.toHaveBeenCalled();

      const second = await renderScreen({ mediaPicker: createPicker({ photos: picked(1), status: 'selected' }) });
      await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());
      await second.user.press(screen.getByTestId('v2-community-write-photo-picker'));
      await waitFor(() => expect(screen.queryByTestId('v2-community-write-photo-0-uploading')).toBeNull());
      await act(async () => { second.unmount(); });

      expect(communityApi.deleteImage).toHaveBeenCalledWith(102);
    });

    test('사진 권한이 거부되면 안내와 설정 이동을 제공한다', async () => {
      const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
      const { user } = await renderScreen({ mediaPicker: createPicker({ photos: [], status: 'denied' }) });
      await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());

      await user.press(screen.getByTestId('v2-community-write-photo-picker'));

      expect(await screen.findByText('사진을 첨부하려면 설정에서 사진 접근을 허용해 주세요.')).toBeVisible();
      await user.press(screen.getByTestId('v2-community-write-photo-settings'));
      expect(openSettings).toHaveBeenCalledTimes(1);
    });

    test('사진을 첨부하면 작성 중 상태로 알린다', async () => {
      mockUploads();
      const onDirtyChange = jest.fn();
      const { user } = await renderScreen({
        mediaPicker: createPicker({ photos: picked(1), status: 'selected' }),
        onDirtyChange,
      });
      await waitFor(() => expect(screen.getByTestId('v2-community-write-category-TRAVEL')).toBeVisible());

      await user.press(screen.getByTestId('v2-community-write-photo-picker'));

      await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(true));
    });
  });
});
