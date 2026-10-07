import React from 'react';
import { screen } from '@testing-library/react-native';

import { REASON_CODES, type ReviewReasonKey } from '../../api/reviewReasons';
import { renderWithProviders } from '../../../app/testing/testProviders';
import { REVIEW_REASON_ICONS, ReviewReasonIcon } from '../ReviewReasonIcon';

const reasons = Object.keys(REASON_CODES) as ReviewReasonKey[];

describe('ReviewReasonIcon', () => {
  test('모든 추천 이유 코드가 SVG 아이콘 하나씩을 가진다', () => {
    expect(Object.keys(REVIEW_REASON_ICONS).sort()).toEqual([...reasons].sort());
    for (const reason of reasons) expect(REVIEW_REASON_ICONS[reason].Icon).toBeDefined();
  });

  test.each(reasons)('%s 아이콘은 비율을 유지한 크기로 장식용으로 렌더링된다', async (reason) => {
    await renderWithProviders(<ReviewReasonIcon height={14} reason={reason} testID={`icon-${reason}`} />);
    const icon = screen.getByTestId(`icon-${reason}`, { includeHiddenElements: true });
    expect(icon).toHaveProp('height', 14);
    expect(icon).toHaveProp('width', (14 * REVIEW_REASON_ICONS[reason].viewBoxWidth) / 16);
    expect(icon).toHaveProp('accessibilityElementsHidden', true);
    expect(icon).toHaveProp('importantForAccessibility', 'no-hide-descendants');
  });
});
