import React, { useMemo } from 'react';
import { Image } from 'react-native';
import { useQueries } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { useProfile } from '../../../../features/profile/hooks/useProfile';
import { useMyReviews } from '../../../../features/profile/hooks/useMyReviews';
import { useBookmarkedPlaceIds, useToggleBookmark } from '../hooks/useBookmarks';
import { getInitialCalendarMonth } from '../../onboarding-preferences/model/travelScheduleCalendar';
import { createPlaceDetailQueryOptions } from '../../place-detail/hooks/usePlaceDetail';
import { useCheckIns } from '../../check-ins/hooks/useCheckIns';
import { useCoupons } from '../../offers-coupons/hooks/useOffersCoupons';
import { useReservations } from '../../reservations/hooks/useReservations';
import { useTravelSchedules } from '../../travel-schedules/hooks/useTravelSchedules';
import { ErrorState, LoadingState } from '../../../shared/components';
import MyPageStatValue from '../components/MyPageStatValue';
import TravelCalendar from '../components/TravelCalendar';
import VerifiedPlaceCard from '../components/VerifiedPlaceCard';
import VerifiedPlaceCardSkeleton from '../components/VerifiedPlaceCardSkeleton';
import { getTodayServerTravelDate, selectFeaturedTravelSchedule } from '../model/myPageTravel';
import {
  toVerifiedPlaceEntries,
  toVerifiedPlaceListState,
} from '../model/verifiedPlaceEntries';
import BackIcon from '../../../shared/assets/icons/back.svg';
import ChevronIcon from '../../../shared/assets/icons/chevron-right-24.svg';
import DividerIcon from '../../../shared/assets/icons/divider.svg';
import SettingsIcon from '../../../shared/assets/icons/settings.svg';
import AvatarPlaceholder from '../../../shared/assets/icons/avatar-placeholder.svg';

const VERIFIED_PLACES_LIMIT = 4;
const SKELETON_KEYS = ['skeleton-0', 'skeleton-1', 'skeleton-2', 'skeleton-3'] as const;

// Loading, error and empty slots reserve the height of the content they stand in
// for, so resolving a section does not shift everything below it.
const PROFILE_ROW_HEIGHT = 56;
const TRAVEL_CALENDAR_HEIGHT = 376;
const VERIFIED_PLACE_CARD_HEIGHT = 222;

export type MyPageScreenProps = {
  onBack: () => void;
  onOpenProfileEdit: () => void;
  onOpenSettings: () => void;
  onOpenVerifiedPlaces: () => void;
};

export default function MyPageScreen({
  onBack,
  onOpenProfileEdit,
  onOpenSettings,
  onOpenVerifiedPlaces,
}: MyPageScreenProps) {
  const { t } = useTranslation();
  const {
    isError: isProfileError,
    isLoading: isProfileLoading,
    profile,
    refetch: refetchProfile,
  } = useProfile();
  const reservationsQuery = useReservations();
  const couponsQuery = useCoupons();
  const reviewsQuery = useMyReviews({ limit: 1 });
  const travelSchedulesQuery = useTravelSchedules();
  const checkInsQuery = useCheckIns({ limit: VERIFIED_PLACES_LIMIT });

  const featuredSchedule = useMemo(
    () => selectFeaturedTravelSchedule(
      travelSchedulesQuery.data?.schedules ?? [],
      getTodayServerTravelDate(),
    ),
    [travelSchedulesQuery.data],
  );

  const initialCalendarMonth = useMemo(
    () => getInitialCalendarMonth({
      endDateText: featuredSchedule?.endDate ?? '',
      startDateText: featuredSchedule?.startDate ?? '',
    }),
    [featuredSchedule],
  );

  const placeIds = useMemo(() => {
    const ids = (checkInsQuery.data?.checkIns ?? []).map((checkIn) => checkIn.placeId);
    return Array.from(new Set(ids));
  }, [checkInsQuery.data]);

  const placeDetailQueries = useQueries({
    queries: placeIds.map((placeId) => createPlaceDetailQueryOptions(placeId)),
  });

  const verifiedPlaceListState = toVerifiedPlaceListState(
    toVerifiedPlaceEntries(placeIds, placeDetailQueries),
  );
  const isLoadingCheckIns = checkInsQuery.isLoading;

  const retryVerifiedPlaces = () => {
    void checkInsQuery.refetch();
    placeDetailQueries.forEach((query) => void query.refetch());
  };

  const { bookmarkedPlaceIds } = useBookmarkedPlaceIds();
  const toggleBookmark = useToggleBookmark();

  const toggleFavorite = (placeId: number) => {
    toggleBookmark.mutate({ nextBookmarked: !bookmarkedPlaceIds.has(placeId), placeId });
  };

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-my-page-screen">
      <Content contentContainerStyle={CONTENT_CONTAINER_STYLE}>
        <TopBar>
          <IconButton
            accessibilityLabel={t('myPage.back')}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onBack}
          >
            <BackIcon height={84} style={TOP_BAR_ICON_STYLE} width={80} />
          </IconButton>
          <TopBarTitle>{t('myPage.title')}</TopBarTitle>
          <IconButton
            accessibilityLabel={t('myPage.settings')}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onOpenSettings}
          >
            <SettingsIcon height={84} style={TOP_BAR_ICON_STYLE} width={80} />
          </IconButton>
        </TopBar>

        <Section $borderWidth={8}>
          <SectionContent>
            {isProfileLoading ? (
              <Slot $minHeight={PROFILE_ROW_HEIGHT}>
                <LoadingState description={t('myPage.profileLoading')} />
              </Slot>
            ) : (
              <>
                {/*
                  The row stays tappable even when the profile failed to load:
                  changing a password or a profile image does not depend on the
                  profile response, and replacing the row with an error box would
                  make the edit screen unreachable.
                */}
                <ProfileRow accessibilityRole="button" onPress={onOpenProfileEdit}>
                  <ProfileInfo>
                    {profile?.profileImageUrl ? (
                      <Avatar source={{ uri: profile.profileImageUrl }} />
                    ) : (
                      <AvatarPlaceholder height={56} width={56} />
                    )}
                    <ProfileText>
                      <Username numberOfLines={1}>
                        {profile?.username ?? t('myPage.profileUnavailable')}
                      </Username>
                      {profile?.country ? (
                        <UserCountry numberOfLines={1}>
                          {t(`countries.${profile.country.toLowerCase()}`, { defaultValue: profile.country })}
                        </UserCountry>
                      ) : null}
                    </ProfileText>
                  </ProfileInfo>
                  <ChevronIcon height={24} width={24} />
                </ProfileRow>
                {isProfileError ? (
                  <InlineRetryRow>
                    <InlineRetryText>{t('myPage.profileError')}</InlineRetryText>
                    <InlineRetryButton
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={() => void refetchProfile()}
                    >
                      <InlineRetryLabel>{t('myPage.retry')}</InlineRetryLabel>
                    </InlineRetryButton>
                  </InlineRetryRow>
                ) : null}
              </>
            )}

            <StatsCard>
              <StatItem>
                <StatLabel>{t('myPage.stats.reservations')}</StatLabel>
                <MyPageStatValue
                  isError={reservationsQuery.isError}
                  isLoading={reservationsQuery.isLoading}
                  testID="v2-my-page-stat-reservations"
                  value={reservationsQuery.data?.totalCount ?? 0}
                />
              </StatItem>
              <DividerIcon height={48} width={1} />
              <StatItem>
                <StatLabel>{t('myPage.stats.reviews')}</StatLabel>
                <MyPageStatValue
                  isError={reviewsQuery.isError}
                  isLoading={reviewsQuery.isLoading}
                  testID="v2-my-page-stat-reviews"
                  value={reviewsQuery.reviewCount}
                />
              </StatItem>
              <DividerIcon height={48} width={1} />
              <StatItem>
                <StatLabel>{t('myPage.stats.coupons')}</StatLabel>
                <MyPageStatValue
                  isError={couponsQuery.isError}
                  isLoading={couponsQuery.isLoading}
                  testID="v2-my-page-stat-coupons"
                  value={couponsQuery.data?.totalCount ?? 0}
                />
              </StatItem>
            </StatsCard>
          </SectionContent>
        </Section>

        <Section $borderWidth={8}>
          <SectionContent>
            <SectionTitle>{t('myPage.travel.title')}</SectionTitle>
            {travelSchedulesQuery.isLoading ? (
              <Slot $minHeight={TRAVEL_CALENDAR_HEIGHT}>
                <LoadingState description={t('myPage.travel.loading')} />
              </Slot>
            ) : travelSchedulesQuery.isError ? (
              <Slot $minHeight={TRAVEL_CALENDAR_HEIGHT}>
                <ErrorState
                  actionLabel={t('myPage.retry')}
                  description={t('myPage.travel.error')}
                  onAction={() => void travelSchedulesQuery.refetch()}
                />
              </Slot>
            ) : (
              <TravelCalendar highlightedRange={featuredSchedule} initialMonth={initialCalendarMonth} />
            )}
          </SectionContent>
        </Section>

        <Section $borderWidth={0}>
          <SectionContent>
            <SectionHeaderRow accessibilityRole="button" onPress={onOpenVerifiedPlaces}>
              <SectionTitle>{t('myPage.verifiedPlaces.title')}</SectionTitle>
              <ChevronIcon height={24} width={24} />
            </SectionHeaderRow>
            {isLoadingCheckIns ? (
              <PlacesScroll horizontal showsHorizontalScrollIndicator={false}>
                {SKELETON_KEYS.map((key) => <VerifiedPlaceCardSkeleton key={key} />)}
              </PlacesScroll>
            ) : checkInsQuery.isError || verifiedPlaceListState.kind === 'error' ? (
              <Slot $minHeight={VERIFIED_PLACE_CARD_HEIGHT}>
                <ErrorState
                  actionLabel={t('myPage.retry')}
                  description={t('myPage.verifiedPlaces.error')}
                  onAction={retryVerifiedPlaces}
                />
              </Slot>
            ) : verifiedPlaceListState.kind === 'ready' ? (
              <PlacesScroll horizontal showsHorizontalScrollIndicator={false}>
                {verifiedPlaceListState.entries.map((entry) => (
                  entry.place ? (
                    <VerifiedPlaceCard
                      address={entry.place.address}
                      favorited={bookmarkedPlaceIds.has(entry.placeId)}
                      imageUrl={entry.place.thumbnailUrl}
                      key={entry.placeId}
                      name={entry.place.name}
                      onToggleFavorite={() => toggleFavorite(entry.placeId)}
                    />
                  ) : (
                    <VerifiedPlaceCardSkeleton key={entry.placeId} />
                  )
                ))}
              </PlacesScroll>
            ) : (
              <Slot $minHeight={VERIFIED_PLACE_CARD_HEIGHT}>
                <EmptyPlacesText>{t('myPage.verifiedPlaces.empty')}</EmptyPlacesText>
              </Slot>
            )}
          </SectionContent>
        </Section>
      </Content>
    </Screen>
  );
}

const CONTENT_CONTAINER_STYLE = { flexGrow: 1 } as const;
const TOP_BAR_ICON_STYLE = { position: 'absolute' } as const;

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Content = styled.ScrollView`
  flex: 1;
`;

const TopBar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 84px;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
`;

const IconButton = styled.Pressable`
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.background};
  shadow-color: #000;
  shadow-offset: 0 4px;
  shadow-opacity: 0.06;
  shadow-radius: 10px;
  elevation: 2;
`;

const TopBarTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: 500;
`;

const Section = styled.View<{ $borderWidth: number }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md}px 0;
  border-bottom-width: ${({ $borderWidth }) => $borderWidth}px;
  border-bottom-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const SectionContent = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: 0 ${({ theme }) => theme.spacing.lg}px;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 20px;
  font-weight: 700;
`;

const SectionHeaderRow = styled.Pressable`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Slot = styled.View<{ $minHeight: number }>`
  width: 100%;
  min-height: ${({ $minHeight }) => $minHeight}px;
  align-items: center;
  justify-content: center;
`;

const InlineRetryRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.dangerSoft};
`;

const InlineRetryText = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;

const InlineRetryButton = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

const InlineRetryLabel = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: 700;
  text-decoration-line: underline;
`;

const ProfileRow = styled.Pressable`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ProfileInfo = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const ProfileText = styled.View``;

const Avatar = styled(Image)`
  width: 56px;
  height: 56px;
  border-radius: 28px;
`;

const Username = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: 500;
`;

const UserCountry = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;

const StatsCard = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  height: 85px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
`;

const StatItem = styled.View`
  align-items: center;
  gap: 6px;
`;

const StatLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: 500;
`;

const StatValue = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 20px;
  font-weight: 700;
`;

const PlacesScroll = styled.ScrollView.attrs({
  contentContainerStyle: { gap: 16 },
})``;

const EmptyPlacesText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
`;
