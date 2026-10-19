import { submitEditedAttachments } from '../../../../../shared/components/contentEditSubmission';
import { useAppDialog } from '../../../../../shared/components/AppDialogProvider';
import { ReviewReasonIcon } from '../../../../../shared/components/ReviewReasonIcon';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorState, LoadingState } from '../../../../../shared/components';
import ContentEditForm, { type ContentEditDraft } from '../../../../../shared/components/ContentEditForm';
import { useMyReview } from '../../hooks/useProfile';
import { useUpdatePlaceReview, useReviewEditMedia, serializeRecommendReasons, type RecommendReason, type SelectedPhoto, MAX_PHOTOS, MAX_REASONS, MAX_REVIEW_LENGTH, RECOMMEND_REASONS, visitVerificationMediaPicker, type VisitVerificationMediaPicker } from '../../../../place/visit-verification';

export default function MyReviewEditScreen({ reviewId, onBack, onDirtyChange, mediaPicker = visitVerificationMediaPicker }: {
  reviewId: number; onBack: () => void; onDirtyChange?: (dirty: boolean) => void; mediaPicker?: VisitVerificationMediaPicker;
}) {
  const { t } = useTranslation();
  const query = useMyReview(reviewId);
  if (query.isError && !query.review) return <ErrorState fill description={t('myPage.verifiedPlaces.error')} actionLabel={t('myPage.retry')} onAction={() => void query.refetch()} />;
  if (query.isSearching) return <LoadingState fill />;
  const review = query.review;
  if (!review) return <ErrorState fill description={t('myPageActivity.reviewUnavailable')} />;
  return <ReviewEditor key={review.reviewId} review={review} reasons={query.reasons} onBack={onBack} onDirtyChange={onDirtyChange} mediaPicker={mediaPicker} />;
}

function ReviewEditor({ review, reasons, onBack, onDirtyChange, mediaPicker }: {
  review: NonNullable<ReturnType<typeof useMyReview>['review']>; reasons: RecommendReason[];
  onBack: () => void; onDirtyChange?: (dirty: boolean) => void; mediaPicker: VisitVerificationMediaPicker;
}) {
  const { t } = useTranslation();
  const dialog = useAppDialog();
  const update = useUpdatePlaceReview(review.placeId, review.reviewId);
  const media = useReviewEditMedia(review.placeId);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const mounted = useRef(true);
  const sources = useRef(new Map<string, SelectedPhoto>());
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const initialPhotos = review.reviewMedia !== undefined
    ? review.reviewMedia.flatMap((photo, index) => photo.imageUrl ? [{ key: `server:${index}`, uri: photo.imageUrl, serverId: photo.reviewMediaId }] : [])
    : review.imageUrls.map((uri, index) => ({ key: `legacy:${index}`, uri }));
  const save = async (draft: ContentEditDraft) => {
    if (locked.current) return;
    locked.current = true; setBusy(true);
    try {
      const body = { content: draft.content.trim(), recommendReasons: serializeRecommendReasons(draft.selectedIds as RecommendReason[]) };
      if (JSON.stringify(initialPhotos.map(photo => photo.uri)) === JSON.stringify(draft.photos.map(photo => photo.uri))) await update.mutateAsync(body);
      else await submitEditedAttachments(draft.photos, {
        upload: async uri => { const source = sources.current.get(uri); if (!source) throw new Error('Photo source missing'); return media.upload(source); },
        discard: media.discard,
        save: reviewMediaIds => update.mutateAsync({ ...body, reviewMediaIds }),
      });
      if (mounted.current) { onDirtyChange?.(false); dialog.toast(t('editContent.saved')); onBack(); }
    } catch { if (mounted.current) dialog.toast(t('editContent.operationFailed')); }
    finally { locked.current = false; if (mounted.current) setBusy(false); }
  };
  return <ContentEditForm key={review.reviewId} heading={t('editContent.reviewHeading')}
    selectionTitle={t('editContent.features')} selectionHint={t('editContent.featuresHint')}
    options={RECOMMEND_REASONS.map(reason => ({ id: reason, label: t(`visitVerification.reasons.${reason}`), icon: <ReviewReasonIcon reason={reason} /> }))}
    initialSelectedIds={reasons} selectionLimit={MAX_REASONS} initialContent={review.content}
    initialPhotos={initialPhotos}
    busy={busy} onSubmit={draft => { void save(draft); }} maxPhotos={MAX_PHOTOS} maxContentLength={MAX_REVIEW_LENGTH} onBack={onBack} onDirtyChange={onDirtyChange}
    pickPhotos={async remaining => { const result = await mediaPicker.pickPhotos(remaining);
      if (result.status === 'selected') result.photos.forEach(photo => sources.current.set(photo.uri, photo));
      return { status: result.status, uris: result.status === 'selected' ? result.photos.map(photo => photo.uri) : [] }; }} />;
}
