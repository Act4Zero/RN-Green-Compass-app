import React from 'react';
import renderer, { act } from 'react-test-renderer';
import analyticsService from '@/services/analyticsService';
import MapView from '../MapView';

const mockMapFacade: any = {
  locations: new Array(57).fill(null), filteredLocations: [], visibleLocations: [], availableCategories: [],
  filters: { categories: {} }, query: '', selectedLocation: null, styleId: 'living-planet', cameraCommand: null,
  camera: { center: { lat: 42.72, lng: 25.35 }, zoom: 3.2, pitch: 0, heading: 0 },
  userLocation: null, isLoading: false, error: null, isLocating: false, locationError: null,
  isOutOfCoverage: false, isResultsOpen: false, isResultsRailCollapsed: false, isDataInitialized: true,
  clearLocationError: jest.fn(), updateCamera: jest.fn(),
  selectLocation: jest.fn(), moveCamera: jest.fn(), locateUser: jest.fn(), setQuery: jest.fn(),
  setStyleId: jest.fn(), setResultsOpen: jest.fn(), toggleCategory: jest.fn(), clearSelectedLocation: jest.fn(),
  setResultsRailCollapsed: jest.fn(), resetViewportToDefault: jest.fn(),
};

jest.mock('@/theme', () => ({ useAppTheme: () => ({ theme: require('@/theme/tokens').createTheme('light') }) }));
jest.mock('@/context/AppLocaleContext', () => ({ useAppLocale: () => ({ locale: 'en', t: (english: string) => english }) }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }), useLocalSearchParams: () => ({}) }));
jest.mock('@react-native-community/netinfo', () => ({ __esModule: true, default: { addEventListener: jest.fn(() => () => undefined) } }));
jest.mock('@/features/offline-maps', () => ({ getOfflineSource: jest.fn(async () => null) }));
jest.mock('@/hooks/useMapIntegration', () => ({ useMapIntegration: () => mockMapFacade }));
jest.mock('../GlobeRenderer', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  return { __esModule: true, default: (props: Record<string, unknown>) => ReactModule.createElement(View, { ...props, testID: 'globe-renderer' }) };
});
jest.mock('@/services/analyticsService', () => ({ __esModule: true, default: { trackScreenView: jest.fn(), trackEvent: jest.fn() } }));
jest.mock('@expo/vector-icons', () => {
  const ReactModule = require('react'); const { Text } = require('react-native');
  return { Ionicons: ({ name }: { name: string }) => ReactModule.createElement(Text, null, name) };
});

describe('Living Planet shell', () => {
  afterEach(() => {
    mockMapFacade.error = null;
    mockMapFacade.isLoading = false;
    mockMapFacade.locationError = null;
    mockMapFacade.filteredLocations = [];
    jest.clearAllMocks();
  });

  it('announces the verified dataset while it is loading', () => {
    mockMapFacade.isLoading = true;
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapView />); });
    expect(tree.root.findByProps({ children: 'Preparing the verified sustainability catalogue…' })).toBeTruthy();
  });

  it('mounts Living Planet without a token or account gate', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapView />); });
    expect(tree.root.findByProps({ testID: 'globe-renderer' })).toBeTruthy();
  });

  it('renders a dataset failure without mounting a renderer', () => {
    mockMapFacade.error = new Error('Dataset unavailable');
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapView />); });
    expect(tree.root.findByProps({ children: 'Dataset unavailable' })).toBeTruthy();
    expect(tree.root.findAllByProps({ testID: 'globe-renderer' })).toHaveLength(0);
  });

  it('renders a denied-location message as an assertive toast', () => {
    mockMapFacade.locationError = 'Location permission denied.';
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapView />); });
    expect(tree.root.findByProps({ accessibilityLiveRegion: 'assertive' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Location permission denied.' })).toBeTruthy();
    act(() => tree.unmount());
  });

  it('forwards cluster and pin interaction through the shared renderer contract', () => {
    mockMapFacade.filteredLocations = [{ id: 'ev-1', lat: 42.7, lng: 23.3 }];
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapView />); });
    const globe = tree.root.findByProps({ testID: 'globe-renderer' });
    act(() => globe.props.onLocationPress('ev-1'));
    expect(mockMapFacade.selectLocation).toHaveBeenCalledWith(mockMapFacade.filteredLocations[0], false);
    act(() => globe.props.onClusterPress({ lat: 42.7, lng: 23.3 }, 8));
    expect(mockMapFacade.moveCamera).toHaveBeenCalledWith({ center: { lat: 42.7, lng: 23.3 }, zoom: 8, pitch: 36 }, 850);
    expect(analyticsService.trackEvent).toHaveBeenCalledWith('map_cluster_opened', { zoom: 8 });
  });
});
