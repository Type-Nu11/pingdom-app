import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import type { SvgProps } from 'react-native-svg';

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

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const CategoryChips = ({
  categories,
  categoryIconScale,
  chipHeight,
  topPaddingX,
  uiScale,
}: CategoryChipsProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.categoryList,
        {
          gap: Math.round(clamp(12 * uiScale, 8, 12)),
          paddingRight: topPaddingX,
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
          <Text style={[styles.categoryText, { fontSize: Math.round(clamp(19 * uiScale, 14, 19)) }]}>
            {category.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  categoryList: {
    gap: 12,
    paddingRight: 22,
    paddingTop: 20,
  },
  categoryChip: {
    alignItems: 'center',
    backgroundColor: '#f9fafc',
    borderRadius: 16,
    flexDirection: 'row',
    height: 46,
    paddingHorizontal: 18,
    shadowColor: '#243041',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
  },
  categoryText: {
    color: '#757780',
    fontSize: 19,
    fontWeight: '800',
  },
});

export default CategoryChips;
