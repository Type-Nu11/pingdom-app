import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

const IMAGE_URLS = [
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85',
] as const;

const VISITS = [
  { fixture: 'goyang', pair: 0 },
  { fixture: 'daeseong', pair: 2 },
  { fixture: 'goyang', pair: 0 },
  { fixture: 'daeseong', pair: 2 },
] as const;

type VerificationPlace = {
  category: string;
  imageUrl?: string;
  placeName: string;
};

function VisitCard({
  address,
  category,
  name,
  onPress,
  pair,
}: {
  address: string;
  category: string;
  name: string;
  onPress: () => void;
  pair: number;
}) {
  return (
    <Card
      accessibilityLabel={`${name}, ${address}`}
      accessibilityRole="button"
      onPress={onPress}
    >
      <CardHeading>
        <Name>{name} <Category>{category}</Category></Name>
        <More>⋮</More>
      </CardHeading>
      <Address numberOfLines={1}>{address}</Address>
      <Images>
        <VisitImage source={{ uri: IMAGE_URLS[pair] }} />
        <VisitImage source={{ uri: IMAGE_URLS[pair + 1] }} />
      </Images>
    </Card>
  );
}

export default function VerificationScreen({
  onBack,
  onOpenPlace,
}: {
  onBack: () => void;
  onOpenPlace: (place: VerificationPlace) => void;
}) {
  const { t } = useTranslation();

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']}>
      <Header>
        <BackButton
          accessibilityLabel={t('reservation.common.back')}
          accessibilityRole="button"
          hitSlop={12}
          onPress={onBack}
        >
          <BackText>‹</BackText>
        </BackButton>
        <Title accessibilityRole="header">{t('reservation.verification.title')}</Title>
        <HeaderSpacer />
      </Header>
      <List showsVerticalScrollIndicator={false}>
        <SectionTitle accessibilityRole="header">
          {t('reservation.verification.recentVisits')}
        </SectionTitle>
        {VISITS.map((visit, index) => {
          const prefix = `reservation.fixtures.${visit.fixture}`;
          const address = t(`${prefix}.address`);
          const category = t(`${prefix}.category`);
          const name = t(`${prefix}.name`);

          return (
            <VisitCard
              address={address}
              category={category}
              key={`${visit.fixture}-${index}`}
              name={name}
              onPress={() => onOpenPlace({
                category,
                imageUrl: IMAGE_URLS[visit.pair],
                placeName: name,
              })}
              pair={visit.pair}
            />
          );
        })}
      </List>
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.lg}px;
`;

const BackButton = styled.Pressable`
  width: ${({ theme }) => theme.spacing.xxl}px;
  height: ${({ theme }) => theme.spacing.xxl}px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const BackText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.display.fontSize}px;
  line-height: ${({ theme }) => theme.typography.display.lineHeight}px;
`;

const Title = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
  text-align: center;
`;

const HeaderSpacer = styled.View`
  width: ${({ theme }) => theme.spacing.xxl}px;
`;

const List = styled.ScrollView`
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.lg}px
    ${({ theme }) => theme.spacing.xl}px;
`;

const SectionTitle = styled.Text`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
`;

const Card = styled.Pressable`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  padding-bottom: ${({ theme }) => theme.spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const CardHeading = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Name = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
`;

const Category = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
`;

const More = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const Address = styled.Text`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;

const Images = styled.View`
  height: ${({ theme }) => theme.spacing.xxl * 3}px;
  flex-direction: row;
  gap: 2px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.md}px;
`;

const VisitImage = styled.Image`
  flex: 1;
  height: 100%;
`;
