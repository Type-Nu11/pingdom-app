import React from 'react';
import { screen } from '@testing-library/react-native';

import { createTestI18n, renderWithProviders } from '../../../../shared/testing/testProviders';
import { ApiError } from '../../../../shared/api';
import { registerOfferCouponResources } from '../../i18n/offerCouponResources';
import OfferCouponErrorState from '../OfferCouponErrorState';

async function renderState(ui: React.ReactElement) {
  const i18n = await createTestI18n('ko');
  registerOfferCouponResources(i18n);
  return renderWithProviders(ui, { i18n });
}

describe('OfferCouponErrorState', () => {
  test('소진(CAPACITY_EXCEEDED)은 품절 문구와 뒤로 가기 CTA를 보여준다', async () => {
    const onBack = jest.fn();
    const { user } = await renderState(
      <OfferCouponErrorState
        error={new ApiError('conflict', { status: 409, code: 'CAPACITY_EXCEEDED' })}
        onBack={onBack}
        onRetry={jest.fn()}
        surface="placeCta"
      />,
    );

    expect(screen.getByText('수량이 소진되었습니다')).toBeTruthy();
    expect(screen.queryByText('다시 시도')).toBeNull();
    await user.press(screen.getByText('뒤로 가기'));
    expect(onBack).toHaveBeenCalled();
  });

  test('서버 코드 없는 409는 원인을 단정하지 않고 보관함 확인으로 안내한다', async () => {
    const onViewWallet = jest.fn();
    const { user } = await renderState(
      <OfferCouponErrorState
        error={new ApiError('conflict', { status: 409 })}
        onViewWallet={onViewWallet}
        surface="placeCta"
      />,
    );

    expect(screen.getByText('발급하지 못했습니다')).toBeTruthy();
    await user.press(screen.getByText('보관함 확인'));
    expect(onViewWallet).toHaveBeenCalled();
  });

  test('처리할 수 없는 CTA는 버튼 없이 안내 문구만 남긴다', async () => {
    await renderState(
      <OfferCouponErrorState
        error={new ApiError('unauthorized', { status: 401, code: 'TOKEN_EXPIRED' })}
        onRetry={jest.fn()}
        surface="wallet"
      />,
    );

    expect(screen.getByText('로그인이 필요합니다')).toBeTruthy();
    expect(screen.queryByText('다시 로그인')).toBeNull();
    expect(screen.queryByText('다시 시도')).toBeNull();
  });

  test('전송 실패는 재시도 CTA를 보여준다', async () => {
    const onRetry = jest.fn();
    const { user } = await renderState(
      <OfferCouponErrorState
        error={new ApiError('offline', { isNetworkError: true })}
        onRetry={onRetry}
        surface="wallet"
      />,
    );

    expect(screen.getByText('연결에 문제가 있습니다')).toBeTruthy();
    await user.press(screen.getByText('다시 시도'));
    expect(onRetry).toHaveBeenCalled();
  });
});
