import { createContext, useContext, useEffect, useRef } from 'react';

const ScrollToTopContext = createContext(0);
export const MapSheetScrollToTopProvider = ScrollToTopContext.Provider;
export const MapSheetPageActivityContext = createContext(true);

/** A navbar double tap resets mounted content without remounting its filters or queries. */
export function useMapSheetScrollToTop(scrollToTop: () => void) {
  const request = useContext(ScrollToTopContext);
  const active = useContext(MapSheetPageActivityContext);
  const previous = useRef(request);
  const callback = useRef(scrollToTop);
  callback.current = scrollToTop;
  useEffect(() => {
    if (previous.current === request) return;
    previous.current = request;
    if (active) callback.current();
  }, [active, request]);
}
