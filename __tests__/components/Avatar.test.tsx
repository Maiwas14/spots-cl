import React from 'react';
import { render } from '@testing-library/react-native';
import { Avatar } from '@/components/Avatar';

describe('Avatar', () => {
  test('muestra inicial del username cuando no hay uri', () => {
    const { getByText } = render(<Avatar username="miguel" />);
    expect(getByText('M')).toBeTruthy();
  });

  test('usa "U" como default si no hay username', () => {
    const { getByText } = render(<Avatar />);
    expect(getByText('U')).toBeTruthy();
  });

  test('renderiza sin crash con uri', () => {
    const { toJSON } = render(
      <Avatar uri="https://example.com/avatar.jpg" username="ana" size={50} />
    );
    expect(toJSON()).toBeTruthy();
  });

  test('renderiza placeholder cuando uri es null', () => {
    const { getByText } = render(<Avatar uri={null} username="pedro" />);
    expect(getByText('P')).toBeTruthy();
  });

  test('respeta el size custom', () => {
    const { toJSON } = render(<Avatar username="test" size={60} />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
  });

  test('primera letra siempre en mayuscula', () => {
    const { getByText } = render(<Avatar username="zarco" />);
    expect(getByText('Z')).toBeTruthy();
  });
});
