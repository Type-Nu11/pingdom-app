import React, { createContext, type PropsWithChildren, useContext } from 'react';
import { unavailableWakeWordAdapter, type WakeWordAdapter } from './wakeWord';

const WakeWordContext = createContext<WakeWordAdapter>(unavailableWakeWordAdapter);
/** Application composition injects a native, licensed Korean KWS runtime here. */
export function WakeWordProvider({ adapter = unavailableWakeWordAdapter, children }: PropsWithChildren<{ adapter?: WakeWordAdapter }>) {
  return <WakeWordContext.Provider value={adapter}>{children}</WakeWordContext.Provider>;
}
export const useWakeWordAdapter = () => useContext(WakeWordContext);
