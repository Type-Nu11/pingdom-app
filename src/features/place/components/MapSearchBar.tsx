import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type MapSearchBarProps = {
  onOpenSearch?: () => void;
  onProfilePress?: () => void;
  profileSize: number;
  searchHeight: number;
  uiScale: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const MapSearchBar = ({
  onOpenSearch,
  onProfilePress,
  profileSize,
  searchHeight,
  uiScale,
}: MapSearchBarProps) => {
  return (
    <View
      style={[
        styles.searchBar,
        {
          height: searchHeight,
          paddingLeft: Math.round(clamp(18 * uiScale, 12, 18)),
          paddingRight: Math.round(clamp(12 * uiScale, 8, 12)),
        },
      ]}
    >
      <Pressable
        accessibilityRole="search"
        accessibilityLabel="집 근처 업체 검색"
        style={styles.searchTapArea}
        onPress={onOpenSearch}
      >
        <Text
          style={[
            styles.searchIcon,
            {
              fontSize: Math.round(clamp(36 * uiScale, 25, 36)),
              lineHeight: Math.round(clamp(39 * uiScale, 28, 39)),
              marginRight: Math.round(clamp(8 * uiScale, 5, 8)),
            },
          ]}
        >
          ⌕
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.searchPlaceholder, { fontSize: Math.round(clamp(25 * uiScale, 17, 25)) }]}
        >
          집 근처 업체 검색
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="프로필 열기"
        hitSlop={8}
        style={[
          styles.profileButton,
          {
            borderRadius: profileSize / 2,
            borderWidth: Math.round(clamp(4 * uiScale, 3, 4)),
            height: profileSize,
            width: profileSize,
          },
        ]}
        onPress={onProfilePress}
      >
        <View
          style={[
            styles.profileHead,
            {
              borderRadius: Math.round(clamp(8 * uiScale, 6, 8)),
              height: Math.round(clamp(15 * uiScale, 11, 15)),
              width: Math.round(clamp(15 * uiScale, 11, 15)),
            },
          ]}
        />
        <View
          style={[
            styles.profileBody,
            {
              height: Math.round(clamp(19 * uiScale, 14, 19)),
              width: Math.round(clamp(30 * uiScale, 23, 30)),
            },
          ]}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    alignItems: 'center',
    backgroundColor: '#fcfcfd',
    borderRadius: 16,
    flexDirection: 'row',
    height: 64,
    paddingLeft: 18,
    paddingRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 4,
  },
  searchIcon: {
    color: '#6b6e7a',
    fontSize: 36,
    lineHeight: 39,
    marginRight: 8,
  },
  searchPlaceholder: {
    color: '#81828c',
    flex: 1,
    fontSize: 25,
    fontWeight: '700',
  },
  searchTapArea: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  profileButton: {
    alignItems: 'center',
    borderColor: '#686973',
    borderRadius: 22,
    borderWidth: 4,
    height: 44,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 44,
  },
  profileHead: {
    backgroundColor: '#686973',
    borderRadius: 8,
    height: 15,
    marginTop: 3,
    width: 15,
  },
  profileBody: {
    backgroundColor: '#686973',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 19,
    marginTop: 2,
    width: 30,
  },
});

export default MapSearchBar;
