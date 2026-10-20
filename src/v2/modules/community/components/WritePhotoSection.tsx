import { Text as AppText } from '../../../shared/components/Typography';
import React from 'react';
import { ActivityIndicator, Image, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import CloseSmallIcon from '../../../../assets/v2/icons/community/close-small.svg';
import PhotoPickerIcon from '../../../../assets/v2/icons/community/photo-picker.svg';
import { textStyleCss } from '../../../shared/theme/typography';
import type { PostPhoto } from '../hooks/usePostPhotoUploads';
import { MAX_POST_PHOTOS } from '../model/photoCount';

export type WritePhotoSectionProps = {
  /** The picker is open or the post is being submitted. */
  disabled?: boolean;
  onOpenSettings: () => void;
  onPick: () => void;
  onRemove: (key: string) => void;
  onRetry: (key: string) => void;
  permissionDenied: boolean;
  photos: readonly PostPhoto[];
  /** Submit was attempted while uploads were still running. */
  showUploadInProgress?: boolean;
};

// Figma `Section/Photos` (8168:10683): heading, "최대 10장" hint, then a row of
// the 73×72 picker (icon over `n/10`) and 72px previews 8px apart, each with a
// 20px remove button in its top-right corner.
export default function WritePhotoSection({
  disabled = false,
  onOpenSettings,
  onPick,
  onRemove,
  onRetry,
  permissionDenied,
  photos,
  showUploadInProgress = false,
}: WritePhotoSectionProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const full = photos.length >= MAX_POST_PHOTOS;
  const pickerDisabled = disabled || full;
  const failures = new Set(photos.flatMap((photo) => (photo.status === 'failed' && photo.failure ? [photo.failure] : [])));

  return (
    <>
      <Head>
        <Title>{t('community.write_screen.photoSection')}</Title>
        <Hint>{t('community.write_screen.photoCount', { count: MAX_POST_PHOTOS })}</Hint>
      </Head>

      <Row
        contentContainerStyle={ROW_CONTENT_STYLE}
        horizontal
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        testID="v2-community-write-photos"
      >
        <Picker
          accessibilityHint={full ? t('community.write_screen.photos.limitReached', { max: MAX_POST_PHOTOS }) : undefined}
          accessibilityLabel={t('community.write_screen.photos.addA11y', { count: photos.length, max: MAX_POST_PHOTOS })}
          accessibilityRole="button"
          accessibilityState={{ disabled: pickerDisabled }}
          disabled={pickerDisabled}
          onPress={onPick}
          testID="v2-community-write-photo-picker"
        >
          <PhotoPickerIcon height={30.5} style={PICKER_ICON_STYLE} width={30.5} />
          <PickerCount testID="v2-community-write-photo-count">
            {t('community.write_screen.photos.counter', { count: photos.length, max: MAX_POST_PHOTOS })}
          </PickerCount>
        </Picker>

        {photos.map((photo, index) => {
          const position = index + 1;
          const retryable = photo.status === 'failed' && photo.failure === 'retryable';
          return (
            <Preview key={photo.key} testID={`v2-community-write-photo-${index}`}>
              <PreviewImage
                accessibilityIgnoresInvertColors
                accessibilityLabel={t('community.write_screen.photos.photoA11y', { index: position })}
                source={{ uri: photo.uri }}
              />
              {photo.status === 'uploading' ? (
                <Overlay
                  accessibilityLabel={t('community.write_screen.photos.uploading', { index: position })}
                  accessible
                  testID={`v2-community-write-photo-${index}-uploading`}
                >
                  <ActivityIndicator color={theme.colors.textInverse} size="small" />
                </Overlay>
              ) : photo.status === 'failed' ? (
                <FailedOverlay
                  accessibilityLabel={retryable ? t('community.write_screen.photos.retryA11y', { index: position }) : undefined}
                  accessibilityRole={retryable ? 'button' : undefined}
                  disabled={!retryable}
                  onPress={() => onRetry(photo.key)}
                  testID={`v2-community-write-photo-${index}-failed`}
                >
                  {retryable ? <RetryLabel>{t('community.write_screen.photos.retry')}</RetryLabel> : null}
                </FailedOverlay>
              ) : null}
              <Remove
                accessibilityLabel={t('community.write_screen.photos.remove', { index: position })}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => onRemove(photo.key)}
                testID={`v2-community-write-photo-${index}-remove`}
              >
                <CloseSmallIcon height={14} width={14} />
              </Remove>
            </Preview>
          );
        })}
      </Row>

      {permissionDenied ? (
        <Notice testID="v2-community-write-photo-permission">
          <NoticeText accessibilityLiveRegion="polite" accessibilityRole="alert">
            {t('community.write_screen.photos.permissionDenied')}
          </NoticeText>
          <NoticeButton accessibilityRole="button" onPress={onOpenSettings} testID="v2-community-write-photo-settings">
            <NoticeButtonLabel>{t('community.write_screen.photos.openSettings')}</NoticeButtonLabel>
          </NoticeButton>
        </Notice>
      ) : null}
      {failures.has('retryable') ? (
        <ErrorText accessibilityLiveRegion="polite" accessibilityRole="alert" testID="v2-community-write-photo-error">
          {t('community.write_screen.photos.uploadFailed')}
        </ErrorText>
      ) : null}
      {failures.has('unsupported') ? (
        <ErrorText accessibilityLiveRegion="polite" accessibilityRole="alert" testID="v2-community-write-photo-unsupported">
          {t('community.write_screen.photos.unsupported')}
        </ErrorText>
      ) : null}
      {failures.has('tooLarge') ? (
        <ErrorText accessibilityLiveRegion="polite" accessibilityRole="alert" testID="v2-community-write-photo-too-large">
          {t('community.write_screen.photos.tooLarge')}
        </ErrorText>
      ) : null}
      {showUploadInProgress && failures.size === 0 ? (
        <ErrorText accessibilityLiveRegion="polite" accessibilityRole="alert" testID="v2-community-write-photo-in-progress">
          {t('community.write_screen.photos.uploadInProgress')}
        </ErrorText>
      ) : null}
    </>
  );
}

const ROW_CONTENT_STYLE = { gap: 8, paddingHorizontal: 24 } as const;
// The exported glyph is a 28px icon in a 30.5px box (2.5px stroke overhang).
const PICKER_ICON_STYLE = { margin: -1.25 } as const;

const Head = styled.View`gap: 4px;`;
const Title = styled(AppText)`color: ${({ theme }) => theme.colors.labelNormal}; ${({ theme }) => textStyleCss(theme.typography.headline2Bold)}`;
const Hint = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; ${({ theme }) => textStyleCss(theme.typography.captionRegular)}`;
// The row bleeds out of the section's 24px side padding so previews scroll
// under the screen edge instead of being clipped at the content column.
const Row = styled(ScrollView)`flex-grow: 0; margin: 0 -24px;`;
const Picker = styled.Pressable`
  width: 73px;
  height: 72px;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.labelDisabled};
`;
const PickerCount = styled(AppText)`color: ${({ theme }) => theme.colors.labelAssistive}; ${({ theme }) => textStyleCss(theme.typography.labelMedium)}`;
const Preview = styled.View`width: 72px; height: 72px;`;
const PreviewImage = styled(Image)`
  width: 72px;
  height: 72px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.lineNeutral};
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;
const Overlay = styled.View`
  position: absolute; top: 0; right: 0; bottom: 0; left: 0;
  align-items: center; justify-content: center;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.overlayDim};
`;
const FailedOverlay = styled.Pressable`
  position: absolute; top: 0; right: 0; bottom: 0; left: 0;
  align-items: center; justify-content: center;
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.danger};
  background-color: ${({ theme }) => theme.colors.overlayDim};
`;
const RetryLabel = styled(AppText)`color: ${({ theme }) => theme.colors.textInverse}; ${({ theme }) => textStyleCss(theme.typography.captionBold)}`;
// Figma `Remove` (8168:10817): 20px `Overlay/Dim` circle 3px inside the photo's
// 1px border, i.e. 4px from the preview's top-right corner.
const Remove = styled.Pressable`
  position: absolute; top: 4px; right: 4px;
  width: 20px; height: 20px;
  align-items: center; justify-content: center;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.overlayDim};
`;
const Notice = styled.View`flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px;`;
const NoticeText = styled(AppText)`flex: 1; color: ${({ theme }) => theme.colors.textAlternative}; ${({ theme }) => textStyleCss(theme.typography.captionRegular)}`;
const NoticeButton = styled.Pressable`padding: 6px 14px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primarySoft};`;
const NoticeButtonLabel = styled(AppText)`color: ${({ theme }) => theme.colors.primary}; ${({ theme }) => textStyleCss(theme.typography.captionBold)}`;
const ErrorText = styled(AppText)`color: ${({ theme }) => theme.colors.danger}; ${({ theme }) => textStyleCss(theme.typography.captionRegular)}`;
