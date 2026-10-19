import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Text as AppText } from '../../../../../shared/components/Typography';
import { ErrorState, HeaderBackButton, LoadingState } from '../../../../../shared/components';
import OwnerContentActions from '../../../../../shared/components/OwnerContentActions';
import { useMyReview } from '../../hooks/useProfile';

/** Resolve IDs exclusively through the signed-in user's reviews, never another visitor's review. */
export default function MyReviewScreen({ onBack, reviewId, onEdit }: { onBack: () => void; reviewId: number; onEdit?: (reviewId: number) => void }) {
  const { t, i18n } = useTranslation();
  const query = useMyReview(reviewId);
  const { review } = query;
  const date = review ? new Date(review.createdAt) : null;
  const dateLabel = date && Number.isFinite(date.getTime())
    ? date.toLocaleDateString(i18n.language) : review?.createdAt;

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-my-review-screen">
      <Header>
        <HeaderBackButton accessibilityLabel={t('myPage.back')} onPress={onBack} />
        <Title>{t('myPageActivity.reviewTitle')}</Title>
        {review ? <OwnerContentActions key={review.reviewId} onEdit={onEdit ? () => onEdit(review.reviewId) : undefined} /> : <Spacer />}
      </Header>
      {query.isError ? (
        <ErrorState fill actionLabel={t('myPage.retry')} description={t('myPage.verifiedPlaces.error')}
          onAction={() => void query.refetch()} />
      ) : review ? (
        <Content contentContainerStyle={CONTENT_STYLE}>
          <DateText>{dateLabel}</DateText>
          {review.visibilityStatus === 'HIDDEN' ? <DateText>{t('myPageActivity.reviewHidden')}</DateText> : null}
          <Body testID="v2-my-review-content">{review.content}</Body>
          {review.imageUrls.map((uri, index) => (
            <Photo key={`${index}-${uri}`} source={{ uri }} accessibilityLabel={t('myPageActivity.reviewPhoto', { index: index + 1 })} />
          ))}
        </Content>
      ) : query.isLoading || query.isFetching || query.hasNextPage ? (
        <LoadingState />
      ) : (
        <ErrorState fill description={t('myPageActivity.reviewUnavailable')} />
      )}
    </Screen>
  );
}
const CONTENT_STYLE = { padding: 24, gap: 16 } as const;
const Screen = styled(SafeAreaView)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
const Header = styled.View`flex-direction: row; align-items: center; justify-content: space-between; padding: 0 24px; min-height: 44px;`;
const Title = styled(AppText).attrs({ numberOfLines: 2 })`flex: 1; min-width: 0; text-align: center; font-size: 18px; font-weight: 700; color: ${({ theme }) => theme.colors.textStrong};`;
const Spacer = styled.View`width: 44px; flex-shrink: 0;`;
const Content = styled.ScrollView`flex: 1;`;
const DateText = styled(AppText)`font-size: 14px; color: ${({ theme }) => theme.colors.textMuted};`;
const Body = styled(AppText)`font-size: 16px; line-height: 24px; color: ${({ theme }) => theme.colors.textStrong};`;
const Photo = styled.Image`width: 100%; aspect-ratio: 1; border-radius: 16px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
