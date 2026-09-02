import React from 'react';
import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import CouponQrCode from '../CouponQrCode';

jest.mock('react-native-qrcode-svg', () => {
  const React = require('react');
  const { View } = require('react-native');

  return function MockQrCode(props: Record<string, unknown>) {
    return React.createElement(View, props);
  };
});

const CODE = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const A11Y_LABEL = 'Coupon code ending in AFA6';

describe('CouponQrCode', () => {
  test('서버 Coupon code만 QR payload로 사용한다', async () => {
    await renderWithProviders(
      <CouponQrCode
        code={CODE}
        codeAccessibilityLabel={A11Y_LABEL}
        unavailableLabel="실패"
      />,
    );

    const qr = screen.getByTestId('v2-coupon-qr-image', { includeHiddenElements: true });
    expect(qr.props.value).toBe(CODE);
  });

  test('전체 코드는 보이고 선택 가능하지만 접근성 라벨은 마스킹한다', async () => {
    await renderWithProviders(
      <CouponQrCode
        code={CODE}
        codeAccessibilityLabel={A11Y_LABEL}
        unavailableLabel="실패"
      />,
    );

    const codeText = screen.getByTestId('v2-coupon-qr-code');
    expect(codeText).toHaveTextContent('3FA85F64-5717-4562-B3FC-2C963F66AFA6');
    expect(codeText.props.accessibilityLabel).toBe(A11Y_LABEL);
    expect(codeText.props.accessibilityLabel).not.toContain('3FA85F64');
    expect(codeText.props.selectable).toBe(true);
  });

  test('QR 그래픽은 스크린리더에서 숨긴다', async () => {
    await renderWithProviders(
      <CouponQrCode
        code={CODE}
        codeAccessibilityLabel={A11Y_LABEL}
        unavailableLabel="실패"
      />,
    );

    expect(screen.queryByTestId('v2-coupon-qr-image')).toBeNull();
  });
});
