import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';
import { Text } from '../../../shared/components/Typography';
import type { ReservationConfirmation } from '../../booking';
import { usePlaceExplorationMediaList } from '../../place/exploration';
import type { VoicePlaceFacts } from '../model/voiceAssistantCommand.types';
import { formatPickerSelection, localPickerDate, type PickerField } from './VoiceClarificationPicker';
import Chevron from '../assets/review-chevron.svg';

export function VoiceReservationSummary({ confirmation: c, place, disabled, onEdit, onShowPlace }: {
  confirmation: Readonly<ReservationConfirmation>; place: VoicePlaceFacts | null; disabled: boolean;
  onEdit: (field: PickerField) => void; onShowPlace?: (placeId: number) => void;
}) {
  const { t, i18n } = useTranslation();
  const media = usePlaceExplorationMediaList([c.placeId]);
  const image = media[String(c.placeId)]?.[0];
  const start = new Date(c.startsAt), end = new Date(c.endsAt);
  const date = localPickerDate(c.timezone, start), endDate = localPickerDate(c.timezone, end);
  const timeFormat = new Intl.DateTimeFormat(i18n.language, { timeZone: c.timezone, hour: 'numeric', minute: '2-digit', hour12: true });
  const startTime = new Intl.DateTimeFormat('en-GB', { timeZone: c.timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(start);
  const fields: { field: PickerField; label: string }[] = [
    { field: 'quantity', label: t('reservation.create.peopleCount', { count: c.quantity }) },
    { field: 'date', label: formatPickerSelection('date', date, i18n.language) },
    { field: 'timeRange', label: `${timeFormat.format(start)} – ${date !== endDate ? `${formatPickerSelection('date', endDate, i18n.language)} ` : ''}${timeFormat.format(end)}` },
  ];
  return <Summary testID="voice-reservation-summary">
    <PlaceCard accessibilityRole={onShowPlace ? 'button' : undefined} disabled={disabled || !onShowPlace}
      accessibilityLabel={c.placeName} onPress={() => onShowPlace?.(c.placeId)}>
      {image && <Thumbnail source={{ uri: image }} resizeMode="cover" accessibilityLabel={c.placeName} />}
      <PlaceCopy><Meta numberOfLines={1}>{t('reservation.create.peopleCount', { count: c.quantity })}{place?.address ? ` · ${place.address}` : ''}</Meta>
        <NameRow><PlaceName numberOfLines={1}>{c.placeName}</PlaceName><Chevron /></NameRow>
      </PlaceCopy>
    </PlaceCard>
    {fields.map(({ field, label }) => <Section key={field}>
      <Heading>{t(`reservation.create.${field === 'quantity' ? 'people' : field === 'timeRange' ? 'time' : 'date'}`)}</Heading>
      <Selection accessibilityRole="button" accessibilityLabel={`${field === 'timeRange' ? formatPickerSelection('timeRange', startTime, i18n.language) : label} · ${t('voiceAssistant.picker.edit')}`}
        accessibilityState={{ disabled }} disabled={disabled} onPress={() => onEdit(field)}>
        <SelectedValue>{label} · <Edit>{t('voiceAssistant.picker.edit')}</Edit></SelectedValue>
      </Selection>
    </Section>)}
  </Summary>;
}
const Summary = styled.View`gap: 16px;`;
const PlaceCard = styled.Pressable`flex-direction: row; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; background-color: ${({ theme }) => theme.colors.backgroundAssistive};`;
const Thumbnail = styled.Image`width: 50px; height: 50px; border-radius: 8px;`;
const PlaceCopy = styled.View`flex: 1; gap: 4px;`;
const Meta = styled(Text)`font-size: 14px; line-height: 18px; color: ${({ theme }) => theme.colors.textAlternative};`;
const NameRow = styled.View`flex-direction: row; align-items: center; gap: 4px;`;
const PlaceName = styled(Text)`flex-shrink: 1; font-size: 20px; line-height: 26px; font-weight: 700; color: ${({ theme }) => theme.colors.textStrong};`;
const Section = styled.View`gap: 16px; padding-bottom: 16px; border-bottom-width: 8px; border-bottom-color: ${({ theme }) => theme.colors.fillNormal};`;
const Heading = styled(Text)`font-size: 18px; line-height: 24px; font-weight: 700; color: ${({ theme }) => theme.colors.textStrong};`;
const Selection = styled.Pressable`align-self: flex-start; padding: 8px 16px; border-radius: 16px; border-width: 1px; border-color: ${({ theme }) => theme.liquidGlass.category.activeBorder}; background-color: ${({ theme }) => theme.liquidGlass.category.activeTint}; opacity: ${({ disabled }) => disabled ? 0.4 : 1};`;
const SelectedValue = styled(Text)`font-size: 14px; line-height: 18px; font-weight: 500; color: ${({ theme }) => theme.liquidGlass.category.activeForeground};`;
const Edit = styled(SelectedValue)`color: ${({ theme }) => theme.liquidGlass.category.activeForeground};`;
