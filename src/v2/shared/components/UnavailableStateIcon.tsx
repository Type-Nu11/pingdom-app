import React from 'react';
import { View } from 'react-native';
import ContentUnavailableAsset from '../../../assets/v2/icons/common/content-unavailable.svg';

/** Decorative visual; the state title and description provide accessible copy. */
export default function UnavailableStateIcon({ size = 88 }: { size?: number }) {
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <ContentUnavailableAsset width={size} height={size} />
    </View>
  );
}
