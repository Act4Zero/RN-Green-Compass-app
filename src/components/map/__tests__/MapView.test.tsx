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

  it('mounts the renderer within the shell protected by the root navigator', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapView />); });
    expect(tree.root.findByProps({ testID: 'globe-renderer' })).toBeTruthy();
  });

  it('renders a dataset failure without mounting a renderer', () => {
    mockMapFacade.error = new Error('Dataset unavailable');
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapView />); });
    expect(tree.root.findByProps({ children: 'The sustainability catalogue could not be loaded.' })).toBeTruthy();
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
  it('opens the cycling layer over Sofia, toggles nearby places and closes it on return to the globe', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapView />); });
    const button = tree.root.findByProps({ accessibilityLabel: 'Show Sofia cycleways' });
    expect(tree.root.findByProps({ testID: 'globe-renderer' }).props.cyclingVisible).toBe(false);
    act(() => button.props.onPress());
    expect(mockMapFacade.moveCamera).toHaveBeenCalledWith(expect.objectContaining({ center: {lat:42.691,lng:23.323}, zoom:12.1, pitch:0 }), expect.any(Number));
    expect(mockMapFacade.setResultsRailCollapsed).toHaveBeenCalledWith(true);
    expect(tree.root.findByProps({ testID: 'globe-renderer' }).props.cyclingVisible).toBe(true);
    act(() => tree.root.findByProps({ accessibilityLabel: 'Cycling map legend and details' }).props.onPress());
    const toggle = tree.root.findByProps({ accessibilityRole:'checkbox' });
    expect(toggle.props.accessibilityState.checked).toBe(true);
    act(() => toggle.props.onPress());
    expect(tree.root.findByProps({ testID: 'globe-renderer' }).props.cyclingPlacesVisible).toBe(false);
    act(() => tree.root.findByProps({ testID: 'globe-renderer' }).props.onRequestGlobe());
    expect(tree.root.findByProps({ testID: 'globe-renderer' }).props.cyclingVisible).toBe(false);
    act(() => tree.unmount());
  });
  it('shows a clicked cycling feature and removes selection when the layer closes', () => {
    const feature = require('@/features/cycling').SOFIA_CYCLING.features.find((item: any) => item.properties.name);
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapView />); });
    act(() => tree.root.findByProps({ accessibilityLabel: 'Show Sofia cycleways' }).props.onPress());
    act(() => tree.root.findByProps({ testID: 'globe-renderer' }).props.onCyclingFeaturePress(feature.properties.id));
    expect(tree.root.findByProps({ children: feature.properties.name })).toBeTruthy();
    act(() => tree.root.findByProps({ accessibilityLabel: 'Show Sofia cycleways' }).props.onPress());
    expect(tree.root.findAllByProps({ children: feature.properties.name })).toHaveLength(0);
    act(() => tree.unmount());
  });

  it('closes map-only panels and selection before returning to the globe', () => {
    mockMapFacade.isResultsOpen = true;
    mockMapFacade.isResultsRailCollapsed = false;
    mockMapFacade.selectedLocation = { id: 'place-1', name: 'Test place', lat: 42.7, lng: 23.3 };
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<MapView />); });
    expect(tree.root.findAllByType(require('../MapResultsPanel').default)).toHaveLength(1);
    expect(tree.root.findAllByType(require('../MapPopup').default)).toHaveLength(1);

    act(() => tree.root.findByProps({ testID: 'globe-renderer' }).props.onRequestGlobe());

    expect(mockMapFacade.setResultsOpen).toHaveBeenCalledWith(false);
    expect(mockMapFacade.setResultsRailCollapsed).toHaveBeenCalledWith(true);
    expect(mockMapFacade.selectLocation).toHaveBeenCalledWith(null, false);
    expect(tree.root.findAllByType(require('../MapSidebar').default)).toHaveLength(0);
    expect(tree.root.findAllByType(require('../MapResultsPanel').default)).toHaveLength(0);
    expect(tree.root.findAllByType(require('../MapPopup').default)).toHaveLength(0);
    act(() => tree.unmount());
  });

});
