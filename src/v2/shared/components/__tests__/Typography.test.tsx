import { render, screen } from '@testing-library/react-native';
import React from 'react';
import styled from 'styled-components/native';

import * as SharedComponents from '..';

describe('V2 typography boundary', () => {
  test('Text는 Pretendard를 기본 적용한다', async () => {
    expect(SharedComponents.Text).toBeDefined();
    if (!SharedComponents.Text) return;

    await render(<SharedComponents.Text>default text</SharedComponents.Text>);

    expect(screen.getByText('default text')).toHaveStyle({ fontFamily: 'Pretendard' });
  });

  test('배열과 styled-components 호출자 fontFamily가 기본값보다 우선한다', async () => {
    expect(SharedComponents.Text).toBeDefined();
    if (!SharedComponents.Text) return;

    const StyledText = styled(SharedComponents.Text)`
      font-family: ScreenSpecificFont;
    `;

    await render(
      <>
        <SharedComponents.Text style={[{ fontFamily: 'FirstFont' }, { fontFamily: 'ArrayOverride' }]}>array text</SharedComponents.Text>
        <StyledText>styled text</StyledText>
      </>,
    );

    expect(screen.getByText('array text')).toHaveStyle({ fontFamily: 'ArrayOverride' });
    expect(screen.getByText('styled text')).toHaveStyle({ fontFamily: 'ScreenSpecificFont' });
  });

  test('TextInput의 입력값과 placeholder가 같은 기본 family를 사용한다', async () => {
    expect(SharedComponents.TextInput).toBeDefined();
    if (!SharedComponents.TextInput) return;

    await render(
      <SharedComponents.TextInput placeholder="placeholder" value="typed value" />,
    );

    expect(screen.getByPlaceholderText('placeholder')).toHaveStyle({ fontFamily: 'Pretendard' });
  });

  test('여러 번 mount해도 React 전역 생성 함수를 변경하지 않는다', async () => {
    expect(SharedComponents.Text).toBeDefined();
    if (!SharedComponents.Text) return;
    const originalCreateElement = React.createElement;

    const first = await render(<SharedComponents.Text>first mount</SharedComponents.Text>);
    await first.unmount();
    const second = await render(<SharedComponents.Text>second mount</SharedComponents.Text>);
    await second.unmount();

    expect(React.createElement).toBe(originalCreateElement);
  });
});
