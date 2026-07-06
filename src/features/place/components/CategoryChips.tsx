import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { SvgProps } from 'react-native-svg';
import { clamp } from '../constants/mapLayout';
import type { PlaceCategory } from '../model/place.types';

export type CategoryChipItem = {
  Icon: React.FC<SvgProps>;
  iconHeight: number;
  iconWidth: number;
  id: PlaceCategory;
  label: string;
  labelKey?: string;
};

type CategoryChipsProps = {
  activeCategory?: PlaceCategory | null;
  categories: CategoryChipItem[];
  categoryIconScale: number;
  chipHeight: number;
  onSelectCategory?: (category: PlaceCategory) => void;
  topPaddingX: number;
  uiScale: number;
};

const CategoryChips = ({
  activeCategory,
  categories,
  categoryIconScale,
  chipHeight,
  onSelectCategory,
  topPaddingX,
  uiScale,
}: CategoryChipsProps) => {
  const { t } = useTranslation();
  const shadowGutter = Math.round(clamp(4 * uiScale, 4, 8));

  return (
    <ScrollView
      horizontal
      removeClippedSubviews={false}
      showsHorizontalScrollIndicator={false}
      style={[styles.categoryScroll, { marginHorizontal: -shadowGutter }]}
      contentContainerStyle={[
        styles.categoryList,
        {
          gap: Math.round(clamp(12 * uiScale, 10, 12)),
          paddingBottom: Math.round(clamp(8 * uiScale, 6, 8)),
          paddingLeft: shadowGutter,
          paddingRight: topPaddingX + shadowGutter,
          paddingTop: Math.round(clamp(15 * uiScale, 12, 15)),
        },
      ]}
    >
      {categories.map((category) => {
        const isActive = activeCategory === category.id;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            key={category.id}
            onPress={() => onSelectCategory?.(category.id)}
            style={[
              styles.categoryChip,
              isActive && styles.categoryChipActive,
              {
                gap: Math.round(clamp(6 * uiScale, 5, 6)),
                height: chipHeight,
                paddingHorizontal: Math.round(clamp(12 * uiScale, 10, 12)),
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
                isActive && styles.categoryTextActive,
                {
                  fontSize: Math.round(clamp(14 * uiScale, 13, 14)),
                  lineHeight: Math.round(clamp(18 * uiScale, 16, 18)),
                },
              ]}
            >
              {category.labelKey
                ? t(category.labelKey, { defaultValue: category.label })
                : category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  categoryScroll: {
    overflow: 'visible',
  },
  categoryList: {
    gap: 12,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 22,
    paddingTop: 15,
  },
  categoryChip: {
    alignItems: 'center',
    backgroundColor: '#fcfcfd',
    borderRadius: 14,
    flexDirection: 'row',
    height: 38,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.11,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryChipActive: {
    backgroundColor: '#fff0f4',
    borderColor: '#ff4a75',
    borderWidth: 1,
  },
  categoryText: {
    color: '#5f626d',
    fontSize: 14,
    fontWeight: '800',
    includeFontPadding: false,
  },
  categoryTextActive: {
    color: '#ff1956',
  },
});

export default CategoryChips;
