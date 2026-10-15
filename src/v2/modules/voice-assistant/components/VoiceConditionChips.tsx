import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';
import { Text } from '../../../shared/components/Typography';
import { formatPickerSelection, type PickerField } from './VoiceClarificationPicker';

export function VoiceConditionChips({ values, editing, disabled = false, onEdit }: {
  values: Partial<Record<PickerField, string>>; editing?: PickerField | null; disabled?: boolean;
  onEdit: (field: PickerField) => void;
}) {
  const { t, i18n } = useTranslation();
  const entries = (['date', 'timeRange', 'quantity'] as const).filter(field => values[field] && field !== editing);
  if (!entries.length) return null;
  return <Row horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
    {entries.map(field => {
      const value = values[field]!;
      const label = field === 'quantity' ? t('voiceAssistant.picker.people', { count: Number(value) }) : formatPickerSelection(field, value, i18n.language);
      return <Chip key={field} accessibilityRole="button" accessibilityLabel={`${label} · ${t('voiceAssistant.picker.edit')}`}
        accessibilityState={{ disabled }} disabled={disabled} onPress={() => onEdit(field as PickerField)}>
        <Label>{label} · <Edit>{t('voiceAssistant.picker.edit')}</Edit></Label>
      </Chip>;
    })}
  </Row>;
}
const Row = styled.ScrollView`flex-grow: 0; overflow: visible;`;
const Chip = styled.Pressable.attrs(({ theme }) => ({ style: { boxShadow: theme.liquidGlass.category.shadow } }))`
  height: 34px; padding: 8px 16px; border-radius: 16px;
  background-color: ${({ theme }) => theme.liquidGlass.category.tint}; opacity: ${({ disabled }) => disabled ? 0.4 : 1};`;
const Label = styled(Text)`font-size: 14px; line-height: 18px; font-weight: 500; color: ${({ theme }) => theme.colors.textAlternative};`;
const Edit = styled(Label)`color: ${({ theme }) => theme.colors.primary};`;
