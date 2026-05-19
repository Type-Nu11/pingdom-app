import React from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import LikedIcon from '../../../assets/icons/Home/Liked.svg';
import PlaceRecommendIcon from '../../../assets/icons/Home/placeRecommend.svg';
import SavedIcon from '../../../assets/icons/Home/Saved.svg';

type MapActionButtonsProps = {
  addIconSize: number;
  addTextSize: number;
  bottom: number;
  left: number;
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
  right,
  sheetTranslateY,
  smallActionHeight,
  smallActionWidth,
}: MapActionButtonsProps) => {
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
          accessibilityLabel="좋아요 장소 보기"
          hitSlop={8}
          style={styles.quickActionButton}
        >
          <LikedIcon height={smallActionHeight} width={smallActionWidth} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="저장한 장소 보기"
          hitSlop={8}
          style={styles.quickActionButton}
        >
          <SavedIcon height={smallActionHeight} width={smallActionWidth} />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="장소 추가"
        hitSlop={8}
        style={styles.addPlaceButton}
      >
        <PlaceRecommendIcon height={addIconSize} width={addIconSize} />
        <Text style={[styles.addPlaceText, { fontSize: addTextSize, lineHeight: addTextSize + 4 }]}>
          장소 게시
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
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 2,
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
