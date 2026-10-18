import React from 'react';
import MapAsset from '../../../../../../assets/v2/icons/place/maping_svg.svg';
import MapOutlineAsset from '../../../../../../assets/v2/icons/place/maping_outline.svg';

/**
 * One map silhouette for sheet categories and bottom navigation. Both Figma states
 * share an 18×21 box, so `size` is the rendered height (21 draws the Figma 1:1 icon).
 */
export default function MapNavigationIcon({ selected, color, size = 21, testID = 'map-navigation-map' }: {
  selected: boolean;
  color: string;
  size?: number;
  testID?: string;
}) {
  const width = size * 18 / 21;
  if (selected) return <MapAsset color={color} height={size} width={width} testID={`${testID}-filled`} />;
  return <MapOutlineAsset color={color} height={size} width={width} testID={`${testID}-outline`} />;
}
