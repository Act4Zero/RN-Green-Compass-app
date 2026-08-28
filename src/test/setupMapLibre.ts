jest.mock('@maplibre/maplibre-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const component = (name: string) => React.forwardRef((props: any, ref: any) => (
    React.createElement(View, { ref, ...props, testID: props.testID || `maplibre-${name}` }, props.children)
  ));
  return {
    MapView: component('map-view'),
    Camera: component('camera'),
    ShapeSource: component('shape-source'),
    CircleLayer: component('circle-layer'),
    SymbolLayer: component('symbol-layer'),
    LocationPuck: component('location-puck'),
    OfflineManager: {},
  };
});
