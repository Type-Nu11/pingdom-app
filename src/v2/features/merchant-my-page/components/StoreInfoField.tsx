import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import PencilIcon from '../../../shared/assets/icons/pencil.svg';

type StoreInfoFieldProps = {
  label: string;
  onEdit?: () => void;
  value: string;
};

export default function StoreInfoField({ label, onEdit, value }: StoreInfoFieldProps) {
  const { t } = useTranslation();

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <FieldRow
        accessibilityLabel={t('merchantMyPage.store.editField', { field: label })}
        accessibilityRole="button"
        hitSlop={8}
        onPress={onEdit}
      >
        <FieldValue numberOfLines={1}>{value}</FieldValue>
        <PencilIcon height={16} width={16} />
      </FieldRow>
    </Field>
  );
}

const Field = styled.View`
  width: 100%;
  gap: 4px;
`;

const FieldLabel = styled.Text`
  color: #5c5e5e;
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: 500;
`;

const FieldRow = styled.Pressable`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 10px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const FieldValue = styled.Text`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
  color: #5e5e66;
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
`;
