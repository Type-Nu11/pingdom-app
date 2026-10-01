import React from 'react';
import Svg, { Path } from 'react-native-svg';
import styled, { useTheme } from 'styled-components/native';

// Outline of assets/v2/icons/header/search.svg, drawn inline so the stroke
// follows the theme instead of a fixed color.
const SEARCH_ICON_PATH = 'm19 19-4.343-4.343m0 0A8 8 0 1 0 3.343 3.343a8 8 0 0 0 11.314 11.314';

type Props = Readonly<{
  onChangeText: (value: string) => void;
  placeholder: string;
  testID?: string;
  value: string;
}>;

export default function OnboardingSearchBox({ onChangeText, placeholder, testID, value }: Props) {
  const { colors } = useTheme();

  return (
    <Box>
      <Svg fill="none" height={18} viewBox="0 0 20 20" width={18}>
        <Path
          d={SEARCH_ICON_PATH}
          stroke={colors.labelNeutral}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </Svg>
      <Input
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textAlternative}
        testID={testID}
        value={value}
      />
    </Box>
  );
}

const Box = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  height: 56px;
  margin-bottom: 20px;
  padding: 0 20px;
  border-radius: 30px;
  background-color: ${({ theme }) => theme.colors.fillAlternative};
`;

const Input = styled.TextInput`
  flex: 1;
  padding: 0;
  color: ${({ theme }) => theme.colors.labelNeutral};
  font-size: ${({ theme }) => theme.typography.headline2Medium.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.headline2Medium.fontWeight};
`;
