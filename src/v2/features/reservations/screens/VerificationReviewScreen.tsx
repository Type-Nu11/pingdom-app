import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

const REASONS = [
  { icon: '😇', id: 'kind' },
  { icon: '📌', id: 'easyToFind' },
  { icon: '😋', id: 'delicious' },
  { icon: '🌐', id: 'multilingual' },
  { icon: 'P', id: 'parking' },
  { icon: '📷', id: 'photoSpot' },
  { icon: '✨', id: 'clean' },
] as const;
type ReasonId = typeof REASONS[number]['id'];

type Props = {
  category: string;
  imageUrl?: string;
  onBack: () => void;
  placeName: string;
};

export default function VerificationReviewScreen({ category, imageUrl, onBack, placeName }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedReasons, setSelectedReasons] = useState<ReasonId[]>(['kind', 'delicious']);
  const [review, setReview] = useState('');

  const pickPhotos = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          t('reservation.verification.alerts.permissionTitle'),
          t('reservation.verification.alerts.permissionBody'),
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        mediaTypes: ['images'],
        quality: 0.85,
        selectionLimit: 3,
      });
      if (!result.canceled) setPhotos(result.assets.slice(0, 3).map((asset) => asset.uri));
    } catch {
      Alert.alert(
        t('reservation.verification.alerts.photoErrorTitle'),
        t('reservation.verification.alerts.photoErrorBody'),
      );
    }
  };

  const toggleReason = (reason: ReasonId) => {
    setSelectedReasons((current) => {
      if (current.includes(reason)) return current.filter((item) => item !== reason);
      if (current.length >= 5) return current;
      return [...current, reason];
    });
  };

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']}>
      <Header>
        <BackButton
          accessibilityLabel={t('reservation.common.back')}
          accessibilityRole="button"
          onPress={onBack}
        >
          <BackText>‹</BackText>
        </BackButton>
        <HeaderTitle accessibilityRole="header">
          {t('reservation.verification.title')}
        </HeaderTitle>
        <HeaderSpacer />
      </Header>

      <Content keyboardShouldPersistTaps="handled">
        <ScrollContent>
          <PlaceCard accessibilityRole="button">
            {imageUrl ? (
              <PlaceImage source={{ uri: imageUrl }} />
            ) : (
              <PlaceImageFallback />
            )}
            <PlaceCopy>
              <Category>{category}</Category>
              <PlaceName>{placeName}  ›</PlaceName>
            </PlaceCopy>
          </PlaceCard>

          <SectionTitle>{t('reservation.verification.photo.title')}</SectionTitle>
          <PhotoRow>
            {photos.map((uri) => (
              <PhotoDeleteButton
                accessibilityLabel={t('reservation.verification.photo.delete')}
                accessibilityRole="button"
                key={uri}
                onPress={() => setPhotos((items) => items.filter((item) => item !== uri))}
              >
                <Photo source={{ uri }} />
              </PhotoDeleteButton>
            ))}
            {photos.length < 3 ? (
              <PhotoPicker
                accessibilityLabel={t('reservation.verification.photo.add')}
                accessibilityRole="button"
                onPress={() => void pickPhotos()}
              >
                <PhotoIcon>▧</PhotoIcon>
                <PhotoCount>{photos.length}/3</PhotoCount>
              </PhotoPicker>
            ) : null}
          </PhotoRow>

          <Divider />
          <SectionTitle>{t('reservation.verification.reasons.title')}</SectionTitle>
          <SectionDescription>
            {t('reservation.verification.reasons.description')}
          </SectionDescription>
          <ReasonWrap>
            {REASONS.map((reason) => {
              const selected = selectedReasons.includes(reason.id);
              const label = t(`reservation.verification.reasons.${reason.id}`);
              return (
                <Reason
                  $selected={selected}
                  accessibilityLabel={label}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  key={reason.id}
                  onPress={() => toggleReason(reason.id)}
                >
                  <ReasonIcon>{reason.icon}</ReasonIcon>
                  <ReasonText $selected={selected}>{label}</ReasonText>
                </Reason>
              );
            })}
          </ReasonWrap>
          <SelectedCount>
            {t('reservation.verification.reasons.selectedCount', {
              count: selectedReasons.length,
            })}
          </SelectedCount>

          <Divider />
          <SectionTitle>{t('reservation.verification.review.title')}</SectionTitle>
          <ReviewInput
            accessibilityLabel={t('reservation.verification.review.title')}
            multiline
            onChangeText={setReview}
            placeholder={t('reservation.verification.review.placeholder')}
            placeholderTextColor={theme.colors.textMuted}
            textAlignVertical="top"
            value={review}
          />
        </ScrollContent>
      </Content>

      <SubmitWrap>
        <SubmitButton
          accessibilityRole="button"
          onPress={() => Alert.alert(
            t('reservation.verification.alerts.completeTitle'),
            t('reservation.verification.alerts.completeBody'),
          )}
        >
          <SubmitLabel>{t('reservation.verification.review.submit')}</SubmitLabel>
        </SubmitButton>
      </SubmitWrap>
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
`;

const BackButton = styled.Pressable`
  width: ${({ theme }) => theme.spacing.xxl}px;
  height: ${({ theme }) => theme.spacing.xxl}px;
  align-items: center;
  justify-content: center;
`;

const BackText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.display.fontSize}px;
  line-height: ${({ theme }) => theme.typography.display.lineHeight}px;
`;

const HeaderTitle = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
  text-align: center;
`;

const HeaderSpacer = styled.View`
  width: ${({ theme }) => theme.spacing.xxl}px;
`;

const Content = styled.ScrollView`
  flex: 1;
`;

const ScrollContent = styled.View`
  padding: 0 ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
`;

const PlaceCard = styled.Pressable`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  padding: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const PlaceImage = styled.Image`
  width: ${({ theme }) => theme.spacing.xxl}px;
  height: ${({ theme }) => theme.spacing.xxl}px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
`;

const PlaceImageFallback = styled.View`
  width: ${({ theme }) => theme.spacing.xxl}px;
  height: ${({ theme }) => theme.spacing.xxl}px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background-color: ${({ theme }) => theme.colors.disabled};
`;

const PlaceCopy = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
  margin-left: ${({ theme }) => theme.spacing.md}px;
`;

const Category = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;

const PlaceName = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
`;

const PhotoRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const PhotoDeleteButton = styled.Pressable``;

const Photo = styled.Image`
  width: ${({ theme }) => theme.spacing.xxl * 2}px;
  height: ${({ theme }) => theme.spacing.xxl * 2}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
`;

const PhotoPicker = styled.Pressable`
  width: ${({ theme }) => theme.spacing.xxl * 2}px;
  height: ${({ theme }) => theme.spacing.xxl * 2}px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surfacePressed};
`;

const PhotoIcon = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.display.fontSize}px;
`;

const PhotoCount = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const Divider = styled.View`
  height: ${({ theme }) => theme.spacing.sm}px;
  margin: ${({ theme }) => theme.spacing.lg}px -${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const SectionDescription = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;

const ReasonWrap = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const Reason = styled.Pressable<{ $selected: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ $selected, theme }) => (
    $selected ? theme.colors.primary : theme.colors.surfaceMuted
  )};
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const ReasonIcon = styled.Text`
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
`;

const ReasonText = styled.Text<{ $selected: boolean }>`
  color: ${({ $selected, theme }) => (
    $selected ? theme.colors.primary : theme.colors.textMuted
  )};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;

const SelectedCount = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;

const ReviewInput = styled.TextInput`
  height: ${({ theme }) => theme.spacing.xxl * 4}px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
`;

const SubmitWrap = styled.View`
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const SubmitButton = styled.Pressable`
  min-height: ${({ theme }) => theme.spacing.xxl + theme.spacing.md}px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const SubmitLabel = styled.Text`
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
`;
