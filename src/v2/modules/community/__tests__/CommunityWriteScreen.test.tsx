import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../app/testing/testProviders';
import { ApiError } from '../../../shared/api';
import { usePlaceAutocomplete } from '../../place/search';
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

    await waitFor(() => expect(screen.getByTestId('v2-community-write-title-error')).toHaveTextContent('제목이 중복됩니다.'));
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
});
