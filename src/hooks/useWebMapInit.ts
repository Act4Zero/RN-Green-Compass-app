import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    _leafletMapInitialized?: boolean;
    _leafletMapInstance?: any;
    _userLocationMarker?: any;
  }
}

interface MapInitOptions {
  initialLat: number;
  initialLng: number;
  initialZoom: number;
  isDataInitialized: boolean;
}

/**
 * Hook to initialize Leaflet map on web platform
 */
export function useWebMapInit({
  initialLat = 20, 
  initialLng = 0, 
  initialZoom = 2,
  isDataInitialized
}: MapInitOptions) {
  const initialized = useRef(false);

  useEffect(() => {
    // Only run on web platform client-side
    if (typeof window === 'undefined' || initialized.current) {
      return;
    }

    // Delay initialization to ensure DOM is fully rendered
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
        
        // Import Leaflet's default CSS
        require('leaflet/dist/leaflet.css');
        
        // Import our custom EV popup CSS
        try {
          require('../styles/web/ev-popup.css');
          console.log('EV popup CSS loaded successfully');
        } catch (cssErr) {
          console.warn('Could not load EV popup CSS:', cssErr);
        }
        
        // Initialize the map
        const map = L.map('map').setView([initialLat, initialLng], initialZoom);
        window._leafletMapInstance = map;
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);
        
        window._leafletMapInitialized = true;
        console.log('Leaflet map initialized successfully');
        initialized.current = true;
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
  }, [initialLat, initialLng, initialZoom, isDataInitialized]);

  return {
    isInitialized: typeof window !== 'undefined' && !!window._leafletMapInitialized,
    mapInstance: typeof window !== 'undefined' ? window._leafletMapInstance : null
  };
}
