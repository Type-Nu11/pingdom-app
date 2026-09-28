import { Text as AppText } from '../../../../shared/components/Typography';
import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import BackIcon from '../../../../../assets/v2/icons/header/back.svg';
import SettingsIcon from '../../../../shared/assets/icons/settings.svg';
import { ApiErrorState } from '../../../../shared/components';
import ReservationRecordCard from '../components/ReservationRecordCard';
import { useReservations } from '../hooks/useReservations';
import type { Reservation } from '..';

type Props = {
  onBack: () => void;
  onOpenReservation: (reservationId: number) => void;
  onOpenSettings: () => void;
};

export default function ReservationBoxScreen({ onBack, onOpenReservation, onOpenSettings }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const reservations = useReservations({ limit: 100, page: 1 });
  const items = reservations.data?.reservations ?? [];
  const totalCount = reservations.data?.totalElements ?? items.length;

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-reservation-box-screen">
      <TopBar>
        <IconButton accessibilityLabel={t('reservation.common.back')} accessibilityRole="button" onPress={onBack}>
          <BackIcon height={44} width={44} />
        </IconButton>
        <Title accessibilityRole="header">{t('reservation.box.title')}</Title>
        <IconButton accessibilityLabel={t('reservation.box.settings')} accessibilityRole="button" onPress={onOpenSettings}>
          <SettingsIcon height={44} width={44} />
        </IconButton>
      </TopBar>

      {reservations.isLoading ? (
        <State accessibilityLiveRegion="polite">
          <ActivityIndicator color={theme.colors.primary} />
          <StateText>{t('reservation.box.loading')}</StateText>
        </State>
      ) : reservations.isError && !reservations.data ? (
        <ApiErrorState error={reservations.error} busy={reservations.isFetching}
          onBack={onBack} onRetry={() => reservations.refetch({ cancelRefetch: false })} />
      ) : (
        <FlatList
          contentContainerStyle={LIST_CONTENT_STYLE}
          data={items}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={<>{reservations.isError ? <ApiErrorState error={reservations.error} busy={reservations.isFetching} onRetry={() => reservations.refetch({ cancelRefetch: false })} /> : null}<Count>{t('reservation.box.count', { count: totalCount })}</Count></>}
          ListEmptyComponent={<EmptyText>{t('reservation.box.empty')}</EmptyText>}
          refreshControl={(
            <RefreshControl
              onRefresh={() => void reservations.refetch({ cancelRefetch: false })}
              refreshing={reservations.isRefetching}
              tintColor={theme.colors.primary}
            />
          )}
          renderItem={({ item }: { item: Reservation }) => (
            <ReservationRecordCard
              onPress={() => onOpenReservation(item.id)}
              reservation={item}
            />
          )}
          testID="v2-reservation-box-list"
        />
      )}
    </Screen>
  );
}

const LIST_CONTENT_STYLE = { flexGrow: 1, gap: 14, padding: 24 } as const;

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const TopBar = styled.View`
  height: 72px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.lg}px;
`;

const IconButton = styled.Pressable`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.background};
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0 4px;
  shadow-opacity: 0.06;
  shadow-radius: 10px;
  elevation: 2;
`;

const Title = styled(AppText)`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: 500;
`;

const Count = styled(AppText)`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: 700;
`;

const State = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

const StateText = styled(AppText)`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  text-align: center;
`;

const RetryLabel = styled(AppText)`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: 700;
`;

const EmptyText = styled(AppText)`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  text-align: center;
  padding-top: ${({ theme }) => theme.spacing.xl}px;
`;
