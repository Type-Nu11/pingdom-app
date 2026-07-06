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
                gap: Math.round(clamp(7 * uiScale, 5, 7)),
                height: chipHeight,
                paddingHorizontal: Math.round(clamp(17 * uiScale, 14, 17)),
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
                  fontSize: Math.round(clamp(17 * uiScale, 15, 17)),
                  lineHeight: Math.round(clamp(21 * uiScale, 18, 21)),
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
    height: 44,
    paddingHorizontal: 17,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 4,
  },
  categoryChipActive: {
    backgroundColor: '#fff0f4',
    borderColor: '#ff4a75',
    borderWidth: 1,
  },
  categoryText: {
    color: '#5f626d',
    fontSize: 17,
    fontWeight: '800',
    includeFontPadding: false,
  },
  categoryTextActive: {
    color: '#ff1956',
  },
});

export default CategoryChips;
