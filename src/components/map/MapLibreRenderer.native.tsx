import {
  Camera,
  CircleLayer,
  LineLayer,
  MapView,
  ShapeSource,
  SymbolLayer,
  UserLocation,
  type CameraRef,
} from '@maplibre/maplibre-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useAppLocale } from '../../context/AppLocaleContext';
import type { MapRendererProps } from '../../types/map';
import { locationsToFeatureCollection } from '../../utils/mapGlobe';
import { CYCLING_PATHS, CYCLING_PLACES, CYCLING_LINE_COLOR } from '@/features/cycling';
import { localizeMapStyle, type MapStyleDocument } from '../../utils/mapStyleLocale';

export default function MapLibreRenderer(props: MapRendererProps) {
  const { locale } = useAppLocale();
  const cameraRef = useRef<CameraRef>(null);
  const sourceRef = useRef<React.ElementRef<typeof ShapeSource>>(null);
  const [localizedStyle, setLocalizedStyle] = useState<string | object | null>(null);
  const shape = useMemo(() => locationsToFeatureCollection(props.locations), [props.locations]);

  useEffect(() => {
    const offlineStyle = props.source.offlineStyle;
    if (offlineStyle && typeof offlineStyle === 'object') {
      setLocalizedStyle(localizeMapStyle(offlineStyle as MapStyleDocument, locale));
      return undefined;
    }
    if (typeof offlineStyle === 'string') {
      setLocalizedStyle(offlineStyle);
      return undefined;
    }
    const controller = new AbortController();
    setLocalizedStyle(null);
    void fetch(props.source.onlineStyleUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Map style request failed (${response.status})`);
        return response.json() as Promise<MapStyleDocument>;
      })
      .then((style) => setLocalizedStyle(localizeMapStyle(style, locale)))
      .catch((error) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setLocalizedStyle(props.source.onlineStyleUrl);
      });
    return () => controller.abort();
  }, [locale, props.source.offlineStyle, props.source.onlineStyleUrl]);

  useEffect(() => {
    const command = props.cameraCommand;
    if (!command) return;
    cameraRef.current?.setCamera({ centerCoordinate: command.center ? [command.center.lng, command.center.lat] : undefined, zoomLevel: command.zoom, pitch: command.pitch, heading: command.heading, animationDuration: props.reducedMotion ? 0 : command.durationMs ?? 850, animationMode: props.reducedMotion ? 'moveTo' : 'flyTo' });
  }, [props.cameraCommand, props.reducedMotion, localizedStyle]);

  useEffect(() => {
    if (!props.searchPoint) return;
    cameraRef.current?.setCamera({ centerCoordinate: [props.searchPoint.lng, props.searchPoint.lat], zoomLevel: 13.5, pitch: 42, animationDuration: props.reducedMotion ? 0 : 850, animationMode: props.reducedMotion ? 'moveTo' : 'flyTo' });
  }, [props.reducedMotion, props.searchPoint]);

  if (!localizedStyle) return <View style={{ flex: 1, backgroundColor: '#EAF1EC' }} />;

  return (
    <MapView
      style={{ flex: 1 }}
      mapStyle={localizedStyle as any}
      compassEnabled
      attributionEnabled
      logoEnabled={false}
      onDidFinishLoadingMap={props.onReady}
      onDidFailLoadingMap={() => props.onError('The detailed map could not load. Check the connection or install an offline pack.')}
      onRegionDidChange={(event) => {
        const [lng, lat] = event.geometry.coordinates;
        const { zoomLevel, pitch, heading, visibleBounds, isUserInteraction } = event.properties;
        const [ne, sw] = visibleBounds;
        props.onCameraChanged({ center: { lat, lng }, zoom: zoomLevel, pitch, heading, bounds: { north: ne[1], east: ne[0], south: sw[1], west: sw[0] } });
        if (isUserInteraction && zoomLevel < 4.65) props.onRequestGlobe();
      }}
    >
      <Camera ref={cameraRef} defaultSettings={{ centerCoordinate: [props.cameraCommand?.center?.lng ?? 25.35, props.cameraCommand?.center?.lat ?? 42.72], zoomLevel: props.cameraCommand?.zoom ?? 6.35, pitch: props.cameraCommand?.pitch ?? 34, heading: props.cameraCommand?.heading ?? -8 }} minZoomLevel={3.8} />
      {props.cyclingVisible ? <>
        <ShapeSource id="green-compass-cycleways" shape={CYCLING_PATHS} hitbox={{ width: 24, height: 24 }} onPress={event => { const id = event.features[0]?.properties?.id; if (id) props.onCyclingFeaturePress?.(String(id)); }}>
          <LineLayer id="cycling-outline" style={{ lineColor: '#FFFFFF', lineWidth: ['interpolate', ['linear'], ['zoom'], 10, 4, 15, 9], lineOpacity: 0.9, lineCap: 'round', lineJoin: 'round' }} />
          <LineLayer id="cycling-lines" style={{ lineColor: CYCLING_LINE_COLOR as any, lineWidth: ['interpolate', ['linear'], ['zoom'], 10, 2, 15, 5], lineCap: 'round', lineJoin: 'round' }} />
        </ShapeSource>
        {props.cyclingPlacesVisible !== false ? <ShapeSource id="green-compass-cycling-places" shape={CYCLING_PLACES} hitbox={{ width: 32, height: 32 }} onPress={event => { const id = event.features[0]?.properties?.id; if (id) props.onCyclingFeaturePress?.(String(id)); }}>
          <CircleLayer id="cycling-places" minZoomLevel={14} style={{ circleColor: ['match', ['get', 'kind'], 'parking', '#1951BE', '#087DAB'], circleRadius: 10, circleStrokeColor: '#FFFFFF', circleStrokeWidth: 2 }} />
          <SymbolLayer id="cycling-place-labels" minZoomLevel={14} style={{ textFont: ['Noto Sans Regular'], textField: ['match', ['get', 'kind'], 'parking', 'P', '●'], textSize: 12, textColor: '#FFFFFF', textAllowOverlap: true }} />
        </ShapeSource> : null}
      </> : null}
      <ShapeSource
        ref={sourceRef}
        id="green-compass-locations"
        shape={shape}
        cluster
        clusterRadius={54}
        clusterMaxZoomLevel={13}
        hitbox={{ width: 48, height: 48 }}
        onPress={async (event) => {
          const selected = event.features[0];
          if (!selected || selected.geometry.type !== 'Point') return;
          const [lng, lat] = selected.geometry.coordinates;
          const clusterId = selected.properties?.cluster_id;
          if (clusterId !== undefined) {
            const zoom = await sourceRef.current?.getClusterExpansionZoom(selected);
            props.onClusterPress({ lat, lng }, zoom ?? 8);
          } else if (selected.properties?.id) props.onLocationPress(String(selected.properties.id));
        }}
      >
        <CircleLayer id="location-clusters" filter={['has', 'point_count']} style={{ circleColor: ['step', ['get', 'point_count'], '#76D49B', 25, '#B8E36B', 60, '#F0B15D'], circleRadius: ['step', ['get', 'point_count'], 19, 25, 24, 60, 29], circleStrokeWidth: 3, circleStrokeColor: '#FFFFFF' }} />
        <SymbolLayer id="cluster-count" filter={['has', 'point_count']} style={{ textField: ['get', 'point_count_abbreviated'], textSize: 13, textColor: '#0B1711' }} />
        <CircleLayer id="location-pins" filter={['!', ['has', 'point_count']]} style={{ circleColor: '#174C35', circleRadius: 9, circleStrokeWidth: 3, circleStrokeColor: '#C6F177' }} />
        <CircleLayer id="selected-pin" filter={['==', ['get', 'id'], props.selectedLocationId ?? '']} style={{ circleColor: '#C6F177', circleRadius: 15, circleStrokeWidth: 4, circleStrokeColor: '#FFFFFF', circleOpacity: 0.45 }} />
      </ShapeSource>
      {props.searchPoint ? <ShapeSource id="green-compass-address-search" shape={{ type: 'Feature', geometry: { type: 'Point', coordinates: [props.searchPoint.lng, props.searchPoint.lat] }, properties: {} }}><CircleLayer id="address-search-halo" style={{ circleRadius: 17, circleColor: '#C6F177', circleOpacity: 0.28 }} /><CircleLayer id="address-search-point" style={{ circleRadius: 8, circleColor: '#C6F177', circleStrokeWidth: 4, circleStrokeColor: '#174C35' }} /></ShapeSource> : null}
      {props.userLocation ? <UserLocation visible animated /> : null}
    </MapView>
  );
}
