import React from 'react';
import type { PressableProps } from 'react-native';
import styled from 'styled-components/native';

import NoteEditIcon from '../../../../assets/v2/icons/place/note_edit.svg';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
};

export default function PlaceReportEntryButton({ label, ...pressableProps }: Props) {
  return (
    <EntryButton
      {...pressableProps}
      accessibilityLabel={pressableProps.accessibilityLabel ?? label}
      accessibilityRole="button"
    >
      <NoteEditIcon aria-hidden height={24} width={24} />
      <EntryButtonText>{label}</EntryButtonText>
    </EntryButton>
  );
}

const EntryButton = styled.Pressable`
  width: 120px;
  height: 48px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 18px;
  border-radius: 24px;
  background-color: rgba(255, 25, 86, 0.88);
`;

const EntryButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: 16px;
  font-weight: 600;
  line-height: 21px;
`;
