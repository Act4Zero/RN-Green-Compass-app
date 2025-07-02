import React from 'react';
import { MapLocation } from '../../types/map';

interface MapPopupProps {
  location: MapLocation;
  onClose: () => void;
}

declare const MapPopup: React.FC<MapPopupProps>;
export default MapPopup;
