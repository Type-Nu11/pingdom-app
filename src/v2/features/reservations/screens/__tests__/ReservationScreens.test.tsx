import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import ReservationDetailScreen from '../ReservationDetailScreen';
import VerificationReviewScreen from '../VerificationReviewScreen';
import VerificationScreen from '../VerificationScreen';

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

describe('V2 reservation screens', () => {
  test('예약 상세는 전달받은 실제 예약 식별자를 표시한다', async () => {
    const onBack = jest.fn();
    const { user } = await renderWithProviders(
      <ReservationDetailScreen onBack={onBack} reservationId={901} />,
    );

    expect(screen.getByText('901')).toBeVisible();
    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test('최근 방문 장소를 누르면 실제 장소 정보로 작성 화면을 연다', async () => {
    const onOpenPlace = jest.fn();
    const { user } = await renderWithProviders(
      <VerificationScreen onBack={jest.fn()} onOpenPlace={onOpenPlace} />,
    );

    await user.press(screen.getAllByRole('button', { name: /대성반점, 123m/ })[0]);

    expect(onOpenPlace).toHaveBeenCalledWith(expect.objectContaining({
      category: '음식점',
      placeName: '대성반점',
    }));
  });

  test('추천 이유 선택과 후기 입력을 사용자가 직접 변경할 수 있다', async () => {
    const { user } = await renderWithProviders(
      <VerificationReviewScreen
        category="음식점"
        imageUrl="https://example.com/place.jpg"
        onBack={jest.fn()}
        placeName="대성반점"
      />,
    );

    const delicious = screen.getByRole('checkbox', { name: '맛있어요' });
    expect(delicious.props.accessibilityState).toEqual({ checked: true });
    await user.press(delicious);
    expect(delicious.props.accessibilityState).toEqual({ checked: false });

    const reviewInput = screen.getByLabelText('후기 작성');
    await user.type(reviewInput, '직접 작성한 후기입니다.');
    expect(reviewInput.props.value).toBe('직접 작성한 후기입니다.');
    expect(screen.getByText('1')).toBeVisible();
  });
});
