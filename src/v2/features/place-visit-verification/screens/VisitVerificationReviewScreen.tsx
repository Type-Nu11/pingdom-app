import React, { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import BackIcon from '../../../../assets/v2/icons/header/back.svg';
import PhotoIcon from '../../../../assets/v2/icons/edit/image.svg';
import CameraIcon from '../../../../assets/v2/icons/place/Camera.svg';
import CleanIcon from '../../../../assets/v2/icons/place/Clean.svg';
import DeliciousIcon from '../../../../assets/v2/icons/place/Delicious.svg';
import GroupIcon from '../../../../assets/v2/icons/place/Group.svg';
import KindIcon from '../../../../assets/v2/icons/place/Kind.svg';
import ParkIcon from '../../../../assets/v2/icons/place/Park.svg';
import PinIcon from '../../../../assets/v2/icons/place/Pin.svg';
import { ApiErrorState, Button, LoadingState } from '../../../shared/components';
import { usePlaceCard } from '../../place-exploration/hooks/usePlaceExploration';
import { useSubmitVisitVerification } from '../hooks/useSubmitVisitVerification';
import {
  appendPhotos,
  MAX_PHOTOS,
  MAX_REASONS,
  MAX_REVIEW_LENGTH,
  RECOMMEND_REASONS,
  toggleReason,
  validateReviewDraft,
  type RecommendReason,
  type ReviewValidation,
  type SelectedPhoto,
} from '../model/visitVerification';
import {
  visitVerificationMediaPicker,
  type VisitVerificationMediaPicker,
} from '../services/mediaPicker';

type Props = {
  checkInId?: number;
  mediaPicker?: VisitVerificationMediaPicker;
  onBack: () => void;
  onComplete: () => void;
  placeId: number;
};

const VALIDATION_KEYS: Exclude<ReviewValidation, null> extends infer Key
  ? Record<Extract<Key, string>, string>
  : never = {
  'content-required': 'visitVerification.validation.contentRequired',
  'content-too-long': 'visitVerification.validation.contentTooLong',
  'multiple-reasons-contract-missing': 'visitVerification.contract.multipleReasons',
  'photo-upload-contract-missing': 'visitVerification.contract.photoUpload',
  'reason-required': 'visitVerification.validation.reasonRequired',
};

function SelectedPlaceImage({ uri }: { uri: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!uri || failed) {
    return <PlaceImageFallback testID="visit-review-place-image-fallback"><PhotoIcon height={24} width={24} /></PlaceImageFallback>;
  }
  return <PlaceImage onError={() => setFailed(true)} source={{ uri }} testID="visit-review-place-image" />;
}

function RecommendReasonIcon({ reason }: { reason: RecommendReason }) {
  const props = {
    accessibilityElementsHidden: true,
    height: 16,
    importantForAccessibility: 'no-hide-descendants' as const,
    testID: `visit-reason-icon-${reason}`,
    width: 16,
  };

  switch (reason) {
    case 'kind': return <KindIcon {...props} />;
    case 'easyToFind': return <PinIcon {...props} />;
    case 'delicious': return <DeliciousIcon {...props} />;
    case 'multilingual': return <GroupIcon {...props} />;
    case 'parking': return <ParkIcon {...props} />;
    case 'photoSpot': return <CameraIcon {...props} width={19} />;
    case 'clean': return <CleanIcon {...props} />;
  }
}

export default function VisitVerificationReviewScreen({
  mediaPicker = visitVerificationMediaPicker,
  onBack,
  onComplete,
  placeId,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const place = usePlaceCard(placeId);
  const mutation = useSubmitVisitVerification();
  const submitLocked = useRef(false);
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [reasons, setReasons] = useState<RecommendReason[]>([]);
  const [content, setContent] = useState('');
  const [validation, setValidation] = useState<ReviewValidation>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const submit = async () => {
    if (submitLocked.current || mutation.isPending) return;
    const nextValidation = validateReviewDraft({ content, photoCount: photos.length, reasons });
    setValidation(nextValidation);
    if (nextValidation) return;
    submitLocked.current = true;
    try {
      await mutation.mutateAsync({
        body: { content: content.trim(), recommendReason: t(`visitVerification.reasons.${reasons[0]}`) },
        placeId,
      });
      onComplete();
    } catch {
      // TanStack Mutation owns the contract error and renders it below the form.
    } finally {
      submitLocked.current = false;
    }
  };

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']}>
      <Header>
        <BackButton accessibilityLabel={t('visitVerification.back')} accessibilityRole="button" onPress={onBack}><BackIcon width={44} height={44} /></BackButton>
        <Title accessibilityRole="header">{t('visitVerification.title')}</Title><HeaderSpacer />
      </Header>
      {place.isLoading ? <LoadingState description={t('visitVerification.placeLoading')} fill /> : place.isError ? (
        <ApiErrorState error={place.error} fill onBack={onBack} onRetry={() => void place.refetch()} />
      ) : place.data ? (
        <KeyboardArea behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Content keyboardShouldPersistTaps="handled">
            <PlaceSummary>
              <SelectedPlaceImage uri={place.data.imageUrl} />
              <PlaceCopy><Category numberOfLines={1}>{place.data.category ?? t('visitVerification.unknownCategory')}</Category><PlaceName numberOfLines={1}>{place.data.name}</PlaceName></PlaceCopy>
            </PlaceSummary>

            <Section>
              <SectionRow><SectionTitle>{t('visitVerification.photoSection')}</SectionTitle><Count>{t('visitVerification.photoCount', { count: photos.length })}</Count></SectionRow>
              <PhotoRow horizontal showsHorizontalScrollIndicator={false}>
                {photos.map((photo, index) => (
                  <PhotoWrap key={photo.uri}><Preview source={{ uri: photo.uri }} /><Delete accessibilityLabel={t('visitVerification.photoDelete', { index: index + 1 })} accessibilityRole="button" onPress={() => setPhotos((current) => current.filter((item) => item.uri !== photo.uri))}><DeleteText>×</DeleteText></Delete></PhotoWrap>
                ))}
                {photos.length < MAX_PHOTOS ? (
                  <PhotoPicker accessibilityLabel={t('visitVerification.addPhotos')} accessibilityRole="button" onPress={async () => {
                    const result = await mediaPicker.pickPhotos(MAX_PHOTOS - photos.length);
                    setPermissionDenied(result.status === 'denied');
                    if (result.status === 'selected') setPhotos((current) => appendPhotos(current, result.photos));
                  }} testID="visit-photo-picker"><PhotoIcon height={28} testID="visit-photo-picker-icon" width={28} /><PickerCount>{t('visitVerification.photoCount', { count: photos.length })}</PickerCount></PhotoPicker>
                ) : null}
              </PhotoRow>
              {permissionDenied ? <InlineMessage accessibilityLiveRegion="polite">{t('visitVerification.permissionDenied')}</InlineMessage> : null}
            </Section>

            <Section>
              <SectionRow><SectionTitle>{t('visitVerification.reasonSection')}</SectionTitle><Count>{t('visitVerification.reasonHelp')}</Count></SectionRow>
              <Chips>
                {RECOMMEND_REASONS.map((reason) => {
                  const selected = reasons.includes(reason);
                  return <Chip $selected={selected} accessibilityRole="checkbox" accessibilityState={{ checked: selected, disabled: !selected && reasons.length >= MAX_REASONS }} disabled={!selected && reasons.length >= MAX_REASONS} key={reason} onPress={() => { setReasons((current) => toggleReason(current, reason)); setValidation(null); }} testID={`visit-reason-${reason}`}><RecommendReasonIcon reason={reason} /><ChipText $selected={selected}>{t(`visitVerification.reasons.${reason}`)}</ChipText></Chip>;
                })}
              </Chips>
              <Count>{reasons.length}/{MAX_REASONS}</Count>
            </Section>

            <Section>
              <SectionTitle>{t('visitVerification.reviewSection')}</SectionTitle>
              <ReviewInput maxLength={MAX_REVIEW_LENGTH} multiline onChangeText={(value) => { setContent(value); setValidation(null); }} placeholder={t('visitVerification.reviewPlaceholder')} placeholderTextColor={theme.colors.textMuted} testID="visit-review-input" textAlignVertical="top" value={content} />
              <Count>{content.length}/{MAX_REVIEW_LENGTH}</Count>
            </Section>
            {validation ? <InlineMessage accessibilityLiveRegion="assertive">{t(VALIDATION_KEYS[validation])}</InlineMessage> : null}
            {mutation.isError ? <ApiErrorState error={mutation.error} onRetry={() => void submit()} /> : null}
          </Content>
          <SubmitBar><Button disabled={mutation.isPending} fullWidth label={mutation.isPending ? t('visitVerification.submitting') : t('visitVerification.submit')} onPress={() => void submit()} shape="pill" testID="visit-submit" /></SubmitBar>
        </KeyboardArea>
      ) : null}
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
const Header = styled.View`height: 56px; flex-direction: row; align-items: center; padding: 0 ${({ theme }) => theme.spacing.md}px; border-bottom-width: 1px; border-bottom-color: ${({ theme }) => theme.colors.border};`;
const BackButton = styled.Pressable`width: 44px; height: 44px; align-items: center; justify-content: center;`;
const Title = styled.Text`flex: 1; text-align: center; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.title.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight};`;
const HeaderSpacer = styled.View`width: 44px;`;
const Content = styled.ScrollView.attrs(({ theme }) => ({
  contentContainerStyle: {
    paddingBottom: (theme.spacing.xxl * 2) + theme.spacing.sm,
  },
}))`flex: 1;`;
const KeyboardArea = styled(KeyboardAvoidingView)`flex: 1;`;
const PlaceSummary = styled.View`height: 84px; flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px; margin: ${({ theme }) => theme.spacing.md}px; padding: ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const PlaceImage = styled(Image)`width: 56px; height: 56px; border-radius: ${({ theme }) => theme.radius.sm}px;`;
const PlaceImageFallback = styled.View`width: 56px; height: 56px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.sm}px; background-color: ${({ theme }) => theme.colors.disabled};`;
const PlaceCopy = styled.View`flex: 1; min-width: 0;`;
const Category = styled.Text`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const PlaceName = styled.Text`margin-top: ${({ theme }) => theme.spacing.xs}px; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.title.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight};`;
const Section = styled.View`padding: ${({ theme }) => theme.spacing.md}px; border-top-width: 8px; border-top-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const SectionRow = styled.View`flex-direction: row; align-items: center; justify-content: space-between;`;
const SectionTitle = styled.Text`margin-bottom: ${({ theme }) => theme.spacing.sm}px; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight};`;
const Count = styled.Text`align-self: flex-end; color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const PhotoRow = styled.ScrollView`flex-grow: 0;`;
const PhotoWrap = styled.View`width: 80px; height: 80px; margin-right: ${({ theme }) => theme.spacing.sm}px;`;
const Preview = styled(Image)`width: 80px; height: 80px; border-radius: ${({ theme }) => theme.radius.sm}px;`;
const Delete = styled.Pressable`position: absolute; top: -4px; right: -4px; width: 28px; height: 28px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.textStrong};`;
const DeleteText = styled.Text`color: ${({ theme }) => theme.colors.onPrimary}; font-size: 20px; line-height: 21px;`;
const PhotoPicker = styled.Pressable`width: 80px; height: 80px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.sm}px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const PickerCount = styled.Text`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const Chips = styled.View`flex-direction: row; flex-wrap: wrap; gap: ${({ theme }) => theme.spacing.sm}px;`;
const Chip = styled.Pressable<{ $selected: boolean }>`min-height: 40px; flex-direction: row; align-items: center; justify-content: center; gap: ${({ theme }) => theme.spacing.xs}px; padding: 0 ${({ theme }) => theme.spacing.md}px; border-width: 1px; border-color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.border}; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ $selected, theme }) => $selected ? theme.colors.primarySoft : theme.colors.surface};`;
const ChipText = styled.Text<{ $selected: boolean }>`color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: ${({ theme }) => theme.typography.label.fontWeight};`;
const ReviewInput = styled.TextInput`min-height: 112px; padding: ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.inputBackground}; color: ${({ theme }) => theme.colors.text};`;
const InlineMessage = styled.Text`margin: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px 0; color: ${({ theme }) => theme.colors.danger}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; line-height: 18px;`;
const SubmitBar = styled.View`position: absolute; right: 0; bottom: 0; left: 0; padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.md}px; background-color: ${({ theme }) => theme.colors.surface};`;
