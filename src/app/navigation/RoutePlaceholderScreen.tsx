import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../shared/components/Button';

type RoutePlaceholderScreenProps = {
  description: string;
  onBack: () => void;
  title: string;
};

const RoutePlaceholderScreen = ({
  description,
  onBack,
  title,
}: RoutePlaceholderScreenProps) => (
  <View style={styles.container}>
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Button label="뒤로 가기" onPress={onBack} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    gap: 12,
    padding: 24,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#F6F8FB',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  description: {
    color: '#555555',
    fontSize: 16,
  },
  title: {
    color: '#1E1E1E',
    fontSize: 24,
    fontWeight: '700',
  },
});

export default RoutePlaceholderScreen;
