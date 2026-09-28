import { Text as AppText, TextInput as AppTextInput } from '../../../shared/components/Typography';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import SendIcon from '../../../../assets/v2/icons/community/send.svg';
import { COMMENT_CONTENT_MAX_LENGTH, COMMENT_COUNTER_WARNING_THRESHOLD } from '../model/commentForm';

export type CommentInputBarProps = {
  busy: boolean;
  disabled: boolean;
  errorText?: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  value: string;
};

export default function CommentInputBar({
  busy,
  disabled,
  errorText,
  onChangeText,
  onSubmit,
  value,
}: CommentInputBarProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const canSubmit = !disabled && value.trim().length > 0;

  return (
    <Bar testID="v2-community-comment-input-bar">
      {value.length >= COMMENT_COUNTER_WARNING_THRESHOLD ? (
        <CounterText testID="v2-community-comment-counter">
          {t('community.detail.commentInput.counter', { count: value.length, max: COMMENT_CONTENT_MAX_LENGTH })}
        </CounterText>
      ) : null}
      {errorText ? (
        <ErrorText accessibilityLiveRegion="polite" accessibilityRole="alert" testID="v2-community-comment-input-error">
          {errorText}
        </ErrorText>
      ) : null}
      <Row>
        <Field
          accessibilityLabel={t('community.detail.commentInput.label')}
          maxLength={COMMENT_CONTENT_MAX_LENGTH}
          multiline
          onChangeText={onChangeText}
          placeholder={t('community.detail.commentInput.placeholder')}
          placeholderTextColor={theme.colors.textAlternative}
          testID="v2-community-comment-input"
          value={value}
        />
        <SendButton
          $enabled={canSubmit}
          accessibilityLabel={t('community.detail.commentInput.send')}
          accessibilityRole="button"
          accessibilityState={{ busy, disabled: !canSubmit }}
          disabled={!canSubmit}
          onPress={onSubmit}
          testID="v2-community-comment-send"
        >
          {busy ? (
            <ActivityIndicator
              accessibilityLabel={t('community.detail.commentInput.sendBusy')}
              color={theme.colors.onPrimary}
              size="small"
            />
          ) : (
            <SendIcon height={22} width={22} />
          )}
        </SendButton>
      </Row>
    </Bar>
  );
}

const Bar = styled.View`
  gap: 6px;
  padding: 16px ${({ theme }) => theme.spacing.md}px 24px;
  background-color: ${({ theme }) => theme.colors.background};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.surfaceMuted};
`;
const Row = styled.View`flex-direction: row; align-items: flex-end; gap: 8px;`;
const Field = styled(AppTextInput)`
  flex: 1;
  max-height: 96px;
  min-height: 44px;
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
`;
const SendButton = styled.Pressable<{ $enabled: boolean }>`
  width: 44px; height: 44px; align-items: center; justify-content: center;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.primary};
  opacity: ${({ $enabled }) => ($enabled ? 1 : 0.4)};
`;
const CounterText = styled(AppText)`align-self: flex-end; color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const ErrorText = styled(AppText)`color: ${({ theme }) => theme.colors.danger}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
