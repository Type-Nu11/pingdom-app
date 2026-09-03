import React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import BackIcon from '../../../../assets/v2/icons/header/back.svg';
import NoNearbyPlaceIcon from '../../../../assets/v2/icons/smRlavy.svg';
import { ApiErrorState, Button, LoadingState } from '../../../shared/components';
import VisitPlaceCard from '../components/VisitPlaceCard';
import { useVisitVerificationCandidates } from '../hooks/useVisitVerificationCandidates';
import type { VisitVerificationCandidate } from '../hooks/useVisitVerificationCandidates';
import { useLocationPermissionStatus } from '../hooks/useLocationPermissionStatus';

type Props = {
  onBack: () => void;
  onSelectPlace: (selection: { checkInId: number; placeId: number }) => void;
};

export default function VisitVerificationPlacesScreen({ onBack, onSelectPlace }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { candidates, checkInsQuery } = useVisitVerificationCandidates();
  const locationPermission = useLocationPermissionStatus();
  const retryNextPage = () => void checkInsQuery.fetchNextPage();

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']}>
      <Header>
        <BackButton accessibilityLabel={t('visitVerification.back')} accessibilityRole="button" onPress={onBack}><BackIcon width={44} height={44} /></BackButton>
        {candidates.length > 0 || checkInsQuery.isLoading || checkInsQuery.isError ? (
          <>
            <Title accessibilityRole="header">{t('visitVerification.title')}</Title>
            <HeaderSpacer />
          </>
        ) : null}
      </Header>

      {checkInsQuery.isLoading ? (
        <LoadingState description={t('visitVerification.placeLoading')} fill />
      ) : checkInsQuery.isError ? (
        <ApiErrorState error={checkInsQuery.error} fill onBack={onBack} onRetry={() => void checkInsQuery.refetch()} />
      ) : candidates.length === 0 && locationPermission === 'denied' ? (
        <Empty testID="visit-verification-permission-denied">
          <EmptyIcon><EmptyMark>!</EmptyMark></EmptyIcon>
          <EmptyTitle>{t('visitVerification.permissionTitle')}</EmptyTitle>
          <EmptyDescription>{t('visitVerification.locationPermissionDenied')}</EmptyDescription>
          <EmptyAction><Button fullWidth label={t('visitVerification.return')} onPress={onBack} shape="pill" /></EmptyAction>
        </Empty>
      ) : candidates.length === 0 ? (
        <Empty testID="visit-verification-empty">
          <EmptyIcon>
            <NoNearbyPlaceIcon height={50} testID="visit-verification-empty-icon" width={44} />
          </EmptyIcon>
          <EmptyTitle>{t('visitVerification.emptyTitle')}</EmptyTitle>
          <EmptyDescription>{t('visitVerification.emptyDescription')}</EmptyDescription>
          <EmptyAction><Button fullWidth label={t('visitVerification.return')} onPress={onBack} shape="pill" /></EmptyAction>
        </Empty>
      ) : (
        <Body>
          <SectionTitle accessibilityRole="header">{t('visitVerification.recentVisits')}</SectionTitle>
          <List
            data={candidates}
            keyExtractor={(item) => String(item.checkInId)}
            onEndReached={() => {
              if (checkInsQuery.hasNextPage && !checkInsQuery.isFetchingNextPage) {
                void checkInsQuery.fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.35}
            testID="visit-verification-list"
            renderItem={({ item }) => (
              <VisitPlaceCard
                candidate={item}
                onPress={() => onSelectPlace({ checkInId: item.checkInId, placeId: item.placeId })}
              />
            )}
            ListFooterComponent={checkInsQuery.isFetchingNextPage ? (
              <Footer testID="visit-verification-next-loading"><ActivityIndicator color={theme.colors.primary} /></Footer>
            ) : checkInsQuery.isFetchNextPageError ? (
              <Footer testID="visit-verification-next-error">
                <FooterText>{t('visitVerification.errorTitle')}</FooterText>
                <Retry accessibilityRole="button" onPress={retryNextPage}><RetryText>{t('visitVerification.retry')}</RetryText></Retry>
              </Footer>
            ) : null}
          />
        </Body>
      )}
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
const Header = styled.View`height: 44px; flex-direction: row; align-items: center; padding: 0 16px;`;
const BackButton = styled.Pressable`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  background-color: rgba(255, 255, 255, 0.92);
  elevation: 2;
  shadow-color: #11151b;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.06;
  shadow-radius: 8px;
`;
const Title = styled.Text`flex: 1; text-align: center; color: ${({ theme }) => theme.colors.textStrong}; font-size: 18px; line-height: 23px; font-weight: 500;`;
const HeaderSpacer = styled.View`width: 44px;`;
const Body = styled.View`flex: 1;`;
const SectionTitle = styled.Text`margin: 16px 24px; color: ${({ theme }) => theme.colors.textStrong}; font-size: 18px; line-height: 23px; font-weight: 700;`;
const List = styled(FlatList<VisitVerificationCandidate>).attrs(({ theme }) => ({ contentContainerStyle: { paddingBottom: theme.spacing.xxl, paddingHorizontal: 24 } }))``;
const Empty = styled.View`flex: 1; align-items: center; justify-content: center; padding: 24px; padding-bottom: 96px;`;
const EmptyIcon = styled.View`width: 96px; height: 96px; align-items: center; justify-content: center; margin-bottom: 28px; border-radius: 48px; background-color: ${({ theme }) => theme.colors.primarySoft};`;
const EmptyMark = styled.Text`width: 38px; height: 48px; padding-top: 8px; text-align: center; color: ${({ theme }) => theme.colors.onPrimary}; font-size: 24px; font-weight: 900; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primary}; overflow: hidden;`;
const EmptyTitle = styled.Text`text-align: center; color: ${({ theme }) => theme.colors.textStrong}; font-size: 22px; font-weight: 800;`;
const EmptyDescription = styled.Text`max-width: 340px; margin-top: 16px; text-align: center; color: ${({ theme }) => theme.colors.textMuted}; font-size: 16px; line-height: 24px;`;
const EmptyAction = styled.View`position: absolute; right: 24px; bottom: 24px; left: 24px;`;
const Footer = styled.View`min-height: 72px; align-items: center; justify-content: center; gap: ${({ theme }) => theme.spacing.sm}px;`;
const FooterText = styled.Text`color: ${({ theme }) => theme.colors.textMuted};`;
const Retry = styled.Pressable`min-height: 40px; justify-content: center; padding: 0 ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primarySoft};`;
const RetryText = styled.Text`color: ${({ theme }) => theme.colors.primary}; font-weight: ${({ theme }) => theme.typography.label.fontWeight};`;
