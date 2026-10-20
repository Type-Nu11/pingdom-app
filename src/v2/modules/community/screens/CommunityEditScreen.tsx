import { useAppDialog } from '../../../shared/components/AppDialogProvider';
import { submitEditedAttachments } from '../../../shared/components/contentEditSubmission';
import { canManageCommunityPost } from '../model/postOwnership';
import { BackHandler } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';
import { ApiErrorState, ErrorState, LoadingState } from '../../../shared/components';
import { Text } from '../../../shared/components/Typography';
import ContentEditForm, { type ContentEditDraft, type EditOption } from '../../../shared/components/ContentEditForm';
import { useProfile } from '../../user/profile';
import { visitVerificationMediaPicker, reviewPhotoPart, type SelectedPhoto, type VisitVerificationMediaPicker } from '../../place/visit-verification';
import { useCategories, usePost, useUpdatePost, useCommunityEditMedia, type CommunityPostDetail } from '../hooks/useCommunity';
import CommunityPlaceCard from '../components/CommunityPlaceCard';
import CommunityPlacePicker from '../components/CommunityPlacePicker';
import CloseIcon from '../../../../assets/v2/icons/community/close-medium.svg';
import { isPlaceCategory, WRITE_CONTENT_MAX_LENGTH, WRITE_TITLE_MAX_LENGTH } from '../model/writeForm';
import { MAX_POST_PHOTOS } from '../model/photoCount';

export default function CommunityEditScreen({ postId, onBack, onDirtyChange, mediaPicker = visitVerificationMediaPicker }: {
  postId: number; onBack: () => void; onDirtyChange?: (dirty: boolean) => void; mediaPicker?: VisitVerificationMediaPicker;
}) {
  const { t } = useTranslation();
  const post = usePost(postId);
  const profile = useProfile();
  const categories = useCategories();
  if (post.isLoading || profile.isLoading || categories.isLoading) return <LoadingState fill />;
  if (post.isError && !post.data) return <ApiErrorState fill error={post.error} onBack={onBack} onRetry={() => void post.refetch()} />;
  if (profile.isError && !profile.profile) return <ApiErrorState fill error={profile.error} onBack={onBack} onRetry={() => void profile.refetch()} />;
  if (categories.isError && !categories.data) return <ApiErrorState fill error={categories.error} onBack={onBack} onRetry={() => void categories.refetch()} />;
  if (!post.data?.postId || !canManageCommunityPost(post.data.author?.authorId, profile.profile?.id)) {
    return <ErrorState fill description={t('editContent.notAuthor')} actionLabel={t('editContent.back')} onAction={onBack} />;
  }
  const options = (categories.data?.categories ?? []).flatMap(category => category.categoryId && category.categoryName
    ? [{ id: category.categoryId, label: category.categoryName }] : []);
  const currentCategory = post.data.category;
  if (currentCategory?.categoryId && currentCategory.categoryName && !options.some(option => option.id === currentCategory.categoryId)) {
    options.push({ id: currentCategory.categoryId, label: currentCategory.categoryName });
  }
  return <PostEditor key={postId} post={post.data} options={options} onBack={onBack} onDirtyChange={onDirtyChange} mediaPicker={mediaPicker} />;
}

function PostEditor({ post: initialPost, options, onBack, onDirtyChange, mediaPicker }: {
  post: CommunityPostDetail; options: EditOption[]; onBack: () => void;
  onDirtyChange?: (dirty: boolean) => void; mediaPicker: VisitVerificationMediaPicker;
}) {
  const { t } = useTranslation();
  const [post] = useState(initialPost);
  const dialog = useAppDialog();
  const mutation = useUpdatePost(post.postId!);
  const media = useCommunityEditMedia();
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const mounted = useRef(true);
  const sources = useRef(new Map<string, SelectedPhoto>());
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const [places, setPlaces] = useState(post.places ?? []);
  const [pickingPlace, setPickingPlace] = useState(false);
  useEffect(() => {
    if (!pickingPlace) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => { setPickingPlace(false); return true; });
    return () => listener.remove();
  }, [pickingPlace]);
  const placeDirty = JSON.stringify(places) !== JSON.stringify(post.places ?? []);
  const save = async (draft: ContentEditDraft) => {
    if (locked.current) return;
    if (isPlaceCategory(draft.selectedIds[0]) && !places.length) { dialog.toast(t('editContent.placeRequired')); return; }
    locked.current = true; setBusy(true);
    try {
      const body = { title: draft.title!.trim(), content: draft.content.trim(), categoryId: draft.selectedIds[0],
        ...(placeDirty ? { placeIds: places.flatMap(place => place.placeId ? [place.placeId] : []) } : {}) };
      const unchangedPhotos = JSON.stringify(draft.photos.map(photo => photo.uri)) === JSON.stringify((post.images ?? []).flatMap(photo => photo.imageUrl ? [photo.imageUrl] : []));
      if (unchangedPhotos) await mutation.mutateAsync(body);
      else await submitEditedAttachments(draft.photos, {
        upload: async uri => { const source = sources.current.get(uri); if (!source) throw new Error('Photo source missing'); return media.upload(reviewPhotoPart(source)); },
        discard: media.discard,
        save: imageIds => mutation.mutateAsync({ ...body, imageIds }),
      });
      if (mounted.current) { onDirtyChange?.(false); dialog.toast(t('editContent.saved')); onBack(); }
    } catch { if (mounted.current) dialog.toast(t('editContent.operationFailed')); }
    finally { locked.current = false; if (mounted.current) setBusy(false); }
  };
  return <Container>
    <FormHost accessibilityElementsHidden={pickingPlace} importantForAccessibility={pickingPlace ? 'no-hide-descendants' : 'auto'}>
      <ContentEditForm heading={t('editContent.postHeading')} selectionTitle={t('editContent.category')}
        selectionHint={t('editContent.categoryHint')} options={options}
        initialSelectedIds={post.category?.categoryId ? [post.category.categoryId] : []}
        initialTitle={post.title ?? ''} initialContent={post.content ?? ''}
        initialPhotos={(post.images ?? []).flatMap((photo, index) => photo.imageUrl ? [{ key: `server:${photo.imageId ?? index}:${index}`, uri: photo.imageUrl, serverId: photo.imageId }] : [])}
        maxPhotos={MAX_POST_PHOTOS} maxContentLength={WRITE_CONTENT_MAX_LENGTH} maxTitleLength={WRITE_TITLE_MAX_LENGTH}
        busy={busy} onSubmit={draft => { void save(draft); }} onBack={onBack} onDirtyChange={onDirtyChange} extraDirty={placeDirty}
        pickPhotos={async remaining => { const result = await mediaPicker.pickPhotos(remaining);
          if (result.status === 'selected') result.photos.forEach(photo => sources.current.set(photo.uri, photo));
          return { status: result.status, uris: result.status === 'selected' ? result.photos.map(photo => photo.uri) : [] }; }}>
        <PlaceSection>
          <SectionTitle>{t('editContent.places')}</SectionTitle>
          {places.map((place, index) => <CommunityPlaceCard key={`${place.placeId}-${index}`} name={place.placeName ?? ''}
            category={place.category} region={place.region} imageUrl={place.imageUrl} muted={place.deleted}
            trailing={<RemovePlace accessibilityRole="button" accessibilityLabel={t('editContent.removePlace')}
              disabled={busy} onPress={() => setPlaces(current => current.filter((_, currentIndex) => currentIndex !== index))}><CloseIcon /></RemovePlace>} />)}
          <AddPlace accessibilityRole="button" disabled={busy} onPress={() => setPickingPlace(true)}><AddText>{t('editContent.addPlace')}</AddText></AddPlace>
        </PlaceSection>
      </ContentEditForm>
    </FormHost>
    {pickingPlace ? <PickerLayer accessibilityViewIsModal>
      <CommunityPlacePicker onClose={() => setPickingPlace(false)} onSelect={place => {
        setPlaces(current => current.some(item => item.placeId === place.id) ? current : [...current,
          { placeId: place.id, placeName: place.name, category: place.category, address: place.address }]);
        setPickingPlace(false);
      }} />
    </PickerLayer> : null}
  </Container>;
}
const Container = styled.View`flex: 1;`;
const FormHost = styled.View`flex: 1;`;
const PickerLayer = styled.View`position: absolute; top: 0; bottom: 0; left: 0; right: 0;`;
const PlaceSection = styled.View`padding: 16px 24px; gap: 12px;`;
const SectionTitle = styled(Text)`font-size: 18px; font-weight: 700; color: ${({ theme }) => theme.colors.labelNormal};`;
const RemovePlace = styled.Pressable.attrs({ hitSlop: 6 })`width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: 22px; background-color: ${({ theme }) => theme.colors.background};`;
const AddPlace = styled.Pressable`min-height: 44px; justify-content: center;`;
const AddText = styled(Text)`color: ${({ theme }) => theme.colors.primary};`;
