import React from 'react';
import type { PressableProps } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import styled, { useTheme } from 'styled-components/native';

// The exported Figma header buttons (`back-button.svg`, `more-button.svg`) are
// 80×84 artboards: a 44px glass circle at (16, 16) plus room for its drop
// shadow. The button keeps the 44px hit box from the design and lets the
// artboard overflow it so the circle renders at its real size. react-native-svg
// drops the artboard's `<filter>`, so its 0/4/20 6% drop shadow is drawn by the
// button itself.
const ARTBOARD_WIDTH = 80;
const ARTBOARD_HEIGHT = 84;
const CIRCLE_OFFSET = 16;

export type HeaderIconButtonProps = Omit<PressableProps, 'children'> & {
  Icon: React.ComponentType<SvgProps>;
};

export default function HeaderIconButton({ Icon, style, ...pressableProps }: HeaderIconButtonProps) {
  const theme = useTheme();
  return (
    <Button
      {...pressableProps}
      style={(state) => [{ boxShadow: theme.liquidGlass.navigation.shadow }, typeof style === 'function' ? style(state) : style]}
    >
      <Artboard pointerEvents="none">
        <Icon height={ARTBOARD_HEIGHT} width={ARTBOARD_WIDTH} />
      </Artboard>
    </Button>
  );
}

const Button = styled.Pressable`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  overflow: visible;
`;

const Artboard = styled.View`
  position: absolute;
  top: -${CIRCLE_OFFSET}px;
  left: -${CIRCLE_OFFSET}px;
  width: ${ARTBOARD_WIDTH}px;
  height: ${ARTBOARD_HEIGHT}px;
`;
