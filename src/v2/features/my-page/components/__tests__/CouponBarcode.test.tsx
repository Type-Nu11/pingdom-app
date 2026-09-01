import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import CouponBarcode from '../CouponBarcode';

const CODE = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const ACCESSIBILITY_LABEL = '쿠폰 코드입니다. 화면의 코드를 직원에게 보여주세요.';

const barcode = (code = CODE) => (
  <CouponBarcode
    accessibilityLabel={ACCESSIBILITY_LABEL}
    code={code}
    unavailableLabel="실패"
  />
);

async function layout(width: number) {
  await fireEvent(screen.getByTestId('v2-coupon-barcode'), 'layout', {
    nativeEvent: { layout: { height: 120, width, x: 0, y: 0 } },
  });
}

describe('CouponBarcode', () => {
  test('폭을 재기 전에는 바 자리만 잡고 코드는 이미 보여준다', async () => {
    await renderWithProviders(barcode());

    expect(screen.queryByTestId('v2-coupon-barcode-svg', { includeHiddenElements: true }))
      .toBeNull();
    expect(screen.getByTestId('v2-coupon-barcode-code'))
      .toHaveTextContent('3FA85F64-5717-4562-B3FC-2C963F66AFA6');
  });

  test('폭을 재고 나면 바코드를 그린다', async () => {
    await renderWithProviders(barcode());

    await layout(274);

    expect(screen.getByTestId('v2-coupon-barcode-svg', { includeHiddenElements: true }))
      .toBeTruthy();
    expect(screen.queryByText('실패')).toBeNull();
  });

  test('바와 전체 코드는 스크린리더에서 숨기고 안전한 안내만 읽는다', async () => {
    await renderWithProviders(barcode());

    await layout(274);

    // 기본 쿼리는 접근성에서 숨겨진 요소를 제외한다. 바가 여기서 안 잡히면 숨겨진 것.
    expect(screen.queryByTestId('v2-coupon-barcode-svg')).toBeNull();
    // 전체 코드는 화면에는 보이지만 접근성 포커스는 안전한 안내를 사용한다.
    expect(screen.getByTestId('v2-coupon-barcode-code', { includeHiddenElements: true }))
      .toHaveTextContent('3FA85F64-5717-4562-B3FC-2C963F66AFA6');
    expect(screen.getByLabelText(ACCESSIBILITY_LABEL)).toBeTruthy();
    expect(screen.queryByLabelText(CODE)).toBeNull();
  });

  test('인코딩할 수 없는 코드는 안내 문구로 대체하고 코드는 남긴다', async () => {
    // CODE128은 ASCII만 인코딩하므로 비 ASCII 코드는 실패한다.
    await renderWithProviders(barcode('쿠폰코드'));

    await layout(274);

    expect(screen.getByText('실패')).toBeTruthy();
    expect(screen.getByTestId('v2-coupon-barcode-code')).toHaveTextContent('쿠폰코드');
  });
});
