import React, { memo, useLayoutEffect, useState, type PropsWithChildren } from 'react';
import styled from 'styled-components/native';
import { MapSheetPageActivityContext } from '../hooks/useMapSheetScrollToTop';

// Keep visited lists and decoded images alive, without reconciling hidden pages
// for every location, query, or gesture update in MapScreen.
const PageContent = memo(function PageContent({ active, children }: PropsWithChildren<{ active: boolean }>) {
  return <MapSheetPageActivityContext.Provider value={active}>{children}</MapSheetPageActivityContext.Provider>;
}, (previous, next) => !previous.active && !next.active);

export default function MapSheetPage({ active, children, testID }: PropsWithChildren<{ active: boolean; testID: string }>) {
  const [visited, setVisited] = useState(active);
  useLayoutEffect(() => { if (active) setVisited(true); }, [active]);
  if (!active && !visited) return null;
  return <Page testID={testID} pointerEvents={active ? 'box-none' : 'none'}
    accessibilityElementsHidden={!active} importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}
    style={{ display: active ? 'flex' : 'none' }}>
    <PageContent active={active}>{children}</PageContent>
  </Page>;
}

const Page = styled.View`position: absolute; top: 0; right: 0; bottom: 0; left: 0;`;
