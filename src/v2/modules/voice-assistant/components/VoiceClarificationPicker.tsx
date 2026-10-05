import React, { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';
import { Text } from '../../../shared/components/Typography';
import { buildCalendarDays, shiftCalendarMonth, formatCalendarMonth } from '../../travel/calendar';
import { VOICE_QUANTITY_LIMITS } from '../model/voiceAssistantCommand.types';
import PreviousIcon from '../assets/picker-prev.svg';
import NextIcon from '../assets/picker-next.svg';
import { VoiceTimeWheel } from './VoiceTimeWheel';

export type PickerField = 'date' | 'timeRange' | 'quantity';
export type PickerSelection = Readonly<{ field: PickerField; value: string }>;

export function localPickerDate(timezone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function formatPickerSelection(field: PickerField, value: string, language: string): string {
  if (field === 'quantity') return value;
  if (field === 'date') {
    const date = new Date(`${value}T12:00:00Z`);
    const day = new Intl.DateTimeFormat(language, { month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
    const weekday = new Intl.DateTimeFormat(language, { weekday: 'short', timeZone: 'UTC' }).format(date);
    return `${day} (${weekday})`;
  }
  return value.split('–').map(time => new Intl.DateTimeFormat(language, { hour: 'numeric', ...(time.endsWith(':00') ? {} : { minute: '2-digit' as const }), hour12: true, timeZone: 'UTC' }).format(new Date(`2000-01-01T${time}:00Z`))).join(' – ');
}

/** User selections only. These are search conditions, never availability or a reservation. */
export function VoiceClarificationPicker({ field, timezone, initialValue, disabled = false, request, conditions, onConfirm }: {
  field: PickerField; timezone: string; initialValue?: string; disabled?: boolean; request?: string; conditions?: ReactNode;
  onConfirm: (selection: PickerSelection) => void;
}) {
  const { t, i18n } = useTranslation();
  const copy = (key: string) => t(`voiceAssistant.picker.${key}`);
  const today = localPickerDate(timezone);
  const [date, setDate] = useState(initialValue && field === 'date' ? initialValue : '');
  const [month, setMonth] = useState(() => {
    const [year, number] = (date || today).split('-').map(Number);
    return { year, month: number };
  });
  const [quantity, setQuantity] = useState(field === 'quantity' && initialValue ? Number(initialValue) : 2);
  const [time, setTime] = useState(() => field === 'timeRange' && initialValue ? initialValue.split('–')[0] : '14:00');
  const [moving, setMoving] = useState(false);
  const valid = field === 'date' ? !!date && date >= today : field === 'timeRange' ? /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
    : quantity >= VOICE_QUANTITY_LIMITS.min && quantity <= VOICE_QUANTITY_LIMITS.max;
  const days = buildCalendarDays(month);
  const selectedValue = field === 'date' ? date : field === 'timeRange' ? time : String(quantity);
  const displayValue = field === 'quantity' ? t('voiceAssistant.picker.people', { count: quantity })
    : selectedValue ? formatPickerSelection(field, selectedValue, i18n.language) : '';
  return <Panel testID={`voice-picker-${field}`}>
    <QuestionGroup>
      {!!request && <Query>“{request}”</Query>}
      <Question accessibilityRole="header" accessibilityLiveRegion="polite">{copy(field)}</Question>
    </QuestionGroup>
    {conditions}
    {field === 'date' && <Calendar>
      <MonthRow>
        <MonthArrow accessibilityRole="button" accessibilityLabel={copy('previousMonth')} disabled={disabled || `${month.year}-${String(month.month).padStart(2, '0')}` <= today.slice(0, 7)}
          onPress={() => setMonth(current => shiftCalendarMonth(current, -1))}><PreviousIcon /></MonthArrow>
        <MonthLabel>{formatCalendarMonth(month, i18n.language)}</MonthLabel>
        <MonthArrow accessibilityRole="button" accessibilityLabel={copy('nextMonth')} disabled={disabled}
          onPress={() => setMonth(current => shiftCalendarMonth(current, 1))}><NextIcon /></MonthArrow>
      </MonthRow>
      <Grid>{copy('weekdays').split(',').map(day => <DayLabel key={day}>{day}</DayLabel>)}</Grid>
      <Grid>{days.map((day, index) => day ? <Day key={day.date} $last={index >= days.length - 7}
        accessibilityRole="button" accessibilityLabel={day.date} accessibilityState={{ selected: date === day.date, disabled: disabled || day.date < today }}
        disabled={disabled || day.date < today} onPress={() => setDate(day.date)}>
        <DayCircle collapsable={false}>{date === day.date && <DaySelection testID={`voice-date-selection-${day.date}`} pointerEvents="none" />}<DayText $selected={date === day.date} $today={today === day.date}>{day.day}</DayText></DayCircle>
      </Day> : <DayGap key={index} $last={index >= days.length - 7} />)}</Grid>
    </Calendar>}
    {field === 'timeRange' && <VoiceTimeWheel value={time} disabled={disabled} onMoving={setMoving} onChange={setTime} />}
    {field === 'quantity' && <Quantities horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {Array.from({ length: VOICE_QUANTITY_LIMITS.max - VOICE_QUANTITY_LIMITS.min + 1 }, (_, index) => index + VOICE_QUANTITY_LIMITS.min).map(count => <Quantity key={count} $selected={quantity === count}
        accessibilityRole="button" accessibilityLabel={t('voiceAssistant.picker.people', { count })} accessibilityState={{ selected: quantity === count, disabled }}
        disabled={disabled} onPress={() => setQuantity(count)}><QuantityText $selected={quantity === count}>{t('voiceAssistant.picker.people', { count })}</QuantityText></Quantity>)}
    </Quantities>}
    <Confirm accessibilityRole="button" accessibilityLabel={copy('confirm')} accessibilityState={{ disabled: disabled || !valid || moving }} disabled={disabled || !valid || moving}
      onPress={() => {
        if (!valid || disabled || moving) return;
        // Only the user-confirmed visiting time is submitted; no end time is inferred.
        onConfirm({ field, value: field === 'date' ? date : field === 'timeRange' ? time : String(quantity) });
      }}>
      <ConfirmText>{displayValue ? t('voiceAssistant.picker.confirmValue', { value: displayValue }) : copy('confirm')}</ConfirmText>
    </Confirm>
  </Panel>;
}

const Panel = styled.View`gap: 16px;`;
const QuestionGroup = styled.View`gap: 6px;`;
const Query = styled(Text)`font-size: 14px; line-height: 18px; font-weight: 500; color: ${({ theme }) => theme.colors.text};`;
const Question = styled(Text)`font-size: 16px; line-height: 21px; font-weight: 500; color: ${({ theme }) => theme.colors.textStrong};`;
const Calendar = styled.View`padding: 12px; gap: 4px; border-radius: 20px; background-color: ${({ theme }) => theme.liquidGlass.category.tint};`;
const MonthRow = styled.View`height: 36px; flex-direction: row; align-items: center; justify-content: space-between;`;
const MonthArrow = styled.Pressable`width: 36px; height: 36px; align-items: center; justify-content: center; opacity: ${({ disabled }) => disabled ? 0.3 : 1};`;
const MonthLabel = styled(Text)`font-size: 16px; line-height: 21px; font-weight: 700; color: ${({ theme }) => theme.colors.textStrong};`;
const Grid = styled.View`flex-direction: row; flex-wrap: wrap;`;
const DayLabel = styled(Text)`width: 14.2857%; height: 28px; text-align: center; font-size: 12px; line-height: 28px; font-weight: 500; color: ${({ theme }) => theme.colors.textAlternative};`;
const Day = styled.Pressable<{ $last: boolean }>`width: 14.2857%; height: 38px; margin-bottom: ${({ $last }) => $last ? 0 : 4}px; align-items: center; justify-content: center; opacity: ${({ disabled }) => disabled ? 0.2 : 1};`;
// Keep the native clipping view mounted even before selection. A selected fill is
// created with its own fixed radius instead of turning a flattened transparent view opaque.
const DayCircle = styled.View`width: 36px; height: 36px; border-radius: 18px; overflow: hidden; align-items: center; justify-content: center;`;
const DaySelection = styled.View`position: absolute; width: 36px; height: 36px; border-radius: 18px;
  background-color: ${({ theme }) => theme.colors.primary};`;
const DayText = styled(Text)<{ $selected: boolean; $today: boolean }>`font-size: 16px; line-height: 21px; font-weight: ${({ $selected }) => $selected ? 700 : 500};
  color: ${({ theme, $selected, $today }) => $selected ? '#ffffff' : $today ? theme.colors.primary : theme.colors.textStrong};`;
const DayGap = styled.View<{ $last: boolean }>`width: 14.2857%; height: 38px; margin-bottom: ${({ $last }) => $last ? 0 : 4}px;`;
const Quantities = styled.ScrollView`flex-grow: 0; overflow: visible;`;
const Quantity = styled.Pressable.attrs(({ theme }) => ({ style: { boxShadow: theme.liquidGlass.category.shadow } }))<{ $selected: boolean }>`height: 34px; padding-horizontal: 15px; border-radius: 16px;
  align-items: center; justify-content: center; opacity: ${({ disabled }) => disabled ? 0.4 : 1}; border-width: 1px;
  border-color: ${({ theme, $selected }) => $selected ? theme.liquidGlass.category.activeBorder : 'transparent'};
  background-color: ${({ theme, $selected }) => $selected ? theme.liquidGlass.category.activeTint : theme.liquidGlass.category.tint};`;
const QuantityText = styled(Text)<{ $selected: boolean }>`font-size: 14px; line-height: 18px; font-weight: 500; color: ${({ theme, $selected }) => $selected ? theme.colors.primary : theme.colors.textAlternative};`;
const Confirm = styled.Pressable`height: 48px; border-radius: 24px; align-items: center; justify-content: center; background-color: ${({ theme }) => theme.colors.primary}; opacity: ${({ disabled }) => disabled ? 0.4 : 1};`;
const ConfirmText = styled(Text)`font-size: 16px; line-height: 21px; color: #ffffff; font-weight: 700;`;
