import { Text as AppText, TextInput as AppTextInput } from '../../../../shared/components/Typography';
import React, { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import BackIcon from '../../../../../assets/v2/icons/header/back-chevron.svg';
import ChevronRightIcon from '../../../../../assets/v2/icons/community/chevron-right.svg';
import PhotoIcon from '../../../../../assets/v2/icons/edit/image.svg';
import PhotoOutlineIcon from '../../../../../assets/v2/icons/edit/image-outline.svg';
import { ApiErrorState, Button, LoadingState } from '../../../../shared/components';
import { ReviewReasonIcon } from '../../../../shared/components/ReviewReasonIcon';
import { usePlaceCard } from '../../exploration';
import { useSubmitVisitVerification } from '../hooks/useSubmitVisitVerification';
import {
  appendPhotos,
  MAX_PHOTOS,
  MAX_REASONS,
  MAX_REVIEW_LENGTH,
  RECOMMEND_REASONS,
  reviewSubmissionErrorKey,
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
  return <ReviewReasonIcon height={16} reason={reason} testID={`visit-reason-icon-${reason}`} />;
}

export default function VisitVerificationReviewScreen({
  mediaPicker = visitVerificationMediaPicker,
  onBack,
  onComplete,
  placeId,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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
    const nextValidation = validateReviewDraft({
      content,
      reasons,
    });
    setValidation(nextValidation);
    if (nextValidation) return;
    submitLocked.current = true;
    try {
      await mutation.mutateAsync({
        content,
        photos,
        reasons,
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
      <Header testID="visit-review-header">
        <BackButton accessibilityLabel={t('visitVerification.back')} accessibilityRole="button" onPress={onBack}><BackIcon color={theme.colors.textAlternative} height={44} width={44} /></BackButton>
        <Title accessibilityRole="header">{t('visitVerification.title')}</Title><HeaderSpacer />
      </Header>
      {place.isLoading ? <LoadingState description={t('visitVerification.placeLoading')} fill /> : place.isError ? (
        <ApiErrorState error={place.error} fill onBack={onBack} onRetry={() => void place.refetch()} />
      ) : place.data ? (
        <KeyboardArea testID="visit-review-keyboard" keyboardVerticalOffset={insets.top} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Content keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" testID="visit-review-scroll">
            <PlaceSummary>
              <SelectedPlaceImage uri={place.data.imageUrl} />
              <PlaceCopy>
                <Category numberOfLines={1}>{place.data.category ?? t('visitVerification.unknownCategory')}</Category>
                <PlaceNameRow><PlaceName numberOfLines={1}>{place.data.name}</PlaceName><ChevronRightIcon accessibilityElementsHidden color={theme.colors.borderEmphasis} height={24} importantForAccessibility="no-hide-descendants" width={24} /></PlaceNameRow>
              </PlaceCopy>
            </PlaceSummary>

            <Section>
              <SectionRow><SectionTitle>{t('visitVerification.photoSection')}</SectionTitle></SectionRow>
              <PhotoRow horizontal showsHorizontalScrollIndicator={false}>
                {photos.map((photo, index) => (
                  <PhotoWrap key={photo.uri}><Preview source={{ uri: photo.uri }} /><Delete accessibilityLabel={t('visitVerification.photoDelete', { index: index + 1 })} accessibilityRole="button" onPress={() => setPhotos((current) => current.filter((item) => item.uri !== photo.uri))}><DeleteText>×</DeleteText></Delete></PhotoWrap>
                ))}
                {photos.length < MAX_PHOTOS ? (
                  <PhotoPicker accessibilityLabel={t('visitVerification.addPhotos')} accessibilityRole="button" onPress={async () => {
                    const result = await mediaPicker.pickPhotos(MAX_PHOTOS - photos.length);
                    setPermissionDenied(result.status === 'denied');
                    if (result.status === 'selected') setPhotos((current) => appendPhotos(current, result.photos));
                  }} testID="visit-photo-picker"><PhotoOutlineIcon color={theme.colors.textMuted} height={30.5} style={{ margin: -1.25 }} testID="visit-photo-picker-icon" width={30.5} /><PickerCount>{t('visitVerification.photoCount', { count: photos.length })}</PickerCount></PhotoPicker>
                ) : null}
              </PhotoRow>
              {permissionDenied ? <InlineMessage accessibilityLiveRegion="polite">{t('visitVerification.permissionDenied')}</InlineMessage> : null}
            </Section>

            <Section>
              <SectionRow><SectionTitle>{t('visitVerification.reasonSection')}</SectionTitle><Hint>{t('visitVerification.reasonHelp')}</Hint></SectionRow>
              <Chips>
                {RECOMMEND_REASONS.map((reason) => {
                  const selected = reasons.includes(reason);
                  return <Chip $selected={selected} accessibilityRole="checkbox" accessibilityState={{ checked: selected, disabled: !selected && reasons.length >= MAX_REASONS }} disabled={!selected && reasons.length >= MAX_REASONS} key={reason} onPress={() => { setReasons((current) => toggleReason(current, reason)); setValidation(null); }} testID={`visit-reason-${reason}`}><RecommendReasonIcon reason={reason} /><ChipText $selected={selected}>{t(`visitVerification.reasons.${reason}`)}</ChipText></Chip>;
                })}
              </Chips>
              <SelectedCount><SelectedCountValue>{reasons.length}</SelectedCountValue>{t('visitVerification.reasonSelectedSuffix', { max: MAX_REASONS })}</SelectedCount>
            </Section>

            <Section $divider={false}>
              <SectionRow><SectionTitle>{t('visitVerification.reviewSection')}</SectionTitle></SectionRow>
              <ReviewInput maxLength={MAX_REVIEW_LENGTH} multiline onChangeText={(value) => { setContent(value); setValidation(null); }} placeholder={t('visitVerification.reviewPlaceholder')} placeholderTextColor={theme.colors.textMuted} testID="visit-review-input" textAlignVertical="top" value={content} />
              <Count>{content.length}/{MAX_REVIEW_LENGTH}</Count>
            </Section>
            {validation ? <InlineMessage accessibilityLiveRegion="assertive">{t(VALIDATION_KEYS[validation])}</InlineMessage> : null}
            {mutation.isError ? <InlineMessage accessibilityLiveRegion="assertive">{t(`visitVerification.errors.${reviewSubmissionErrorKey(mutation.error)}`)}</InlineMessage> : null}
          </Content>
          <SubmitBar testID="visit-review-submit-bar"><Button disabled={mutation.isPending} fullWidth labelColor={theme.colors.textInverse} label={mutation.isPending ? t(mutation.phase === 'uploading' ? 'visitVerification.uploading' : 'visitVerification.submitting') : t('visitVerification.submit')} onPress={() => void submit()} shape="pill" size="onboarding" testID="visit-submit" /></SubmitBar>
        </KeyboardArea>
      ) : null}
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
const Header = styled.View`height: 44px; flex-direction: row; align-items: center; padding: 0 ${({ theme }) => theme.spacing.md}px;`;
// Dark: Figma Glass/FillSoft + Glass/Stroke circle; light keeps the elevated white circle.
const BackButton = styled.Pressable`width: 44px; height: 44px; align-items: center; justify-content: center; border-radius: 22px; border-width: ${({ theme }) => theme.colorScheme === 'dark' ? 1 : 0}px; border-color: ${({ theme }) => theme.liquidGlass.header.rim}; background-color: ${({ theme }) => theme.colorScheme === 'dark' ? 'rgba(28, 28, 32, 0.48)' : theme.colors.surfaceElevated}; elevation: 2; shadow-color: ${({ theme }) => theme.colors.shadow}; shadow-offset: 0px 2px; shadow-opacity: 0.06; shadow-radius: 8px;`;
const Title = styled(AppText)`flex: 1; text-align: center; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.navigationTitle.fontSize}px; font-weight: ${({ theme }) => theme.typography.navigationTitle.fontWeight}; line-height: ${({ theme }) => theme.typography.navigationTitle.lineHeight}px;`;
const HeaderSpacer = styled.View`width: 44px;`;
const Content = styled.ScrollView.attrs(({ theme }) => ({
  contentContainerStyle: {
    paddingBottom: theme.spacing.md,
  },
}))`flex: 1;`;
const KeyboardArea = styled(KeyboardAvoidingView)`flex: 1;`;
const PlaceSummary = styled.View`flex-direction: row; align-items: center; margin: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px 0; padding: 12px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.backgroundAssistive};`;
const PlaceImage = styled(Image)`width: 50px; height: 50px; border-radius: ${({ theme }) => theme.radius.sm}px;`;
const PlaceImageFallback = styled.View`width: 50px; height: 50px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.sm}px; background-color: ${({ theme }) => theme.colors.disabled};`;
const PlaceCopy = styled.View`flex: 1; min-width: 0; gap: ${({ theme }) => theme.spacing.xs}px; padding-left: ${({ theme }) => theme.spacing.md}px;`;
const Category = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: ${({ theme }) => theme.typography.bodyRegular.fontSize}px; font-weight: ${({ theme }) => theme.typography.bodyRegular.fontWeight}; line-height: ${({ theme }) => theme.typography.bodyRegular.lineHeight}px;`;
const PlaceNameRow = styled.View`flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.xs}px;`;
const PlaceName = styled(AppText)`flex-shrink: 1; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.headline1Bold.fontSize}px; font-weight: ${({ theme }) => theme.typography.headline1Bold.fontWeight}; line-height: ${({ theme }) => theme.typography.headline1Bold.lineHeight}px;`;
const Section = styled.View<{ $divider?: boolean }>`padding: 16px 24px; border-bottom-width: ${({ $divider = true }) => ($divider ? 8 : 0)}px; border-bottom-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const SectionRow = styled.View`gap: ${({ theme }) => theme.spacing.xs}px; margin-bottom: ${({ theme }) => theme.spacing.md}px;`;
const SectionTitle = styled(AppText)`color: ${({ theme }) => theme.colors.labelNormal}; font-size: ${({ theme }) => theme.typography.headline2Bold.fontSize}px; font-weight: ${({ theme }) => theme.typography.headline2Bold.fontWeight}; line-height: ${({ theme }) => theme.typography.headline2Bold.lineHeight}px;`;
const Hint = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: ${({ theme }) => theme.typography.labelMedium.fontSize}px; font-weight: ${({ theme }) => theme.typography.labelMedium.fontWeight}; line-height: ${({ theme }) => theme.typography.labelMedium.lineHeight}px;`;
const SelectedCount = styled(AppText)`margin-top: 6px; color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.captionMedium.fontSize}px; font-weight: ${({ theme }) => theme.typography.captionMedium.fontWeight}; line-height: ${({ theme }) => theme.typography.captionMedium.lineHeight}px;`;
const SelectedCountValue = styled(AppText)`color: ${({ theme }) => theme.colors.primaryPressed}; font-size: ${({ theme }) => theme.typography.captionMedium.fontSize}px; font-weight: ${({ theme }) => theme.typography.captionMedium.fontWeight}; line-height: ${({ theme }) => theme.typography.captionMedium.lineHeight}px;`;
const Count = styled(AppText)`align-self: flex-end; color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const PhotoRow = styled.ScrollView`flex-grow: 0;`;
const PhotoWrap = styled.View`width: 72px; height: 72px; margin-right: ${({ theme }) => theme.spacing.sm}px;`;
const Preview = styled(Image)`width: 72px; height: 72px; border-radius: ${({ theme }) => theme.radius.md}px;`;
const Delete = styled.Pressable`position: absolute; top: -4px; right: -4px; width: 28px; height: 28px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.textStrong};`;
const DeleteText = styled(AppText)`color: ${({ theme }) => theme.colors.onPrimary}; font-size: 20px; line-height: 21px;`;
const PhotoPicker = styled.Pressable`width: 72px; height: 72px; align-items: center; justify-content: center; gap: ${({ theme }) => theme.spacing.xs}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colorScheme === 'dark' ? theme.colors.textDisabled : theme.colors.surfacePressed};`;
const PickerCount = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: ${({ theme }) => theme.typography.labelMedium.fontSize}px; font-weight: ${({ theme }) => theme.typography.labelMedium.fontWeight}; line-height: ${({ theme }) => theme.typography.labelMedium.lineHeight}px;`;
// Figma lays the chip list out 370pt wide, 16pt past the section's right padding.
const Chips = styled.View`flex-direction: row; flex-wrap: wrap; gap: ${({ theme }) => theme.spacing.sm}px; margin-right: -${({ theme }) => theme.spacing.md}px;`;
const Chip = styled.Pressable<{ $selected: boolean }>`max-width: 100%; height: 34px; flex-direction: row; align-items: center; justify-content: center; gap: ${({ $selected }) => $selected ? 10 : 6}px; padding: 0 15px; border-width: 1px; border-color: ${({ $selected, theme }) => $selected ? theme.liquidGlass.category.activeBorder : 'transparent'}; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ $selected, theme }) => $selected ? theme.liquidGlass.category.activeTint : theme.colors.backgroundAssistive};`;
const ChipText = styled(AppText)<{ $selected: boolean }>`flex-shrink: 1; color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.textAlternative}; font-size: ${({ theme }) => theme.typography.labelMedium.fontSize}px; font-weight: ${({ theme }) => theme.typography.labelMedium.fontWeight}; line-height: ${({ theme }) => theme.typography.labelMedium.lineHeight}px;`;
const ReviewInput = styled(AppTextInput)`min-height: 139px; padding: 10px 12px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.backgroundAssistive}; color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.typography.labelMedium.fontSize}px; font-weight: ${({ theme }) => theme.typography.labelMedium.fontWeight}; line-height: ${({ theme }) => theme.typography.labelMedium.lineHeight}px;`;
const InlineMessage = styled(AppText)`margin: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px 0; color: ${({ theme }) => theme.colors.danger}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; line-height: 18px;`;
const SubmitBar = styled.View`flex-shrink: 0; padding: 0 24px 16px; background-color: ${({ theme }) => theme.colors.surface};`;
