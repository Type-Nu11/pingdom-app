import React from 'react';
import { Image } from 'react-native';
import { useTheme } from 'styled-components/native';

export function TranslationAttributionBadge() {
  const { colorScheme } = useTheme();
  return <Image accessibilityLabel="Translated by Google"
    source={colorScheme === 'dark' ? require('./assets/white-short.png') : require('./assets/color-short.png')}
    style={{ width: 122, height: 16 }} />;
}
