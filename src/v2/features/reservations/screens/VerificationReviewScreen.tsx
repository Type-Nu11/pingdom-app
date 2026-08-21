import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

const REASONS = [
  '친절해요',
  '찾기 쉬워요',
  '맛있어요',
  '다국어 설명이 잘 되어 있어요',
  '주차하기 편해요',
  '사진 찍기 좋아요',
  '매장이 깨끗해요',
] as const;

const REASON_ICONS: Record<typeof REASONS[number], string> = {
  '친절해요': '😇',
  '찾기 쉬워요': '📌',
  '맛있어요': '😋',
  '다국어 설명이 잘 되어 있어요': '🌐',
  '주차하기 편해요': 'P',
  '사진 찍기 좋아요': '📷',
  '매장이 깨끗해요': '✨',
};

type Props = {
  category: string;
  imageUrl?: string;
  onBack: () => void;
  placeName: string;
};

export default function VerificationReviewScreen({ category, imageUrl, onBack, placeName }: Props) {
  const theme = useTheme();
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedReasons, setSelectedReasons] = useState<string[]>(['친절해요', '맛있어요']);
  const [review, setReview] = useState('');

  const pickPhotos = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('사진 권한이 필요합니다', '설정에서 사진 접근을 허용해 주세요.');
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
      Alert.alert('사진을 불러오지 못했습니다', '잠시 후 다시 시도해 주세요.');
    }
  };

  const toggleReason = (reason: string) => {
    setSelectedReasons((current) => {
      if (current.includes(reason)) return current.filter((item) => item !== reason);
      if (current.length >= 5) return current;
      return [...current, reason];
    });
  };

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']}>
      <Header>
        <BackButton accessibilityLabel="뒤로 가기" accessibilityRole="button" onPress={onBack}>
          <BackText>‹</BackText>
        </BackButton>
        <HeaderTitle accessibilityRole="header">검증하기</HeaderTitle>
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

          <SectionTitle>사진 첨부</SectionTitle>
          <PhotoRow>
            {photos.map((uri) => (
              <PhotoDeleteButton
                accessibilityLabel="첨부 사진 삭제"
                accessibilityRole="button"
                key={uri}
                onPress={() => setPhotos((items) => items.filter((item) => item !== uri))}
              >
                <Photo source={{ uri }} />
              </PhotoDeleteButton>
            ))}
            {photos.length < 3 ? (
              <PhotoPicker
                accessibilityLabel="사진 첨부"
                accessibilityRole="button"
                onPress={() => void pickPhotos()}
              >
                <PhotoIcon>▧</PhotoIcon>
                <PhotoCount>{photos.length}/3</PhotoCount>
              </PhotoPicker>
            ) : null}
          </PhotoRow>

          <Divider />
          <SectionTitle>추천 이유</SectionTitle>
          <SectionDescription>최대 5개까지 선택할 수 있어요</SectionDescription>
          <ReasonWrap>
            {REASONS.map((reason) => {
              const selected = selectedReasons.includes(reason);
              return (
                <Reason
                  $selected={selected}
                  accessibilityLabel={reason}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  key={reason}
                  onPress={() => toggleReason(reason)}
                >
                  <ReasonIcon>{REASON_ICONS[reason]}</ReasonIcon>
                  <ReasonText $selected={selected}>{reason}</ReasonText>
                </Reason>
              );
            })}
          </ReasonWrap>
          <SelectedCount>
            <SelectedCountAccent>{selectedReasons.length}</SelectedCountAccent>/5개 선택됨
          </SelectedCount>

          <Divider />
          <SectionTitle>후기 작성</SectionTitle>
          <ReviewInput
            accessibilityLabel="후기 작성"
            multiline
            onChangeText={setReview}
            placeholder="다른 사람들에게 user님의 후기를 알려주세요"
            placeholderTextColor={theme.colors.textMuted}
            textAlignVertical="top"
            value={review}
          />
        </ScrollContent>
      </Content>

      <SubmitWrap>
        <SubmitButton
          accessibilityRole="button"
          onPress={() => Alert.alert('작성 완료', '리뷰 제출 API가 연결되면 등록할 수 있어요.')}
        >
          <SubmitLabel>리뷰하기</SubmitLabel>
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

const SelectedCountAccent = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
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
