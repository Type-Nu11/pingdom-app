import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  TEMPORARY_MAP_RANKING_ENDPOINTS,
  type TemporaryMapRankingEndpoint,
} from './model';

type Props = {
  onSelect: (endpoint: TemporaryMapRankingEndpoint) => void;
};

export default function TemporaryMapRankingApiCheckList({ onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Map 랭킹 API · #190 계약 검증(서버 미확정)</Text>
      {TEMPORARY_MAP_RANKING_ENDPOINTS.map((endpoint) => (
        <Pressable
          accessibilityRole="button"
          key={endpoint}
          style={({ pressed }) => [styles.endpointButton, pressed && styles.pressed]}
          onPress={() => onSelect(endpoint)}
        >
          <Text style={styles.endpointText}>{endpoint}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, marginTop: 8 },
  endpointButton: {
    backgroundColor: '#7856ff', borderRadius: 24, justifyContent: 'center',
    minHeight: 72, paddingHorizontal: 22, paddingVertical: 14,
  },
  endpointText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  label: { color: '#6e6e76', fontSize: 13, marginBottom: 2 },
  pressed: { opacity: 0.78 },
});
