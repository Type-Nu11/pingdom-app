import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { HeaderBackButton } from '../../../shared/components';
import {
  normalizeSupportedLanguage,
  setLanguage,
  type SupportedLanguage,
} from '../../../shared/i18n';

type LanguageSettingsScreenProps = {
  onBack: () => void;
  onSelectLanguage?: (language: SupportedLanguage) => Promise<void> | void;
};

const LANGUAGE_OPTIONS = ['ko', 'en'] as const satisfies readonly SupportedLanguage[];

export default function LanguageSettingsScreen({
  onBack,
  onSelectLanguage = setLanguage,
}: LanguageSettingsScreenProps) {
  const { i18n, t } = useTranslation();
  const selectedLanguage = normalizeSupportedLanguage(i18n.resolvedLanguage) ?? 'en';

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-language-settings-screen">
      <Header>
        <HeaderBackButton accessibilityLabel={t('settings.back')} onPress={onBack} />
        <HeaderTitle numberOfLines={1}>{t('settings.language.title')}</HeaderTitle>
        <HeaderSpacer />
      </Header>

      <Content>
        <Description>{t('settings.language.description')}</Description>
        <Options>
          {LANGUAGE_OPTIONS.map((language) => {
            const selected = language === selectedLanguage;
            const label = t(language === 'ko'
              ? 'settings.language.korean'
              : 'settings.language.english');

            return (
              <LanguageOption
                $selected={selected}
                accessibilityLabel={selected
                  ? `${label}, ${t('settings.language.selected')}`
                  : label}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={language}
                onPress={() => void onSelectLanguage(language)}
              >
                <LanguageLabel>{label}</LanguageLabel>
                <Radio $selected={selected}>
                  {selected ? <RadioDot /> : null}
                </Radio>
              </LanguageOption>
            );
          })}
        </Options>
      </Content>
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`
  background-color: ${({ theme }) => theme.colors.background};
  flex: 1;
`;

const Header = styled.View`
  align-items: center;
  flex-direction: row;
  height: 56px;
  justify-content: space-between;
  padding: 0 16px;
`;

const HeaderTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
`;

const HeaderSpacer = styled.View`
  height: 44px;
  width: 44px;
`;

const Content = styled.View`
  flex: 1;
  padding: 24px 16px;
`;

const Description = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 20px;
`;

const Options = styled.View`
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  border-width: 1px;
  overflow: hidden;
`;

const LanguageOption = styled.Pressable<{ $selected: boolean }>`
  align-items: center;
  background-color: ${({ $selected, theme }) => (
    $selected ? theme.colors.primarySelected : theme.colors.surface
  )};
  border-bottom-color: ${({ theme }) => theme.colors.border};
  border-bottom-width: 1px;
  flex-direction: row;
  justify-content: space-between;
  min-height: 64px;
  padding: 0 20px;
`;

const LanguageLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 16px;
  font-weight: 600;
`;

const Radio = styled.View<{ $selected: boolean }>`
  align-items: center;
  border-color: ${({ $selected, theme }) => (
    $selected ? theme.colors.primary : theme.colors.border
  )};
  border-radius: 10px;
  border-width: 2px;
  height: 20px;
  justify-content: center;
  width: 20px;
`;

const RadioDot = styled.View`
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 5px;
  height: 10px;
  width: 10px;
`;
