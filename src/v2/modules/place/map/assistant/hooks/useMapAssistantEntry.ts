import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useForegroundWakeWord } from '../../../../voice-assistant';

export const MAP_ASSISTANT_INTRO_SEEN_KEY = '@pingdom/map-assistant-intro-seen/v2';

/** One local input session at a time. Returning to the map permits a new session. */
export function useMapAssistantEntry(enabled: boolean, isFocused: boolean, accountId: string | null = null, wakeWordVisible = true) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const opening = useRef(false);
  const noticeShown = useRef(false);
  const request = useRef(0);
  const openRef = useRef<() => void>(() => {});
  const wakeWord = useForegroundWakeWord({ enabled, focused: isFocused && wakeWordVisible, accountId,
    assistantBusy: isResolving || isNoticeOpen || isOpen }, () => openRef.current());
  const prepareAssistant = wakeWord.prepareAssistant;
  const close = useCallback(() => {
    request.current++;
    opening.current = false;
    setIsOpen(false);
    setIsNoticeOpen(false);
    setIsResolving(false);
  }, []);
  useEffect(() => {
    if (!enabled || !isFocused) close();
  }, [close, enabled, isFocused]);
  useEffect(() => () => { request.current++; }, []);
  useEffect(() => { close(); }, [accountId, close]);
  const open = useCallback(() => {
    if (!enabled || !isFocused || opening.current) return;
    opening.current = true;
    setIsResolving(true);
    const current = ++request.current;
    void (async () => {
      // Both entry paths wait for native KWS teardown before autoStart STT.
      const released = await prepareAssistant();
      if (request.current !== current) return;
      if (!released) { opening.current = false; setIsResolving(false); return; }
      let seen = noticeShown.current;
      if (!seen) {
        try { seen = await AsyncStorage.getItem(MAP_ASSISTANT_INTRO_SEEN_KEY) === '1'; }
        catch { seen = false; }
      }
      if (request.current !== current) return;
      setIsResolving(false);
      if (seen) { setIsOpen(true); return; }
      noticeShown.current = true;
      setIsNoticeOpen(true);
      void AsyncStorage.setItem(MAP_ASSISTANT_INTRO_SEEN_KEY, '1').catch(() => undefined);
    })();
  }, [enabled, isFocused, prepareAssistant]);
  openRef.current = open;
  const continueToAssistant = useCallback(() => {
    if (!enabled || !isFocused || !isNoticeOpen) return;
    setIsNoticeOpen(false);
    setIsOpen(true);
  }, [enabled, isFocused, isNoticeOpen]);
  return { close, open, continueToAssistant, wakeWord,
    isOpen: enabled && isFocused && isOpen,
    isNoticeOpen: enabled && isFocused && isNoticeOpen,
    isBusy: isResolving || isNoticeOpen || isOpen,
    enabled: enabled && isFocused };
}
