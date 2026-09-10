import { Platform, requireNativeComponent, UIManager, type ViewProps } from 'react-native';

type MapGlassBackdropNativeViewProps = ViewProps & {
  captureEnabled: boolean;
};

// Older development binaries keep their translucent fallback until rebuilt.
export const isMapGlassBackdropAvailable = Platform.OS === 'android'
  && UIManager.getViewManagerConfig('MapGlassBackdropView') != null;

const MapGlassBackdropNativeView = isMapGlassBackdropAvailable
  ? requireNativeComponent<MapGlassBackdropNativeViewProps>('MapGlassBackdropView')
  : null;

export default MapGlassBackdropNativeView;
