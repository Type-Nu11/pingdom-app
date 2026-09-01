import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import CouponBarcode from '../CouponBarcode';

const CODE = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const A11Y_LABEL = 'Coupon code ending in AFA6';

async function layout(width: number) {
  await fireEvent(screen.getByTestId('v2-coupon-barcode'), 'layout', {
    nativeEvent: { layout: { height: 120, width, x: 0, y: 0 } },
  });
}

describe('CouponBarcode', () => {
  test('폭을 재기 전에는 바 자리만 잡고 코드는 이미 보여준다', async () => {
    await renderWithProviders(
      <CouponBarcode code={CODE} codeAccessibilityLabel={A11Y_LABEL} unavailableLabel="실패" />,
    );

    expect(screen.queryByTestId('v2-coupon-barcode-svg', { includeHiddenElements: true }))
      .toBeNull();
    expect(screen.getByTestId('v2-coupon-barcode-code'))
      .toHaveTextContent('3FA85F64-5717-4562-B3FC-2C963F66AFA6');
  });

  test('폭을 재고 나면 바코드를 그린다', async () => {
    await renderWithProviders(
      <CouponBarcode code={CODE} codeAccessibilityLabel={A11Y_LABEL} unavailableLabel="실패" />,
    );

    await layout(274);

    expect(screen.getByTestId('v2-coupon-barcode-svg', { includeHiddenElements: true }))
      .toBeTruthy();
    expect(screen.queryByText('실패')).toBeNull();
  });

  test('바는 장식이라 스크린리더에 안 잡히고, 코드 라벨은 끝 네 자리만 읽힌다', async () => {
    await renderWithProviders(
      <CouponBarcode code={CODE} codeAccessibilityLabel={A11Y_LABEL} unavailableLabel="실패" />,
    );

    await layout(274);

    // 기본 쿼리는 접근성에서 숨겨진 요소를 제외한다. 바가 여기서 안 잡히면 숨겨진 것.
    expect(screen.queryByTestId('v2-coupon-barcode-svg')).toBeNull();

    // 화면에는 전체 코드가 보이지만, 스크린리더 라벨은 끝 네 자리로 마스킹된다.
    const codeText = screen.getByTestId('v2-coupon-barcode-code');
    expect(codeText).toHaveTextContent('3FA85F64-5717-4562-B3FC-2C963F66AFA6');
    expect(codeText.props.accessibilityLabel).toBe(A11Y_LABEL);
    expect(codeText.props.accessibilityLabel).not.toContain('3FA85F64');
  });

  test('인코딩할 수 없는 코드는 안내 문구로 대체하고 코드는 남긴다', async () => {
    // CODE128은 ASCII만 인코딩하므로 비 ASCII 코드는 실패한다.
    await renderWithProviders(
      <CouponBarcode code={'쿠폰코드'} codeAccessibilityLabel={A11Y_LABEL} unavailableLabel="실패" />,
    );

    await layout(274);

    expect(screen.getByText('실패')).toBeTruthy();
    expect(screen.getByTestId('v2-coupon-barcode-code')).toHaveTextContent('쿠폰코드');
  });
});
