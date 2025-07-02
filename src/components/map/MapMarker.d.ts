import React from 'react';
import { MapLocation } from '../../types/map';

interface MapMarkerProps {
  location: MapLocation;
  selected?: boolean;
  onPress?: (location: MapLocation) => void;
}

declare const MapMarker: React.FC<MapMarkerProps>;
export default MapMarker;
