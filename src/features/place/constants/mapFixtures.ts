import FashionIcon from '../../../assets/icons/Home/fashion.svg';
import FoodIcon from '../../../assets/icons/Home/food.svg';
import GameIcon from '../../../assets/icons/Home/game.svg';
import MusicIcon from '../../../assets/icons/Home/music.svg';
import { CategoryChipItem } from '../components/CategoryChips';
import { HotPlace, MapMarker } from '../model/place.types';

export const mapCategories: CategoryChipItem[] = [
  { id: 'food', label: 'Food', Icon: FoodIcon, iconWidth: 15, iconHeight: 18 },
  { id: 'music', label: 'Music', Icon: MusicIcon, iconWidth: 13, iconHeight: 17 },
  { id: 'fashion', label: 'Fashion', Icon: FashionIcon, iconWidth: 24, iconHeight: 18 },
  { id: 'game', label: 'Game', Icon: GameIcon, iconWidth: 22, iconHeight: 19 },
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
  { id: 'music-1', lat: 35.6643, lng: 128.4137 },
  { id: 'music-2', lat: 35.66455, lng: 128.41425 },
  { id: 'music-3', lat: 35.66405, lng: 128.4147 },
  { id: 'music-4', lat: 35.66372, lng: 128.41385 },
  { id: 'music-5', lat: 35.66352, lng: 128.41435 },
  { id: 'music-6', lat: 35.66318, lng: 128.41355 },
];
