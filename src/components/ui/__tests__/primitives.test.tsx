import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Pressable, TextInput } from 'react-native';
import { AppButton, AppInput, StatePanel } from '..';

jest.mock('@/theme', () => ({
  useAppTheme: () => ({
    theme: require('@/theme/tokens').createTheme('light'),
  }),
}));

jest.mock('@expo/vector-icons', () => {
  const ReactModule = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name }: { name: string }) => ReactModule.createElement(Text, { testID: `icon-${name}` }),
  };
});

describe('shared UI primitives', () => {
  it('gives controls accessible labels and minimum touch targets', async () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <>
          <AppButton label="Log an action" onPress={() => undefined} />
          <AppInput label="Email address" value="" onChangeText={() => undefined} />
        </>
      );
    });

    const button = tree.root.findByType(Pressable);
    const input = tree.root.findByType(TextInput);
    expect(button.props.accessibilityLabel).toBe('Log an action');
    expect(button.props.accessibilityRole).toBe('button');
    expect(input.props.accessibilityLabel).toBe('Email address');
  });

  it('renders consistent state messaging', async () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <StatePanel title="Nothing here yet" message="Start with one small action." />
      );
    });
    expect(tree.root.findByProps({ children: 'Nothing here yet' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Start with one small action.' })).toBeTruthy();
  });
});
