import React, { useEffect, useRef, useState } from 'react';
import { View, Platform, Alert } from 'react-native';
import { mapViewStyles } from '../../styles/map/MapViewStyles';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { getCurrentPosition } from '../../utils/mapUtils';

import { useMapState } from '../../hooks/useMapState';
import { useMapIntegration } from '../../hooks/useMapIntegration';
// Import components with relative paths
import MapMarker from './MapMarker';
import MapPopup from './MapPopup';
import LocateButton from './LocateButton';

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

export default function MapView() {
  const webViewRef = useRef<WebView>(null);
  const { filteredLocations, viewport, updateViewport, selectedLocation, selectLocation } = useMapIntegration();
  const [mapReady, setMapReady] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  // Check for location permission on mount
  useEffect(() => {
    // For web, we check permission differently than native
    if (Platform.OS === 'web') {
      // On web, we can't check permissions directly, so we assume it's granted
      // and will handle rejection when we try to use it
      setLocationPermission(true);
    } else {
      // For native platforms, we would use the appropriate permission checking
      // For now, we'll just set it to true as a placeholder
      setLocationPermission(true);
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
    if (!locationPermission) {
      Alert.alert('Location Permission', 'Location permission is required to use this feature.');
      return;
    }

    try {
      // Use our utility function to get position
      const position = await getCurrentPosition();
      
      if (webViewRef.current) {
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
      Alert.alert('Location Error', 'Could not get your location. Please check your settings.');
    }
  };

  const renderMap = () => {
    if (Platform.OS === 'web') {
      // On web, we can use the Leaflet library directly
      return (
        <div className="leaflet-container" style={{width: '100%', height: '100%'}}>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
          <div id="map" style={{width: '100%', height: '100%'}}></div>
        </div>
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

  return (
    <View style={styles.container}>
      {renderMap()}
      <LocateButton onPress={handleLocateMe} />
      {selectedLocation && (
        <MapPopup location={selectedLocation} />
      )}
    </View>
  );
}

// Use the external styles imported from MapViewStyles
const styles = mapViewStyles;
