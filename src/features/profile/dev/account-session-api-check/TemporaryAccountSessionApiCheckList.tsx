import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  TEMPORARY_ACCOUNT_SESSION_ENDPOINTS,
  type TemporaryAccountSessionEndpoint,
} from './model';

type Props = {
  onSelect: (endpoint: TemporaryAccountSessionEndpoint) => void;
};

/**
 * TEMPORARY: Remove this component and its render in ApiCheckScreen after #165/#166 device QA.
 * New endpoints are appended to TEMPORARY_ACCOUNT_SESSION_ENDPOINTS so the latest stays last.
 */
export default function TemporaryAccountSessionApiCheckList({ onSelect }: Props) {
  const accountEndpoints = TEMPORARY_ACCOUNT_SESSION_ENDPOINTS.filter(
    (endpoint) =>
      !endpoint.includes('/firebase/') &&
      !endpoint.includes('/notifications/') &&
      !endpoint.includes('/travel-schedules'),
  );
  const notificationEndpoints = TEMPORARY_ACCOUNT_SESSION_ENDPOINTS.filter(
    (endpoint) => endpoint.includes('/firebase/') || endpoint.includes('/notifications/'),
  );
  const travelScheduleEndpoints = TEMPORARY_ACCOUNT_SESSION_ENDPOINTS.filter(
    (endpoint) => endpoint.includes('/travel-schedules'),
  );

  const renderEndpoint = (endpoint: TemporaryAccountSessionEndpoint) => (
    <Pressable
      accessibilityRole="button"
      key={endpoint}
      style={({ pressed }) => [styles.endpointButton, pressed && styles.pressed]}
      onPress={() => onSelect(endpoint)}
    >
      <Text style={styles.endpointText}>{endpoint}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>계정·세션 API · 임시 실기기 검증</Text>
      {accountEndpoints.map(renderEndpoint)}
      <Text style={[styles.label, styles.sectionLabel]}>여행 일정 API · #168 실기기 검증</Text>
      {travelScheduleEndpoints.map(renderEndpoint)}
      <Text style={[styles.label, styles.sectionLabel]}>FCM·알림 설정 API · #166 실기기 검증</Text>
      {notificationEndpoints.map(renderEndpoint)}
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
  sectionLabel: {
    marginTop: 12,
  },
});
