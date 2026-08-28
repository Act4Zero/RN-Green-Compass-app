import React from 'react';
import renderer, { act } from 'react-test-renderer';
import type { MapRendererProps } from '@/types/map';
import LivingPlanetExperience from '../LivingPlanetExperience';

jest.mock('@/context/AppLocaleContext', () => ({ useAppLocale: () => ({ t: (english: string) => english }) }));
jest.mock('@/theme', () => ({ useAppTheme: () => ({ theme: require('@/theme/tokens').createTheme('light') }) }));
jest.mock('@expo/vector-icons', () => {
  const ReactModule = require('react');
  const { Text } = require('react-native');
  return { Ionicons: ({ name }: { name: string }) => ReactModule.createElement(Text, null, name) };
});
jest.mock('../LivingPlanetCanvas', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  return { __esModule: true, default: (props: Record<string, unknown>) => ReactModule.createElement(View, { ...props, testID: 'planet-canvas' }, props.children) };
});
jest.mock('../LivingPlanetScene', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  return { __esModule: true, default: () => ReactModule.createElement(View, { testID: 'planet-scene' }) };
});
jest.mock('../MapLibreRenderer', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  return { __esModule: true, default: () => ReactModule.createElement(View, { testID: 'maplibre-renderer' }) };
});
jest.mock('../LivingPlanetFallbackGlobe', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  return { __esModule: true, default: () => ReactModule.createElement(View, { testID: 'planet-fallback' }) };
});

const baseProps: MapRendererProps = {
  locations: [],
  selectedLocationId: null,
  styleId: 'living-planet',
  cameraCommand: null,
  userLocation: null,
  reducedMotion: true,
  mode: 'globe',
  quality: 'high',
  source: { onlineStyleUrl: 'https://example.test/style.json', attribution: 'Test' },
  onReady: jest.fn(),
  onCameraChanged: jest.fn(),
  onLocationPress: jest.fn(),
  onClusterPress: jest.fn(),
  onRequestMap: jest.fn(),
  onRequestGlobe: jest.fn(),
  onError: jest.fn(),
};

describe('Living Planet renderer lifecycle', () => {
  it('keeps the globe mounted and pauses it while the detailed map is active', () => {
    jest.useFakeTimers();
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<LivingPlanetExperience {...baseProps} />); });
    expect(tree.root.findByProps({ testID: 'planet-canvas' }).props.active).toBe(true);

    act(() => { tree.update(<LivingPlanetExperience {...baseProps} mode="map" />); });
    expect(tree.root.findByProps({ testID: 'planet-canvas' }).props.active).toBe(false);
    expect(tree.root.findByProps({ testID: 'maplibre-renderer' })).toBeTruthy();

    act(() => { tree.update(<LivingPlanetExperience {...baseProps} mode="to-globe" />); });
    expect(tree.root.findByProps({ testID: 'planet-canvas' }).props.active).toBe(true);
    act(() => {
      tree.unmount();
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('provides an explicit working return control in detailed map mode', () => {
    const onRequestGlobe = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<LivingPlanetExperience {...baseProps} mode="map" onRequestGlobe={onRequestGlobe} />); });
    const back = tree.root.findByProps({ accessibilityLabel: 'Back to globe' });
    act(() => back.props.onPress());
    expect(onRequestGlobe).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });
});
