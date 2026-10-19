import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';
import { Text, TextInput } from './Typography';
import { HeaderBackButton } from './HeaderBackButton';
import Button from './Button';
import { useAppDialog } from './AppDialogProvider';
import { textStyleCss } from '../theme/typography';
import GuideDot from '../assets/icons/edit-guide-dot.svg';
import PhotoIcon from '../../../assets/v2/icons/community/photo-picker.svg';
import CloseIcon from '../../../assets/v2/icons/community/close-small.svg';

export type EditPhoto = { key: string; uri: string; serverId?: number };
export type EditOption = { id: string; label: string; icon?: React.ReactNode };
export type ContentEditDraft = { title?: string; content: string; selectedIds: string[]; photos: EditPhoto[] };
export type EditPhotoPicker = (remaining: number) => Promise<{ status: 'selected' | 'cancelled' | 'denied'; uris: string[] }>;

type Props = {
  heading: string; selectionTitle: string; selectionHint: string; options: EditOption[];
  initialSelectedIds: string[]; initialContent: string; initialTitle?: string; initialPhotos: EditPhoto[];
  maxPhotos: number; maxContentLength: number; maxTitleLength?: number; selectionLimit?: number;
  children?: React.ReactNode; extraDirty?: boolean; onBack: () => void; onDirtyChange?: (dirty: boolean) => void;
  pickPhotos: EditPhotoPicker; busy?: boolean; onSubmit?: (draft: ContentEditDraft) => void;
};

/** Shared Figma edit layout; drafts and local attachments never mutate server originals. */
export default function ContentEditForm(props: Props) {
  const { t } = useTranslation();
  const dialog = useAppDialog();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState(props.initialTitle);
  const [content, setContent] = useState(props.initialContent);
  const [selectedIds, setSelectedIds] = useState(props.initialSelectedIds);
  const [photos, setPhotos] = useState(props.initialPhotos);
  const [picking, setPicking] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const mounted = useRef(true);
  const pickingLocked = useRef(false);
  const nextPhoto = useRef(0);
  const initial = useRef(JSON.stringify({ title, content, selectedIds, photos }));
  const dirty = !!props.extraDirty || JSON.stringify({ title, content, selectedIds, photos }) !== initial.current;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { props.onDirtyChange?.(dirty); }, [dirty, props.onDirtyChange]);
  const invalid = !content.trim() || content.length > props.maxContentLength || !selectedIds.length
    || (title !== undefined && (!title.trim() || title.length > (props.maxTitleLength ?? 50)));
  const pick = async () => {
    if (props.busy || pickingLocked.current || photos.length >= props.maxPhotos) return;
    pickingLocked.current = true; setPicking(true);
    try {
      const result = await props.pickPhotos(Math.max(0, props.maxPhotos - photos.length));
      if (!mounted.current) return;
      if (result.status === 'denied') dialog.toast(t('editContent.photoDenied'));
      if (result.status === 'selected') setPhotos(current => {
        const known = new Set(current.map(photo => photo.uri));
        const added = result.uris.filter(uri => {
          if (!uri || known.has(uri)) return false;
          known.add(uri); return true;
        })
          .map(uri => ({ key: `local:${++nextPhoto.current}`, uri }));
        return [...current, ...added].slice(0, props.maxPhotos);
      });
    } catch { if (mounted.current) dialog.toast(t('editContent.photoFailed')); }
    finally { pickingLocked.current = false; if (mounted.current) setPicking(false); }
  };
  const select = (id: string) => {
    if (props.busy) return;
    if ((props.selectionLimit ?? 1) === 1) { setSelectedIds([id]); return; }
    setSelectedIds(current => current.includes(id) ? current.filter(value => value !== id)
      : current.length < (props.selectionLimit ?? 1) ? [...current, id] : current);
  };
  const submit = () => {
    setShowErrors(true);
    if (props.busy || invalid || pickingLocked.current) return;
    if (props.onSubmit) props.onSubmit({ title, content, selectedIds, photos });
    else dialog.toast(t('editContent.saveUnavailable'));
  };
  return <Screen edges={['top', 'bottom', 'left', 'right']} testID="content-edit-screen">
    <Header><HeaderBackButton accessibilityLabel={t('editContent.back')} onPress={() => { if (!props.busy) props.onBack(); }} />
      <Heading numberOfLines={2}>{props.heading}</Heading><Spacer /></Header>
    <KeyboardArea behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={insets.top}>
      <Content keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={SCROLL_CONTENT}>
        <Section>
          <Head><SectionTitle>{props.selectionTitle}</SectionTitle><SelectionHint>{props.selectionHint}</SelectionHint></Head>
          <Options>{props.options.map(option => <Chip key={option.id} $selected={selectedIds.includes(option.id)}
            accessibilityRole={(props.selectionLimit ?? 1) === 1 ? 'radio' : 'checkbox'} accessibilityLabel={option.label}
            accessibilityState={{ checked: selectedIds.includes(option.id) }} onPress={() => select(option.id)}>
            {option.icon}<ChipLabel $selected={selectedIds.includes(option.id)}>{option.label}</ChipLabel>
          </Chip>)}</Options>
        </Section>
        <Section>
          <SectionTitle>{t('editContent.contentTitle')}</SectionTitle>
          {title !== undefined ? <TitleInput accessibilityLabel={t('editContent.titleField')} value={title} editable={!props.busy}
            onChangeText={setTitle} maxLength={props.maxTitleLength ?? 50} testID="content-edit-title" /> : null}
          <BodyInput accessibilityLabel={t('editContent.bodyField')} value={content} editable={!props.busy} multiline textAlignVertical="top"
            onChangeText={setContent} maxLength={props.maxContentLength} testID="content-edit-body" />
          <GuideRow><GuideDot /><Guide>{t('editContent.guide')}</Guide></GuideRow>
        </Section>
        <Section>
          <Head><SectionTitle>{t('editContent.photosTitle')}</SectionTitle><Hint>{t('editContent.photosHint', { count: props.maxPhotos })}</Hint></Head>
          <PhotoRow horizontal contentContainerStyle={PHOTO_ROW} keyboardShouldPersistTaps="handled" showsHorizontalScrollIndicator={false}>
            <PhotoPicker accessibilityRole="button" accessibilityLabel={t('editContent.addPhotos')}
              accessibilityState={{ disabled: picking || photos.length >= props.maxPhotos, busy: picking }}
              disabled={props.busy || picking || photos.length >= props.maxPhotos} onPress={() => void pick()}>
              <PhotoIcon /><Hint>{photos.length}/{props.maxPhotos}</Hint>
            </PhotoPicker>
            {photos.map((photo, index) => <PhotoFrame key={photo.key}>
              <Photo source={{ uri: photo.uri }} accessibilityLabel={t('editContent.photo', { index: index + 1 })} />
              <Remove accessibilityRole="button" accessibilityLabel={t('editContent.removePhoto', { index: index + 1 })}
                disabled={props.busy} hitSlop={12} onPress={() => setPhotos(current => current.filter(item => item.key !== photo.key))}><CloseIcon /></Remove>
            </PhotoFrame>)}
          </PhotoRow>
        </Section>
        {props.children}
        <Footer>
          {!props.onSubmit ? <Notice>{t('editContent.saveUnavailable')}</Notice> : null}
          {showErrors && invalid ? <ErrorText accessibilityRole="alert">{t('editContent.required')}</ErrorText> : null}
          <Button fullWidth shape="pill" size="onboarding" label={t('editContent.save')} onPress={submit}
            loading={props.busy} disabled={picking || props.busy} testID="content-edit-submit" />
        </Footer>
      </Content>
    </KeyboardArea>
  </Screen>;
}
const SCROLL_CONTENT = { paddingBottom: 16 } as const;
const PHOTO_ROW = { gap: 8, paddingHorizontal: 24 } as const;
const Screen = styled(SafeAreaView)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
const Header = styled.View`min-height: 44px; flex-direction: row; align-items: center; padding: 0 16px;`;
const Heading = styled(Text)`flex: 1; min-width: 0; text-align: center; color: ${({ theme }) => theme.colors.textStrong}; ${({ theme }) => textStyleCss(theme.typography.navigationTitle)}`;
const Spacer = styled.View`width: 44px;`;
const KeyboardArea = styled(KeyboardAvoidingView)`flex: 1;`;
const Content = styled(ScrollView)`flex: 1;`;
const Section = styled.View`padding: 16px 24px; gap: 12px; border-bottom-width: 8px; border-bottom-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const Head = styled.View`gap: 4px;`;
const SelectionHint = styled(Text)`color: ${({ theme }) => theme.colors.textAlternative}; ${({ theme }) => textStyleCss(theme.typography.labelMedium)}`;
const SectionTitle = styled(Text)`color: ${({ theme }) => theme.colors.labelNormal}; ${({ theme }) => textStyleCss(theme.typography.headline2Bold)}`;
const Hint = styled(Text)`color: ${({ theme }) => theme.colors.textAlternative}; ${({ theme }) => textStyleCss(theme.typography.captionRegular)}`;
const Options = styled.View`flex-direction: row; flex-wrap: wrap; gap: 8px; padding-top: 4px;`;
const Chip = styled.Pressable.attrs({ hitSlop: 4 })<{ $selected: boolean }>`min-height: 36px; flex-direction: row; gap: 4px; align-items: center; padding: 8px 16px; border-radius: 16px; border-width: 1px; border-color: ${({ theme, $selected }) => $selected ? theme.liquidGlass.category.activeBorder : 'transparent'}; background-color: ${({ theme, $selected }) => $selected ? theme.liquidGlass.category.activeTint : theme.colors.backgroundAssistive};`;
const ChipLabel = styled(Text)<{ $selected: boolean }>`flex-shrink: 1; color: ${({ theme, $selected }) => $selected ? theme.colors.primary : theme.colors.textAlternative}; ${({ theme }) => textStyleCss(theme.typography.labelMedium)}`;
const TitleInput = styled(TextInput)`padding: 14px 12px; min-height: 49px; border-radius: 12px; background-color: ${({ theme }) => theme.colors.backgroundAssistive}; color: ${({ theme }) => theme.colors.textAlternative}; ${({ theme }) => textStyleCss(theme.typography.bodyMedium)}`;
const BodyInput = styled(TextInput)`padding: 14px 12px; height: 139px; border-radius: 12px; background-color: ${({ theme }) => theme.colors.backgroundAssistive}; color: ${({ theme }) => theme.colors.textAlternative}; ${({ theme }) => textStyleCss(theme.typography.labelMedium)}`;
const GuideRow = styled.View`flex-direction: row; gap: 4px; align-items: center;`;
const Guide = styled(Hint)`flex: 1; min-width: 0; color: ${({ theme }) => theme.colors.labelAssistive};`;
const PhotoRow = styled.ScrollView`flex-grow: 0; margin: 0 -24px;`;
const PhotoPicker = styled.Pressable`width: 73px; height: 72px; gap: 4px; border-radius: 12px; align-items: center; justify-content: center; background-color: ${({ theme }) => theme.colors.labelDisabled};`;
const PhotoFrame = styled.View`width: 72px; height: 72px;`;
const Photo = styled.Image`width: 72px; height: 72px; border-radius: 12px; border-width: 1px; border-color: ${({ theme }) => theme.colors.lineNeutral};`;
const Remove = styled.Pressable`position: absolute; top: 3px; right: 3px; width: 20px; height: 20px; align-items: center; justify-content: center; border-radius: 10px; background-color: ${({ theme }) => theme.colors.overlayDim};`;
const Footer = styled.View`padding: 16px 24px 0; gap: 12px;`;
const Notice = styled(Hint)`text-align: center;`;
const ErrorText = styled(Hint)`color: ${({ theme }) => theme.colors.danger};`;
