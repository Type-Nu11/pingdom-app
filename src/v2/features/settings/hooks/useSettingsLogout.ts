import { useRef, useState } from 'react';

export function useSettingsLogout(onLogout?: () => Promise<void>) {
  const lock = useRef(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [failed, setFailed] = useState(false);
  const logout = async () => {
    if (!onLogout || lock.current) return;
    lock.current = true;
    setIsLoggingOut(true);
    setFailed(false);
    try { await onLogout(); }
    catch { setFailed(true); }
    finally { lock.current = false; setIsLoggingOut(false); }
  };
  return { failed, isLoggingOut, logout };
}
