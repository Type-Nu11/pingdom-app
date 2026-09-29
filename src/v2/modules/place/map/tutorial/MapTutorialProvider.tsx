import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { BackHandler, View, useWindowDimensions } from 'react-native';
import styled from 'styled-components/native';
import { MapTutorialContext } from './context';
import { MapTutorialOverlay } from './MapTutorialOverlay';
import { MAP_TUTORIAL_SEEN_KEY, MAP_TUTORIAL_STEPS, type MapTutorialTargetId, type TutorialRect } from './model';

export function MapTutorialProvider({ children, enabled, username }: PropsWithChildren<{
  enabled: boolean;
  username?: string;
}>) {
  const window = useWindowDimensions();
  const [size, setSize] = useState({ width: window.width, height: window.height });
  const [unseen, setUnseen] = useState(false);
  const [index, setIndex] = useState(0);
  const [target, setTarget] = useState<TutorialRect | null>(null);
  const root = useRef<View>(null);
  const targets = useRef(new Map<MapTutorialTargetId, View>());
  const measurement = useRef(0);
  const active = enabled && unseen;
  const step = MAP_TUTORIAL_STEPS[index];
  const activeTarget = active && step !== 'welcome' ? step : null;

  useEffect(() => {
    let mounted = true;
    void AsyncStorage.getItem(MAP_TUTORIAL_SEEN_KEY)
      .then(value => { if (mounted) setUnseen(value !== '1'); })
      .catch(() => { if (mounted) setUnseen(true); });
    return () => { mounted = false; };
  }, []);

  const finish = useCallback(() => {
    setUnseen(false);
    void AsyncStorage.setItem(MAP_TUTORIAL_SEEN_KEY, '1').catch(() => {
      if (__DEV__) console.warn('[map-tutorial] Could not save completion.');
    });
  }, []);
  const next = useCallback(() => {
    if (index === MAP_TUTORIAL_STEPS.length - 1) finish();
    else setIndex(current => Math.min(current + 1, MAP_TUTORIAL_STEPS.length - 1));
  }, [finish, index]);
  const previous = useCallback(() => setIndex(current => Math.max(0, current - 1)), []);

  useEffect(() => {
    if (!active) return;
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      if (index > 0) previous(); else finish();
      return true;
    });
    return () => back.remove();
  }, [active, finish, index, previous]);

  const refresh = useCallback(() => {
    const revision = ++measurement.current;
    const view = activeTarget ? targets.current.get(activeTarget) : null;
    if (!view || !root.current) { setTarget(null); return; }
    // measureLayout excludes the sheet's native animated translation. Window
    // coordinates include it, and subtracting our root also handles safe areas.
    root.current.measureInWindow((rootX, rootY) => {
      view.measureInWindow((x, y, width, height) => {
        if (revision !== measurement.current) return;
        const rect = width > 0 && height > 0 ? { x: x - rootX, y: y - rootY, width, height } : null;
        setTarget(current => current && rect && Object.keys(rect).every(
          key => current[key as keyof TutorialRect] === rect[key as keyof TutorialRect],
        ) ? current : rect);
      });
    });
  }, [activeTarget]);
  const register = useCallback((id: MapTutorialTargetId, view: View | null) => {
    if (view) targets.current.set(id, view);
    else targets.current.delete(id);
  }, []);
  useEffect(() => {
    setTarget(null);
    const frame = requestAnimationFrame(refresh);
    return () => { cancelAnimationFrame(frame); measurement.current++; };
  }, [refresh, size.width, size.height]);
  const context = useMemo(() => ({ activeTarget, register, refresh }), [activeTarget, register, refresh]);

  return <MapTutorialContext.Provider value={context}>
    <View collapsable={false} ref={root} style={{ flex: 1 }} onLayout={event => {
      const { width, height } = event.nativeEvent.layout;
      setSize(current => current.width === width && current.height === height ? current : { width, height });
    }}>
      <Container accessibilityElementsHidden={active} importantForAccessibility={active ? 'no-hide-descendants' : 'auto'}>
        {children}
      </Container>
      {active ? <MapTutorialOverlay index={index} width={size.width} height={size.height} target={target}
        username={username} onClose={finish} onNext={next} onPrevious={previous} /> : null}
    </View>
  </MapTutorialContext.Provider>;
}

const Container = styled.View`flex: 1;`;
