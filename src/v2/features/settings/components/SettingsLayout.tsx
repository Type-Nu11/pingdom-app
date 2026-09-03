import React, { type PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { HeaderBackButton } from '../../../shared/components';
import ChevronIcon from '../../../shared/assets/icons/chevron-right-20.svg';

export function SettingsScreenLayout({
  children,
  testID,
}: PropsWithChildren<{ testID: string }>) {
  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID={testID}>
      {children}
    </Screen>
  );
}

export function SettingsTopBar({
  backLabel,
  onBack,
  title,
}: {
  backLabel: string;
  onBack: () => void;
  title: string;
}) {
  return (
    <TopBar>
      <HeaderBackButton accessibilityLabel={backLabel} onPress={onBack} />
      <TopBarTitle accessibilityRole="header">{title}</TopBarTitle>
      <Spacer />
    </TopBar>
  );
}

export function SettingsList({ children }: PropsWithChildren) {
  return <Content contentContainerStyle={CONTENT_CONTAINER_STYLE}>{children}</Content>;
}

export function SettingsSection({ children, title }: PropsWithChildren<{ title?: string }>) {
  return (
    <Section>
      {title ? <SectionTitle accessibilityRole="header">{title}</SectionTitle> : null}
      <SectionCard>{children}</SectionCard>
    </Section>
  );
}

export function SettingsRow({
  danger = false,
  label,
  onPress,
  subtitle,
  value,
}: {
  danger?: boolean;
  label: string;
  onPress?: () => void;
  subtitle?: string;
  value?: string;
}) {
  const content = (
    <>
      <RowCopy>
        <RowLabel $danger={danger}>{label}</RowLabel>
        {subtitle ? <RowSubtitle>{subtitle}</RowSubtitle> : null}
      </RowCopy>
      {value ? <RowValue>{value}</RowValue> : null}
      {onPress ? <ChevronIcon height={20} width={20} /> : null}
    </>
  );

  if (!onPress) return <StaticRow>{content}</StaticRow>;

  return (
    <Row accessibilityRole="button" onPress={onPress}>
      {content}
    </Row>
  );
}

const CONTENT_CONTAINER_STYLE = { paddingBottom: 32 } as const;

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const TopBar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
`;

const Spacer = styled.View`
  width: 44px;
  height: 44px;
`;

const TopBarTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const Content = styled.ScrollView`
  flex: 1;
`;

const Section = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.md}px;
  border-bottom-width: 8px;
  border-bottom-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: 700;
`;

const SectionCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Row = styled.Pressable`
  min-height: 48px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.sm}px 0;
`;

const StaticRow = styled.View`
  min-height: 48px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.sm}px 0;
`;

const RowCopy = styled.View`
  flex: 1;
`;

const RowLabel = styled.Text<{ $danger: boolean }>`
  color: ${({ $danger, theme }) => ($danger ? theme.colors.danger : theme.colors.textStrong)};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.body.fontWeight};
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const RowSubtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

const RowValue = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;
