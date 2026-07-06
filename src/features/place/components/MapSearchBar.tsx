import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { clamp } from '../constants/mapLayout';

type MapSearchBarProps = {
  onOpenSearch?: () => void;
  onProfilePress?: () => void;
  profileSize: number;
  searchHeight: number;
  uiScale: number;
};

const MapSearchBar = ({
  onOpenSearch,
  onProfilePress,
  profileSize,
  searchHeight,
  uiScale,
}: MapSearchBarProps) => {
  const { t } = useTranslation();
  const accessibilityLabel = t('map.search.accessibilityLabel', {
    defaultValue: '검색어를 입력하세요',
  });
  const placeholder = t('map.search.placeholder', {
    defaultValue: '검색어를 입력하세요...',
  });

  return (
    <View
      style={[
        styles.searchBar,
        {
          height: searchHeight,
          paddingLeft: Math.round(clamp(16 * uiScale, 12, 16)),
          paddingRight: Math.round(clamp(16 * uiScale, 12, 16)),
        },
      ]}
    >
      <Pressable
        accessibilityRole="search"
        accessibilityLabel={accessibilityLabel}
        style={styles.searchTapArea}
        onPress={onOpenSearch}
      >
        <Text
          style={[
            styles.searchIcon,
            {
              fontSize: Math.round(clamp(27 * uiScale, 24, 27)),
              lineHeight: Math.round(clamp(30 * uiScale, 27, 30)),
              marginRight: Math.round(clamp(13 * uiScale, 10, 13)),
            },
          ]}
        >
          ⌕
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.searchPlaceholder, { fontSize: Math.round(clamp(18 * uiScale, 16, 18)) }]}
        >
          {placeholder}
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
            borderWidth: Math.round(clamp(3.5 * uiScale, 3, 3.5)),
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
              height: Math.round(clamp(12 * uiScale, 10, 12)),
              width: Math.round(clamp(12 * uiScale, 10, 12)),
            },
          ]}
        />
        <View
          style={[
            styles.profileBody,
            {
              height: Math.round(clamp(14 * uiScale, 12, 14)),
              width: Math.round(clamp(24 * uiScale, 21, 24)),
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.11,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    color: '#6b6e7a',
    fontSize: 27,
    lineHeight: 30,
    marginRight: 13,
  },
  searchPlaceholder: {
    color: '#81828c',
    flex: 1,
    fontSize: 18,
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
    borderRadius: 16,
    borderWidth: 3.5,
    height: 32,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 32,
  },
  profileHead: {
    backgroundColor: '#686973',
    borderRadius: 8,
    height: 12,
    marginTop: 2,
    width: 12,
  },
  profileBody: {
    backgroundColor: '#686973',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 14,
    marginTop: 2,
    width: 24,
  },
});

export default MapSearchBar;
