import React, { useMemo } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { ErrorState, LoadingState } from '../../../shared/components';
import {
  useCloseOffer,
  useMerchantMedia,
  useMerchantOffers,
  useMerchantOperating,
  useMerchantOwnerProfile,
  useMerchantPlaceDetail,
  useMerchantPlaceInformation,
  useMerchantReviews,
} from '../hooks/useMerchantOwner';
import { toMerchantEvents, toMerchantReviews, toMerchantStore } from '../model/mappers';
import type { MerchantProfileSummary } from '../model/types';
import MerchantMyPageScreen from './MerchantMyPageScreen';

export type MerchantMyPageContainerProps = {
  onBack: () => void;
  onCreateEvent: () => void;
  onEditAddress: () => void;
  onEditBusinessHours: () => void;
  onEditPhoneNumber: () => void;
  onOpenAllReviews: (placeId: number) => void;
  onOpenProfileEdit: () => void;
  onOpenSettings: () => void;
  onOpenVerifiedPlaces: (placeId: number) => void;
  /** Supplied by the navigator, which owns the user profile query. */
  userProfileImageUrl: string | null;
  username: string;
};

export default function MerchantMyPageContainer({
  onBack,
  onCreateEvent,
  onEditAddress,
  onEditBusinessHours,
  onEditPhoneNumber,
  onOpenAllReviews,
  onOpenProfileEdit,
  onOpenSettings,
  onOpenVerifiedPlaces,
  userProfileImageUrl,
  username,
}: MerchantMyPageContainerProps) {
  const { t } = useTranslation();

  const merchantProfileQuery = useMerchantOwnerProfile();
  const placeId = merchantProfileQuery.data?.placeIds[0];

  const detailQuery = useMerchantPlaceDetail(placeId);
  const informationQuery = useMerchantPlaceInformation(placeId);
  const operatingQuery = useMerchantOperating(placeId);
  const mediaQuery = useMerchantMedia(placeId);
  const reviewsQuery = useMerchantReviews(placeId);
  const offersQuery = useMerchantOffers();

  const closeOffer = useCloseOffer();

  const profileSummary: MerchantProfileSummary = useMemo(
    () => ({
      isVerified: merchantProfileQuery.data?.status === 'ACTIVE',
      profileImageUrl: userProfileImageUrl,
      username: username || (merchantProfileQuery.data?.displayName ?? ''),
    }),
    [merchantProfileQuery.data, userProfileImageUrl, username],
  );

  const store = useMemo(
    () =>
      detailQuery.data
        ? toMerchantStore({
            detail: detailQuery.data,
            information: informationQuery.data,
            media: mediaQuery.data,
            operating: operatingQuery.data,
          })
        : null,
    [detailQuery.data, informationQuery.data, mediaQuery.data, operatingQuery.data],
  );

  const reviews = useMemo(
    () => toMerchantReviews(reviewsQuery.data?.content ?? []),
    [reviewsQuery.data],
  );

  const events = useMemo(
    () => (placeId != null ? toMerchantEvents(offersQuery.data?.offers ?? [], placeId) : []),
    [offersQuery.data, placeId],
  );

  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      t('merchantMyPage.events.closeConfirmTitle'),
      t('merchantMyPage.events.closeConfirmBody'),
      [
        { style: 'cancel', text: t('merchantMyPage.events.closeCancel') },
        {
          onPress: () => {
            closeOffer.mutate(Number(eventId), {
              onError: () => Alert.alert(t('merchantMyPage.events.closeFailed')),
            });
          },
          style: 'destructive',
          text: t('merchantMyPage.events.closeConfirm'),
        },
      ],
    );
  };

  const isInitialLoading =
    merchantProfileQuery.isLoading || (placeId != null && detailQuery.isLoading);
  const isError =
    merchantProfileQuery.isError
    || (placeId != null && detailQuery.isError);

  if (isInitialLoading) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <LoadingState description={t('merchantMyPage.loading')} fill />
      </Screen>
    );
  }

  if (isError || !merchantProfileQuery.data) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <ErrorState
          actionLabel={t('merchantMyPage.retry')}
          description={t('merchantMyPage.loadError')}
          fill
          onAction={() => {
            void merchantProfileQuery.refetch();
            void detailQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  if (placeId == null || !store) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <ErrorState description={t('merchantMyPage.noStore')} fill />
      </Screen>
    );
  }

  return (
    <MerchantMyPageScreen
      events={events}
      onBack={onBack}
      onCreateEvent={onCreateEvent}
      onDeleteEvent={handleDeleteEvent}
      onEditAddress={onEditAddress}
      onEditBusinessHours={onEditBusinessHours}
      onEditPhoneNumber={onEditPhoneNumber}
      onOpenAllReviews={() => onOpenAllReviews(placeId)}
      onOpenProfileEdit={onOpenProfileEdit}
      onOpenSettings={onOpenSettings}
      onOpenVerifiedPlaces={() => onOpenVerifiedPlaces(placeId)}
      profile={profileSummary}
      reviews={reviews}
      store={store}
    />
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;
