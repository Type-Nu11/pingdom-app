import { CategoryChipItem } from '../components/CategoryChips';
import { FashionGlyph, FoodGlyph, GameGlyph, MusicGlyph } from '../components/CategoryGlyphs';
import { HotPlace, MapMarker } from '../model/place.types';

export const mapCategories: CategoryChipItem[] = [
  { id: 'food', label: 'Food', Icon: FoodGlyph, iconWidth: 15, iconHeight: 18 },
  { id: 'music', label: 'Music', Icon: MusicGlyph, iconWidth: 13, iconHeight: 17 },
  { id: 'fashion', label: 'Fashion', Icon: FashionGlyph, iconWidth: 24, iconHeight: 18 },
  { id: 'game', label: 'Game', Icon: GameGlyph, iconWidth: 22, iconHeight: 19 },
];

export const hotPlaceFixtures: HotPlace[] = [
  { id: 'hot-1', rank: 1, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-2', rank: 2, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-3', rank: 3, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-4', rank: 4, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-5', rank: 5, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-6', rank: 6, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-7', rank: 7, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-8', rank: 8, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-9', rank: 9, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-10', rank: 10, location: 'Seoul', username: 'woo._sm' },
];

export const mapMarkerFixtures: MapMarker[] = [
  { id: 'music-1', category: 'music', markerType: 'hot', lat: 35.6643, lng: 128.4137 },
  { id: 'food-1', category: 'food', markerType: 'hot', lat: 35.66455, lng: 128.41425 },
  { id: 'game-1', category: 'game', markerType: 'hot', lat: 35.66405, lng: 128.4147 },
  { id: 'fashion-1', category: 'fashion', markerType: 'default', lat: 35.66372, lng: 128.41385 },
  { id: 'music-2', category: 'music', markerType: 'default', lat: 35.66352, lng: 128.41435 },
  { id: 'food-2', category: 'food', markerType: 'default', lat: 35.66318, lng: 128.41355 },
];
