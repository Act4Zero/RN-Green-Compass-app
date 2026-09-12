import {
  AttributionControl,
  GeoJSONSource,
  Map as MapLibreMap,
  MapLayerMouseEvent,
  Marker,
  NavigationControl,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useAppLocale } from '../../context/AppLocaleContext';
import type { MapLocationFeatureCollection, MapRendererProps } from '../../types/map';
import { locationsToFeatureCollection } from '../../utils/mapGlobe';
import { CYCLING_PATHS, CYCLING_PLACES, CYCLING_LINE_COLOR } from '@/features/cycling';
import { getLocalizedMapNameExpression, isMapNameTextField } from '../../utils/mapStyleLocale';

const LOCATIONS_SOURCE = 'green-compass-locations';
const USER_SOURCE = 'green-compass-user-location';
const CYCLING_SOURCE = 'green-compass-cycleways';
const CYCLING_PLACES_SOURCE = 'green-compass-cycling-places';
const CYCLING_LAYERS = ['cycling-outline', 'cycling-lines'];
const CYCLING_PLACE_LAYERS = ['cycling-places', 'cycling-place-labels'];

const SEARCH_SOURCE = 'green-compass-address-search';

function userFeature(point: { lat: number; lng: number } | null): GeoJSON.FeatureCollection {
  return { type: 'FeatureCollection', features: point ? [{ type: 'Feature', geometry: { type: 'Point', coordinates: [point.lng, point.lat] }, properties: {} }] : [] };
}

function applyMapLabelLocale(map: MapLibreMap, locale: 'en' | 'bg') {
  const expression = getLocalizedMapNameExpression(locale);
  for (const layer of map.getStyle().layers || []) {
    if (layer.type !== 'symbol') continue;
    const textField = map.getLayoutProperty(layer.id, 'text-field');
    if (!isMapNameTextField(textField)) continue;
    map.setLayoutProperty(layer.id, 'text-field', expression);
  }
}

export default function MapLibreRenderer(props: MapRendererProps) {
  const { locale } = useAppLocale();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const localeRef = useRef(locale);
  const latest = useRef(props);
  const geoJson = useMemo(() => locationsToFeatureCollection(props.locations), [props.locations]);
  latest.current = props;
  localeRef.current = locale;

  const syncVisibleMarkers = (map: MapLibreMap) => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = latest.current.locations.map((location) => {
      const selected = location.id === latest.current.selectedLocationId;
      const markerButton = document.createElement('button');
      markerButton.type = 'button';
      markerButton.setAttribute('aria-label', `${localeRef.current === 'bg' ? 'Отворете' : 'Open'} ${location.name}`);
      markerButton.style.width = selected ? '28px' : '20px';
      markerButton.style.height = selected ? '28px' : '20px';
      markerButton.style.padding = '0';
      markerButton.style.borderRadius = '50%';
      markerButton.style.border = selected ? '4px solid #FFFFFF' : '3px solid #C6F177';
      markerButton.style.background = selected ? '#C6F177' : '#174C35';
      markerButton.style.boxShadow = '0 3px 10px rgba(11, 23, 17, 0.35)';
      markerButton.style.cursor = 'pointer';
      markerButton.addEventListener('click', (event) => {
        event.stopPropagation();
        latest.current.onLocationPress(location.id);
      });
      const marker = new Marker({ element: markerButton, anchor: 'center' }).setLngLat([location.lng, location.lat]).addTo(map);
      marker.getElement().setAttribute('aria-label', `${localeRef.current === 'bg' ? 'Отворете' : 'Open'} ${location.name}`);
      return marker;
    });
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (typeof window.WebGLRenderingContext === 'undefined') {
      latest.current.onError('This browser cannot render the detailed map.');
      return;
    }
    const map = new MapLibreMap({
      container: containerRef.current,
      style: latest.current.source.onlineStyleUrl,
      center: [latest.current.cameraCommand?.center?.lng ?? 25.35, latest.current.cameraCommand?.center?.lat ?? 42.72],
      zoom: latest.current.cameraCommand?.zoom ?? 6.35,
      pitch: latest.current.cameraCommand?.pitch ?? 34,
      bearing: latest.current.cameraCommand?.heading ?? -8,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new NavigationControl({ showCompass: true }), 'bottom-right');
    map.on('load', () => {
      map.addSource(CYCLING_SOURCE, { type: 'geojson', data: CYCLING_PATHS });
      const visibility = latest.current.cyclingVisible ? 'visible' : 'none';
      map.addLayer({ id: 'cycling-outline', type: 'line', source: CYCLING_SOURCE, layout: { visibility, 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#FFFFFF', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 4, 15, 9], 'line-opacity': 0.9 } });
      map.addLayer({ id: 'cycling-lines', type: 'line', source: CYCLING_SOURCE, layout: { visibility, 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': CYCLING_LINE_COLOR as any, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 15, 5] } });
      map.addSource(CYCLING_PLACES_SOURCE, { type: 'geojson', data: CYCLING_PLACES });
      const placeVisibility = latest.current.cyclingVisible && latest.current.cyclingPlacesVisible !== false ? 'visible' : 'none';
      map.addLayer({ id: 'cycling-places', type: 'circle', source: CYCLING_PLACES_SOURCE, minzoom: 12, layout: { visibility: placeVisibility }, paint: { 'circle-color': ['match', ['get', 'kind'], 'parking', '#1951BE', '#087DAB'], 'circle-radius': 10, 'circle-stroke-color': '#FFFFFF', 'circle-stroke-width': 2 } });
      map.addLayer({ id: 'cycling-place-labels', type: 'symbol', source: CYCLING_PLACES_SOURCE, minzoom: 12, layout: { visibility: placeVisibility, 'text-font': ['Noto Sans Regular'], 'text-field': ['match', ['get', 'kind'], 'parking', 'P', '●'], 'text-size': 12, 'text-allow-overlap': true }, paint: { 'text-color': '#FFFFFF' } });
      map.addSource(LOCATIONS_SOURCE, { type: 'geojson', data: locationsToFeatureCollection(latest.current.locations), cluster: true, clusterRadius: 54, clusterMaxZoom: 13 });
      map.addLayer({ id: 'location-clusters', type: 'circle', source: LOCATIONS_SOURCE, filter: ['has', 'point_count'], paint: { 'circle-color': ['step', ['get', 'point_count'], '#76D49B', 25, '#B8E36B', 60, '#F0B15D'], 'circle-radius': ['step', ['get', 'point_count'], 19, 25, 24, 60, 29], 'circle-stroke-width': 3, 'circle-stroke-color': '#FFFFFF' } });
      map.addLayer({ id: 'cluster-count', type: 'symbol', source: LOCATIONS_SOURCE, filter: ['has', 'point_count'], layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 13 }, paint: { 'text-color': '#0B1711' } });
      map.addLayer({ id: 'location-pins', type: 'circle', source: LOCATIONS_SOURCE, filter: ['!', ['has', 'point_count']], paint: { 'circle-color': '#174C35', 'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 7, 13, 10], 'circle-stroke-width': 3, 'circle-stroke-color': '#C6F177' } });
      map.addLayer({ id: 'selected-pin', type: 'circle', source: LOCATIONS_SOURCE, filter: ['==', ['get', 'id'], latest.current.selectedLocationId ?? ''], paint: { 'circle-color': '#C6F177', 'circle-radius': 15, 'circle-stroke-width': 4, 'circle-stroke-color': '#FFFFFF', 'circle-opacity': 0.45 } });
      map.addSource(USER_SOURCE, { type: 'geojson', data: userFeature(latest.current.userLocation) });
      map.addLayer({ id: 'user-location', type: 'circle', source: USER_SOURCE, paint: { 'circle-radius': 8, 'circle-color': '#2E89FF', 'circle-stroke-width': 3, 'circle-stroke-color': '#FFFFFF' } });
      map.addSource(SEARCH_SOURCE, { type: 'geojson', data: userFeature(latest.current.searchPoint ?? null) });
      map.addLayer({ id: 'address-search-halo', type: 'circle', source: SEARCH_SOURCE, paint: { 'circle-radius': 17, 'circle-color': '#C6F177', 'circle-opacity': 0.28 } });
      map.addLayer({ id: 'address-search-point', type: 'circle', source: SEARCH_SOURCE, paint: { 'circle-radius': 8, 'circle-color': '#C6F177', 'circle-stroke-width': 4, 'circle-stroke-color': '#174C35' } });
      syncVisibleMarkers(map);
      try { applyMapLabelLocale(map, localeRef.current); } catch { /* Base-map labels must never block location rendering. */ }
      latest.current.onReady();
    });
    map.on('error', (event: any) => {
      const message = event.error?.message;
      if (message && !message.includes('AbortError') && !message.includes('timeout exceeded')) latest.current.onError(message);
    });
    const reportCamera = () => {
      const center = map.getCenter();
      const bounds = map.getBounds();
      latest.current.onCameraChanged({ center: { lat: center.lat, lng: center.lng }, zoom: map.getZoom(), pitch: map.getPitch(), heading: map.getBearing(), bounds: { north: bounds.getNorth(), south: bounds.getSouth(), east: bounds.getEast(), west: bounds.getWest() } });
      if (map.getZoom() < 4.65) latest.current.onRequestGlobe();
    };
    map.on('moveend', reportCamera);
    map.on('zoomend', reportCamera);
    map.on('click', event => {
      if (!latest.current.cyclingVisible || !map.getLayer('cycling-lines')) return;
      // Give narrow lines a comfortable touch target while keeping the map legible.
      const { x, y } = event.point;
      const features = map.queryRenderedFeatures([[x - 10, y - 10], [x + 10, y + 10]], { layers: ['cycling-lines', 'cycling-places'] });
      const feature = features.find(item => item.layer.id === 'cycling-places') ?? features[0];
      const id = feature?.properties?.id;
      if (id) latest.current.onCyclingFeaturePress?.(String(id));
    });
    for (const layer of ['cycling-lines', 'cycling-places']) {
      map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
    }
    map.on('click', 'location-clusters', async (event: MapLayerMouseEvent) => {
      const selected = event.features?.[0];
      if (!selected || selected.geometry.type !== 'Point') return;
      const source = map.getSource(LOCATIONS_SOURCE) as GeoJSONSource;
      const zoom = await source.getClusterExpansionZoom(Number(selected.properties?.cluster_id));
      const [lng, lat] = selected.geometry.coordinates;
      latest.current.onClusterPress({ lat, lng }, zoom);
    });
    map.on('click', 'location-pins', (event: MapLayerMouseEvent) => {
      const id = event.features?.[0]?.properties?.id;
      if (id) latest.current.onLocationPress(String(id));
    });
    const resize = () => map.resize();
    window.addEventListener('resize', resize);
    const observer = new ResizeObserver(resize);
    observer.observe(containerRef.current);
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      observer.disconnect();
      window.removeEventListener('resize', resize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const layer of CYCLING_LAYERS) if (map.getLayer(layer)) map.setLayoutProperty(layer, 'visibility', props.cyclingVisible ? 'visible' : 'none');
    for (const layer of CYCLING_PLACE_LAYERS) if (map.getLayer(layer)) map.setLayoutProperty(layer, 'visibility', props.cyclingVisible && props.cyclingPlacesVisible !== false ? 'visible' : 'none');
  }, [props.cyclingVisible, props.cyclingPlacesVisible]);

  useEffect(() => { (mapRef.current?.getSource(LOCATIONS_SOURCE) as GeoJSONSource | undefined)?.setData(geoJson as MapLocationFeatureCollection); }, [geoJson]);
  useEffect(() => { const map = mapRef.current; if (map?.isStyleLoaded()) syncVisibleMarkers(map); }, [props.locations, props.selectedLocationId, locale]);
  useEffect(() => { (mapRef.current?.getSource(USER_SOURCE) as GeoJSONSource | undefined)?.setData(userFeature(props.userLocation)); }, [props.userLocation]);
  useEffect(() => { (mapRef.current?.getSource(SEARCH_SOURCE) as GeoJSONSource | undefined)?.setData(userFeature(props.searchPoint ?? null)); }, [props.searchPoint]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !props.searchPoint) return;
    const moveToAddress = () => {
      const next = { center: [props.searchPoint!.lng, props.searchPoint!.lat] as [number, number], zoom: 13.5, pitch: 42, duration: props.reducedMotion ? 0 : 850 };
      if (props.reducedMotion) map.jumpTo(next);
      else map.flyTo(next);
    };
    moveToAddress();
  }, [props.reducedMotion, props.searchPoint]);
  useEffect(() => { if (mapRef.current?.getLayer('selected-pin')) mapRef.current.setFilter('selected-pin', ['==', ['get', 'id'], props.selectedLocationId ?? '']); }, [props.selectedLocationId]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    applyMapLabelLocale(map, locale);
  }, [locale]);
  useEffect(() => {
    const map = mapRef.current;
    const command = props.cameraCommand;
    if (!map || !command) return;
    const next = { center: command.center ? [command.center.lng, command.center.lat] as [number, number] : undefined, zoom: command.zoom, pitch: command.pitch, bearing: command.heading, duration: props.reducedMotion ? 0 : command.durationMs ?? 850 };
    if (props.reducedMotion) map.jumpTo(next);
    else map.flyTo(next);
  }, [props.cameraCommand, props.reducedMotion]);

  return <View style={{ flex: 1, overflow: 'hidden' }}><div ref={containerRef} aria-label={locale === 'bg' ? 'Подробна карта на устойчивите места' : 'Detailed sustainability map'} style={{ width: '100%', height: '100%' }} /></View>;
}
