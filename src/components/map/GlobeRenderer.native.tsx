import Mapbox, {
  Camera,
  CircleLayer,
  LocationPuck,
  MapView,
  ShapeSource,
  StyleImport,
  SymbolLayer,
} from '@rnmapbox/maps';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { MAP_STYLE_PRESETS } from '../../config/mapGlobe';
import { MapRendererProps } from '../../types/map';
import { locationsToFeatureCollection } from '../../utils/mapGlobe';

export default function GlobeRenderer(props: MapRendererProps) {
  const cameraRef = useRef<React.ElementRef<typeof Camera>>(null);
  const sourceRef = useRef<ShapeSource>(null);
  const [tokenReady, setTokenReady] = useState(false);
  const shape = useMemo(() => locationsToFeatureCollection(props.locations), [props.locations]);
  const preset = MAP_STYLE_PRESETS[props.styleId];

  useEffect(() => {
    Mapbox.setAccessToken(props.accessToken);
    setTokenReady(true);
  }, [props.accessToken]);
  useEffect(() => {
    const command = props.cameraCommand;
    if (!command) return;
    cameraRef.current?.setCamera({
      centerCoordinate: command.center ? [command.center.lng, command.center.lat] : undefined,
      zoomLevel: command.zoom,
      pitch: command.pitch,
      heading: command.heading,
      animationDuration: props.reducedMotion ? 0 : command.durationMs ?? 850,
      animationMode: props.reducedMotion ? 'none' : 'flyTo',
    });
  }, [props.cameraCommand, props.reducedMotion]);

  if (!tokenReady) return <View style={{ flex: 1 }} />;

  return (
    <MapView
      style={{ flex: 1 }}
      styleURL={preset.styleUrl}
      projection="globe"
      compassEnabled
      scaleBarEnabled={false}
      logoEnabled
      attributionEnabled
      onDidFinishLoadingMap={props.onReady}
      onMapLoadingError={() => props.onError('The 3D globe could not load its map data. Check your connection and try again.')}
      onCameraChanged={(state) => {
        const { center, zoom, pitch, heading, bounds } = state.properties;
        props.onCameraChanged({
          center: { lat: center[1], lng: center[0] }, zoom, pitch, heading,
          bounds: bounds ? {
            north: bounds.ne[1], east: bounds.ne[0], south: bounds.sw[1], west: bounds.sw[0],
          } : undefined,
        });
      }}
    >
      <Camera
        ref={cameraRef}
        defaultSettings={{ centerCoordinate: [18.2, 48.4], zoomLevel: 3.15, pitch: 18, heading: 0 }}
      />
      <StyleImport id="basemap" existing config={{ lightPreset: preset.lightPreset, show3dObjects: 'true' }} />
      <ShapeSource
        ref={sourceRef}
        id="green-compass-locations"
        shape={shape}
        cluster
        clusterRadius={54}
        clusterMaxZoomLevel={13}
        hitbox={{ width: 48, height: 48 }}
        onPress={async (event) => {
          const feature = event.features[0];
          if (!feature || feature.geometry.type !== 'Point') return;
          const [lng, lat] = feature.geometry.coordinates;
          const clusterId = feature.properties?.cluster_id;
          if (clusterId !== undefined) {
            const expansionZoom = await sourceRef.current?.getClusterExpansionZoom(feature);
            props.onClusterPress({ lat, lng }, expansionZoom ?? 8);
          } else if (feature.properties?.id) {
            props.onLocationPress(String(feature.properties.id));
          }
        }}
      >
        <CircleLayer
          id="location-clusters"
          filter={['has', 'point_count']}
          style={{
            circleColor: ['step', ['get', 'point_count'], '#76D49B', 25, '#B8E36B', 60, '#F0B15D'],
            circleRadius: ['step', ['get', 'point_count'], 19, 25, 24, 60, 29],
            circleStrokeWidth: 3, circleStrokeColor: '#FFFFFF', circleEmissiveStrength: 0.8,
          }}
        />
        <SymbolLayer
          id="cluster-count"
          filter={['has', 'point_count']}
          style={{ textField: ['get', 'point_count_abbreviated'], textSize: 13, textColor: '#0B1711', textEmissiveStrength: 1 }}
        />
        <CircleLayer
          id="location-pins"
          filter={['!', ['has', 'point_count']]}
          style={{ circleColor: '#174C35', circleRadius: 9, circleStrokeWidth: 3, circleStrokeColor: '#C6F177', circleEmissiveStrength: 0.95 }}
        />
        <CircleLayer
          id="selected-pin"
          filter={['==', ['get', 'id'], props.selectedLocationId ?? '']}
          style={{ circleColor: '#C6F177', circleRadius: 15, circleStrokeWidth: 4, circleStrokeColor: '#FFFFFF', circleOpacity: 0.45, circleEmissiveStrength: 1 }}
        />
      </ShapeSource>
      {props.userLocation ? <LocationPuck puckBearingEnabled pulsing={{ isEnabled: true }} /> : null}
    </MapView>
  );
}
