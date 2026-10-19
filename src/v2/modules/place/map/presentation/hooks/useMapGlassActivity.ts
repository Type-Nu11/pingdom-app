import { useEffect, useState } from 'react';
import { useNavigation, type ParamListBase } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

/** Avoid recomputing Android backdrop blur while the native stack composites screens. */
export function useMapGlassActivity(focused: boolean): boolean {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [settled, setSettled] = useState(focused);

  useEffect(() => {
    const start = navigation.addListener('transitionStart', () => setSettled(false));
    const end = navigation.addListener('transitionEnd', event => setSettled(!event.data.closing));
    return () => { start(); end(); };
  }, [navigation]);

  useEffect(() => {
    if (!focused) setSettled(false);
  }, [focused]);

  return focused && settled;
}
