import { CategoryChipItem } from '../components/CategoryChips';
import { FashionGlyph, FoodGlyph, GameGlyph, MusicGlyph } from '../components/CategoryGlyphs';

export const mapCategories: CategoryChipItem[] = [
  {
    id: 'food',
    label: '음식',
    labelKey: 'map.categories.food',
    Icon: FoodGlyph,
    iconWidth: 15,
    iconHeight: 18,
  },
  {
    id: 'music',
    label: '음악',
    labelKey: 'map.categories.music',
    Icon: MusicGlyph,
    iconWidth: 13,
    iconHeight: 17,
  },
  {
    id: 'fashion',
    label: '패션',
    labelKey: 'map.categories.fashion',
    Icon: FashionGlyph,
    iconWidth: 24,
    iconHeight: 18,
  },
  {
    id: 'game',
    label: '게임',
    labelKey: 'map.categories.game',
    Icon: GameGlyph,
    iconWidth: 22,
    iconHeight: 19,
  },
];
