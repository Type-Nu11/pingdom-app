import { Text as AppText, TextInput as AppTextInput } from '../../../shared/components/Typography';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import BackButtonIcon from '../../../../assets/v2/icons/community/back-button.svg';
import CloseMediumIcon from '../../../../assets/v2/icons/community/close-medium.svg';
import CloseSmallIcon from '../../../../assets/v2/icons/community/close-small.svg';
import FilterButtonIcon from '../../../../assets/v2/icons/community/filter-button.svg';
import PhotoPickerIcon from '../../../../assets/v2/icons/community/photo-picker.svg';
import type { CommunityPlaceTag, CommunityPostTag } from '../model/types';

export type CommunityWriteScreenProps = {
  initialPlaceTag?: CommunityPlaceTag | null;
  onBack: () => void;
  onSubmit: (draft: {
    body: string;
    photoUris: string[];
    placeTag: CommunityPlaceTag | null;
    tag: CommunityPostTag;
    title: string;
  }) => void;
};

const CATEGORY_OPTIONS: CommunityPostTag[] = ['spot', 'diary', 'ledger'];
const MAX_PHOTOS = 10;

type ValidationError = 'body-required' | 'title-required' | null;

export default function CommunityWriteScreen({ initialPlaceTag = null, onBack, onSubmit }: CommunityWriteScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tag, setTag] = useState<CommunityPostTag>('spot');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [placeTag, setPlaceTag] = useState<CommunityPlaceTag | null>(initialPlaceTag);
  const [validation, setValidation] = useState<ValidationError>(null);

  const submit = () => {
    if (title.trim().length === 0) {
      setValidation('title-required');
      return;
    }
    if (body.trim().length === 0) {
      setValidation('body-required');
      return;
    }
    setValidation(null);
    onSubmit({ body, photoUris, placeTag, tag, title });
  };

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-community-write-screen">
      <Header>
        <BackButton accessibilityLabel={t('community.write_screen.back')} accessibilityRole="button" onPress={onBack}>
          <BackButtonIcon height={42} width={40} />
        </BackButton>
        <Title accessibilityRole="header">{t('community.write_screen.title')}</Title>
        <FilterButton accessibilityLabel={t('community.moreOptions')} accessibilityRole="button">
          <FilterButtonIcon height={44} width={44} />
        </FilterButton>
      </Header>

      <KeyboardArea behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Content keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
          <Section>
            <SectionHead>
              <SectionTitle>{t('community.write_screen.categoryLabel')}</SectionTitle>
              <SectionSubtitle>{t('community.write_screen.categoryHint')}</SectionSubtitle>
            </SectionHead>
            <Chips>
              {CATEGORY_OPTIONS.map((option) => {
                const selected = option === tag;
                return (
                  <CategoryChip
                    $selected={selected}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    key={option}
                    onPress={() => setTag(option)}
                    testID={`v2-community-write-category-${option}`}
                  >
                    <CategoryChipLabel $selected={selected}>{t(`community.categories.${option}`)}</CategoryChipLabel>
                  </CategoryChip>
                );
              })}
            </Chips>
          </Section>

          <Section>
            <SectionTitle>{t('community.write_screen.titleLabel')}</SectionTitle>
            <TitleInput
              onChangeText={(value) => { setTitle(value); setValidation(null); }}
              placeholder={t('community.write_screen.titlePlaceholder')}
              placeholderTextColor={theme.colors.textAlternative}
              testID="v2-community-write-title"
              value={title}
            />
            <BodyInput
              multiline
              onChangeText={(value) => { setBody(value); setValidation(null); }}
              placeholder={t('community.write_screen.bodyPlaceholder')}
              placeholderTextColor={theme.colors.textAlternative}
              testID="v2-community-write-body"
              textAlignVertical="top"
              value={body}
            />
            <GuideRow>
              <GuideDot />
              <GuideText>{t('community.write_screen.guideText')}</GuideText>
            </GuideRow>
            {validation ? (
              <ValidationText accessibilityLiveRegion="assertive">
                {t(`community.write_screen.validation.${validation === 'title-required' ? 'titleRequired' : 'bodyRequired'}`)}
              </ValidationText>
            ) : null}
          </Section>

          <Section>
            <SectionTitle>{t('community.write_screen.photoSection')}</SectionTitle>
            <SectionSubtitle>{t('community.write_screen.photoCount', { count: MAX_PHOTOS })}</SectionSubtitle>
            <PhotoRow horizontal showsHorizontalScrollIndicator={false}>
              <PhotoPicker
                accessibilityLabel={t('community.write_screen.addPhotos')}
                accessibilityRole="button"
                disabled={photoUris.length >= MAX_PHOTOS}
                testID="v2-community-write-photo-picker"
              >
                <PhotoPickerIcon height={28} width={28} />
                <PhotoPickerCount>{photoUris.length}/{MAX_PHOTOS}</PhotoPickerCount>
              </PhotoPicker>
              {photoUris.map((uri, index) => (
                <PhotoWrap key={uri}>
                  <Photo source={{ uri }} />
                  <RemovePhoto
                    accessibilityLabel={t('community.write_screen.addPhotos')}
                    accessibilityRole="button"
                    onPress={() => setPhotoUris((current) => current.filter((_, i) => i !== index))}
                  >
                    <CloseSmallIcon height={14} width={14} />
                  </RemovePhoto>
                </PhotoWrap>
              ))}
            </PhotoRow>
          </Section>

          {placeTag ? (
            <PlaceSection>
              <PlaceHead>
                <PlaceHeadTitle>{t('community.write_screen.placeTagTitle')}</PlaceHeadTitle>
                <PlaceHeadTag>{t(`community.categories.${tag}`)}</PlaceHeadTag>
              </PlaceHead>
              <PlaceSubtitle>{t('community.write_screen.placeTagHint')}</PlaceSubtitle>
              <PlaceCard>
                <PlaceImageWrap>
                  {placeTag.imageUrl ? <PlaceImage source={{ uri: placeTag.imageUrl }} /> : null}
                </PlaceImageWrap>
                <PlaceInfo>
                  <PlaceCategory numberOfLines={1}>{placeTag.category}</PlaceCategory>
                  <PlaceName numberOfLines={1}>{placeTag.name}</PlaceName>
                </PlaceInfo>
                <RemovePlace
                  accessibilityLabel={placeTag.name}
                  accessibilityRole="button"
                  onPress={() => setPlaceTag(null)}
                  testID="v2-community-write-remove-place"
                >
                  <CloseMediumIcon height={19} width={19} />
                </RemovePlace>
              </PlaceCard>
            </PlaceSection>
          ) : null}
        </Content>

        <SubmitBar>
          <SubmitButton accessibilityRole="button" onPress={submit} testID="v2-community-write-submit">
            <SubmitLabel>{t('community.write_screen.submit')}</SubmitLabel>
          </SubmitButton>
        </SubmitBar>
      </KeyboardArea>
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
const Header = styled.View`height: 44px; flex-direction: row; align-items: center; padding: 0 ${({ theme }) => theme.spacing.md}px;`;
const Title = styled(AppText)`flex: 1; text-align: center; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.navigationTitle.fontSize}px; font-weight: ${({ theme }) => theme.typography.navigationTitle.fontWeight};`;
const BackButton = styled.Pressable`width: 40px; height: 42px; align-items: center; justify-content: center;`;
const FilterButton = styled.Pressable`width: 44px; height: 44px; align-items: center; justify-content: center;`;
const KeyboardArea = styled(KeyboardAvoidingView)`flex: 1;`;
const Content = styled(ScrollView)`flex: 1;`;

const Section = styled.View`gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px; border-bottom-width: 8px; border-bottom-color: ${({ theme }) => theme.colors.backgroundAssistive};`;
const SectionHead = styled.View`gap: 4px;`;
const SectionTitle = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: 18px; font-weight: 700;`;
const SectionSubtitle = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: ${({ theme }) => theme.typography.label.fontSize}px;`;

const Chips = styled.View`flex-direction: row; gap: ${({ theme }) => theme.spacing.sm}px;`;
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

const TitleInput = styled(AppTextInput)`padding: 14px 12px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.backgroundAssistive}; color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.typography.body.fontSize}px;`;
const BodyInput = styled(AppTextInput)`min-height: 139px; padding: 14px 12px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.backgroundAssistive}; color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const GuideRow = styled.View`flex-direction: row; align-items: center; gap: 4px;`;
const GuideDot = styled.View`width: 3px; height: 3px; border-radius: 2px; background-color: ${({ theme }) => theme.colors.textMuted};`;
const GuideText = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const ValidationText = styled(AppText)`color: ${({ theme }) => theme.colors.danger}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;

const PhotoRow = styled.ScrollView.attrs({ contentContainerStyle: { gap: 8, paddingTop: 4 } })``;
const PhotoPicker = styled.Pressable`width: 72px; height: 72px; align-items: center; justify-content: center; gap: 4px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.disabled};`;
const PhotoPickerCount = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.label.fontSize}px;`;
const PhotoWrap = styled.View`width: 72px; height: 72px; border-radius: ${({ theme }) => theme.radius.md}px; overflow: hidden; border-width: 1px; border-color: ${({ theme }) => theme.colors.backgroundNeutral};`;
const Photo = styled(Image)`width: 100%; height: 100%;`;
const RemovePhoto = styled.Pressable`position: absolute; right: 3px; top: 3px; width: 20px; height: 20px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.full}px; background-color: rgba(0, 0, 0, 0.4);`;

const PlaceSection = styled.View`gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;`;
const PlaceHead = styled.View`flex-direction: row; align-items: center; gap: 4px;`;
const PlaceHeadTitle = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: 18px; font-weight: 700;`;
const PlaceHeadTag = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.label.fontSize}px;`;
const PlaceSubtitle = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const PlaceCard = styled.View`flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.backgroundAssistive};`;
const PlaceImageWrap = styled.View`width: 50px; height: 50px; border-radius: ${({ theme }) => theme.radius.sm}px; overflow: hidden; background-color: ${({ theme }) => theme.colors.disabled};`;
const PlaceImage = styled(Image)`width: 100%; height: 100%;`;
const PlaceInfo = styled.View`flex: 1; gap: 4px; min-width: 0;`;
const PlaceCategory = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: ${({ theme }) => theme.typography.body.fontSize}px;`;
const PlaceName = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.title.fontSize}px; font-weight: 700;`;
const RemovePlace = styled.Pressable`width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.surface};`;

const SubmitBar = styled.View`padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;`;
const SubmitButton = styled.Pressable`height: 64px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primary};`;
const SubmitLabel = styled(AppText)`color: ${({ theme }) => theme.colors.onPrimary}; font-size: 20px; font-weight: 700;`;
