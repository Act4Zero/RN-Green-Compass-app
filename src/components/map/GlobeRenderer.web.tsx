import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { MAP_STYLE_PRESETS } from '../../config/mapGlobe';
import { locationsToFeatureCollection } from '../../utils/mapGlobe';
import { MapLocationFeatureCollection, MapRendererProps } from '../../types/map';

const LOCATIONS_SOURCE = 'green-compass-locations';
const USER_SOURCE = 'green-compass-user-location';
const MAPBOX_VERSION = '3.27.0';
const MAPBOX_SCRIPT_URL = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.js`;
const MAPBOX_STYLESHEET_URL = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.css`;
let mapboxLoader: Promise<any> | null = null;

function loadMapboxGL(): Promise<any> {
  const browserWindow = window as typeof window & { mapboxgl?: any };
  if (browserWindow.mapboxgl) return Promise.resolve(browserWindow.mapboxgl);
  if (mapboxLoader) return mapboxLoader;

  mapboxLoader = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${MAPBOX_STYLESHEET_URL}"]`)) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = MAPBOX_STYLESHEET_URL;
      document.head.appendChild(stylesheet);
    }

    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${MAPBOX_SCRIPT_URL}"]`);
    const script = existingScript ?? document.createElement('script');
    const onReady = () => browserWindow.mapboxgl
      ? resolve(browserWindow.mapboxgl)
      : reject(new Error('Mapbox loaded without exposing its browser renderer.'));
    script.addEventListener('load', onReady, { once: true });
    script.addEventListener('error', () => {
      mapboxLoader = null;
      reject(new Error('The 3D globe renderer could not be downloaded. Check your connection and try again.'));
    }, { once: true });
    if (!existingScript) {
      script.src = MAPBOX_SCRIPT_URL;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  });
  return mapboxLoader;
}

function userFeature(point: { lat: number; lng: number } | null): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: point ? [{ type: 'Feature', geometry: { type: 'Point', coordinates: [point.lng, point.lat] }, properties: {} }] : [],
  };
}

export default function GlobeRenderer(props: MapRendererProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const mapboxRef = useRef<any>(null);
  const styleUrlRef = useRef(MAP_STYLE_PRESETS[props.styleId].styleUrl);
  const latest = useRef(props);
  const geoJson = useMemo(() => locationsToFeatureCollection(props.locations), [props.locations]);
  latest.current = props;

  const applyStyleConfig = (map: any) => {
    const preset = MAP_STYLE_PRESETS[latest.current.styleId];
    try {
      map.setProjection('globe');
      map.setConfigProperty?.('basemap', 'lightPreset', preset.lightPreset);
      map.setConfigProperty?.('basemap', 'show3dObjects', true);
      map.setConfigProperty?.('basemap', 'showPointOfInterestLabels', true);
    } catch {
      // Older renderer/style combinations safely ignore Standard style configuration.
    }
  };

  const ensureDataLayers = (map: any) => {
    applyStyleConfig(map);
    if (!map.getSource(LOCATIONS_SOURCE)) {
      map.addSource(LOCATIONS_SOURCE, {
        type: 'geojson',
        data: locationsToFeatureCollection(latest.current.locations),
        cluster: true,
        clusterRadius: 54,
        clusterMaxZoom: 13,
      });
      map.addLayer({
        id: 'location-clusters', type: 'circle', source: LOCATIONS_SOURCE, filter: ['has', 'point_count'], slot: 'top',
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#76D49B', 25, '#B8E36B', 60, '#F0B15D'],
          'circle-radius': ['step', ['get', 'point_count'], 19, 25, 24, 60, 29],
          'circle-stroke-width': 3, 'circle-stroke-color': '#FFFFFF', 'circle-emissive-strength': 0.8,
        },
      } as any);
      map.addLayer({
        id: 'cluster-count', type: 'symbol', source: LOCATIONS_SOURCE, filter: ['has', 'point_count'], slot: 'top',
        layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 13 },
        paint: { 'text-color': '#0B1711', 'text-emissive-strength': 1 },
      } as any);
      map.addLayer({
        id: 'location-pins', type: 'circle', source: LOCATIONS_SOURCE, filter: ['!', ['has', 'point_count']], slot: 'top',
        paint: {
          'circle-color': '#174C35', 'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 7, 13, 10],
          'circle-stroke-width': 3, 'circle-stroke-color': '#C6F177', 'circle-emissive-strength': 0.95,
        },
      } as any);
      map.addLayer({
        id: 'selected-pin', type: 'circle', source: LOCATIONS_SOURCE,
        filter: ['==', ['get', 'id'], latest.current.selectedLocationId ?? ''], slot: 'top',
        paint: {
          'circle-color': '#C6F177', 'circle-radius': 15, 'circle-stroke-width': 4,
          'circle-stroke-color': '#FFFFFF', 'circle-opacity': 0.45, 'circle-emissive-strength': 1,
        },
      } as any);
    }
    if (!map.getSource(USER_SOURCE)) {
      map.addSource(USER_SOURCE, { type: 'geojson', data: userFeature(latest.current.userLocation) });
      map.addLayer({
        id: 'user-location', type: 'circle', source: USER_SOURCE, slot: 'top',
        paint: { 'circle-radius': 8, 'circle-color': '#2E89FF', 'circle-stroke-width': 3, 'circle-stroke-color': '#FFFFFF' },
      } as any);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let map: any;
    let resizeObserver: ResizeObserver | null = null;
    let firstResizeFrame: number | null = null;
    let secondResizeFrame: number | null = null;
    const resizeMap = () => map?.resize();
    loadMapboxGL().then((mapboxgl) => {
      if (cancelled || !containerRef.current) return;
      mapboxRef.current = mapboxgl;
      if (!mapboxgl.supported(true)) {
        latest.current.onError('This browser cannot run the 3D globe. Enable WebGL or try a newer browser.');
        return;
      }
      mapboxgl.accessToken = latest.current.accessToken;
      const preset = MAP_STYLE_PRESETS[latest.current.styleId];
      styleUrlRef.current = preset.styleUrl;
      try {
        map = new mapboxgl.Map({
          container: containerRef.current,
          style: preset.styleUrl,
          projection: 'globe',
          center: [18.2, 48.4],
          zoom: 3.15,
          pitch: 18,
          bearing: 0,
          attributionControl: false,
          antialias: true,
        });
        mapRef.current = map;
        // React Native Web can finish measuring the app shell after Mapbox has
        // created its canvas. Keep the canvas synchronized with the actual map
        // container instead of leaving it at the transient first measurement.
        resizeObserver = new ResizeObserver(resizeMap);
        resizeObserver.observe(containerRef.current);
        window.addEventListener('resize', resizeMap);
        firstResizeFrame = window.requestAnimationFrame(() => {
          resizeMap();
          secondResizeFrame = window.requestAnimationFrame(resizeMap);
        });
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
        map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');
        map.on('style.load', () => { resizeMap(); ensureDataLayers(map); latest.current.onReady(); });
        map.on('error', (event: any) => {
          const message = event?.error?.message;
          if (message && !message.includes('AbortError')) latest.current.onError(message);
        });
        map.on('moveend', () => {
          const center = map.getCenter();
          const bounds = map.getBounds();
          latest.current.onCameraChanged({
            center: { lat: center.lat, lng: center.lng }, zoom: map.getZoom(), pitch: map.getPitch(), heading: map.getBearing(),
            bounds: { north: bounds.getNorth(), south: bounds.getSouth(), east: bounds.getEast(), west: bounds.getWest() },
          });
        });
        map.on('click', 'location-clusters', (event: any) => {
          const feature = event.features?.[0];
          if (!feature) return;
          const source = map.getSource(LOCATIONS_SOURCE);
          const [lng, lat] = feature.geometry.coordinates;
          source.getClusterExpansionZoom(feature.properties.cluster_id, (error: Error | null, zoom: number) => {
            if (error) {
              latest.current.onError('Unable to open this location cluster. Please try again.');
              return;
            }
            const nextZoom = Number.isFinite(zoom) ? zoom : Math.min(map.getZoom() + 2, 14);
            latest.current.onClusterPress({ lat, lng }, nextZoom);
          });
        });
        map.on('click', 'location-pins', (event: any) => {
          const id = event.features?.[0]?.properties?.id;
          if (id) latest.current.onLocationPress(String(id));
        });
        ['location-clusters', 'location-pins'].forEach((layer) => {
          map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
          map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
        });
      } catch (error) {
        latest.current.onError(error instanceof Error ? error.message : 'Unable to start the 3D globe.');
      }
    }).catch((error) => latest.current.onError(error instanceof Error ? error.message : 'Unable to load the map renderer.'));
    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resizeMap);
      if (firstResizeFrame !== null) window.cancelAnimationFrame(firstResizeFrame);
      if (secondResizeFrame !== null) window.cancelAnimationFrame(secondResizeFrame);
      map?.remove();
      mapRef.current = null;
    };
  // The renderer owns one stable map instance; current props are read through latest.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    const source = map.getSource(LOCATIONS_SOURCE);
    source?.setData(geoJson as MapLocationFeatureCollection);
  }, [geoJson]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const preset = MAP_STYLE_PRESETS[props.styleId];
    if (styleUrlRef.current !== preset.styleUrl) {
      styleUrlRef.current = preset.styleUrl;
      map.setStyle(preset.styleUrl);
    } else if (map.isStyleLoaded()) {
      applyStyleConfig(map);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.styleId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer('selected-pin')) return;
    map.setFilter('selected-pin', ['==', ['get', 'id'], props.selectedLocationId ?? '']);
  }, [props.selectedLocationId]);

  useEffect(() => {
    const source = mapRef.current?.getSource(USER_SOURCE);
    source?.setData(userFeature(props.userLocation));
  }, [props.userLocation]);

  useEffect(() => {
    const map = mapRef.current;
    const command = props.cameraCommand;
    if (!map || !command) return;
    const next: Record<string, unknown> = {
      duration: props.reducedMotion ? 0 : command.durationMs ?? 850,
      essential: false,
    };
    if (command.center) next.center = [command.center.lng, command.center.lat];
    if (Number.isFinite(command.zoom)) next.zoom = command.zoom;
    if (Number.isFinite(command.pitch)) next.pitch = command.pitch;
    if (Number.isFinite(command.heading)) next.bearing = command.heading;
    if (props.reducedMotion) map.jumpTo(next);
    else map.flyTo(next);
  }, [props.cameraCommand, props.reducedMotion]);

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      <div ref={containerRef} aria-label="Interactive sustainability globe" style={{ width: '100%', height: '100%' }} />
    </View>
  );
}
