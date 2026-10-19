import { ReviewReasonIcon } from '../../../../../shared/components/ReviewReasonIcon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorState, LoadingState } from '../../../../../shared/components';
import ContentEditForm from '../../../../../shared/components/ContentEditForm';
import { useMyReview } from '../../hooks/useProfile';
import { MAX_PHOTOS, MAX_REASONS, MAX_REVIEW_LENGTH, RECOMMEND_REASONS, visitVerificationMediaPicker, type VisitVerificationMediaPicker } from '../../../../place/visit-verification';

export default function MyReviewEditScreen({ reviewId, onBack, onDirtyChange, mediaPicker = visitVerificationMediaPicker }: {
  reviewId: number; onBack: () => void; onDirtyChange?: (dirty: boolean) => void; mediaPicker?: VisitVerificationMediaPicker;
}) {
  const { t } = useTranslation();
  const query = useMyReview(reviewId);
  if (query.isError && !query.review) return <ErrorState fill description={t('myPage.verifiedPlaces.error')} actionLabel={t('myPage.retry')} onAction={() => void query.refetch()} />;
  if (query.isSearching) return <LoadingState fill />;
  const review = query.review;
  if (!review) return <ErrorState fill description={t('myPageActivity.reviewUnavailable')} />;
  return <ContentEditForm key={review.reviewId} heading={t('editContent.reviewHeading')}
    selectionTitle={t('editContent.features')} selectionHint={t('editContent.featuresHint')}
    options={RECOMMEND_REASONS.map(reason => ({ id: reason, label: t(`visitVerification.reasons.${reason}`), icon: <ReviewReasonIcon reason={reason} /> }))}
    initialSelectedIds={query.reasons} selectionLimit={MAX_REASONS} initialContent={review.content}
    initialPhotos={review.imageUrls.map((uri, index) => ({ key: `server:${review.reviewId}:${index}`, uri }))}
    maxPhotos={MAX_PHOTOS} maxContentLength={MAX_REVIEW_LENGTH} onBack={onBack} onDirtyChange={onDirtyChange}
    pickPhotos={async remaining => { const result = await mediaPicker.pickPhotos(remaining);
      return { status: result.status, uris: result.status === 'selected' ? result.photos.map(photo => photo.uri) : [] }; }} />;
}
