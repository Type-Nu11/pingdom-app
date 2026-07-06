import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const RADIUS_STORAGE_KEY = '@pingdom/map-recommendation-radius-km:v1';

export const DEFAULT_RECOMMENDATION_RADIUS_KM = 5;
export const MIN_RECOMMENDATION_RADIUS_KM = 1;
export const MAX_RECOMMENDATION_RADIUS_KM = 20;

export type MapSettingsState = {
  isHydrated: boolean;
  recommendationRadiusKm: number;
};

type MapSettingsActions = {
  hydrateMapSettings: () => Promise<void>;
  setRecommendationRadiusKm: (radiusKm: number) => Promise<void>;
};

export type MapSettingsStore = MapSettingsState & MapSettingsActions;

export const useMapSettingsStore = create<MapSettingsStore>((set) => ({
  isHydrated: false,
  recommendationRadiusKm: DEFAULT_RECOMMENDATION_RADIUS_KM,

  hydrateMapSettings: async () => {
    try {
      const saved = await AsyncStorage.getItem(RADIUS_STORAGE_KEY);
      const parsed = saved ? Number(saved) : NaN;

      set({
        isHydrated: true,
        recommendationRadiusKm: Number.isFinite(parsed)
          ? parsed
          : DEFAULT_RECOMMENDATION_RADIUS_KM,
      });
    } catch {
      set({ isHydrated: true });
    }
  },

  setRecommendationRadiusKm: async (radiusKm: number) => {
    const clamped = Math.min(
      MAX_RECOMMENDATION_RADIUS_KM,
      Math.max(MIN_RECOMMENDATION_RADIUS_KM, Math.round(radiusKm))
    );

    set({ recommendationRadiusKm: clamped });
    await AsyncStorage.setItem(RADIUS_STORAGE_KEY, String(clamped));
  },
}));
