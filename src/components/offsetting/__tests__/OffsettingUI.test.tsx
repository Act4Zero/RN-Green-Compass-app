import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Pressable } from 'react-native';
import { ChoiceChips, ImpactBars } from '../OffsettingUI';

jest.mock('@/theme', () => ({
  useAppTheme: () => ({
    theme: require('@/theme/tokens').createTheme('light'),
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('offsetting UI primitives', () => {
  it('exposes selected choice state and updates through an accessible control', () => {
    const onChange = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ChoiceChips
          label="Travel frequency"
          value="sometimes"
          options={[
            { value: 'rarely', label: 'Rarely' },
            { value: 'sometimes', label: 'Sometimes' },
          ]}
          onChange={onChange}
        />
      );
    });

    const controls = tree.root.findAllByType(Pressable);
    expect(controls[1].props.accessibilityRole).toBe('button');
    expect(controls[1].props.accessibilityState).toEqual({ selected: true });
    act(() => controls[0].props.onPress());
    expect(onChange).toHaveBeenCalledWith('rarely');
  });

  it('renders a useful empty state for impact data', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<ImpactBars points={[]} />);
    });
    expect(tree.root.findByProps({ children: 'Log an action or travel choice to start your chart.' })).toBeTruthy();
  });
});
