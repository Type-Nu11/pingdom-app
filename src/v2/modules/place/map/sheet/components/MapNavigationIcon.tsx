import React from 'react';
import Svg, { Path } from 'react-native-svg';
import MapAsset from '../../../../../../assets/v2/icons/place/maping_svg.svg';

/** One map silhouette for sheet categories and bottom navigation. */
export default function MapNavigationIcon({ selected, color, size = 24, testID = 'map-navigation-map' }: {
  selected: boolean;
  color: string;
  size?: number;
  testID?: string;
}) {
  const width = size * 21 / 24;
  if (selected) return <MapAsset color={color} height={size} width={width} testID={`${testID}-filled`} />;
  return <Svg height={size} viewBox="-1 -1 20 23" width={width}>
    <Path d="M9 0C11.3869 0 13.6764 0.934087 15.3643 2.59668C17.0521 4.25932 18 6.51489 18 8.86621C17.9999 11.2174 17.052 13.4722 15.3643 15.1348L9 20.4004L2.63672 15.1348C1.80101 14.3116 1.13787 13.3343 0.685547 12.2588C0.233268 11.1833 5.22794e-05 10.0304 0 8.86621C0 7.70194 0.233217 6.54829 0.685547 5.47266C1.13787 4.3972 1.80105 3.41978 2.63672 2.59668C4.32447 0.934296 6.61328 6.38185e-05 9 0Z"
      fill="none" stroke={color} strokeLinejoin="round" strokeWidth={1.8}
      testID={`${testID}-outline`} />
  </Svg>;
}
