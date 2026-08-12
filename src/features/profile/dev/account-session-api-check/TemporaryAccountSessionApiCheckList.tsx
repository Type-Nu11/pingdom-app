import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  TEMPORARY_ACCOUNT_SESSION_ENDPOINTS,
  type TemporaryAccountSessionEndpoint,
} from './model';

type Props = {
  onSelect: (endpoint: TemporaryAccountSessionEndpoint) => void;
};

/**
 * TEMPORARY: Remove this component and its render in ApiCheckScreen after #165 device QA.
 * New endpoints are appended to TEMPORARY_ACCOUNT_SESSION_ENDPOINTS so the latest stays last.
 */
export default function TemporaryAccountSessionApiCheckList({ onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>계정·세션 API · 임시 실기기 검증</Text>
      {TEMPORARY_ACCOUNT_SESSION_ENDPOINTS.map((endpoint) => (
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
  container: {
    gap: 12,
    marginTop: 8,
  },
  endpointButton: {
    backgroundColor: '#ff4771',
    borderRadius: 24,
    justifyContent: 'center',
    minHeight: 72,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  endpointText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  label: {
    color: '#6e6e76',
    fontSize: 13,
    marginBottom: 2,
  },
  pressed: {
    opacity: 0.78,
  },
});
