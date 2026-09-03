import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import { HeaderBackButton } from '../../../shared/components';
import { ErrorState, LoadingState } from '../../../shared/components';
import NotificationSettingToggle from '../components/NotificationSettingToggle';

const SETTING_KEYS = [
  'pushAll',
  'firstRecordTrending',
  'recordNewTags',
  'favoriteMoodChange',
  'frequentAreaHotPlace',
  'todayMissionArea',
  'weeklyReport',
  'nightNotifications',
  'marketingEvents',
] as const;

export type NotificationSettingKey = (typeof SETTING_KEYS)[number];
export type NotificationSettingValues = Record<NotificationSettingKey, boolean>;

export type NotificationSettingPresentationState = {
  errorMessage?: string;
  isLoading?: boolean;
};

// These are visual defaults from the approved design only. They are deliberately
// kept out of storage and API state until notification consent policy is defined.
export const DEFAULT_NOTIFICATION_SETTING_VALUES: NotificationSettingValues = {
  favoriteMoodChange: true,
  firstRecordTrending: true,
  frequentAreaHotPlace: true,
  marketingEvents: false,
  nightNotifications: false,
  pushAll: true,
  recordNewTags: true,
  todayMissionArea: false,
  weeklyReport: true,
};

type ScreenState = 'error' | 'loading' | 'ready';

export type NotificationSettingsScreenProps = {
  initialValues?: Partial<NotificationSettingValues>;
  onBack: () => void;
  onRetry?: () => void;
  presentationStates?: Partial<Record<NotificationSettingKey, NotificationSettingPresentationState>>;
  state?: ScreenState;
};

type SettingDefinition = {
  descriptionKey?: string;
  key: NotificationSettingKey;
  labelKey: string;
};

type SectionDefinition = {
  key: string;
  settings: readonly SettingDefinition[];
  titleKey?: string;
};

const SECTIONS: readonly SectionDefinition[] = [
  {
    key: 'push',
    settings: [{
      descriptionKey: 'notificationSettings.settings.pushAll.description',
      key: 'pushAll',
      labelKey: 'notificationSettings.settings.pushAll.label',
    }],
  },
  {
    key: 'records',
    settings: [
      {
        descriptionKey: 'notificationSettings.settings.firstRecordTrending.description',
        key: 'firstRecordTrending',
        labelKey: 'notificationSettings.settings.firstRecordTrending.label',
      },
      {
        descriptionKey: 'notificationSettings.settings.recordNewTags.description',
        key: 'recordNewTags',
        labelKey: 'notificationSettings.settings.recordNewTags.label',
      },
    ],
    titleKey: 'notificationSettings.sections.records',
  },
  {
    key: 'interests',
    settings: [
      {
        descriptionKey: 'notificationSettings.settings.favoriteMoodChange.description',
        key: 'favoriteMoodChange',
        labelKey: 'notificationSettings.settings.favoriteMoodChange.label',
      },
      {
        descriptionKey: 'notificationSettings.settings.frequentAreaHotPlace.description',
        key: 'frequentAreaHotPlace',
        labelKey: 'notificationSettings.settings.frequentAreaHotPlace.label',
      },
      {
        key: 'todayMissionArea',
        labelKey: 'notificationSettings.settings.todayMissionArea.label',
      },
    ],
    titleKey: 'notificationSettings.sections.interests',
  },
  {
    key: 'reports',
    settings: [{
      descriptionKey: 'notificationSettings.settings.weeklyReport.description',
      key: 'weeklyReport',
      labelKey: 'notificationSettings.settings.weeklyReport.label',
    }],
    titleKey: 'notificationSettings.sections.reports',
  },
  {
    key: 'other',
    settings: [
      {
        descriptionKey: 'notificationSettings.settings.nightNotifications.description',
        key: 'nightNotifications',
        labelKey: 'notificationSettings.settings.nightNotifications.label',
      },
      {
        key: 'marketingEvents',
        labelKey: 'notificationSettings.settings.marketingEvents.label',
      },
    ],
    titleKey: 'notificationSettings.sections.other',
  },
] as const;

export default function NotificationSettingsScreen({
  initialValues,
  onBack,
  onRetry,
  presentationStates = {},
  state = 'ready',
}: NotificationSettingsScreenProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<NotificationSettingValues>(() => ({
    ...DEFAULT_NOTIFICATION_SETTING_VALUES,
    ...initialValues,
  }));

  const setValue = (key: NotificationSettingKey, value: boolean) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-notification-settings-screen">
      <TopBar>
        <HeaderBackButton accessibilityLabel={t('notificationSettings.back')} onPress={onBack} />
        <TopBarTitle>{t('notificationSettings.title')}</TopBarTitle>
        <TopBarSpacer />
      </TopBar>

      {state === 'loading' ? (
        <StateSlot>
          <LoadingState description={t('notificationSettings.loading')} fill />
        </StateSlot>
      ) : state === 'error' ? (
        <StateSlot>
          <ErrorState
            actionLabel={onRetry ? t('notificationSettings.retry') : undefined}
            description={t('notificationSettings.error')}
            fill
            onAction={onRetry}
          />
        </StateSlot>
      ) : (
        <Content contentContainerStyle={CONTENT_CONTAINER_STYLE}>
          {SECTIONS.map((section, sectionIndex) => (
            <Section $isLast={sectionIndex === SECTIONS.length - 1} key={section.key}>
              {section.titleKey ? <SectionTitle>{t(section.titleKey)}</SectionTitle> : null}
              <SettingList>
                {section.settings.map((setting) => {
                  const presentationState = presentationStates[setting.key];

                  return (
                    <NotificationSettingToggle
                      description={setting.descriptionKey ? t(setting.descriptionKey) : undefined}
                      errorMessage={presentationState?.errorMessage}
                      isLoading={presentationState?.isLoading}
                      key={setting.key}
                      label={t(setting.labelKey)}
                      onValueChange={(value) => setValue(setting.key, value)}
                      testID={`notification-setting-${setting.key}`}
                      value={values[setting.key]}
                    />
                  );
                })}
              </SettingList>
            </Section>
          ))}
        </Content>
      )}
    </Screen>
  );
}

const CONTENT_CONTAINER_STYLE = { flexGrow: 1 } as const;

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const TopBar = styled.View`
  height: 84px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
`;

const TopBarTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: 600;
`;

const TopBarSpacer = styled.View`
  width: 44px;
  height: 44px;
`;

const Content = styled.ScrollView`
  flex: 1;
`;

const Section = styled.View<{ $isLast: boolean }>`
  width: 100%;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
  border-bottom-width: ${({ $isLast }) => ($isLast ? 0 : 8)}px;
  border-bottom-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
`;

const SettingList = styled.View`
  width: 100%;
`;

const StateSlot = styled.View`
  flex: 1;
`;
