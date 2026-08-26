import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Pressable } from 'react-native';
import { CarbonBalanceCards, ChoiceChips, ImpactBars } from '../OffsettingUI';

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

  it('keeps gross, avoided, retired, and remaining carbon values visibly separate', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<CarbonBalanceCards summary={{ period: 'week', grossTrackedKgCo2e: 12, avoidedKgCo2e: 4, retiredOffsetKgCo2e: 2, netBalanceKgCo2e: 6, metrics: { co2eKgAvoided: 4, plasticItemsAvoided: 0, wasteKgAvoided: 0, waterLitresSaved: 0 }, totalActions: 2, challengeStreak: 1, series: [], countryBenchmark: null, globalBenchmark: { regionCode: 'GLOBAL', regionName: 'Global', year: 2024, tonnesCo2ePerCapita: 6.56, scope: 'territorial_ghg_excluding_lulucf', version: 'EDGAR-2025-GHG', sourceLabel: 'EDGAR', sourceUrl: 'https://example.com' }, treeSeedlingEquivalent: 0.07 }} />);
    });
    const text = JSON.stringify(tree.toJSON());
    expect(text).toContain('Gross tracked');
    expect(text).toContain('Estimated avoided');
    expect(text).toContain('Retired offsets');
    expect(text).toContain('Remaining balance');
  });
});
