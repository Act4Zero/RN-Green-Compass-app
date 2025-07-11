import React, { useRef, useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { mapViewStyles } from '../../styles/map/MapViewStyles';
import { leafletHtml } from './leafletTemplate';

interface NativeMapViewProps {
  filteredLocations: any[];
  onMapReady: () => void;
  onMapMove: (center: { lat: number; lng: number }, zoom: number) => void;
  onMarkerClick: (locationId: string) => void;
  userLocation: { lat: number; lng: number } | null;
  updateUserLocationOnMap?: boolean;
}

/**
 * Native-specific implementation of the map view using WebView with Leaflet
 */
export function NativeMapView({
  filteredLocations,
  onMapReady,
  onMapMove,
  onMarkerClick,
  userLocation,
  updateUserLocationOnMap
}: NativeMapViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);
  
  // Handle messages from the WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'MAP_READY':
          setMapReady(true);
          onMapReady();
          break;
        case 'MAP_MOVE':
          onMapMove(
            {
              lat: message.lat,
              lng: message.lng
            },
            message.zoom
          );
          break;
        case 'MARKER_CLICK':
          onMarkerClick(message.id);
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

  // Update the map center when user location changes and updateUserLocationOnMap is true
  useEffect(() => {
    if (mapReady && webViewRef.current && userLocation && updateUserLocationOnMap) {
      webViewRef.current.injectJavaScript(`
        window.postMessage(JSON.stringify({
          type: 'SET_CENTER',
          lat: ${userLocation.lat},
          lng: ${userLocation.lng},
          zoom: 15
        }));
        if(window._userLocationMarker){window._userLocationMarker.setLatLng([${userLocation.lat},${userLocation.lng}]);}else{window._userLocationMarker = L.circleMarker([${userLocation.lat},${userLocation.lng}],{radius:8,color:'#1976D2',fillColor:'#1976D2',fillOpacity:0.9,weight:2}).addTo(map);}
        true;
      `);
    }
  }, [mapReady, userLocation, updateUserLocationOnMap]);

  return (
    <WebView
      ref={webViewRef}
      originWhitelist={['*']}
      source={{ html: leafletHtml }}
      onMessage={handleWebViewMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      style={mapViewStyles.webview}
    />
  );
}

export default NativeMapView;
