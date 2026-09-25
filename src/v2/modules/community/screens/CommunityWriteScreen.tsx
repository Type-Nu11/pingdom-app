import { Text as AppText, TextInput as AppTextInput } from '../../../shared/components/Typography';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import BackButtonIcon from '../../../../assets/v2/icons/community/back-button.svg';
import CloseMediumIcon from '../../../../assets/v2/icons/community/close-medium.svg';
import { useCategories, useCreatePost } from '../hooks/useCommunity';
import {
  communityWriteBannerAction,
  communityWriteErrorKind,
  communityWriteHasUnmappedFieldError,
  communityWriteServerFieldErrors,
} from '../model/writeSubmitError';
import {
  WRITE_CONTENT_MAX_LENGTH,
  WRITE_TITLE_MAX_LENGTH,
  isPlaceCategory,
  validateWriteForm,
  type WriteFormFieldErrorKey,
  type WritePlaceTag,
} from '../model/writeForm';
import CommunityPlacePicker from '../components/CommunityPlacePicker';

export type CommunityWriteScreenProps = {
  initialCategoryId?: string;
  onBack: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onSignIn?: () => void;
  onSubmitSuccess: (result: { placeIds: number[]; postId: number }) => void;
};

const VALIDATION_KEY_TO_I18N: Record<WriteFormFieldErrorKey, string> = {
  categoryRequired: 'community.write_screen.validation.categoryRequired',
  contentRequired: 'community.write_screen.validation.bodyRequired',
  contentTooLong: 'community.write_screen.validation.contentTooLong',
  placeRequired: 'community.write_screen.validation.placeRequired',
  titleRequired: 'community.write_screen.validation.titleRequired',
  titleTooLong: 'community.write_screen.validation.titleTooLong',
};

export default function CommunityWriteScreen({
  initialCategoryId,
  onBack,
  onDirtyChange,
  onSignIn,
  onSubmitSuccess,
}: CommunityWriteScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const submissionGuard = useRef(false);
  const [manualCategoryId, setManualCategoryId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [placeTags, setPlaceTags] = useState<WritePlaceTag[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const categoriesQuery = useCategories();
  const categories = useMemo(
    () => (categoriesQuery.data?.categories ?? []).filter(
      (category): category is { categoryId: string; categoryName: string } =>
        Boolean(category.categoryId) && Boolean(category.categoryName),
    ),
    [categoriesQuery.data],
  );
  const selectedCategoryId = manualCategoryId
    ?? categories.find((category) => category.categoryId === initialCategoryId)?.categoryId
    ?? categories[0]?.categoryId
    ?? null;
  const placeCategorySelected = isPlaceCategory(selectedCategoryId);

  const createPost = useCreatePost();

  const fieldErrors = validateWriteForm({
    categoryId: selectedCategoryId,
    content,
    placeTags,
    title,
  });
  const serverFieldErrors = createPost.isError ? communityWriteServerFieldErrors(createPost.error) : {};
  const fieldErrorText = (field: keyof typeof fieldErrors) => {
    if (serverFieldErrors[field]) return serverFieldErrors[field];
    if (!showErrors) return undefined;
    const key = fieldErrors[field];
    return key ? t(VALIDATION_KEY_TO_I18N[key]) : undefined;
  };

  const isValid = Object.keys(fieldErrors).length === 0;
  const isDirty = title.length > 0 || content.length > 0 || placeTags.length > 0;
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const submit = () => {
    if (submissionGuard.current || createPost.isPending || !selectedCategoryId) return;
    setShowErrors(true);
    if (Object.keys(fieldErrors).length > 0) return;

    submissionGuard.current = true;
    createPost.mutate(
      {
        categoryId: selectedCategoryId,
        content: content.trim(),
        title: title.trim(),
        ...(placeTags.length > 0 ? { placeIds: placeTags.map((tag) => tag.id) } : {}),
      },
      {
        onError: () => {
          submissionGuard.current = false;
        },
        onSuccess: (data) => {
          if (typeof data.postId !== 'number') {
            submissionGuard.current = false;
            return;
          }
          onDirtyChange?.(false);
          onSubmitSuccess({ placeIds: data.placeIds ?? [], postId: data.postId });
        },
      },
    );
  };

  const bannerKind = createPost.isError ? communityWriteErrorKind(createPost.error) : null;
  const bannerAction = createPost.isError ? communityWriteBannerAction(createPost.error) : 'none';
  const hasUnmappedServerError = createPost.isError && communityWriteHasUnmappedFieldError(createPost.error);

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-community-write-screen">
      <Header>
        <BackButton accessibilityLabel={t('community.write_screen.back')} accessibilityRole="button" onPress={onBack}>
          <BackButtonIcon height={42} width={40} />
        </BackButton>
        <Title accessibilityRole="header">{t('community.write_screen.title')}</Title>
        <HeaderSpacer />
      </Header>

      <KeyboardArea behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Content keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
          <Section>
            <SectionHead>
              <SectionTitle>{t('community.write_screen.categoryLabel')}</SectionTitle>
              <SectionSubtitle>{t('community.write_screen.categoryHint')}</SectionSubtitle>
            </SectionHead>
            {categoriesQuery.isLoading ? (
              <ActivityIndicator color={theme.colors.primary} testID="v2-community-write-categories-loading" />
            ) : categoriesQuery.isError ? (
              <InlineErrorRow testID="v2-community-write-categories-error">
                <ValidationText>{t('common.apiError.generic.description')}</ValidationText>
                <RetryButton accessibilityRole="button" onPress={() => void categoriesQuery.refetch()}>
                  <RetryLabel>{t('community.write_screen.placePicker.retry')}</RetryLabel>
                </RetryButton>
              </InlineErrorRow>
            ) : (
              <Chips>
                {categories.map((category) => {
                  const selected = category.categoryId === selectedCategoryId;
                  return (
                    <CategoryChip
                      $selected={selected}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      key={category.categoryId}
                      onPress={() => setManualCategoryId(category.categoryId)}
                      testID={`v2-community-write-category-${category.categoryId}`}
                    >
                      <CategoryChipLabel $selected={selected}>{category.categoryName}</CategoryChipLabel>
                    </CategoryChip>
                  );
                })}
              </Chips>
            )}
            {fieldErrorText('categoryId') ? (
              <ValidationText accessibilityLiveRegion="polite" accessibilityRole="alert">
                {fieldErrorText('categoryId')}
              </ValidationText>
            ) : null}
          </Section>

          <Section>
            <SectionTitle>{t('community.write_screen.titleLabel')}</SectionTitle>
            <TitleInput
              accessibilityLabel={t('community.write_screen.titleLabel')}
              maxLength={WRITE_TITLE_MAX_LENGTH}
              onBlur={() => setShowErrors(true)}
              onChangeText={setTitle}
              placeholder={t('community.write_screen.titlePlaceholder')}
              placeholderTextColor={theme.colors.textAlternative}
              testID="v2-community-write-title"
              value={title}
            />
            <CounterText>
              {t('community.write_screen.titleCounter', { count: title.length, max: WRITE_TITLE_MAX_LENGTH })}
            </CounterText>
            {fieldErrorText('title') ? (
              <ValidationText
                accessibilityLiveRegion="polite"
                accessibilityRole="alert"
                testID="v2-community-write-title-error"
              >
                {fieldErrorText('title')}
              </ValidationText>
            ) : null}

            <BodyInput
              accessibilityLabel={t('community.write_screen.bodyLabel')}
              maxLength={WRITE_CONTENT_MAX_LENGTH}
              multiline
              onBlur={() => setShowErrors(true)}
              onChangeText={setContent}
              placeholder={t('community.write_screen.bodyPlaceholder')}
              placeholderTextColor={theme.colors.textAlternative}
              testID="v2-community-write-body"
              textAlignVertical="top"
              value={content}
            />
            <CounterText>
              {t('community.write_screen.contentCounter', { count: content.length, max: WRITE_CONTENT_MAX_LENGTH })}
            </CounterText>
            {fieldErrorText('content') ? (
              <ValidationText
                accessibilityLiveRegion="polite"
                accessibilityRole="alert"
                testID="v2-community-write-body-error"
              >
                {fieldErrorText('content')}
              </ValidationText>
            ) : null}

            <GuideRow>
              <GuideDot />
              <GuideText>{t('community.write_screen.guideText')}</GuideText>
            </GuideRow>
          </Section>

          <PlaceSection>
            <PlaceHead>
              <PlaceHeadTitle>{t('community.write_screen.placeTagTitle')}</PlaceHeadTitle>
              <PlaceHeadTag>
                {t(placeCategorySelected ? 'community.write_screen.placeTagRequired' : 'community.write_screen.placeTagOptional')}
              </PlaceHeadTag>
            </PlaceHead>
            <PlaceSubtitle>{t('community.write_screen.placeTagHint')}</PlaceSubtitle>

            {placeTags.map((place) => (
              <PlaceCard key={place.id}>
                <PlaceInfo>
                  <PlaceCategory numberOfLines={1}>{place.category}</PlaceCategory>
                  <PlaceName numberOfLines={1}>{place.name}</PlaceName>
                </PlaceInfo>
                <RemovePlace
                  accessibilityLabel={t('community.write_screen.removePlace', { name: place.name })}
                  accessibilityRole="button"
                  onPress={() => setPlaceTags((current) => current.filter((tag) => tag.id !== place.id))}
                  testID={`v2-community-write-remove-place-${place.id}`}
                >
                  <CloseMediumIcon height={19} width={19} />
                </RemovePlace>
              </PlaceCard>
            ))}

            <AddPlaceButton
              accessibilityLabel={t('community.write_screen.addPlace')}
              accessibilityRole="button"
              onPress={() => setPickerOpen(true)}
              testID="v2-community-write-add-place"
            >
              <AddPlaceLabel>{`+ ${t('community.write_screen.addPlace')}`}</AddPlaceLabel>
            </AddPlaceButton>
            {fieldErrorText('placeIds') ? (
              <ValidationText
                accessibilityLiveRegion="polite"
                accessibilityRole="alert"
                testID="v2-community-write-place-error"
              >
                {fieldErrorText('placeIds')}
              </ValidationText>
            ) : null}
          </PlaceSection>

          {createPost.isError && hasUnmappedServerError ? (
            <Section>
              <ErrorBanner testID="v2-community-write-error-banner">
                <ErrorBannerText accessibilityLiveRegion="assertive" accessibilityRole="alert">
                  {bannerKind === 'notFound'
                    ? t('community.write_screen.errors.placeNotFound')
                    : t(`common.apiError.${bannerKind}.description`)}
                </ErrorBannerText>
                {bannerKind === 'network' || bannerKind === 'generic' ? (
                  <ErrorBannerText>{t('community.write_screen.errors.networkDuplicateWarning')}</ErrorBannerText>
                ) : null}
                {bannerAction === 'retry' ? (
                  <BannerButton accessibilityRole="button" onPress={submit} testID="v2-community-write-retry">
                    <BannerButtonLabel>{t('community.write_screen.errors.retry')}</BannerButtonLabel>
                  </BannerButton>
                ) : bannerAction === 'signIn' ? (
                  <BannerButton accessibilityRole="button" onPress={onSignIn} testID="v2-community-write-sign-in">
                    <BannerButtonLabel>{t('community.write_screen.errors.signIn')}</BannerButtonLabel>
                  </BannerButton>
                ) : null}
              </ErrorBanner>
            </Section>
          ) : null}
        </Content>

        <SubmitBar>
          <SubmitButton
            $enabled={isValid}
            accessibilityRole="button"
            accessibilityState={{ busy: createPost.isPending, disabled: createPost.isPending || !selectedCategoryId }}
            disabled={createPost.isPending || !selectedCategoryId}
            onPress={submit}
            testID="v2-community-write-submit"
          >
            {createPost.isPending ? (
              <ActivityIndicator
                accessibilityLabel={t('community.write_screen.submitBusy')}
                color={theme.colors.onPrimary}
              />
            ) : (
              <SubmitLabel $enabled={isValid}>{t('community.write_screen.submit')}</SubmitLabel>
            )}
          </SubmitButton>
        </SubmitBar>
      </KeyboardArea>

      {pickerOpen ? (
        <CommunityPlacePicker
          onClose={() => setPickerOpen(false)}
          onSelect={(place) => {
            setPlaceTags((current) => (
              current.some((tag) => tag.id === place.id) ? current : [...current, place]
            ));
            setPickerOpen(false);
          }}
        />
      ) : null}
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
const Header = styled.View`height: 44px; flex-direction: row; align-items: center; padding: 0 ${({ theme }) => theme.spacing.md}px;`;
const Title = styled(AppText)`flex: 1; text-align: center; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.navigationTitle.fontSize}px; font-weight: ${({ theme }) => theme.typography.navigationTitle.fontWeight};`;
const BackButton = styled.Pressable`width: 40px; height: 42px; align-items: center; justify-content: center;`;
const HeaderSpacer = styled.View`width: 40px;`;
const KeyboardArea = styled(KeyboardAvoidingView)`flex: 1;`;
const Content = styled(ScrollView)`flex: 1;`;

const Section = styled.View`gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px; border-bottom-width: 8px; border-bottom-color: ${({ theme }) => theme.colors.backgroundAssistive};`;
const SectionHead = styled.View`gap: 4px;`;
const SectionTitle = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: 18px; font-weight: 700;`;
const SectionSubtitle = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: ${({ theme }) => theme.typography.label.fontSize}px;`;

const Chips = styled.View`flex-direction: row; flex-wrap: wrap; gap: ${({ theme }) => theme.spacing.sm}px;`;
const CategoryChip = styled.Pressable<{ $selected: boolean }>`
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  border-color: ${({ $selected, theme }) => ($selected ? theme.colors.primaryPressed : theme.colors.backgroundAssistive)};
  background-color: ${({ $selected, theme }) => ($selected ? theme.colors.primaryRange : theme.colors.backgroundAssistive)};
`;
const CategoryChipLabel = styled(AppText)<{ $selected: boolean }>`
  color: ${({ $selected, theme }) => ($selected ? theme.colors.primary : theme.colors.textAlternative)};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: 500;
`;

const InlineErrorRow = styled.View`flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px;`;
const RetryButton = styled.Pressable`padding: 6px 14px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primarySoft};`;
const RetryLabel = styled(AppText)`color: ${({ theme }) => theme.colors.primary}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: 700;`;

const TitleInput = styled(AppTextInput)`padding: 14px 12px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.backgroundAssistive}; color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.typography.body.fontSize}px;`;
const BodyInput = styled(AppTextInput)`min-height: 139px; padding: 14px 12px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.backgroundAssistive}; color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const CounterText = styled(AppText)`align-self: flex-end; color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const GuideRow = styled.View`flex-direction: row; align-items: center; gap: 4px;`;
const GuideDot = styled.View`width: 3px; height: 3px; border-radius: 2px; background-color: ${({ theme }) => theme.colors.textMuted};`;
const GuideText = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const ValidationText = styled(AppText)`color: ${({ theme }) => theme.colors.danger}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;

const PlaceSection = styled.View`gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;`;
const PlaceHead = styled.View`flex-direction: row; align-items: center; gap: 4px;`;
const PlaceHeadTitle = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: 18px; font-weight: 700;`;
const PlaceHeadTag = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.label.fontSize}px;`;
const PlaceSubtitle = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const PlaceCard = styled.View`flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.backgroundAssistive};`;
const PlaceInfo = styled.View`flex: 1; gap: 4px; min-width: 0;`;
const PlaceCategory = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: ${({ theme }) => theme.typography.body.fontSize}px;`;
const PlaceName = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.title.fontSize}px; font-weight: 700;`;
const RemovePlace = styled.Pressable`width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.surface};`;
const AddPlaceButton = styled.Pressable`align-self: flex-start; padding: 10px 16px; border-radius: ${({ theme }) => theme.radius.full}px; border-width: 1px; border-color: ${({ theme }) => theme.colors.border};`;
const AddPlaceLabel = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.label.fontSize}px; font-weight: 600;`;

const ErrorBanner = styled.View`gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.dangerSoft};`;
const ErrorBannerText = styled(AppText)`color: ${({ theme }) => theme.colors.danger}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const BannerButton = styled.Pressable`align-self: flex-start; padding: 8px 16px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primary};`;
const BannerButtonLabel = styled(AppText)`color: ${({ theme }) => theme.colors.onPrimary}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: 700;`;

const SubmitBar = styled.View`padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;`;
const SubmitButton = styled.Pressable<{ $enabled: boolean }>`height: 64px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ $enabled, theme }) => ($enabled ? theme.colors.primary : theme.colors.disabled)};`;
const SubmitLabel = styled(AppText)<{ $enabled: boolean }>`color: ${({ $enabled, theme }) => ($enabled ? theme.colors.onPrimary : theme.colors.onDisabled)}; font-size: 20px; font-weight: 700;`;
