import React from 'react';
import { Dimensions } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../../../../app/testing/testProviders';
import VerifiedPlaceCard from '../VerifiedPlaceCard';
import VerifiedPlaceCardSkeleton from '../VerifiedPlaceCardSkeleton';

const props = {
  address: '경상남도 진주시 아주 긴 도로명 주소 123',
  favorited: false,
  imageUrl: 'https://cdn.test/place.jpg',
  name: '촉석루',
  onPress: jest.fn(),
  onToggleFavorite: jest.fn(),
};

test.each([157.5, 171, 230])('카드와 스켈레톤 폭 %s 및 이미지와 그라디언트를 함께 변경한다', async (width) => {
  await renderWithProviders(<><VerifiedPlaceCard {...props} width={width} /><VerifiedPlaceCardSkeleton width={width} /></>);
  expect(screen.getByTestId('v2-verified-place-card')).toHaveStyle({ width, height: 222 });
  expect(screen.getByTestId('v2-verified-place-card-skeleton')).toHaveStyle({ width, height: 222 });
  expect(screen.getByTestId('v2-verified-place-card-image')).toHaveStyle({ width: '100%', height: '100%' });
  expect(screen.getByTestId('v2-verified-place-card-gradient').props).toMatchObject({ width: '100%', height: '100%' });
  expect(screen.getByTestId('v2-verified-place-card-overlay')).toHaveStyle({ left: 0, right: 0, paddingTop: 35, paddingBottom: 12 });
});

test.each([
  ['LIGHT', 'rgba(0, 0, 0, 0.12)'],
  ['DARK', 'rgba(0, 0, 0, 0.40)'],
] as const)('%s 모드에서 카드 아래 Shadow/Float 그림자와 사진 위 흰 글자를 쓴다', async (appearancePreference, shadow) => {
  await renderWithProviders(<VerifiedPlaceCard {...props} />, { appearancePreference });
  expect(screen.getByTestId('v2-verified-place-card-shadow')).toHaveStyle({
    borderBottomLeftRadius: 16,
    boxShadow: `0px 4px 20px 0px ${shadow}`,
  });
  expect(screen.getByTestId('v2-verified-place-card')).toHaveStyle({ borderTopLeftRadius: 16, overflow: 'hidden' });
  expect(screen.getByText(props.name)).toHaveStyle({ color: '#FFFFFF', fontFamily: 'PretendardStdVariable-Bold', fontSize: 16, lineHeight: 21 });
  expect(screen.getByText(props.address)).toHaveStyle({ color: '#FFFFFF', fontFamily: 'PretendardStdVariable-Medium', fontSize: 12, lineHeight: 16 });
  expect(screen.getByTestId('favorite-icon')).toHaveProp('color', '#FFFFFF');
});

test('즐겨찾기 중첩 클릭은 전파를 막고 카드 클릭은 그대로 동작한다', async () => {
  await renderWithProviders(<VerifiedPlaceCard {...props} width={157.5} />);
  const stopPropagation = jest.fn();
  await fireEvent.press(screen.getByRole('button', { name: '장소 저장' }), { stopPropagation });
  expect(stopPropagation).toHaveBeenCalledTimes(1);
  expect(props.onToggleFavorite).toHaveBeenCalledTimes(1);
  expect(props.onPress).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByTestId('v2-verified-place-card'));
  expect(props.onPress).toHaveBeenCalledTimes(1);
});

test('이미지 오류와 누락은 fallback을 표시하고 새 URL은 다시 로드한다', async () => {
  const { rerender } = await renderWithProviders(<VerifiedPlaceCard {...props} width={157.5} />);
  await fireEvent(screen.getByTestId('v2-verified-place-card-image'), 'error');
  expect(screen.queryByTestId('v2-verified-place-card-image')).toBeNull();
  expect(screen.getByTestId('v2-verified-place-card-fallback')).toHaveStyle({ width: '100%', height: '100%' });
  await rerender(<VerifiedPlaceCard {...props} width={157.5} imageUrl="https://cdn.test/new.jpg" />);
  expect(screen.getByTestId('v2-verified-place-card-image').props.source.uri).toBe('https://cdn.test/new.jpg');
  await rerender(<VerifiedPlaceCard {...props} imageUrl={null} />);
  expect(screen.getByTestId('v2-verified-place-card-fallback')).toBeTruthy();
});

// Jest does not run native text/Yoga layout. These assert the layout and scaling
// contracts; native wrapping and visual clipping still need device verification.
test.each([
  ['ko', '아주아주긴한국어장소명이여러줄에걸쳐표시되는검증장소'],
  ['en', 'An Extremely Long Verified Place Name WithoutEnoughSpace'],
] as const)('%s 긴 이름과 확대 글꼴에서도 버튼 공간과 열 폭 계약을 유지한다', async (language, name) => {
  const original = Dimensions.get('window');
  try {
    await act(() => Dimensions.set({ window: { ...original, fontScale: 2 } }));
    await renderWithProviders(<VerifiedPlaceCard {...props} name={name} width={130} />, { language });
    expect(screen.getByTestId('v2-verified-place-card')).toHaveStyle({ width: 130, flexGrow: 0, flexShrink: 0 });
    expect(screen.getByText(name).props).toMatchObject({ numberOfLines: 2, maxFontSizeMultiplier: 2 });
    expect(screen.getByText(props.address).props).toMatchObject({ numberOfLines: 1, maxFontSizeMultiplier: 2 });
    expect(screen.getByTestId('v2-verified-place-card-text')).toHaveStyle({ flexGrow: 1, flexShrink: 1, minWidth: 0 });
    const favorite = screen.getAllByRole('button').find((button) => button.props.accessibilityState?.selected === false);
    expect(favorite).toHaveStyle({ width: 28, height: 28, flexShrink: 0 });
  } finally {
    await act(() => Dimensions.set({ window: original }));
  }
});
