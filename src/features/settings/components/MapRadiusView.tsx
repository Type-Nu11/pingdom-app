import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import {
  MAX_RECOMMENDATION_RADIUS_KM,
  MIN_RECOMMENDATION_RADIUS_KM,
  useMapSettingsStore,
} from '../../../app/store/mapSettingsStore';
import SettingsNavBar from './SettingsNavBar';

type MapRadiusViewProps = {
  onBack: () => void;
};

const MapRadiusView = ({ onBack }: MapRadiusViewProps) => {
  const storedRadiusKm = useMapSettingsStore((state) => state.recommendationRadiusKm);
  const setRecommendationRadiusKm = useMapSettingsStore((state) => state.setRecommendationRadiusKm);
  const [radiusKm, setRadiusKm] = useState(storedRadiusKm);

  const handleSave = () => {
    void setRecommendationRadiusKm(radiusKm);
    onBack();
  };

  return (
    <View style={styles.screen}>
      <SettingsNavBar title="추천 반경 설정" onBack={onBack} />
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          현재 위치 기준으로 장소를 추천받을 반경을 설정합니다.
        </Text>
        <Text style={styles.valueText}>{radiusKm}km</Text>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderEdgeText}>{MIN_RECOMMENDATION_RADIUS_KM}km</Text>
          <Slider
            maximumTrackTintColor="#e4e4e5"
            maximumValue={MAX_RECOMMENDATION_RADIUS_KM}
            minimumTrackTintColor="#ff1956"
            minimumValue={MIN_RECOMMENDATION_RADIUS_KM}
            step={1}
            style={styles.slider}
            thumbTintColor="#ff1956"
            value={radiusKm}
            onValueChange={setRadiusKm}
          />
          <Text style={styles.sliderEdgeText}>{MAX_RECOMMENDATION_RADIUS_KM}km</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={handleSave}>
          <Text style={styles.primaryButtonText}>저장하기</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#ff1956',
    borderRadius: 16,
    height: 64,
    justifyContent: 'center',
    marginTop: 32,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  screen: {
    flex: 1,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  sliderEdgeText: {
    color: '#5e5e66',
    fontSize: 13,
    fontWeight: '500',
  },
  sliderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 12,
  },
  subtitle: {
    color: '#5e5e66',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  valueText: {
    color: '#000000',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default MapRadiusView;
