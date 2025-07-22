import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { categoryConfig } from '../utils/categoryUtils';
import { ioniconSvgPaths } from '../utils/ioniconPaths';
import { createMarkerIconUrl } from '../utils/markerUtils';
import { formatAddress } from '../utils/mapUtils';

interface Location {
  id: string;
  lat: number;
  lng: number;
  name: string;
  category: string;
  address_line_1?: string;
  address_line_2?: string;
  town?: string;
  state_or_province?: string;
  country?: string;
  postcode?: string;
  description?: string;
  usage_cost?: string;
  power_kw?: number;
  connection_type?: string;
  level?: string;
  is_fast_charge_capable?: boolean;
  source?: string;
  licence?: string;
}

/**
 * Creates an enhanced HTML popup content for a location
 * @param location The location object with detailed information
 * @returns HTML string for the popup content
 */
function createEnhancedPopupContent(location: Location): string {
  // Format address manually (can't use formatAddress directly due to type incompatibility)
  const address = [
    location.address_line_1,
    location.address_line_2,
    location.town,
    location.state_or_province,
    location.country,
    location.postcode
  ].filter(Boolean).join(', ');
  
  // Start with the title/name
  let html = `<div class="ev-popup">
    <h3>${location.name || 'Unnamed Location'}</h3>`;
  
  // Create Google Maps URL for navigation using address and coordinates for better accuracy
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address || location.name || ''
  )}+${encodeURIComponent(location.lat + ',' + location.lng)}`;
  
  // Add address section with Google Maps button
  html += `
    <div class="ev-popup-section">
      <div class="ev-popup-row">
        <i class="icon-location"></i>
        <span>${address}</span>
        <a href="${googleMapsUrl}" target="_blank" class="ev-popup-maps-btn" title="Open in Google Maps">🗺️</a>
      </div>`;
      
  // Add detailed location if available
  if (location.town || location.state_or_province || location.country) {
    const detailedLocation = [
      location.town,
      location.state_or_province,
      location.country
    ].filter(Boolean).join(', ');
    
    if (detailedLocation) {
      html += `
      <div class="ev-popup-detail">${detailedLocation}</div>`;
    }
  }
  
  if (location.postcode) {
    html += `
      <div class="ev-popup-detail">Postcode: ${location.postcode}</div>`;
  }
  html += `
    </div>`;
  
  // Add category
  html += `
    <div class="ev-popup-row">
      <i class="icon-tag"></i>
      <span>${location.category}</span>
    </div>`;
  
  // Add description if available or use power as fallback for EV
  if (location.description) {
    html += `
    <div class="ev-popup-description">${location.description}</div>`;
  } else if (location.category === 'EV Charging Stations' && location.power_kw) {
    html += `
    <div class="ev-popup-description">
      ${location.power_kw}kW charging power
      ${location.is_fast_charge_capable ? ' - Fast charging capable' : ''}
    </div>`;
  }
  
  // Add EV Charging specific details
  if (location.category === 'EV Charging Stations') {
    html += `
    <div class="ev-popup-charging-section">
      <h4>Charging Details</h4>
      <div class="ev-popup-grid">`;
    
    // Power info
    html += `
        <div class="ev-popup-card">
          <div class="ev-popup-card-header">
            <i class="icon-flash"></i>
            <span>Power</span>
          </div>
          <div class="ev-popup-card-value">
            ${location.power_kw ? `${location.power_kw} kW` : 'Not specified'}
          </div>
          ${location.is_fast_charge_capable ? `<div class="ev-popup-fast-charge">⚡ Fast Charge</div>` : ''}
        </div>`;
    
    // Cost info
    html += `
        <div class="ev-popup-card">
          <div class="ev-popup-card-header">
            <i class="icon-cash"></i>
            <span>Cost</span>
          </div>
          <div class="ev-popup-card-value">
            ${location.usage_cost || 'Not specified'}
          </div>
        </div>`;
    
    html += `
      </div>`; // Close grid
    
    // Connection type and level
    html += `
      <div class="ev-popup-technical">
        <div class="ev-popup-row">
          <i class="icon-link"></i>
          <span>Connector: ${location.connection_type || 'Not specified'}</span>
        </div>
        <div class="ev-popup-row">
          <i class="icon-speedometer"></i>
          <span>Level: ${location.level || 'Not specified'}</span>
        </div>
      </div>
    </div>`; // Close charging section
  }
  
  // Add source and license
  if (location.source || location.licence) {
    html += `
    <div class="ev-popup-source">`;
    
    if (location.source) {
      html += `
      <div class="ev-popup-source-text">Source: ${location.source}</div>`;
    }
    
    if (location.licence) {
      html += `
      <div class="ev-popup-licence-text">License: ${location.licence}</div>`;
    }
    
    html += `
    </div>`;
  }
  
  // Close popup div and return
  html += `
</div>`;
  
  return html;
}

/**
 * Hook to manage markers on a web-based Leaflet map
 */
export function useWebMapMarkers(locations: Location[]) {
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (Platform.OS !== 'web' || 
        !window._leafletMapInitialized || 
        !window._leafletMapInstance) {
      return;
    }

    const L = require('leaflet');
    const map = window._leafletMapInstance;
    
    // Remove old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    locations.forEach((location: Location) => {
      // Get icon and color for this category
      const category = location.category as keyof typeof categoryConfig;
      const config = categoryConfig[category] || categoryConfig['Community'];
      const iconName = config.icon;
      const iconColor = config.color;
      const iconPath = ioniconSvgPaths[iconName] || '';

      // Create marker icon URL
      const svgIconUrl = createMarkerIconUrl(iconPath, iconColor);
      
      // Create Leaflet icon
      const icon = L.icon({
        iconUrl: svgIconUrl,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -36],
        shadowUrl: undefined
      });
      
      // Create enhanced popup content with HTML
      const popupContent = createEnhancedPopupContent(location);
      
      // Create and add marker to map with enhanced popup
      const marker = L.marker([location.lat, location.lng], { icon })
        .addTo(map)
        .bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        });
        
      markersRef.current.push(marker);
    });

    console.log('[WebMapMarkers] Markers added:', markersRef.current.length);
  }, [locations]);

  return {
    markerCount: markersRef.current.length
  };
}
