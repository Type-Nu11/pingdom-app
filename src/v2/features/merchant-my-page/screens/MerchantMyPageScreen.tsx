import React from 'react';
import { Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import BackIcon from '../../../shared/assets/icons/back.svg';
import ChevronIcon from '../../../shared/assets/icons/chevron-right-24.svg';
import ChevronSmallIcon from '../../../shared/assets/icons/chevron-right-20.svg';
import SettingsIcon from '../../../shared/assets/icons/settings.svg';
import AvatarPlaceholder from '../../../shared/assets/icons/avatar-placeholder.svg';
import EventCard from '../components/EventCard';
import MerchantReviewCard from '../components/MerchantReviewCard';
import PlusIcon from '../components/PlusIcon';
import StoreFeatureBadge from '../components/StoreFeatureBadge';
import StoreInfoField from '../components/StoreInfoField';
import VerifiedBadge from '../components/VerifiedBadge';
import type {
  MerchantEvent,
  MerchantProfileSummary,
  MerchantReview,
  MerchantStore,
} from '../model/types';

export type MerchantMyPageScreenProps = {
  events: readonly MerchantEvent[];
  onBack: () => void;
  onCreateEvent: () => void;
  onDeleteEvent: (eventId: string) => void;
  onEditAddress: () => void;
  onEditBusinessHours: () => void;
  onEditPhoneNumber: () => void;
  onOpenAllReviews: () => void;
  onOpenProfileEdit: () => void;
  onOpenSettings: () => void;
  onOpenVerifiedPlaces: () => void;
  profile: MerchantProfileSummary;
  reviews: readonly MerchantReview[];
  store: MerchantStore;
};

const STORE_PHOTO_WIDTH = 242;
const STORE_PHOTO_HEIGHT = 182;

export default function MerchantMyPageScreen({
  events,
  onBack,
  onCreateEvent,
  onDeleteEvent,
  onEditAddress,
  onEditBusinessHours,
  onEditPhoneNumber,
  onOpenAllReviews,
  onOpenProfileEdit,
  onOpenSettings,
  onOpenVerifiedPlaces,
  profile,
  reviews,
  store,
}: MerchantMyPageScreenProps) {
  const { t } = useTranslation();

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-merchant-my-page-screen">
      <Content contentContainerStyle={CONTENT_CONTAINER_STYLE}>
        <TopBar>
          <IconButton
            accessibilityLabel={t('merchantMyPage.back')}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onBack}
          >
            <BackIcon height={44} width={44} />
          </IconButton>
          <TopBarTitle>{t('merchantMyPage.title')}</TopBarTitle>
          <IconButton
            accessibilityLabel={t('merchantMyPage.settings')}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onOpenSettings}
          >
            <SettingsIcon height={44} width={44} />
          </IconButton>
        </TopBar>

        <ProfileSection>
          <ProfileRow accessibilityRole="button" onPress={onOpenProfileEdit}>
            <ProfileInfo>
              {profile.profileImageUrl ? (
                <Avatar source={{ uri: profile.profileImageUrl }} />
              ) : (
                <AvatarPlaceholder height={56} width={56} />
              )}
              <ProfileText>
                <ProfileNameRow>
                  <Username numberOfLines={1}>{profile.username}</Username>
                  {profile.isVerified ? <VerifiedBadge /> : null}
                </ProfileNameRow>
                <ProfileRoleLabel>{t('merchantMyPage.roleLabel')}</ProfileRoleLabel>
              </ProfileText>
            </ProfileInfo>
            <ChevronIcon height={24} width={24} />
          </ProfileRow>
        </ProfileSection>

        <Section>
          <SectionInner>
            <SectionTitle>{t('merchantMyPage.store.title')}</SectionTitle>

            <StoreHeading>
              <StoreNameRow>
                <StoreName>{store.name}</StoreName>
                <StoreCategory>{store.category}</StoreCategory>
              </StoreNameRow>
              <StoreVerifiedText>
                {t('merchantMyPage.store.verifiedCount', { count: store.verifiedCount })}
              </StoreVerifiedText>
            </StoreHeading>

            {store.photos.length > 0 ? (
              <PhotoScroll horizontal showsHorizontalScrollIndicator={false}>
                {store.photos.map((photo) => (
                  <StorePhoto key={photo.id} source={{ uri: photo.url }} />
                ))}
              </PhotoScroll>
            ) : null}

            <Fields>
              <StoreInfoField
                label={t('merchantMyPage.store.address')}
                onEdit={onEditAddress}
                value={store.address}
              />
              <StoreInfoField
                label={t('merchantMyPage.store.businessHours')}
                onEdit={onEditBusinessHours}
                value={store.businessHours}
              />
              <StoreInfoField
                label={t('merchantMyPage.store.phoneNumber')}
                onEdit={onEditPhoneNumber}
                value={store.phoneNumber}
              />
            </Fields>

            {store.features.length > 0 ? (
              <FeatureRow>
                {store.features.map((feature) => (
                  <StoreFeatureBadge feature={feature} key={feature} />
                ))}
              </FeatureRow>
            ) : null}
          </SectionInner>
        </Section>

        <Section>
          <SectionInner>
            <SectionHeaderRow accessibilityRole="button" onPress={onOpenVerifiedPlaces}>
              <SectionTitle>{t('merchantMyPage.reviews.title')}</SectionTitle>
              <ChevronIcon height={24} width={24} />
            </SectionHeaderRow>

            {reviews.length > 0 ? (
              <>
                {reviews.map((review, index) => (
                  <MerchantReviewCard
                    key={review.id}
                    review={review}
                    showDivider={index < reviews.length - 1}
                  />
                ))}
                <AllReviewsButton
                  accessibilityRole="button"
                  onPress={onOpenAllReviews}
                >
                  <AllReviewsText>{t('merchantMyPage.reviews.viewAll')}</AllReviewsText>
                  <ChevronSmallIcon height={16} width={16} />
                </AllReviewsButton>
              </>
            ) : (
              <EmptyText>{t('merchantMyPage.reviews.empty')}</EmptyText>
            )}
          </SectionInner>
        </Section>

        <LastSection>
          <SectionInner>
            <EventHeaderRow>
              <EventHeaderText>
                <SectionTitle>{t('merchantMyPage.events.title')}</SectionTitle>
                <EventHeaderCaption>{t('merchantMyPage.events.subtitle')}</EventHeaderCaption>
              </EventHeaderText>
              <NewEventButton
                accessibilityLabel={t('merchantMyPage.events.create')}
                accessibilityRole="button"
                onPress={onCreateEvent}
              >
                <PlusIcon size={24} />
                <NewEventLabel>{t('merchantMyPage.events.create')}</NewEventLabel>
              </NewEventButton>
            </EventHeaderRow>

            {events.length > 0 ? (
              events.map((event) => (
                <EventCard event={event} key={event.id} onDelete={onDeleteEvent} />
              ))
            ) : (
              <EmptyText>{t('merchantMyPage.events.empty')}</EmptyText>
            )}
          </SectionInner>
        </LastSection>
      </Content>
    </Screen>
  );
}

const CONTENT_CONTAINER_STYLE = { flexGrow: 1, paddingBottom: 24 } as const;

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
  padding: 0 ${({ theme }) => theme.spacing.md}px;
`;

const IconButton = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

const TopBarTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 18px;
  font-weight: 500;
`;

const ProfileSection = styled.View`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
  border-bottom-width: 8px;
  border-bottom-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const Section = styled.View`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md}px 0;
  border-bottom-width: 8px;
  border-bottom-color: ${({ theme }) => theme.colors.inputBackground};
`;

const LastSection = styled.View`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md}px 0;
`;

const SectionInner = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: 0 ${({ theme }) => theme.spacing.lg}px;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 18px;
  font-weight: 700;
`;

const SectionHeaderRow = styled.Pressable`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ProfileRow = styled.Pressable`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ProfileInfo = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const ProfileText = styled.View``;

const ProfileNameRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const Avatar = styled(Image)`
  width: 56px;
  height: 56px;
  border-radius: 28px;
`;

const Username = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 18px;
  font-weight: 500;
`;

const ProfileRoleLabel = styled.Text`
  color: #5e5e66;
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: 500;
`;

const StoreHeading = styled.View`
  gap: 4px;
`;

const StoreNameRow = styled.View`
  flex-direction: row;
  align-items: flex-end;
  gap: 4px;
`;

const StoreName = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.48px;
`;

const StoreCategory = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 18px;
  font-weight: 500;
`;

const StoreVerifiedText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
`;

const PhotoScroll = styled.ScrollView.attrs({
  contentContainerStyle: { gap: 16 },
})``;

const StorePhoto = styled(Image)`
  width: ${STORE_PHOTO_WIDTH}px;
  height: ${STORE_PHOTO_HEIGHT}px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const Fields = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const FeatureRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const AllReviewsButton = styled.Pressable`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 0;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.border};
`;

const AllReviewsText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
`;

const EventHeaderRow = styled.View`
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
`;

const EventHeaderText = styled.View`
  flex: 1;
  gap: 4px;
`;

const EventHeaderCaption = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
`;

const NewEventButton = styled.Pressable`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 40px;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const NewEventLabel = styled.Text`
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: 500;
`;

const EmptyText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
`;
