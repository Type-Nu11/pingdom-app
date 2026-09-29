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
  const [{ index, target }, setPresentation] = useState<{ index: number; target: TutorialRect | null }>({
    index: 0, target: null,
  });
  const root = useRef<View>(null);
  const targets = useRef(new Map<MapTutorialTargetId, View>());
  const measurement = useRef(0);
  const transitioning = useRef(false);
  const [busy, setBusy] = useState(false);
  const completeTransition = useCallback(() => {
    transitioning.current = false;
    setBusy(false);
  }, []);
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
    if (transitioning.current) return;
    measurement.current++;
    setUnseen(false);
    void AsyncStorage.setItem(MAP_TUTORIAL_SEEN_KEY, '1').catch(() => {
      if (__DEV__) console.warn('[map-tutorial] Could not save completion.');
    });
  }, []);
  const measureTarget = useCallback((
    id: MapTutorialTargetId | null,
    onMeasured: (rect: TutorialRect | null) => void,
  ) => {
    const revision = ++measurement.current;
    const view = id ? targets.current.get(id) : null;
    if (!view || !root.current) { onMeasured(null); return; }
    // Window coordinates include the native sheet translation. Keep the visible
    // guide unchanged while these callbacks resolve, then publish one snapshot.
    root.current.measureInWindow((rootX, rootY) => {
      if (revision !== measurement.current) return;
      view.measureInWindow((x, y, width, height) => {
        if (revision !== measurement.current) return;
        onMeasured(width > 0 && height > 0 ? { x: x - rootX, y: y - rootY, width, height } : null);
      });
    });
  }, []);
  const showStep = useCallback((nextIndex: number) => {
    if (transitioning.current) return;
    transitioning.current = true;
    setBusy(true);
    const nextStep = MAP_TUTORIAL_STEPS[nextIndex];
    measureTarget(nextStep === 'welcome' ? null : nextStep, nextTarget => {
      setPresentation({ index: nextIndex, target: nextTarget });
    });
  }, [measureTarget]);
  const next = useCallback(() => {
    if (index === MAP_TUTORIAL_STEPS.length - 1) finish();
    else showStep(index + 1);
  }, [finish, index, showStep]);
  const previous = useCallback(() => showStep(Math.max(0, index - 1)), [index, showStep]);

  useEffect(() => {
    if (!active) return;
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      if (index > 0) previous(); else finish();
      return true;
    });
    return () => back.remove();
  }, [active, finish, index, previous]);

  const refresh = useCallback(() => {
    if (!active || transitioning.current) return;
    measureTarget(activeTarget, nextTarget => {
      setPresentation(current => {
        const unchanged = current.target === nextTarget || (current.target && nextTarget
          && current.target.x === nextTarget.x && current.target.y === nextTarget.y
          && current.target.width === nextTarget.width && current.target.height === nextTarget.height);
        return unchanged ? current : { ...current, target: nextTarget };
      });
    });
  }, [active, activeTarget, measureTarget]);
  const register = useCallback((id: MapTutorialTargetId, view: View | null) => {
    if (view) targets.current.set(id, view);
    else targets.current.delete(id);
  }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(refresh);
    return () => {
      cancelAnimationFrame(frame);
      measurement.current++;
    };
  }, [refresh, size.width, size.height]);
  useEffect(() => {
    if (!active) completeTransition();
  }, [active, completeTransition]);
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
        busy={busy} onTransitionEnd={completeTransition} username={username} onClose={finish} onNext={next} onPrevious={previous} /> : null}
    </View>
  </MapTutorialContext.Provider>;
}

const Container = styled.View`flex: 1;`;
