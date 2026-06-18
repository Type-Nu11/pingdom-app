import {
  type CategoryChipItem,
  FashionGlyph,
  FoodGlyph,
  GameGlyph,
  MusicGlyph,
} from '../components/map';

export const mapCategories: CategoryChipItem[] = [
  { id: 'food', label: 'Food', Icon: FoodGlyph, iconWidth: 15, iconHeight: 18 },
  { id: 'music', label: 'Music', Icon: MusicGlyph, iconWidth: 13, iconHeight: 17 },
  { id: 'fashion', label: 'Fashion', Icon: FashionGlyph, iconWidth: 24, iconHeight: 18 },
  { id: 'game', label: 'Game', Icon: GameGlyph, iconWidth: 22, iconHeight: 19 },
];
