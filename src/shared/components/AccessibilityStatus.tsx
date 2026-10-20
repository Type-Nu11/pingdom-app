import React, { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';

type AccessibilityStatusProps = {
  message: string;
  visible?: boolean;
};

const AccessibilityStatus = ({ message, visible = true }: AccessibilityStatusProps) => {
  useEffect(() => {
    if (message) AccessibilityInfo.announceForAccessibility(message);
  }, [message]);

  if (!visible) return null;

  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  text: { color: '#475467', fontSize: 14, lineHeight: 20 },
});

export default AccessibilityStatus;
