import React from 'react';
import renderer, { act } from 'react-test-renderer';
import analyticsService from '@/services/analyticsService';
import MapView from '../MapView';

const mockMapFacade: any = {
  locations: new Array(89).fill(null), filteredLocations: [], visibleLocations: [], availableCategories: [],
  filters: { categories: {} }, query: '', selectedLocation: null, styleId: 'living-earth', cameraCommand: null,
  userLocation: null, isLoading: false, error: null, isLocating: false, locationError: null,
  isOutOfCoverage: false, isResultsOpen: false, isResultsRailCollapsed: false, isDataInitialized: true,
  clearLocationError: jest.fn(), updateCamera: jest.fn(),
  selectLocation: jest.fn(), moveCamera: jest.fn(), locateUser: jest.fn(), setQuery: jest.fn(),
  setStyleId: jest.fn(), setResultsOpen: jest.fn(), toggleCategory: jest.fn(), clearSelectedLocation: jest.fn(),
  setResultsRailCollapsed: jest.fn(),
  resetViewportToDefault: jest.fn(),
};
let mockAccessToken = '';
let mockExpoGoRuntime = false;

jest.mock('@/theme', () => ({ useAppTheme: () => ({ theme: require('@/theme/tokens').createTheme('light') }) }));
jest.mock('@/hooks/useMapIntegration', () => ({ useMapIntegration: () => mockMapFacade }));
jest.mock('@/config/mapGlobe', () => ({
  ...jest.requireActual('@/config/mapGlobe'),
  getMapboxAccessToken: () => mockAccessToken,
  isExpoGoRuntime: () => mockExpoGoRuntime,
}));
jest.mock('../GlobeRenderer', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => ReactModule.createElement(View, { ...props, testID: 'globe-renderer' }),
  };
});
jest.mock('@/services/analyticsService', () => ({
  __esModule: true,
  default: { trackScreenView: jest.fn(), trackEvent: jest.fn() },
}));
jest.mock('@expo/vector-icons', () => {
  const ReactModule = require('react');
  const { Text } = require('react-native');
  return { Ionicons: ({ name }: { name: string }) => ReactModule.createElement(Text, null, name) };
});

describe('Sustainability Globe shell', () => {
  afterEach(() => {
    mockAccessToken = '';
    mockExpoGoRuntime = false;
    mockMapFacade.error = null;
    mockMapFacade.isLoading = false;
    mockMapFacade.locationError = null;
    jest.clearAllMocks();
  });

  it('announces the verified dataset while it is loading', () => {
    mockMapFacade.isLoading = true;
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapView />); });
    expect(tree.root.findByProps({ children: 'Preparing 89 verified places…' })).toBeTruthy();
  });

  it('renders a clear non-secret configuration fallback when the public token is absent', () => {
    mockAccessToken = '';
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapView />); });
    expect(tree.root.findByProps({ children: 'The globe is taking a breather' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Add EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN to enable the live 3D map.' })).toBeTruthy();
  });

  it('opens safely with custom-build guidance in Expo Go', () => {
    mockAccessToken = 'pk.test';
    mockExpoGoRuntime = true;
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapView />); });
    expect(tree.root.findByProps({ children: 'The 3D globe requires a custom development build and cannot run in Expo Go.' })).toBeTruthy();
  });

  it('renders a dataset failure without attempting to mount a renderer', () => {
    mockAccessToken = 'pk.test';
    mockMapFacade.error = new Error('Dataset unavailable');
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapView />); });
    expect(tree.root.findByProps({ children: 'Dataset unavailable' })).toBeTruthy();
  });

  it('renders a denied-location message as an assertive toast', () => {
    mockAccessToken = 'pk.test';
    mockMapFacade.locationError = 'Location permission denied.';
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapView />); });
    expect(tree.root.findByProps({ accessibilityLiveRegion: 'assertive' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Location permission denied.' })).toBeTruthy();
    act(() => tree.unmount());
  });

  it('forwards cluster and pin interaction through the shared renderer contract', () => {
    mockAccessToken = 'pk.test';
    mockMapFacade.filteredLocations = [{ id: 'ev-1', lat: 42.7, lng: 23.3 }];
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapView />); });
    const globe = tree.root.findByProps({ testID: 'globe-renderer' });

    act(() => globe.props.onLocationPress('ev-1'));
    expect(mockMapFacade.selectLocation).toHaveBeenCalledWith(mockMapFacade.filteredLocations[0], false);

    act(() => globe.props.onClusterPress({ lat: 42.7, lng: 23.3 }, 8));
    expect(mockMapFacade.moveCamera).toHaveBeenCalledWith(
      { center: { lat: 42.7, lng: 23.3 }, zoom: 8, pitch: 36 },
      850,
    );
    expect(analyticsService.trackEvent).toHaveBeenCalledWith('map_cluster_opened', { zoom: 8 });
  });
});
