import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

type ReservationDetailScreenProps = {
  onBack: () => void;
  reservationId: number;
};

export default function ReservationDetailScreen({
  onBack,
  reservationId,
}: ReservationDetailScreenProps) {
  return (
    <Screen edges={['top', 'right', 'bottom', 'left']}>
      <Header>
        <BackButton
          accessibilityLabel="뒤로 가기"
          accessibilityRole="button"
          hitSlop={12}
          onPress={onBack}
        >
          <BackText>‹</BackText>
        </BackButton>
        <Title accessibilityRole="header">예약 상세</Title>
        <HeaderSpacer />
      </Header>
      <Content>
        <Card>
          <Eyebrow>예약 식별자</Eyebrow>
          <ReservationId>{reservationId}</ReservationId>
          <Divider />
          <NoticeTitle>상세·결제 내역 준비 중</NoticeTitle>
          <Notice>
            서버의 예약 상세 및 결제 조회 계약이 연결되면 이 예약 식별자로 정보를 불러옵니다.
          </Notice>
        </Card>
      </Content>
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const BackButton = styled.Pressable`
  width: ${({ theme }) => theme.spacing.xxl}px;
  height: ${({ theme }) => theme.spacing.xxl}px;
  align-items: center;
  justify-content: center;
`;

const BackText = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.display.fontSize}px;
  line-height: ${({ theme }) => theme.typography.display.lineHeight}px;
`;

const Title = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  text-align: center;
`;

const HeaderSpacer = styled.View`
  width: ${({ theme }) => theme.spacing.xxl}px;
`;

const Content = styled.ScrollView.attrs({ contentContainerStyle: { flexGrow: 1 } })`
  padding: ${({ theme }) => theme.spacing.md}px;
`;

const Card = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Eyebrow = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;

const ReservationId = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
`;

const Divider = styled.View`
  height: 1px;
  margin: ${({ theme }) => theme.spacing.xs}px 0;
  background-color: ${({ theme }) => theme.colors.border};
`;

const NoticeTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const Notice = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;
