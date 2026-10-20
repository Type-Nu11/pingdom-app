import { Text as AppText } from '../../../shared/components/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import TrashIcon from '../../../../assets/v2/icons/edit/gg_trash.svg';
import TicketIcon from '../../../../assets/v2/icons/place/Tiket.svg';
import type { MerchantEvent } from '../model/types';

type EventCardProps = {
  event: MerchantEvent;
  onDelete?: (eventId: string) => void;
};

export default function EventCard({ event, onDelete }: EventCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const palette = event.status === 'ended'
    ? { background: colors.dangerSoft, foreground: colors.danger }
    : event.status === 'ongoing'
      ? { background: colors.successSoft, foreground: colors.success }
      : { background: colors.warningSoft, foreground: colors.warning };

  return (
    <Card testID="v2-merchant-event-card">
      <HeaderRow>
        <HeaderLeft>
          <IconBadge>
            <TicketIcon height={24} width={24} />
          </IconBadge>
          <Title numberOfLines={1}>{event.title}</Title>
        </HeaderLeft>
        <HeaderRight>
          <StatusChip style={{ backgroundColor: palette.background }}>
            <StatusText style={{ color: palette.foreground }}>
              {t(`merchantMyPage.events.status.${event.status}`)}
            </StatusText>
          </StatusChip>
          <DeleteButton
            accessibilityLabel={t('merchantMyPage.events.delete')}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => onDelete?.(event.id)}
          >
            <TrashIcon height={20} width={20} />
          </DeleteButton>
        </HeaderRight>
      </HeaderRow>

      <Benefit numberOfLines={2}>{event.benefit}</Benefit>
      <Period>{event.period}</Period>
    </Card>
  );
}

const Card = styled.View`
  width: 100%;
  gap: 4px;
  padding: ${({ theme }) => theme.spacing.sm}px 12px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const IconBadge = styled.View`
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background-color: ${({ theme }) => theme.colors.primaryAssistive};
`;

const Title = styled(AppText)`
  flex: 1;
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 18px;
  font-weight: 700;
`;

const HeaderRight = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const StatusChip = styled.View`
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radius.md}px;
`;

const StatusText = styled(AppText)`
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: 500;
`;

const DeleteButton = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

const Benefit = styled(AppText)`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: 500;
`;

const Period = styled(AppText)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;
