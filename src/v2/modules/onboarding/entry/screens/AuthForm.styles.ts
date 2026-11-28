import styled from 'styled-components/native';
import type { AppTheme } from '../../../../shared/theme';

type Tone = { $tone: keyof AppTheme['colors'] };

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;
export const Title = styled.Text`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textStrong};
`;
export const Fields = styled.View`gap: 16px;`;
export const Field = styled.View`gap: 4px;`;
export const Label = styled.Text<Tone>`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.28px;
  color: ${({ theme, $tone }) => theme.colors[$tone]};
`;
export const InputRow = styled.View<{ $invalid: boolean }>`
  flex-direction: row;
  align-items: center;
  height: 40px;
  padding: 10px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme, $invalid }) => $invalid ? theme.colors.danger : theme.colors.borderEmphasis};
`;
export const Input = styled.TextInput.attrs(({ theme }) => ({
  keyboardAppearance: theme.colorScheme,
  placeholderTextColor: theme.colors.textMuted,
}))`
  flex: 1;
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textStrong};
  padding: 0;
`;
export const Helper = styled.Text<{ $error?: boolean }>`
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.24px;
  color: ${({ theme, $error }) => $error ? theme.colors.danger : theme.colors.textSecondary};
`;
export const SubmitButton = styled.Pressable<{ $filled: boolean }>`
  height: 64px;
  border-radius: 100px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $filled }) => $filled ? theme.colors.primaryAction : theme.colors.disabled};
`;
export const SubmitText = styled.Text<{ $filled: boolean }>`
  font-size: 20px;
  line-height: 26px;
  font-weight: ${({ $filled }) => $filled ? 700 : 500};
  color: ${({ theme, $filled }) => $filled ? theme.colors.onPrimary : theme.colors.onDisabled};
`;
