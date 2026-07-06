import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { clamp } from '../constants/mapLayout';

export type CategoryChipItem = {
  Icon: React.FC<SvgProps>;
  iconHeight: number;
  iconWidth: number;
  id: string;
  label: string;
};

type CategoryChipsProps = {
  categories: CategoryChipItem[];
  categoryIconScale: number;
  chipHeight: number;
  topPaddingX: number;
  uiScale: number;
};

const CategoryChips = ({
  categories,
  categoryIconScale,
  chipHeight,
  topPaddingX,
  uiScale,
}: CategoryChipsProps) => {
  const shadowGutter = Math.round(clamp(12 * uiScale, 8, 12));

  return (
    <ScrollView
      horizontal
      removeClippedSubviews={false}
      showsHorizontalScrollIndicator={false}
      style={[styles.categoryScroll, { marginHorizontal: -shadowGutter }]}
      contentContainerStyle={[
        styles.categoryList,
        {
          gap: Math.round(clamp(12 * uiScale, 8, 12)),
          paddingBottom: Math.round(clamp(14 * uiScale, 10, 14)),
          paddingLeft: shadowGutter,
          paddingRight: topPaddingX + shadowGutter,
          paddingTop: Math.round(clamp(20 * uiScale, 12, 20)),
        },
      ]}
    >
      {categories.map((category) => (
        <Pressable
          key={category.id}
          style={[
            styles.categoryChip,
            {
              gap: Math.round(clamp(8 * uiScale, 5, 8)),
              height: chipHeight,
              paddingHorizontal: Math.round(clamp(18 * uiScale, 12, 18)),
            },
          ]}
        >
          <category.Icon
            height={Math.round(category.iconHeight * categoryIconScale)}
            width={Math.round(category.iconWidth * categoryIconScale)}
          />
          <Text
            style={[
              styles.categoryText,
              {
                fontSize: Math.round(clamp(19 * uiScale, 14, 19)),
                lineHeight: Math.round(clamp(23 * uiScale, 18, 23)),
              },
            ]}
          >
            {category.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  categoryScroll: {
    overflow: 'visible',
  },
  categoryList: {
    gap: 12,
    paddingBottom: 14,
    paddingLeft: 12,
    paddingRight: 22,
    paddingTop: 20,
  },
  categoryChip: {
    alignItems: 'center',
    backgroundColor: '#fcfcfd',
    borderRadius: 16,
    flexDirection: 'row',
    height: 46,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 4,
  },
  categoryText: {
    color: '#5f626d',
    fontSize: 19,
    fontWeight: '800',
    includeFontPadding: false,
  },
});

export default CategoryChips;
