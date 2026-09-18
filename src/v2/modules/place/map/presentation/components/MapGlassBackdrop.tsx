import React, { createContext, useContext, useRef, type RefObject } from 'react';
import { type View } from 'react-native';
import { BlurTargetView } from 'expo-blur';
import styled from 'styled-components/native';

import MapGlassBackdropNativeView from '../../../../../shared/native/MapGlassBackdropNativeView';

const MapGlassBackdropContext = createContext<RefObject<View | null> | undefined>(undefined);

export const useMapGlassBackdrop = () => useContext(MapGlassBackdropContext);

type Props = React.PropsWithChildren<{ active: boolean }>;

/**
 * The native map draws into a SurfaceView, which Android backdrop blur cannot read.
 * Keep one low-resolution PixelCopy target UNDER the live map, outside its tree.
 * Only glass samples this target; map gestures and the visible map stay native.
 */
export default function MapGlassBackdrop({ active, children }: Props) {
  const targetRef = useRef<View | null>(null);

  if (!MapGlassBackdropNativeView) return <>{children}</>;

  return (
    <MapGlassBackdropContext.Provider value={targetRef}>
      <BackdropTarget
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        ref={targetRef}
        testID="map-glass-backdrop"
      >
        <MapGlassBackdropNativeView captureEnabled={active} style={{ flex: 1 }} />
      </BackdropTarget>
      {children}
    </MapGlassBackdropContext.Provider>
  );
}

const BackdropTarget = styled(BlurTargetView)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;
