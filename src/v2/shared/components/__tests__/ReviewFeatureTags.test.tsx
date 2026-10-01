import React from 'react';
import { act, screen } from '@testing-library/react-native';

import { REASON_CODES, normalizeReviewReasons, type ReviewReasonKey } from '../../api/reviewReasons';
import { renderWithProviders } from '../../../app/testing/testProviders';
import { ReviewFeatureTags } from '../ReviewFeatureTags';

const allReasons = Object.keys(REASON_CODES) as ReviewReasonKey[];

describe('ReviewFeatureTags', () => {
  test.each(['summary', 'full'] as const)('%s는 태그가 없으면 아무것도 렌더링하지 않는다', async (variant) => {
    const { toJSON } = await renderWithProviders(<ReviewFeatureTags reasons={[]} variant={variant} />);
    expect(screen.queryByTestId('review-feature-tags')).toBeNull();
    expect(toJSON()).toBeNull();
  });

  test('summary는 첫 칩과 나머지 개수를 보여준다', async () => {
    await renderWithProviders(<ReviewFeatureTags reasons={['delicious', 'photoSpot', 'kind', 'clean', 'parking']} variant="summary" />);
    expect(screen.getByText('맛있어요')).toBeTruthy();
    expect(screen.getByText('+4')).toBeTruthy();
    expect(screen.queryByText('사진 찍기 좋아요')).toBeNull();
    expect(screen.getByLabelText('추천 이유 4개 더 있음')).toBeTruthy();
  });

  test('summary는 태그가 하나면 +N 칩을 만들지 않는다', async () => {
    await renderWithProviders(<ReviewFeatureTags reasons={['kind']} variant="summary" />);
    expect(screen.getByText('친절해요')).toBeTruthy();
    expect(screen.queryByTestId('review-feature-tags-more')).toBeNull();
  });

  test('알 수 없는 코드는 정규화 단계에서 빠져 칩과 +N에 포함되지 않는다', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const reasons = normalizeReviewReasons(['SOMETHING_NEW', 'GOOD_FOOD', 'UNKNOWN', 'CLEAN']);
    await renderWithProviders(<ReviewFeatureTags reasons={reasons} variant="summary" />);
    expect(screen.getByText('+1')).toBeTruthy();
    expect(screen.queryByText(/SOMETHING_NEW|UNKNOWN/)).toBeNull();
    warn.mockRestore();
  });

  test('알 수 없는 코드만 있으면 영역이 렌더링되지 않는다', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { toJSON } = await renderWithProviders(<ReviewFeatureTags reasons={normalizeReviewReasons(['SOMETHING_NEW'])} variant="full" />);
    expect(toJSON()).toBeNull();
    warn.mockRestore();
  });

  test('full은 모든 칩을 순서대로 보여주고 +N은 없다', async () => {
    await renderWithProviders(<ReviewFeatureTags reasons={allReasons} variant="full" />);
    const chips = screen.getAllByTestId(/^review-feature-tags-[A-Za-z]+$/).filter((chip) => chip.props.testID !== 'review-feature-tags-more');
    expect(chips.map((chip) => chip.props.testID)).toEqual(allReasons.map((reason) => `review-feature-tags-${reason}`));
    expect(screen.queryByTestId('review-feature-tags-more')).toBeNull();
    expect(screen.getByText('다국어 설명이 잘 되어 있어요')).toBeTruthy();
  });

  test.each(allReasons)('%s 칩은 자기 아이콘 하나와 접근성 라벨을 가진다', async (reason) => {
    await renderWithProviders(<ReviewFeatureTags reasons={[reason]} variant="full" />);
    const chip = screen.getByTestId(`review-feature-tags-${reason}`);
    expect(chip).toHaveProp('accessible', true);
    expect(typeof chip.props.accessibilityLabel).toBe('string');
    expect(chip.props.accessibilityLabel.length).toBeGreaterThan(0);
    expect(screen.getByText(chip.props.accessibilityLabel)).toBeTruthy();
    expect(screen.getByTestId(`review-feature-tags-${reason}-icon`, { includeHiddenElements: true })).toBeTruthy();
  });

  test('앱 언어를 바꾸면 라벨이 바뀐다', async () => {
    const { i18n } = await renderWithProviders(<ReviewFeatureTags reasons={['delicious', 'clean']} variant="summary" />);
    expect(screen.getByText('맛있어요')).toBeTruthy();
    await act(() => i18n.changeLanguage('en'));
    expect(screen.getByText('Delicious')).toBeTruthy();
    expect(screen.getByLabelText('1 more reasons')).toBeTruthy();
    await act(() => i18n.changeLanguage('ja'));
    expect(screen.getByText('おいしい')).toBeTruthy();
  });

  test('라벨은 한 줄 말줄임이고 칩은 탭 대상이 아니다', async () => {
    await renderWithProviders(<ReviewFeatureTags reasons={['multilingual']} variant="full" />);
    expect(screen.getByText('다국어 설명이 잘 되어 있어요')).toHaveProp('numberOfLines', 1);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
