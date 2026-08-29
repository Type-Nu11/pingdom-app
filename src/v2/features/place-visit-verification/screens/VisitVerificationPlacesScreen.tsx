import React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import BackIcon from '../../../../assets/v2/icons/header/back.svg';
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
        <Title accessibilityRole="header">{t('visitVerification.title')}</Title>
        <HeaderSpacer />
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
          <EmptyIcon><EmptyMark>!</EmptyMark></EmptyIcon>
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
const Header = styled.View`height: 56px; flex-direction: row; align-items: center; padding: 0 ${({ theme }) => theme.spacing.md}px;`;
const BackButton = styled.Pressable`width: 44px; height: 44px; align-items: center; justify-content: center;`;
const Title = styled.Text`flex: 1; text-align: center; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.title.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight};`;
const HeaderSpacer = styled.View`width: 44px;`;
const Body = styled.View`flex: 1;`;
const SectionTitle = styled.Text`padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px 0; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight};`;
const List = styled(FlatList<VisitVerificationCandidate>).attrs(({ theme }) => ({ contentContainerStyle: { paddingBottom: theme.spacing.xxl, paddingHorizontal: theme.spacing.md } }))``;
const Empty = styled.View`flex: 1; align-items: center; justify-content: center; padding: ${({ theme }) => theme.spacing.lg}px;`;
const EmptyIcon = styled.View`width: 76px; height: 76px; align-items: center; justify-content: center; margin-bottom: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primarySoft};`;
const EmptyMark = styled.Text`width: 38px; height: 48px; padding-top: 8px; text-align: center; color: ${({ theme }) => theme.colors.onPrimary}; font-size: 24px; font-weight: 900; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primary}; overflow: hidden;`;
const EmptyTitle = styled.Text`text-align: center; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.title.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight};`;
const EmptyDescription = styled.Text`max-width: 300px; margin-top: ${({ theme }) => theme.spacing.sm}px; text-align: center; color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; line-height: 19px;`;
const EmptyAction = styled.View`position: absolute; right: ${({ theme }) => theme.spacing.md}px; bottom: ${({ theme }) => theme.spacing.md}px; left: ${({ theme }) => theme.spacing.md}px;`;
const Footer = styled.View`min-height: 72px; align-items: center; justify-content: center; gap: ${({ theme }) => theme.spacing.sm}px;`;
const FooterText = styled.Text`color: ${({ theme }) => theme.colors.textMuted};`;
const Retry = styled.Pressable`min-height: 40px; justify-content: center; padding: 0 ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primarySoft};`;
const RetryText = styled.Text`color: ${({ theme }) => theme.colors.primary}; font-weight: ${({ theme }) => theme.typography.label.fontWeight};`;
