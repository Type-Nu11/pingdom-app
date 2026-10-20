import React from 'react';
import type { SvgProps } from 'react-native-svg';

import type { ReviewReasonKey } from '../api/reviewReasons';
import EasyToFindIcon from '../../../assets/v2/icons/review-tag/review-tag-easy-to-find.svg';
import CleanIcon from '../../../assets/v2/icons/review-tag/review-tag-clean.svg';
import DeliciousIcon from '../../../assets/v2/icons/review-tag/review-tag-delicious.svg';
import KindIcon from '../../../assets/v2/icons/review-tag/review-tag-kind.svg';
import MultilingualIcon from '../../../assets/v2/icons/review-tag/review-tag-multilingual.svg';
import ParkingIcon from '../../../assets/v2/icons/review-tag/review-tag-parking.svg';
import PhotoSpotIcon from '../../../assets/v2/icons/review-tag/review-tag-photo-spot.svg';

type ReviewReasonIconAsset = {
  Icon: React.FC<SvgProps>;
  /** Root `viewBox` width of the source SVG; its height is always 16. */
  viewBoxWidth: number;
};

export const REVIEW_REASON_ICONS = {
  clean: { Icon: CleanIcon, viewBoxWidth: 16 },
  delicious: { Icon: DeliciousIcon, viewBoxWidth: 16 },
  easyToFind: { Icon: EasyToFindIcon, viewBoxWidth: 14 },
  kind: { Icon: KindIcon, viewBoxWidth: 15 },
  multilingual: { Icon: MultilingualIcon, viewBoxWidth: 16 },
  parking: { Icon: ParkingIcon, viewBoxWidth: 16 },
  photoSpot: { Icon: PhotoSpotIcon, viewBoxWidth: 19 },
} as const satisfies Record<ReviewReasonKey, ReviewReasonIconAsset>;

const ICON_VIEWBOX_HEIGHT = 16;

type ReviewReasonIconProps = Omit<SvgProps, 'height' | 'width'> & {
  /** Rendered height; the width follows the source aspect ratio unless `width` is given. */
  height?: number;
  reason: ReviewReasonKey;
  width?: number;
};

/** Decorative, multi-colour reason icon. Source colours are kept as-is in every theme. */
export function ReviewReasonIcon({ height = ICON_VIEWBOX_HEIGHT, reason, width, ...props }: ReviewReasonIconProps) {
  const { Icon, viewBoxWidth } = REVIEW_REASON_ICONS[reason];
  return (
    <Icon
      accessibilityElementsHidden
      height={height}
      importantForAccessibility="no-hide-descendants"
      width={width ?? (height * viewBoxWidth) / ICON_VIEWBOX_HEIGHT}
      {...props}
    />
  );
}
