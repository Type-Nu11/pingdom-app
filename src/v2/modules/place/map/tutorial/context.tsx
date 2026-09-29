import React, { createContext, useCallback, useContext, type PropsWithChildren } from 'react';
import { View, type ViewProps } from 'react-native';
import type { MapTutorialTargetId } from './model';

type TutorialContext = {
  activeTarget: MapTutorialTargetId | null;
  register: (id: MapTutorialTargetId, view: View | null) => void;
  refresh: () => void;
};

export const MapTutorialContext = createContext<TutorialContext>({
  activeTarget: null, register: () => {}, refresh: () => {},
});
export const useMapTutorial = () => useContext(MapTutorialContext);

/** A native measurement boundary; the underlying control remains the source of truth. */
export function MapTutorialTarget({ id, children, ...props }: PropsWithChildren<ViewProps & {
  id: MapTutorialTargetId;
}>) {
  const { register, refresh } = useMapTutorial();
  const setRef = useCallback((view: View | null) => {
    register(id, view);
  }, [id, register]);
  return <View {...props} collapsable={false} onLayout={refresh} ref={setRef}>{children}</View>;
}
