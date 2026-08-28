import React from 'react';
import renderer, { act } from 'react-test-renderer';
import MapSidebar from '../MapSidebar';

let mockLocale: 'en' | 'bg' = 'en';
const mockSidebarMap: any = {
  query: '',
  setQuery: jest.fn(),
  locations: Array.from({ length: 57 }),
  availableCategories: ['ev_charging'],
  filters: { categories: { ev_charging: true } },
  recommendationIds: [],
  toggleCategory: jest.fn(),
  styleId: 'living-planet',
  setStyleId: jest.fn(),
  isResultsOpen: false,
  setResultsOpen: jest.fn(),
  isResultsRailCollapsed: false,
  setResultsRailCollapsed: jest.fn(),
};

jest.mock('@/hooks/useMapIntegration', () => ({ useMapIntegration: () => mockSidebarMap }));
jest.mock('@/context/AppLocaleContext', () => ({
  useAppLocale: () => ({
    locale: mockLocale,
    t: (english: string, bulgarian: string) => mockLocale === 'bg' ? bulgarian : english,
  }),
}));
jest.mock('@/theme', () => ({ useAppTheme: () => ({ theme: require('@/theme/tokens').createTheme('light') }) }));
jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({}), useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@expo/vector-icons', () => {
  const ReactModule = require('react');
  const { Text } = require('react-native');
  return { Ionicons: ({ name }: { name: string }) => ReactModule.createElement(Text, null, name) };
});

describe('MapSidebar discovery controls', () => {
  beforeEach(() => { mockLocale = 'en'; });

  it('uses local search and only renders categories derived from the dataset', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapSidebar />); });

    const search = tree.root.findByProps({ accessibilityLabel: 'Search sustainability locations' });
    act(() => search.props.onChangeText('Sofía'));
    expect(mockSidebarMap.setQuery).toHaveBeenCalledWith('Sofía');
    expect(tree.root.findByProps({ children: 'EV charging' })).toBeTruthy();
    expect(tree.root.findAllByProps({ children: 'Recycling' })).toHaveLength(0);

    const selectedControls = tree.root.findAll((node) => node.props.accessibilityState?.selected === true);
    act(() => selectedControls[0].props.onPress());
    expect(mockSidebarMap.toggleCategory).toHaveBeenCalledWith('ev_charging', false);
  });

  it('offers offline maps without a paid satellite style selector', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapSidebar />); });
    expect(tree.root.findByProps({ accessibilityLabel: 'Manage offline maps' })).toBeTruthy();
    expect(tree.root.findAll((node) => String(node.props.accessibilityLabel || '').startsWith('Map style:'))).toHaveLength(0);
  });

  it('renders the map discovery controls in Bulgarian', () => {
    mockLocale = 'bg';
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapSidebar />); });
    expect(tree.root.findByProps({ accessibilityLabel: 'Търсете устойчиви места' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Зареждане на електромобили' })).toBeTruthy();
    expect(tree.root.findByProps({ accessibilityLabel: 'Управление на офлайн картите' })).toBeTruthy();
  });
});
