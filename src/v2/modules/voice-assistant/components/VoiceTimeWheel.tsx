import React, { useRef } from 'react';
import { ScrollView, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';
import { Text } from '../../../shared/components/Typography';

const ROW_HEIGHT = 34;
type Item = { value: number; label: string; accessibilityLabel?: string };

/** Native snapping keeps the visible center row aligned with the chosen time. */
function WheelColumn({ items, value, column, cyclic = true, disabled, onChange, onMoving }: {
  items: Item[]; value: number; column: string; cyclic?: boolean; disabled: boolean;
  onChange: (value: number) => void; onMoving: (moving: boolean) => void;
}) {
  const ref = useRef<ScrollView>(null);
  const values = cyclic ? [...items, ...items, ...items] : items;
  const initial = (cyclic ? items.length : 0) + Math.max(0, items.findIndex(item => item.value === value));
  const settle = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.max(0, Math.min(values.length - 1, Math.round(event.nativeEvent.contentOffset.y / ROW_HEIGHT)));
    onChange(values[index].value); onMoving(false);
    if (cyclic && (index < items.length || index >= items.length * 2)) {
      ref.current?.scrollTo({ y: (items.length + index % items.length) * ROW_HEIGHT, animated: false });
    }
  };
  return <Column testID={`voice-time-${column}`} ref={ref} nestedScrollEnabled scrollEnabled={!disabled} showsVerticalScrollIndicator={false}
    snapToInterval={ROW_HEIGHT} decelerationRate="fast" contentOffset={{ x: 0, y: initial * ROW_HEIGHT }}
    contentContainerStyle={{ paddingVertical: ROW_HEIGHT * 2 }}
    onScrollBeginDrag={() => onMoving(true)} onMomentumScrollBegin={() => onMoving(true)} onMomentumScrollEnd={settle}
    onScrollEndDrag={event => { if (!event.nativeEvent.velocity?.y) settle(event); }}>
    {values.map((item, index) => <WheelRow key={index} accessible={!cyclic || (index >= items.length && index < items.length * 2)} accessibilityRole="button" accessibilityLabel={item.accessibilityLabel ?? item.label}
      accessibilityState={{ selected: item.value === value, disabled }} disabled={disabled}
      onPress={() => { onChange(item.value); onMoving(false); ref.current?.scrollTo({ y: index * ROW_HEIGHT, animated: true }); }}>
      <WheelLabel $selected={item.value === value} $distance={Math.min(2, Math.abs(index - initial))}>{item.label}</WheelLabel>
    </WheelRow>)}
  </Column>;
}

export function VoiceTimeWheel({ value, disabled, onChange, onMoving }: {
  value: string; disabled: boolean; onChange: (time: string) => void; onMoving: (moving: boolean) => void;
}) {
  const { t } = useTranslation();
  const [hour, minute] = value.split(':').map(Number);
  const set = (h: number, m: number) => onChange(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  // Preserve any existing exact minute; new wheel choices follow the Figma 10-minute cadence.
  const minutes = [...new Set([0, 10, 20, 30, 40, 50, minute])].sort((a, b) => a - b);
  return <WheelFrame testID="voice-time-wheel">
    <SelectedRow pointerEvents="none" />
    <WheelColumn column="period" items={[0, 1].map(period => ({ value: period, label: t(`voiceAssistant.picker.${period ? 'pm' : 'am'}`) }))}
      value={Math.floor(hour / 12)} cyclic={false} disabled={disabled} onMoving={onMoving}
      onChange={period => set(hour % 12 + period * 12, minute)} />
    <WheelColumn column="hour" items={Array.from({ length: 12 }, (_, index) => ({ value: index, label: t('voiceAssistant.picker.hour', { count: index || 12 }) }))}
      value={hour % 12} disabled={disabled} onMoving={onMoving} onChange={h => set(h + Math.floor(hour / 12) * 12, minute)} />
    <WheelColumn column="minute" items={minutes.map(m => ({ value: m, label: t('voiceAssistant.picker.minute', { count: m }).replace(String(m), String(m).padStart(2, '0')), accessibilityLabel: t('voiceAssistant.picker.minute', { count: m }) }))}
      value={minute} disabled={disabled} onMoving={onMoving} onChange={m => set(hour, m)} />
  </WheelFrame>;
}

const WheelFrame = styled.View`height: 186px; padding: 8px; flex-direction: row; border-radius: 20px; overflow: hidden;
  background-color: ${({ theme }) => theme.liquidGlass.category.tint};`;
const SelectedRow = styled.View`position: absolute; left: 8px; right: 8px; top: 76px; height: 34px; border-radius: 16px;
  border-width: 1px; border-color: ${({ theme }) => theme.liquidGlass.category.activeBorder};
  background-color: ${({ theme }) => theme.liquidGlass.category.activeTint};`;
const Column = styled(ScrollView)`flex: 1; height: 170px;`;
const WheelRow = styled.Pressable`height: 34px; align-items: center; justify-content: center;`;
const WheelLabel = styled(Text)<{ $selected: boolean; $distance: number }>`font-size: ${({ $selected }) => $selected ? 18 : 16}px;
  line-height: 24px; font-weight: ${({ $selected }) => $selected ? 700 : 500};
  color: ${({ theme, $selected, $distance }) => $selected ? theme.colors.primary : ($distance > 1 ? theme.colors.textAlternative : theme.colors.text)};
  opacity: ${({ $selected, $distance }) => $selected ? 1 : $distance > 1 ? 0.4 : 0.7};`;
