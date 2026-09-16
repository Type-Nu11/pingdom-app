import { useCallback, useEffect, useRef, useState } from 'react';

/** One local input session at a time. Returning to the map permits a new session. */
export function useMapAssistantEntry(enabled: boolean, isFocused: boolean) {
  const [isOpen, setIsOpen] = useState(false);
  const opening = useRef(false);
  const close = useCallback(() => {
    opening.current = false;
    setIsOpen(false);
  }, []);
  useEffect(() => {
    if (!enabled || !isFocused) close();
  }, [close, enabled, isFocused]);
  const open = useCallback(() => {
    if (!enabled || !isFocused || opening.current) return;
    opening.current = true;
    setIsOpen(true);
  }, [enabled, isFocused]);
  return { close, open, isOpen: enabled && isFocused && isOpen, enabled: enabled && isFocused };
}
