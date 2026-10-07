import React from 'react';
import { ImageBackground, Share } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';
import { Text } from '../../../shared/components/Typography';
import DirectionsIcon from '../assets/directions.svg';
import ShareIcon from '../assets/share.svg';
import StarIcon from '../assets/star.svg';
import type { VoiceCommandViewState } from '../hooks/useVoiceCommands';
import type { VoicePlaceFacts } from '../model/voiceAssistantCommand.types';
import { formatDraftAmount } from '../model/reservationDraft';
import { usePlaceExplorationMediaList } from '../../place/exploration';

const placeCardImage = require('../assets/place-card.png');

type Props = {
  state: VoiceCommandViewState;
  onRetry?: () => void;
  onShowMap?: () => void;
  retryDisabled?: boolean;
  historical?: boolean;
};

export function VoiceCommandResults({ state, onRetry, onShowMap, retryDisabled = false, historical = false }: Props) {
  const { t } = useTranslation();
  const resultPlaces = state.phase === 'result' && state.result.outcome.status === 'succeeded'
    ? (state.result.command === 'searchNearbyPlaces' || state.result.command === 'searchNearbyReservablePlaces')
      ? state.result.outcome.data.places : state.result.command === 'getPlaceDetails' ? [state.result.outcome.data.place] : [] : [];
  // Existing Place media query, using only IDs that the command executor verified.
  const media = usePlaceExplorationMediaList(resultPlaces.map(place => place.id), { enabled: !historical });
  const copy = (key: string) => <Copy testID="voice-command-state" accessibilityLiveRegion="polite">{t(`voiceAssistant.command.${key}`)}</Copy>;
  const clarification = (field: string) => <Copy accessibilityLiveRegion="polite">{t(historical && ['date', 'timeRange', 'quantity'].includes(field)
    ? `voiceAssistant.picker.${field}` : `voiceAssistant.command.fields.${field}`)}</Copy>;
  const error = (code: string, session = false) => <>
    <Copy accessibilityRole="alert">{t([session ? `voiceAssistant.sessionErrors.${code}` : `voiceAssistant.command.errors.${code}`, 'voiceAssistant.command.failed'])}</Copy>
    {!historical && <RetryButton testID="voice-command-retry" accessibilityRole="button" accessibilityLabel={t('voiceAssistant.command.retry')}
      accessibilityState={{ disabled: retryDisabled || !onRetry }} disabled={retryDisabled || !onRetry} onPress={onRetry}>
      <RetryText>{t('voiceAssistant.command.retry')}</RetryText>
    </RetryButton>}
  </>;
  const places = (items: readonly VoicePlaceFacts[]) => <>
    <Cards horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
      {items.map(item => <PlaceCard place={item} imageUrl={media[String(item.id)]?.[0]} key={item.id} />)}
    </Cards>
    <Summary>{t(state.phase === 'result' && state.result.command === 'searchNearbyPlaces'
      ? 'voiceAssistant.command.nearbySummary' : 'voiceAssistant.command.resultSummary', { count: items.length, name: items[0]?.name ?? '' })}</Summary>
    <Actions horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      <PrimaryAction accessibilityRole="button" accessibilityLabel={t('voiceAssistant.command.showOnMap')} disabled={historical} accessibilityState={{ disabled: historical }} onPress={onShowMap}>
        <PrimaryActionText>{t('voiceAssistant.command.showOnMap')}</PrimaryActionText>
      </PrimaryAction>
      <ActionChip accessibilityRole="button" accessibilityLabel={t('voiceAssistant.command.directions')} disabled>
        <DirectionsIcon /><ActionText>{t('voiceAssistant.command.directions')}</ActionText>
      </ActionChip>
      <ActionChip accessibilityRole="button" accessibilityLabel={t('voiceAssistant.command.share')} disabled={historical}
        accessibilityState={{ disabled: historical }} onPress={() => { void Share.share({ message: items.map(item => `${item.name}\n${item.address}`).join('\n\n') }).catch(() => {}); }}>
        <ShareIcon /><ActionText>{t('voiceAssistant.command.share')}</ActionText>
      </ActionChip>
    </Actions>
  </>;

  if (state.phase === 'idle') return null;
  if (state.phase === 'unrecognized') return historical
    ? <Copy>{t('voiceAssistant.feedback.unrecognized')}</Copy> : null;
  if (state.phase === 'error') return error(state.code, true);
  if (state.phase === 'assistant') return <Copy testID="voice-assistant-message" accessibilityLiveRegion="polite">{state.text}</Copy>;
  if (state.phase === 'clarification') return clarification(state.field);
  if (state.phase !== 'result') return copy(state.phase);
  const result = state.result;
  if (result.outcome.status === 'rejected') return error(result.outcome.code);
  if (result.outcome.status === 'clarification_required') return clarification(result.outcome.field);
  if ((result.command === 'searchNearbyReservablePlaces' || result.command === 'searchNearbyPlaces') && result.outcome.status === 'succeeded') {
    return result.outcome.data.places.length ? places(result.outcome.data.places)
      : <Copy testID="voice-command-empty">{t('voiceAssistant.command.empty')}</Copy>;
  }
  if (result.command === 'getPlaceDetails' && result.outcome.status === 'succeeded') return places([result.outcome.data.place]);
  if (result.command === 'getAvailabilities' && result.outcome.status === 'succeeded') return <>
    {copy('slots')}{result.outcome.data.availabilities.length ? result.outcome.data.availabilities.map(slot => <Block key={slot.id}>
      {slot.productName !== null && <Copy>{slot.productName}</Copy>}<Copy>{slot.productType}</Copy>
      <Copy>{slot.startsAt} – {slot.endsAt}</Copy><Copy>{t('voiceAssistant.command.capacity', { count: slot.remainingCapacity })}</Copy>
    </Block>) : <Copy testID="voice-command-empty">{t('voiceAssistant.command.empty')}</Copy>}
  </>;
  if (result.command === 'cancelVoiceSession') return copy('canceled');
  if (result.command === 'prepareReservation' && result.outcome.status === 'succeeded') {
    const draft = result.outcome.data.draft;
    const c = draft.confirmation;
    const amount = (value: number) => formatDraftAmount(value, c.currency, c.currencyFractionDigits);
    return <Block testID="voice-reservation-draft" accessibilityLiveRegion="polite">
      <Copy>{t('voiceAssistant.command.draft.title')}</Copy>
      <Copy>{draft.place.name}</Copy><Copy>{draft.place.address}</Copy>
      <Copy>{t('voiceAssistant.command.general')}</Copy>
      <Copy>{draft.date} ({draft.timezone})</Copy>
      <Copy>{c.startsAt} – {c.endsAt} ({c.timezone})</Copy>
      <Copy>{t('voiceAssistant.command.draft.quantity', { count: c.quantity })}</Copy>
      <Copy>{t('voiceAssistant.command.capacity', { count: draft.availability.remainingCapacity })}</Copy>
      <Copy>{t('voiceAssistant.command.draft.unit', { amount: amount(c.unitAmountMinor) })}</Copy>
      <Copy>{t('voiceAssistant.command.draft.additional', { amount: amount(c.additionalAmountMinor) })}</Copy>
      <Copy testID="voice-reservation-draft-total">{t('voiceAssistant.command.draft.total', { amount: amount(c.totalAmountMinor) })}</Copy>
      <Copy>{t(`voiceAssistant.command.draft.${c.paymentRequired ? 'paymentRequired' : 'noPayment'}`)}</Copy>
      {c.cancellable ? <>
        <Copy>{t('voiceAssistant.command.draft.cancelDeadline', { deadline: c.cancellationDeadline, timezone: c.timezone })}</Copy>
        <Copy>{t('voiceAssistant.command.draft.cancelFee', { amount: amount(c.cancellationFeeMinor) })}</Copy>
        <Copy>{t('voiceAssistant.command.draft.refund', { amount: amount(c.refundableAmountMinor) })}</Copy>
      </> : <Copy>{t('voiceAssistant.command.draft.notCancellable')}</Copy>}
      <Copy>{t('voiceAssistant.command.draft.expires', { expiresAt: c.expiresAt })}</Copy>
      <Copy testID="voice-reservation-draft-not-submitted">{t('voiceAssistant.command.draft.notSubmitted')}</Copy>
    </Block>;
  }
  return null;
}

function PlaceCard({ place, imageUrl }: { place: VoicePlaceFacts; imageUrl?: string }) {
  const { t } = useTranslation();
  return <CardWrap>
    <CardImage testID={`voice-place-image-${place.id}`} source={imageUrl ? { uri: imageUrl } : placeCardImage} resizeMode="cover" accessibilityLabel={place.name}>
      {!imageUrl && <ImageNotice>{t('voiceAssistant.command.sampleImage')}</ImageNotice>}
      <CardShade pointerEvents="none">
        <Svg width="100%" height="100%"><Defs><LinearGradient id="assistantCardShade" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor="#000" stopOpacity="0" /><Stop offset="0.5" stopColor="#000" stopOpacity="0.45" /><Stop offset="1" stopColor="#000" stopOpacity="1" />
        </LinearGradient></Defs><Rect width="100%" height="100%" fill="url(#assistantCardShade)" /></Svg>
      </CardShade>
      <CardFooter>
        <CardName numberOfLines={2}>{place.name}</CardName>
        <StarIcon width={28} height={28} />
      </CardFooter>
    </CardImage>
    <Address numberOfLines={1}>{place.distanceMeters !== undefined
      ? t('voiceAssistant.command.distance', { distance: (place.distanceMeters / 1000).toFixed(2) })
      : place.address || t(`voiceAssistant.command.operating.${place.operatingStatus}`)}</Address>
  </CardWrap>;
}

const Cards = styled.ScrollView`
  margin-horizontal: -16px;
  padding-horizontal: 16px;
`;
const CardWrap = styled.View`width: 164px; gap: 8px;`;
const CardImage = styled(ImageBackground)`width: 164px; height: 164px; border-radius: 16px; overflow: hidden; justify-content: flex-end;`;
const ImageNotice = styled(Text)`position: absolute; top: 8px; left: 8px; color: #f8f8f8; background-color: rgba(0, 0, 0, 0.5); font-size: 10px; padding: 2px 4px; border-radius: 4px;`;
const CardShade = styled.View`position: absolute; left: 0px; right: 0px; bottom: 0px; height: 106px;`;
const CardFooter = styled.View`min-height: 70px; padding: 16px 12px 12px; flex-direction: row; align-items: flex-end; justify-content: space-between; gap: 8px;`;
const CardName = styled(Text)`flex: 1; color: #f8f8f8; font-size: 16px; line-height: 21px; font-weight: 700;`;
const Address = styled(Text)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: 14px; line-height: 18px;`;
const Summary = styled(Text)`color: ${({ theme }) => theme.colors.textStrong}; font-size: 16px; line-height: 21px; font-weight: 500;`;
const Actions = styled.ScrollView`margin-horizontal: -16px; padding-horizontal: 16px;`;
const ActionBase = styled.Pressable.attrs(({ theme }) => ({ style: { boxShadow: theme.liquidGlass.category.shadow } }))`
  height: 34px; padding: 8px 16px; border-radius: 17px; flex-direction: row; align-items: center; justify-content: center; gap: 6px;
`;
const PrimaryAction = styled(ActionBase)`background-color: ${({ theme }) => theme.liquidGlass.category.activeTint}; border-width: 1px; border-color: ${({ theme }) => theme.liquidGlass.category.activeBorder};`;
const ActionChip = styled(ActionBase)`background-color: ${({ theme }) => theme.liquidGlass.category.tint};`;
const PrimaryActionText = styled(Text)`color: ${({ theme }) => theme.colors.primary}; font-size: 14px; line-height: 18px; font-weight: 500;`;
const ActionText = styled(Text)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: 14px; line-height: 18px; font-weight: 500;`;
const Block = styled.View`gap: 4px; padding: 12px 0;`;
const Copy = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-size: 16px; line-height: 21px;`;
const RetryButton = styled.Pressable.attrs(({ theme }) => ({ style: { boxShadow: theme.liquidGlass.category.shadow } }))`
  align-self: flex-start; min-height: 34px; padding: 8px 16px; border-radius: 16px;
  align-items: center; justify-content: center;
  background-color: ${({ theme }) => theme.liquidGlass.category.activeTint};
  border-width: 1px; border-color: ${({ theme }) => theme.liquidGlass.category.activeBorder};
`;
const RetryText = styled(Text)`color: ${({ theme }) => theme.colors.primary}; font-size: 14px; line-height: 18px; font-weight: 500;`;
