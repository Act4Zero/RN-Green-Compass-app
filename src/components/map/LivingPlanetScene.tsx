/* eslint-disable react/no-unknown-property -- React Three Fiber JSX uses Three.js properties. */
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Asset } from 'expo-asset';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useAppLocale } from '../../context/AppLocaleContext';
import type { LivingPlanetQuality, MapLocation, MapPoint } from '../../types/map';
import { getUtcSunDirection, latLngToSphere } from '../../utils/livingPlanet';

const PLANET_RADIUS = 1.9;
const atmosphereVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const atmosphereFragmentShader = `
  varying vec3 vNormal;
  void main() {
    float rim = pow(max(0.0, 0.78 - dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.8);
    gl_FragColor = vec4(1.0, 0.99, 0.96, rim * 0.52);
  }
`;
const galaxyVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const galaxyFragmentShader = `
  precision highp float;
  varying vec2 vUv;

  float hash21(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise21(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);
    float a = hash21(cell);
    float b = hash21(cell + vec2(1.0, 0.0));
    float c = hash21(cell + vec2(0.0, 1.0));
    float d = hash21(cell + vec2(1.0, 1.0));
    return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
  }

  void main() {
    vec2 uv = vUv;
    float sweep = (uv.y - 0.50) + (uv.x - 0.5) * 0.10 + sin(uv.x * 10.0) * 0.024;
    float band = exp(-abs(sweep) * 8.8);
    float cloud = noise21(uv * vec2(5.0, 3.5)) * 0.58
      + noise21(uv * vec2(13.0, 8.0)) * 0.29
      + noise21(uv * vec2(31.0, 19.0)) * 0.13;
    float dust = smoothstep(0.22, 0.92, cloud) * band;

    vec3 background = mix(vec3(0.002, 0.018, 0.030), vec3(0.008, 0.032, 0.052), uv.y);
    vec3 blueCloud = vec3(0.09, 0.19, 0.31) * band * (0.22 + dust * 0.82);
    vec3 violetCloud = vec3(0.17, 0.08, 0.23) * pow(band, 1.55) * dust * 0.48;

    vec2 smallStarGrid = uv * vec2(360.0, 210.0);
    vec2 smallStarCell = floor(smallStarGrid);
    float smallStarSeed = hash21(smallStarCell);
    float smallStarShape = smoothstep(0.16, 0.0, length(fract(smallStarGrid) - 0.5));
    float smallStar = smallStarShape * step(0.965, smallStarSeed) * (0.42 + smallStarSeed * 0.72);

    vec2 brightStarGrid = uv * vec2(180.0, 105.0);
    vec2 brightStarCell = floor(brightStarGrid);
    float brightStarSeed = hash21(brightStarCell + 19.7);
    float brightStarDistance = length(fract(brightStarGrid) - 0.5);
    float brightStarCore = smoothstep(0.17, 0.0, brightStarDistance) * step(0.988, brightStarSeed);
    float brightStarGlow = smoothstep(0.34, 0.0, brightStarDistance) * step(0.996, brightStarSeed) * 0.38;
    float star = smallStar + brightStarCore * 1.35 + brightStarGlow;
    vec3 starColor = mix(vec3(0.68, 0.84, 1.0), vec3(1.0, 0.93, 0.76), hash21(smallStarCell + 7.3));

    gl_FragColor = vec4(background + blueCloud + violetCloud + starColor * star, 1.0);
  }
`;

type GlobeLabel = {
  name: string;
  coordinates: [number, number];
  kind: 'continent' | 'city';
  atlasIndex: number;
};

const GLOBE_LABELS: GlobeLabel[] = [
  { name: 'EUROPE', coordinates: [33, 63], kind: 'continent', atlasIndex: 0 },
  { name: 'ASIA', coordinates: [91, 49], kind: 'continent', atlasIndex: 1 },
  { name: 'AFRICA', coordinates: [18, 2], kind: 'continent', atlasIndex: 2 },
  { name: 'NORTH AMERICA', coordinates: [-103, 47], kind: 'continent', atlasIndex: 3 },
  { name: 'SOUTH AMERICA', coordinates: [-61, -18], kind: 'continent', atlasIndex: 4 },
  { name: 'AUSTRALIA', coordinates: [134, -25], kind: 'continent', atlasIndex: 5 },
  { name: 'Sofia', coordinates: [23.3219, 42.6977], kind: 'city', atlasIndex: 6 },
  { name: 'London', coordinates: [-0.1276, 51.5072], kind: 'city', atlasIndex: 7 },
  { name: 'Madrid', coordinates: [-3.7038, 40.4168], kind: 'city', atlasIndex: 8 },
  { name: 'Rome', coordinates: [12.4964, 41.9028], kind: 'city', atlasIndex: 9 },
  { name: 'Cairo', coordinates: [31.2357, 30.0444], kind: 'city', atlasIndex: 10 },
  { name: 'New York', coordinates: [-74.006, 40.7128], kind: 'city', atlasIndex: 11 },
  { name: 'Delhi', coordinates: [77.1025, 28.7041], kind: 'city', atlasIndex: 12 },
  { name: 'Beijing', coordinates: [116.4074, 39.9042], kind: 'city', atlasIndex: 13 },
  { name: 'Tokyo', coordinates: [139.6917, 35.6895], kind: 'city', atlasIndex: 14 },
];

function eventPoint(event: any): [number, number] {
  const native = event?.nativeEvent || event?.sourceEvent || event;
  return [Number(native?.locationX ?? native?.offsetX ?? native?.clientX ?? 0), Number(native?.locationY ?? native?.offsetY ?? native?.clientY ?? 0)];
}

function PlanetPin({ location, selected, onPress }: { location: MapLocation; selected: boolean; onPress: () => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const position = useMemo(() => latLngToSphere({ lat: location.lat, lng: location.lng }, PLANET_RADIUS + 0.055), [location.lat, location.lng]);
  const pulseOffset = useMemo(() => [...location.id].reduce((sum, character) => sum + character.charCodeAt(0), 0) * 0.17, [location.id]);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.4 + pulseOffset) * 0.14;
    ref.current.scale.setScalar((selected ? 1.42 : 1) * pulse);
  });
  return (
    <group position={position}>
      <mesh ref={ref} onClick={(event) => { event.stopPropagation(); onPress(); }}>
        <sphereGeometry args={[selected ? 0.055 : 0.041, 18, 18]} />
        <meshStandardMaterial color={selected ? '#FFFFFF' : '#C6F177'} emissive={selected ? '#C6F177' : '#76D49B'} emissiveIntensity={2.1} roughness={0.25} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.066, 0.086, 28]} />
        <meshBasicMaterial color="#C6F177" transparent opacity={selected ? 0.72 : 0.34} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function PlanetLabel({ label, atlas }: { label: GlobeLabel; atlas: THREE.Texture }) {
  const texture = useMemo(() => {
    const result = atlas.clone();
    const column = label.atlasIndex % 4;
    const row = Math.floor(label.atlasIndex / 4);
    result.repeat.set(0.25, 0.25);
    result.offset.set(column * 0.25, 1 - (row + 1) * 0.25);
    result.colorSpace = THREE.SRGBColorSpace;
    result.minFilter = THREE.LinearMipmapLinearFilter;
    result.magFilter = THREE.LinearFilter;
    result.needsUpdate = true;
    return result;
  }, [atlas, label.atlasIndex]);
  const position = useMemo(
    () => latLngToSphere({ lat: label.coordinates[1], lng: label.coordinates[0] }, PLANET_RADIUS + 0.085),
    [label.coordinates],
  );

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <sprite position={position} scale={label.kind === 'continent' ? [0.62, 0.19, 1] : [0.46, 0.145, 1]} renderOrder={4}>
      <spriteMaterial map={texture} transparent alphaTest={0.04} depthTest depthWrite={false} />
    </sprite>
  );
}

function Stars({ quality }: { quality: LivingPlanetQuality }) {
  const positions = useMemo(() => {
    const count = quality === 'high' ? 1900 : 680;
    const values = new Float32Array(count * 3);
    let seed = 1337;
    const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < count; i += 1) {
      const radius = 12 + random() * 24;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      values[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      values[i * 3 + 1] = radius * Math.cos(phi);
      values[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return values;
  }, [quality]);
  return (
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} /></bufferGeometry>
      <pointsMaterial color="#F4FAFF" size={quality === 'high' ? 0.052 : 0.043} transparent opacity={0.92} sizeAttenuation />
    </points>
  );
}

function GalaxyBackdrop() {
  return (
    <mesh position={[0, 0, -10]} renderOrder={-20}>
      <planeGeometry args={[38, 24]} />
      <shaderMaterial
        vertexShader={galaxyVertexShader}
        fragmentShader={galaxyFragmentShader}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function LivingPlanetScene({
  locations,
  selectedLocationId,
  reducedMotion,
  quality,
  onLocationPress,
  onRequestMap,
}: {
  locations: MapLocation[];
  selectedLocationId: string | null;
  reducedMotion: boolean;
  quality: LivingPlanetQuality;
  onLocationPress: (id: string) => void;
  onRequestMap: (center?: MapPoint, zoom?: number) => void;
}) {
  const { locale } = useAppLocale();
  const groupRef = useRef<THREE.Group>(null);
  const dragging = useRef(false);
  const previous = useRef<[number, number]>([0, 0]);
  const previousMoveAt = useRef(0);
  const pointers = useRef(new Map<number, [number, number]>());
  const pinchDistance = useRef<number | null>(null);
  const angularVelocity = useRef({ x: 0, y: 0 });
  const { camera, gl } = useThree();
  const textureUri = Asset.fromModule(require('../../../assets/images/living-planet-blue-marble-4k.webp')).uri;
  const labelAtlasUri = Asset.fromModule(locale === 'bg'
    ? require('../../../assets/images/living-planet-label-atlas-bg.png')
    : require('../../../assets/images/living-planet-label-atlas-en.png')).uri;
  const texture = useLoader(THREE.TextureLoader, textureUri);
  const labelAtlas = useLoader(THREE.TextureLoader, labelAtlasUri);
  const sun = useMemo(() => getUtcSunDirection(), []);
  const globeLocations = useMemo(() => {
    const cells = new Map<string, MapLocation>();
    for (const location of locations) {
      const key = `${Math.round(location.lat / 10)}:${Math.round(location.lng / 10)}`;
      const existing = cells.get(key);
      if (!existing || location.id === selectedLocationId) cells.set(key, location);
    }
    return [...cells.values()];
  }, [locations, selectedLocationId]);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = Math.min(12, gl.capabilities.getMaxAnisotropy());
    texture.needsUpdate = true;
    labelAtlas.colorSpace = THREE.SRGBColorSpace;
    labelAtlas.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    labelAtlas.needsUpdate = true;
    camera.position.set(0, 0, 7.15);
  }, [camera, gl, labelAtlas, texture]);

  useFrame((_state, delta) => {
    const group = groupRef.current;
    if (!group || reducedMotion || dragging.current) return;
    const velocity = angularVelocity.current;
    if (Math.abs(velocity.x) > 0.002 || Math.abs(velocity.y) > 0.002) {
      group.rotation.x = THREE.MathUtils.clamp(group.rotation.x + velocity.x * delta, -0.85, 0.85);
      group.rotation.y += velocity.y * delta;
      const damping = Math.exp(-3.4 * delta);
      velocity.x *= damping;
      velocity.y *= damping;
      return;
    }
    velocity.x = 0;
    velocity.y = 0;
    group.rotation.y += delta * 0.012;
  });

  const onPointerDown = (event: any) => {
    dragging.current = true;
    const point = eventPoint(event);
    const pointerId = Number(event?.pointerId ?? event?.nativeEvent?.identifier ?? 0);
    pointers.current.set(pointerId, point);
    previous.current = point;
    previousMoveAt.current = Date.now();
    if (pointers.current.size === 2) {
      const [first, second] = [...pointers.current.values()];
      pinchDistance.current = Math.hypot(second[0] - first[0], second[1] - first[1]);
    }
    event.target?.setPointerCapture?.(pointerId);
    event.stopPropagation?.();
  };
  const onPointerMove = (event: any) => {
    if (!dragging.current || !groupRef.current) return;
    const next = eventPoint(event);
    const pointerId = Number(event?.pointerId ?? event?.nativeEvent?.identifier ?? 0);
    pointers.current.set(pointerId, next);
    if (pointers.current.size >= 2) {
      const [first, second] = [...pointers.current.values()];
      const distance = Math.hypot(second[0] - first[0], second[1] - first[1]);
      if (pinchDistance.current && distance > 0) {
        camera.position.z = THREE.MathUtils.clamp(camera.position.z - (distance - pinchDistance.current) * 0.008, 3.8, 8.4);
      }
      pinchDistance.current = distance;
      angularVelocity.current = { x: 0, y: 0 };
      return;
    }
    const dx = next[0] - previous.current[0];
    const dy = next[1] - previous.current[1];
    const now = Date.now();
    const elapsedSeconds = Math.max((now - previousMoveAt.current) / 1000, 1 / 120);
    groupRef.current.rotation.y += dx * 0.007;
    groupRef.current.rotation.x = THREE.MathUtils.clamp(groupRef.current.rotation.x + dy * 0.005, -0.85, 0.85);
    angularVelocity.current = {
      x: THREE.MathUtils.clamp((dy * 0.005) / elapsedSeconds, -2.2, 2.2),
      y: THREE.MathUtils.clamp((dx * 0.007) / elapsedSeconds, -2.8, 2.8),
    };
    previous.current = next;
    previousMoveAt.current = now;
  };
  const endDrag = (event: any) => {
    const pointerId = Number(event?.pointerId ?? event?.nativeEvent?.identifier ?? 0);
    pointers.current.delete(pointerId);
    event.target?.releasePointerCapture?.(pointerId);
    pinchDistance.current = null;
    dragging.current = pointers.current.size > 0;
    const remaining = pointers.current.values().next().value as [number, number] | undefined;
    if (remaining) previous.current = remaining;
  };
  const onWheel = (event: any) => {
    const deltaY = Number(event?.nativeEvent?.deltaY ?? event?.deltaY ?? 0);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z + deltaY * 0.0025, 3.8, 8.4);
    event.stopPropagation?.();
  };

  return (
    <>
      <color attach="background" args={['#01070D']} />
      <fog attach="fog" args={['#01070D', 12, 46]} />
      <GalaxyBackdrop />
      <Stars quality={quality} />
      <ambientLight intensity={quality === 'high' ? 0.48 : 0.58} color="#C8D9DF" />
      <hemisphereLight args={['#FFF9EA', '#17363B', quality === 'high' ? 0.62 : 0.72]} />
      <directionalLight position={sun} intensity={quality === 'high' ? 1.35 : 1.18} color="#FFF0CC" />
      <directionalLight position={[-4.5, 5.2, 8.5]} intensity={quality === 'high' ? 4.1 : 3.65} color="#FFF7E8" />
      <directionalLight position={[4, -1.5, 6]} intensity={quality === 'high' ? 0.78 : 0.92} color="#D9EDFF" />
      <pointLight position={[-2.8, 1.8, 5.8]} intensity={quality === 'high' ? 22 : 17} distance={15} color="#FFF4D9" />
      <group ref={groupRef} rotation={[0.38, -1.92, -0.04]}>
        <mesh
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onWheel={onWheel}
          onDoubleClick={() => onRequestMap({ lat: 42.72, lng: 25.35 }, 6.35)}
        >
          <sphereGeometry args={[PLANET_RADIUS, quality === 'high' ? 112 : 64, quality === 'high' ? 80 : 48]} />
          <meshStandardMaterial map={texture} roughness={0.78} metalness={0.012} emissive="#D8E2DB" emissiveMap={texture} emissiveIntensity={0.055} />
        </mesh>
        <mesh scale={1.022}>
          <sphereGeometry args={[PLANET_RADIUS, 64, 48]} />
          <shaderMaterial vertexShader={atmosphereVertexShader} fragmentShader={atmosphereFragmentShader} transparent depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
        </mesh>
        {globeLocations.map((location) => (
          <PlanetPin
            key={location.id}
            location={location}
            selected={selectedLocationId === location.id}
            onPress={() => { onLocationPress(location.id); onRequestMap({ lat: location.lat, lng: location.lng }, 13.2); }}
          />
        ))}
        {GLOBE_LABELS.map((label) => <PlanetLabel key={label.name} label={label} atlas={labelAtlas} />)}
      </group>
    </>
  );
}
