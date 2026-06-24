import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../../shared/components/Button';

type PlaceDetailScreenProps = {
  placeId: string;
  notificationTitle?: string;
  notificationBody?: string;
  onBack: () => void;
};

const PlaceDetailScreen = ({
  placeId,
  notificationTitle,
  notificationBody,
  onBack,
}: PlaceDetailScreenProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>장소 상세 화면</Text>
        <Text style={styles.description}>{`placeId: ${placeId}`}</Text>
        {notificationTitle ? <Text style={styles.notificationTitle}>{notificationTitle}</Text> : null}
        {notificationBody ? <Text style={styles.notificationBody}>{notificationBody}</Text> : null}
        <Button label="지도 화면으로 돌아가기" onPress={onBack} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F8FB',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 24,
    gap: 12,
  },
  title: {
    color: '#1E1E1E',
    fontSize: 24,
    fontWeight: '700',
  },
  description: {
    color: '#555555',
    fontSize: 16,
  },
  notificationTitle: {
    color: '#2D6CDF',
    fontSize: 18,
    fontWeight: '700',
  },
  notificationBody: {
    color: '#1E1E1E',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
});

export default PlaceDetailScreen;
