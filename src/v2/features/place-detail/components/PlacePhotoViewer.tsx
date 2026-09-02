import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

type Props = {
  imageUrls: readonly string[];
  initialIndex: number;
  onClose: () => void;
  placeName: string;
  visible: boolean;
};

export default function PlacePhotoViewer({
  imageUrls,
  initialIndex,
  onClose,
  placeName,
  visible,
}: Props) {
  const { t } = useTranslation();
  const images = useMemo(
    () => imageUrls.filter((url) => typeof url === 'string' && url.trim().length > 0),
    [imageUrls],
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!visible || images.length === 0) return;
    setCurrentIndex(Math.min(Math.max(initialIndex, 0), images.length - 1));
  }, [images.length, initialIndex, visible]);

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      statusBarTranslucent
      visible={visible && Boolean(currentImage)}
    >
      <Screen edges={['top', 'right', 'bottom', 'left']} testID="place-photo-viewer">
        <TopBar>
          <Counter accessibilityLiveRegion="polite">
            {t('map.detail.imageViewer.counter', {
              current: currentIndex + 1,
              total: images.length,
            })}
          </Counter>
          <CloseButton
            accessibilityLabel={t('map.detail.imageViewer.close')}
            accessibilityRole="button"
            hitSlop={12}
            onPress={onClose}
          >
            <CloseText>×</CloseText>
          </CloseButton>
        </TopBar>

        <PhotoArea>
          <Photo
            accessibilityLabel={t('map.detail.imageViewer.photo', {
              current: currentIndex + 1,
              name: placeName,
              total: images.length,
            })}
            accessibilityRole="image"
            source={{ uri: currentImage }}
          />
        </PhotoArea>

        {hasMultipleImages ? (
          <Navigation>
            <NavigationButton
              accessibilityLabel={t('map.detail.imageViewer.previous')}
              accessibilityRole="button"
              onPress={() => setCurrentIndex((index) => (
                index === 0 ? images.length - 1 : index - 1
              ))}
            >
              <NavigationText>‹</NavigationText>
            </NavigationButton>
            <NavigationButton
              accessibilityLabel={t('map.detail.imageViewer.next')}
              accessibilityRole="button"
              onPress={() => setCurrentIndex((index) => (
                index === images.length - 1 ? 0 : index + 1
              ))}
            >
              <NavigationText>›</NavigationText>
            </NavigationButton>
          </Navigation>
        ) : null}
      </Screen>
    </Modal>
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.textStrong};
`;

const TopBar = styled.View`
  min-height: 60px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
`;

const Counter = styled.Text`
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const CloseButton = styled.Pressable`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.textAlternative};
`;

const CloseText = styled.Text`
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: 32px;
  line-height: 36px;
`;

const PhotoArea = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const Photo = styled.Image.attrs({ resizeMode: 'contain' })`
  width: 100%;
  height: 100%;
`;

const Navigation = styled.View`
  min-height: 76px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.lg}px;
`;

const NavigationButton = styled.Pressable`
  width: 52px;
  height: 52px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.textAlternative};
`;

const NavigationText = styled.Text`
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: 42px;
  line-height: 46px;
`;
