import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Text } from '../../../../../shared/components/Typography';
import CarIcon from '../assets/bubble_car.svg';
import TransitIcon from '../assets/bubble_transit.svg';
import WalkIcon from '../assets/bubble_walk.svg';

/** A provider-path screen anchor positions the parent; this component only draws the Figma bubble. */
export function RouteTimeBubble({ mode, duration, label, tailOffset }: {
  mode: 'car' | 'transit' | 'walk'; duration: string; label: string; tailOffset: number;
}) {
  const theme = useTheme();
  const Icon = mode === 'walk' ? WalkIcon : mode === 'transit' ? TransitIcon : CarIcon;
  return <>
    <Bubble style={{ backgroundColor: theme.colors.primaryAlternative }}>
      <Icon /><Labels>
        <Text style={{ color: '#FFFFFF', fontSize: 16, lineHeight: 20.8, fontWeight: '700' }}>{duration}</Text>
        <Text style={{ color: '#FFFFFF', fontSize: 12, lineHeight: 15.6, fontWeight: '500' }}>{label}</Text>
      </Labels>
    </Bubble>
    <Tail style={{ marginLeft: tailOffset, backgroundColor: theme.colors.primaryAlternative }} />
  </>;
}

const Bubble = styled.View.attrs({ style: { boxShadow: '0px 8px 10px rgba(255,25,86,0.08), 0px 2px 3px rgba(255,25,86,0.08)' } })`border-radius: 16px; padding: 8px 12px 8px 10px; flex-direction: row; align-items: center; gap: 6px;`;
const Labels = styled.View``;
const Tail = styled.View`width: 10px; height: 10px; transform: rotate(45deg); margin-top: -5px;`;
