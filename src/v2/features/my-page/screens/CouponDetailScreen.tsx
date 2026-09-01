import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';
import styled, { useTheme } from 'styled-components/native';

import Button from '../../../shared/components/Button';
import CouponBarcode from '../components/CouponBarcode';
import BackIcon from '../../../shared/assets/icons/back.svg';
import CouponIcon from '../../../shared/assets/icons/coupon.svg';

export type CouponDetailInfoRow = Readonly<{ label: string; value: string }>;

export type CouponDetailScreenProps = {
  onBack: () => void;
  onReserve?: () => void;
  /** Omitted while the place is unknown — a placeholder store name would misread as real. */
  placeName?: string;
  title: string;
  benefit: string;
  periodText: string;
  code: string;
  infoRows: readonly CouponDetailInfoRow[];
  /** `ISSUED` only. A terminal coupon must not be presentable as a valid one. */
  usable: boolean;
  /** Already localized. Replaces the barcode when the coupon can no longer be used. */
  stateNotice?: string;
};

export default function CouponDetailScreen({
  onBack,
  onReserve,
  placeName,
  title,
  benefit,
  periodText,
  code,
  infoRows,
  usable,
  stateNotice,
}: CouponDetailScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  // i18next hands back the key itself when a resource is missing, so an
  // unchecked cast here would turn a missing translation into a render crash.
  const rawNotices = t('myPage.couponDetail.notices', { returnObjects: true });
  const notices: string[] = Array.isArray(rawNotices)
    ? rawNotices.filter((notice): notice is string => typeof notice === 'string')
    : [];

  // The notches have to sit on the perforation, and the block above it grows with
  // the place name, a two-line title and a two-line benefit, so its height is
  // measured instead of assumed. Until the first layout pass they stay hidden
  // rather than parking at a guessed offset.
  const [perforationTop, setPerforationTop] = useState<number | null>(null);

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-coupon-detail-screen">
      <TopBar>
        <IconButton
          accessibilityLabel={t('myPage.back')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
        >
          <BackIcon height={44} width={44} />
        </IconButton>
        <TopBarTitle>{t('myPage.couponDetail.title')}</TopBarTitle>
        <Spacer />
      </TopBar>

      <Content contentContainerStyle={CONTENT_CONTAINER_STYLE}>
        <Ticket>
          <TicketInfo
            onLayout={(event) => setPerforationTop(event.nativeEvent.layout.height)}
          >
            <TitleRow>
              <IconBadge>
                <CouponIcon height={24} width={24} />
              </IconBadge>
              <TitleColumn>
                {placeName ? <PlaceName numberOfLines={1}>{placeName}</PlaceName> : null}
                <CouponName numberOfLines={2}>{title}</CouponName>
              </TitleColumn>
            </TitleRow>
            <Benefit numberOfLines={2}>{benefit}</Benefit>
            <PeriodChip>
              <PeriodText>{periodText}</PeriodText>
            </PeriodChip>
          </TicketInfo>

          {/* Drawn with react-native-svg rather than a dashed border: Android
              ignores `borderStyle: dashed` unless every side shares a width, and
              the exported asset is a fixed 354pt wide with `preserveAspectRatio:
              none`, so stretching it would stretch the dashes too. */}
          <Perforation>
            <Svg height={PERFORATION_HEIGHT} width="100%">
              <Line
                stroke={theme.colors.border}
                strokeDasharray="6 6"
                strokeWidth={1.5}
                x1={0}
                x2="100%"
                y1={PERFORATION_HEIGHT / 2}
                y2={PERFORATION_HEIGHT / 2}
              />
            </Svg>
          </Perforation>

          <BarcodeArea>
            {usable ? (
              <>
                <CouponBarcode
                  code={code}
                  unavailableLabel={t('myPage.couponDetail.barcodeUnavailable')}
                />
                <BarcodeHint>{t('myPage.couponDetail.barcodeHint')}</BarcodeHint>
              </>
            ) : (
              // A used or expired coupon keeps its ticket details so the user can
              // still tell which coupon it was, but never shows a scannable code.
              <StateNotice testID="v2-coupon-detail-unavailable">
                {stateNotice ?? t('myPage.couponDetail.unavailable')}
              </StateNotice>
            )}
          </BarcodeArea>

          {perforationTop === null ? null : (
            <>
              <Notch $side="left" $top={perforationTop} />
              <Notch $side="right" $top={perforationTop} />
            </>
          )}
        </Ticket>

        {usable && onReserve ? (
          <Button
            fullWidth
            label={t('myPage.couponDetail.reserve')}
            onPress={onReserve}
            shape="pill"
            size="onboarding"
            testID="v2-coupon-detail-reserve"
          />
        ) : null}

        <Section>
          <SectionHeading>{t('myPage.couponDetail.infoHeading')}</SectionHeading>
          <Divider />
          {infoRows.map((row) => (
            <InfoRow key={row.label}>
              <InfoLabel>{row.label}</InfoLabel>
              <InfoValue>{row.value}</InfoValue>
            </InfoRow>
          ))}
        </Section>

        <Section>
          <SectionHeading>{t('myPage.couponDetail.noticeHeading')}</SectionHeading>
          <NoticeBox>
            {notices.map((notice) => (
              <NoticeItem key={notice}>
                <NoticeBullet>{'•'}</NoticeBullet>
                <NoticeText>{notice}</NoticeText>
              </NoticeItem>
            ))}
          </NoticeBox>
        </Section>
      </Content>
    </Screen>
  );
}

const CONTENT_CONTAINER_STYLE = { gap: 20, paddingBottom: 24, paddingHorizontal: 24, paddingTop: 16 } as const;

/** Perforation row height and side inset, matching the ticket's 20pt padding. */
const PERFORATION_HEIGHT = 24;
const PERFORATION_INSET = 20;
const NOTCH_SIZE = 22;

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const TopBar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.lg}px;
`;

const IconButton = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

const Spacer = styled.View`
  width: 44px;
  height: 44px;
`;

const TopBarTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 18px;
  font-weight: 500;
`;

const Content = styled.ScrollView`
  flex: 1;
`;

// Clipped like the Figma ticket: the notches straddle the edge, so clipping is
// what turns each one into a bite out of the ticket rather than a full circle
// floating over the page. iOS and Android would otherwise disagree on whether
// the outer half draws at all.
const Ticket = styled.View`
  width: 100%;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.md + 4}px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
`;

const TicketInfo = styled.View`
  gap: ${({ theme }) => theme.spacing.md - 4}px;
  padding: ${({ theme }) => theme.spacing.lg - 4}px;
`;

const TitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md - 4}px;
`;

const IconBadge = styled.View`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background-color: ${({ theme }) => theme.colors.primaryAssistive};
`;

const TitleColumn = styled.View`
  flex: 1;
  gap: 2px;
`;

const PlaceName = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  font-weight: 500;
`;

const CouponName = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 20px;
  font-weight: 700;
`;

const Benefit = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: 500;
`;

const PeriodChip = styled.View`
  align-self: flex-start;
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const PeriodText = styled.Text`
  color: ${({ theme }) => theme.colors.textAlternative};
  font-size: 12px;
  font-weight: 500;
`;

// The cut runs the width of the ticket inset by the card padding, so the inset
// is spacing rather than line coordinates and the dash length stays 6/6 at any
// ticket width.
const Perforation = styled.View`
  height: ${PERFORATION_HEIGHT}px;
  padding: 0 ${PERFORATION_INSET}px;
`;

const BarcodeArea = styled.View`
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm + 2}px;
  padding: 6px ${({ theme }) => theme.spacing.lg - 4}px ${({ theme }) => theme.spacing.lg}px;
`;

const BarcodeHint = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  font-weight: 500;
  text-align: center;
`;

// Centred on the perforation row, so the ticket reads as one cut whatever the
// title and benefit lines do to the block above it. `$top` is the measured
// height of that block, i.e. where the perforation row starts.
const Notch = styled.View<{ $side: 'left' | 'right'; $top: number }>`
  position: absolute;
  top: ${({ $top }) => $top + (PERFORATION_HEIGHT - NOTCH_SIZE) / 2}px;
  width: ${NOTCH_SIZE}px;
  height: ${NOTCH_SIZE}px;
  border-radius: ${NOTCH_SIZE / 2}px;
  background-color: ${({ theme }) => theme.colors.background};
  ${({ $side }) => ($side === 'left'
    ? `left: -${NOTCH_SIZE / 2}px;`
    : `right: -${NOTCH_SIZE / 2}px;`)}
`;

const StateNotice = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg}px 0;
`;

const Section = styled.View`
  gap: ${({ theme }) => theme.spacing.md - 2}px;
  padding-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SectionHeading = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 18px;
  font-weight: 700;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`;

const InfoRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const InfoLabel = styled.Text`
  width: 92px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  font-weight: 500;
`;

const InfoValue = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 400;
`;

const NoticeBox = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const NoticeItem = styled.View`
  flex-direction: row;
  gap: 6px;
`;

const NoticeBullet = styled.Text`
  color: ${({ theme }) => theme.colors.textAlternative};
  font-size: 12px;
`;

const NoticeText = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.textAlternative};
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
`;
