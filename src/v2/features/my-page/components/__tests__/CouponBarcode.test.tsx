import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import CouponBarcode from '../CouponBarcode';

const CODE = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

async function layout(width: number) {
  await fireEvent(screen.getByTestId('v2-coupon-barcode'), 'layout', {
    nativeEvent: { layout: { height: 120, width, x: 0, y: 0 } },
  });
}

describe('CouponBarcode', () => {
  test('폭을 재기 전에는 바 자리만 잡고 코드는 이미 보여준다', async () => {
    await renderWithProviders(<CouponBarcode code={CODE} unavailableLabel="실패" />);

    expect(screen.queryByTestId('v2-coupon-barcode-svg')).toBeNull();
    expect(screen.getByTestId('v2-coupon-barcode-code'))
      .toHaveTextContent('3FA85F64-5717-4562-B3FC-2C963F66AFA6');
  });

  test('폭을 재고 나면 바코드를 그린다', async () => {
    await renderWithProviders(<CouponBarcode code={CODE} unavailableLabel="실패" />);

    await layout(274);

    expect(screen.getByTestId('v2-coupon-barcode-svg')).toBeTruthy();
    expect(screen.queryByText('실패')).toBeNull();
  });

  test('인코딩할 수 없는 코드는 안내 문구로 대체하고 코드는 남긴다', async () => {
    // CODE128은 ASCII만 인코딩하므로 비 ASCII 코드는 실패한다.
    await renderWithProviders(<CouponBarcode code={'쿠폰코드'} unavailableLabel="실패" />);

    await layout(274);

    expect(screen.getByText('실패')).toBeTruthy();
    expect(screen.getByTestId('v2-coupon-barcode-code')).toHaveTextContent('쿠폰코드');
  });
});
