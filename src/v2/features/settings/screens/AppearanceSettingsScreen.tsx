import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { HeaderBackButton } from '../../../shared/components';
import { Text as AppText } from '../../../shared/components/Typography';
import {
  APPEARANCE_PREFERENCES,
  useAppearance,
  type AppearancePreference,
} from '../../../shared/theme';

type AppearanceSettingsScreenProps = {
  onBack: () => void;
  onSelectPreference?: (preference: AppearancePreference) => Promise<void> | void;
};

const LABEL_KEYS: Record<AppearancePreference, string> = {
  SYSTEM: 'settings.appearance.system',
  LIGHT: 'settings.appearance.light',
  DARK: 'settings.appearance.dark',
};

export default function AppearanceSettingsScreen({
  onBack,
  onSelectPreference,
}: AppearanceSettingsScreenProps) {
  const { t } = useTranslation();
  const { preference, setPreference } = useAppearance();
  const selectPreference = onSelectPreference ?? setPreference;

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-appearance-settings-screen">
      <Header>
        <HeaderBackButton accessibilityLabel={t('settings.back')} onPress={onBack} />
        <HeaderTitle numberOfLines={1}>{t('settings.appearance.title')}</HeaderTitle>
        <HeaderSpacer />
      </Header>
      <Content>
        <Description>{t('settings.appearance.description')}</Description>
        <Options>
          {APPEARANCE_PREFERENCES.map((option) => {
            const selected = option === preference;
            const label = t(LABEL_KEYS[option]);
            return (
              <Option
                $selected={selected}
                accessibilityLabel={selected
                  ? `${label}, ${t('settings.appearance.selected')}`
                  : label}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={option}
                onPress={() => void selectPreference(option)}
              >
                <OptionLabel>{label}</OptionLabel>
                <Radio $selected={selected}>{selected ? <RadioDot /> : null}</Radio>
              </Option>
            );
          })}
        </Options>
      </Content>
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`background-color: ${({ theme }) => theme.colors.background}; flex: 1;`;
const Header = styled.View`align-items: center; flex-direction: row; height: 56px; justify-content: space-between; padding: 0 16px;`;
const HeaderTitle = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; flex: 1; font-size: 16px; font-weight: 700; text-align: center;`;
const HeaderSpacer = styled.View`height: 44px; width: 44px;`;
const Content = styled.View`flex: 1; padding: 24px 16px;`;
const Description = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: 14px; line-height: 20px; margin-bottom: 20px;`;
const Options = styled.View`border-color: ${({ theme }) => theme.colors.border}; border-radius: 16px; border-width: 1px; overflow: hidden;`;
const Option = styled.Pressable<{ $selected: boolean }>`
  align-items: center;
  background-color: ${({ $selected, theme }) => $selected ? theme.colors.selectedSurface : theme.colors.surface};
  border-bottom-color: ${({ theme }) => theme.colors.border};
  border-bottom-width: 1px;
  flex-direction: row;
  justify-content: space-between;
  min-height: 56px;
  padding: 12px 16px;
`;
const OptionLabel = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: 15px; font-weight: 500;`;
const Radio = styled.View<{ $selected: boolean }>`
  align-items: center;
  border-color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.borderEmphasis};
  border-radius: 10px;
  border-width: 2px;
  height: 20px;
  justify-content: center;
  width: 20px;
`;
const RadioDot = styled.View`background-color: ${({ theme }) => theme.colors.primary}; border-radius: 5px; height: 10px; width: 10px;`;
