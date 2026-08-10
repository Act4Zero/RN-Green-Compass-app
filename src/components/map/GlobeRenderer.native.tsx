import React from 'react';
import { MapRendererProps } from '../../types/map';

let NativeGlobeRenderer: React.ComponentType<MapRendererProps> | null = null;

export default function GlobeRenderer(props: MapRendererProps) {
  // Do not evaluate RNMapbox until MapView has ruled out Expo Go. RNMapbox
  // eagerly reads its native modules, which would otherwise crash the route
  // before the unsupported-runtime state can be shown.
  NativeGlobeRenderer ??= require('./GlobeRendererNativeMap').default;
  const Renderer = NativeGlobeRenderer as React.ComponentType<MapRendererProps>;
  return <Renderer {...props} />;
}
