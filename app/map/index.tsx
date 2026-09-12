import React from 'react';
import PublicMap from '@/components/map/PublicMap';

/** The root navigator requires authentication before mounting the map. */
export default function MapScreen() {
  return <PublicMap />;
}
