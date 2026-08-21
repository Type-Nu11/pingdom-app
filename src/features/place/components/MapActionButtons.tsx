import React from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import LikedIcon from '../../../assets/v2/icons/main/Liked.svg';
import PlaceRecommendIcon from '../../../assets/v2/icons/main/placeRecommend.svg';
import SavedIcon from '../../../assets/v2/icons/main/Saved.svg';

type MapActionButtonsProps = {
  addIconSize: number;
  addTextSize: number;
  bottom: number;
  left: number;
  onAddPlace?: () => void;
  onOpenLikedPlaces?: () => void;
  onOpenSavedPlaces?: () => void;
  right: number;
  sheetTranslateY: Animated.Value;
  smallActionHeight: number;
  smallActionWidth: number;
};

const MapActionButtons = ({
  addIconSize,
  addTextSize,
  bottom,
  left,
  onAddPlace,
  onOpenLikedPlaces,
  onOpenSavedPlaces,
  right,
  sheetTranslateY,
  smallActionHeight,
  smallActionWidth,
}: MapActionButtonsProps) => {
  const { t } = useTranslation();
  const addPlaceLabel = t('map.actions.addPlace', { defaultValue: '게시하기' });

  return (
    <Animated.View
      style={[
        styles.quickActions,
        {
          bottom,
          left,
          right,
          transform: [{ translateY: sheetTranslateY }],
        },
      ]}
    >
      <View style={styles.quickActionGroup}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('map.actions.likedPlaces', { defaultValue: '좋아요 장소 보기' })}
          hitSlop={8}
          onPress={onOpenLikedPlaces}
          style={styles.quickActionButton}
        >
          <LikedIcon height={smallActionHeight} width={smallActionWidth} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('map.actions.savedPlaces', { defaultValue: '저장한 장소 보기' })}
          hitSlop={8}
          onPress={onOpenSavedPlaces}
          style={styles.quickActionButton}
        >
          <SavedIcon height={smallActionHeight} width={smallActionWidth} />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={addPlaceLabel}
        hitSlop={8}
        onPress={onAddPlace}
        style={styles.addPlaceButton}
      >
        <PlaceRecommendIcon height={addIconSize} width={addIconSize} />
        <Text style={[styles.addPlaceText, { fontSize: addTextSize, lineHeight: addTextSize + 4 }]}>
          {addPlaceLabel}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  quickActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
  },
  quickActionGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  quickActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlaceButton: {
    alignItems: 'center',
    backgroundColor: '#ff4a75',
    borderColor: '#f8f8f8',
    borderRadius: 100,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 8,
    height: 37,
    justifyContent: 'center',
    minWidth: 110,
    paddingHorizontal: 12,
    paddingVertical: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 2,
    transform: [{ translateY: -3 }],
    ...Platform.select({
      android: {
        elevation: 3,
      },
    }),
  },
  addPlaceText: {
    color: '#fff',
    fontWeight: '900',
    includeFontPadding: false,
  },
});

export default MapActionButtons;
