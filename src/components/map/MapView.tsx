import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { View, Platform, Alert, Text } from 'react-native';
import { mapViewStyles } from '../../styles/map/MapViewStyles';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { getCurrentPosition } from '../../utils/mapUtils';

import { useMapState } from '../../hooks/useMapState';
import { useMapIntegration } from '../../hooks/useMapIntegration';
import { useContext } from 'react';
import { MapContext } from '../../context/MapContext';
// Import components with relative paths
import MapMarker from './MapMarker';
import MapPopup from './MapPopup';
import LocateButton from './LocateButton';
import { categoryConfig } from '../../utils/categoryUtils';
import { ioniconSvgPaths } from '../../utils/ioniconPaths';

// HTML and JS for the Leaflet map when running in a WebView
const leafletHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Green Compass Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
    <style>
      body { margin: 0; padding: 0; }
      html, body, #map { height: 100%; width: 100%; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      // Initialize the map
      const map = L.map('map').setView([42.698334, 23.319941], 12);
      
      // Add the OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);
      
      // Function to receive messages from React Native
      window.addEventListener('message', function(event) {
        const message = JSON.parse(event.data);
        
        switch(message.type) {
          case 'UPDATE_MARKERS':
            updateMarkers(message.locations);
            break;
          case 'SET_CENTER':
            map.setView([message.lat, message.lng], message.zoom || map.getZoom());
            break;
          case 'GET_CENTER':
            const center = map.getCenter();
            const zoom = map.getZoom();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'MAP_CENTER',
              lat: center.lat,
              lng: center.lng,
              zoom: zoom
            }));
            break;
        }
      });
      
      // Keep track of markers
      let markers = [];
      
      // Function to update markers on the map
      function updateMarkers(locations) {
        // Clear existing markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        // Add new markers
        locations.forEach(location => {
          const marker = L.marker([location.lat, location.lng])
            .bindPopup(location.name)
            .addTo(map)
            .on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'MARKER_CLICK',
                id: location.id
              }));
            });
          
          markers.push(marker);
        });
      }
      
      // Report map movements
      map.on('moveend', function() {
        const center = map.getCenter();
        const zoom = map.getZoom();
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'MAP_MOVE',
          lat: center.lat,
          lng: center.lng,
          zoom: zoom
        }));
      });
      
      // Initialize
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'MAP_READY'
      }));
    </script>
  </body>
</html>
`;

// Simply ignore TypeScript errors for Leaflet since we're just using it in a controlled way
// @ts-ignore

// Ensure Leaflet CSS is loaded globally for web
if (typeof window !== 'undefined' && Platform.OS === 'web') {
  require('leaflet/dist/leaflet.css');
}

declare global {
  interface Window {
    _leafletMapInitialized?: boolean;
    _leafletMapInstance?: any;
  }
}

export default function MapView() {
  // DEV DEBUG PANEL STATE
  const [showDebugPanel, setShowDebugPanel] = useState(__DEV__);

  // Get initialization state directly from context
  const { isDataInitialized } = useContext(MapContext);
  
  const webViewRef = useRef<WebView>(null);
  const { filteredLocations, viewport, updateViewport, selectedLocation, selectLocation } = useMapIntegration();

  // DEBUG: For UI panel
  const filteredLocationsCount = filteredLocations?.length ?? 0;
  const filteredLocationsSample = filteredLocations?.slice(0, 3) ?? [];
  const [mapReady, setMapReady] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Check for location permission on mount
  useEffect(() => {
    // For web, we check permission differently than native
    if (Platform.OS === 'web') {
      setLocationPermission(true);
    } else {
      setLocationPermission(null); // We'll check on demand
    }
  }, []);

  // Handle messages from the WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'MAP_READY':
          setMapReady(true);
          break;
        case 'MAP_MOVE':
          updateViewport({
            center: {
              lat: message.lat,
              lng: message.lng
            },
            zoom: message.zoom
          });
          break;
        case 'MARKER_CLICK':
          const location = filteredLocations.find(loc => loc.id === message.id);
          if (location) {
            selectLocation(location);
          }
          break;
      }
    } catch (error) {
      console.error('Error processing WebView message:', error);
    }
  };

  // Send updated locations to the WebView when they change
  useEffect(() => {
    if (mapReady && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.postMessage(JSON.stringify({
          type: 'UPDATE_MARKERS',
          locations: ${JSON.stringify(filteredLocations)}
        }));
        true;
      `);
    }
  }, [mapReady, filteredLocations]);

  // Locate user position using our mapUtils
  const handleLocateMe = async () => {
    setIsLocating(true);
    try {
      // Use our utility function to get position (handles permissions)
      const position = await getCurrentPosition();
      setLocationPermission(true);
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window._leafletMapInstance) {
          window._leafletMapInstance.setView([position.lat, position.lng], 15);
        }
      } else if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          window.postMessage(JSON.stringify({
            type: 'SET_CENTER',
            lat: ${position.lat},
            lng: ${position.lng},
            zoom: 15
          }));
          true;
        `);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', error instanceof Error ? error.message : 'Could not get your location. Please check your settings.');
    } finally {
      setIsLocating(false);
    }
  };

  const leafletMarkersRef = useRef<any[]>([]); // For web: store marker refs

  // Initialize Leaflet map on web (client only)
  useEffect(() => {
    // Delay initialization to ensure DOM is fully rendered
    if (Platform.OS === 'web') {
      // Use a short timeout to ensure the DOM is ready
      const initializeLeaflet = () => {
        if (window._leafletMapInitialized || typeof document === 'undefined') return;
        
        try {
          // Check if map element exists
          const mapElement = document.getElementById('map');
          if (!mapElement) {
            console.log('Map element not found yet, will retry');
            return;
          }
          
          // Leaflet doesn't have a default export, so we import the whole module
          const L = require('leaflet');
          if (!L || !L.map) {
            console.error('Leaflet loaded but L.map is undefined');
            return;
          }
          
          // Initialize the map
          const map = L.map('map').setView([42.698334, 23.319941], 12);
          window._leafletMapInstance = map;
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map);
          
          window._leafletMapInitialized = true;
          window._leafletMapInstance = map; 
          console.log('Leaflet map initialized successfully');
        } catch (err) {
          console.error('Error initializing Leaflet map:', err);
        }
      };
      
      // Try immediately and then with a delay if needed
      initializeLeaflet();
      
      // Set a timeout as a fallback to ensure map gets initialized
      const timeoutId = setTimeout(() => {
        if (!window._leafletMapInitialized) {
          console.log('Retrying map initialization after timeout');
          initializeLeaflet();
        }
      }, 500); // 500ms should be enough for the DOM to be ready
      
      return () => clearTimeout(timeoutId);
    }
  }, [isDataInitialized]); // Only run when data is initialized

  // For web: add markers to Leaflet map instance when filteredLocations changes
  // --- CATEGORY ICON MARKERS ---
  // (imports are now at the top)

  function svgToBase64(svg: string) {
    if (typeof window !== 'undefined' && window.btoa) {
      return window.btoa(unescape(encodeURIComponent(svg)));
    } else {
      // fallback for Node.js, not expected in browser
      return Buffer.from(svg).toString('base64');
    }
  }

  useEffect(() => {
    if (Platform.OS !== 'web' || !window._leafletMapInitialized || !window._leafletMapInstance) {
      console.log('[LeafletMarkerEffect] Skipping: platform or map not ready');
      return;
    }
    const L = require('leaflet');
    const map = window._leafletMapInstance;
    console.log('[LeafletMarkerEffect] Adding markers:', filteredLocations.length);
    // Remove old markers
    leafletMarkersRef.current.forEach(marker => marker.remove());
    leafletMarkersRef.current = [];

    filteredLocations.forEach((location: any) => {
      // Get icon and color for this category
      const config = categoryConfig[location.category] || categoryConfig['Community'];
      const iconName = config.icon;
      const iconColor = config.color;
      const iconLabel = config.label;
      const iconPath = ioniconSvgPaths[iconName] || '';

      // Compose SVG for marker with icon
      const svgMarkerString = `
        <svg xmlns='http://www.w3.org/2000/svg' width='32' height='42' viewBox='0 0 32 42' fill='none' color='white'>
          <path d='M16 42C16 42 28 26.5 28 18C28 8.05887 21.9411 2 16 2C10.0589 2 4 8.05887 4 18C4 26.5 16 42 16 42Z' fill='${iconColor}' stroke='white' stroke-width='2'/>
          <g transform='translate(7,12) scale(0.8)'>
            ${iconPath}
          </g>
        </svg>
      `;
      const svgBase64 = svgToBase64(svgMarkerString);
      const svgIconUrl = `data:image/svg+xml;base64,${svgBase64}`;
      const icon = L.icon({
        iconUrl: svgIconUrl,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -36],
        shadowUrl: undefined
      });
      const marker = L.marker([location.lat, location.lng], { icon })
        .addTo(map)
        .bindPopup(location.name || '');
      leafletMarkersRef.current.push(marker);
    });
    console.log('[LeafletMarkerEffect] Markers added:', leafletMarkersRef.current.length);
  }, [filteredLocations]);

  const renderDebugPanel = () => {
    if (!showDebugPanel) return null;
    return (
      <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 10, zIndex: 9999, borderRadius: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>DEBUG: filteredLocations</Text>
            <Text style={{ color: '#fff' }}>Count: {filteredLocationsCount}</Text>
            <Text style={{ color: '#fff', fontSize: 10 }}>
              Sample: {JSON.stringify(filteredLocationsSample, null, 2)}
            </Text>
          </View>
          <Text
            style={{ color: '#fff', marginLeft: 12, fontWeight: 'bold', fontSize: 16 }}
            onPress={() => setShowDebugPanel(false)}
            accessibilityRole="button"
          >✕</Text>
        </View>
      </View>
    );
  };

  const renderMap = () => {
    if (Platform.OS === 'web') {
      // On web, render the map in a fixed-position div to guarantee visibility
      // Render MapMarker components for each filtered location on web
      return (
        <>
          {renderDebugPanel()}
          <div
            className="leaflet-container"
            style={{
              width: '100vw',
              height: '100vh',
              zIndex: 1,
              position: 'fixed',
              top: 0,
              left: 0
            }}
          >
            <div
              id="map"
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
          </div>
        </>
      );
    } else {
      // On mobile, we use a WebView to render Leaflet
      return (
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: leafletHtml }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          style={styles.webview}
        />
      );
    }
  };

  // Render loading state if data is not yet initialized
  if (!isDataInitialized) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 16, color: '#2E7D32', fontWeight: '500' }}>Loading map data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderMap()}
      <LocateButton onPress={handleLocateMe} isLoading={isLocating} />
      {selectedLocation && (
        <MapPopup location={selectedLocation} />
      )}
    </View>
  );
}

// Use the external styles imported from MapViewStyles
const styles = mapViewStyles;
