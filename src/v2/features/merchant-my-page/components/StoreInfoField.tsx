import { Text as AppText } from '../../../shared/components/Typography';
import React from 'react';
import styled from 'styled-components/native';

type StoreInfoFieldProps = {
  label: string;
  value: string;
};

export default function StoreInfoField({ label, value }: StoreInfoFieldProps) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <FieldRow>
        <FieldValue numberOfLines={1}>{value}</FieldValue>
      </FieldRow>
    </Field>
  );
}

const Field = styled.View`
  width: 100%;
  gap: 4px;
`;

const FieldLabel = styled(AppText)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: 500;
`;

const FieldRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 10px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const FieldValue = styled(AppText)`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
`;
