import { render, screen, userEvent } from '@testing-library/react-native';

import {
  useReplaceTravelPurposes,
  useTravelPurposes,
} from '../../../../v2/features/travel-purposes';
import ApiCheckScreen from '../ApiCheckScreen';

jest.mock('../../../../v2/features/travel-purposes', () => ({
  TRAVEL_PURPOSE_MAX_SELECTIONS: 9,
  TRAVEL_PURPOSE_VALUES: [
    'K_POP',
    'BEAUTY',
    'FASHION',
    'CAFE',
    'FOOD',
    'POP_UP',
    'EXHIBITION',
    'NIGHTLIFE',
    'OTHER',
  ],
  useReplaceTravelPurposes: jest.fn(),
  useTravelPurposes: jest.fn(),
}));

const mockUseTravelPurposes = jest.mocked(useTravelPurposes);
const mockUseReplaceTravelPurposes = jest.mocked(useReplaceTravelPurposes);

describe('ApiCheckScreen', () => {
  test('GET 결과를 복원하고 변경된 선택을 PUT body로 전달한다', async () => {
    const mutate = jest.fn();
    mockUseTravelPurposes.mockReturnValue({
      data: { travelPurposes: ['K_POP'] },
      isError: false,
      isPending: false,
      isSuccess: true,
    } as ReturnType<typeof useTravelPurposes>);
    mockUseReplaceTravelPurposes.mockReturnValue({
      isError: false,
      isPending: false,
      isSuccess: false,
      mutate,
    } as unknown as ReturnType<typeof useReplaceTravelPurposes>);

    await render(<ApiCheckScreen onBack={jest.fn()} />);
    const user = userEvent.setup();

    expect(screen.getByText('200 조회 성공')).toBeVisible();
    expect(screen.getAllByText(/"K_POP"/).length).toBeGreaterThan(0);

    await user.press(screen.getByRole('button', { name: 'FOOD' }));
    await user.press(screen.getByRole('button', { name: 'PUT 저장하기' }));

    expect(mutate).toHaveBeenCalledWith({ travelPurposes: ['K_POP', 'FOOD'] });
  });
});
