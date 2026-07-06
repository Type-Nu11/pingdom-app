import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type SettingsSectionProps = {
  children: ReactNode;
  title: string;
};

const SettingsSection = ({ children, title }: SettingsSectionProps) => (
  <View>
    <Text style={styles.title}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  title: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 26,
    paddingBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
});

export default SettingsSection;
