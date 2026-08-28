import { geoDistance, geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import { Asset } from 'expo-asset';
import React, { useEffect, useRef, useState } from 'react';
import { feature } from 'topojson-client';
import topology from 'world-atlas/countries-110m.json';
import { useAppLocale } from '../../context/AppLocaleContext';

type Coordinates = [number, number];

const countries = feature(topology as any, (topology as any).objects.countries) as any;
const sphere = { type: 'Sphere' } as const;
const graticule = geoGraticule10();
const reliefUri = Asset.fromModule(require('../../../assets/images/living-planet-blue-marble-4k.webp')).uri;
const conceptUri = Asset.fromModule(require('../../../assets/images/living-planet-concept-v2.png')).uri;

const CONTINENTS: { name: { en: string; bg: string }; coordinates: Coordinates }[] = [
  { name: { en: 'EUROPE', bg: 'ЕВРОПА' }, coordinates: [33, 63] },
  { name: { en: 'ASIA', bg: 'АЗИЯ' }, coordinates: [91, 49] },
  { name: { en: 'AFRICA', bg: 'АФРИКА' }, coordinates: [19, 4] },
  { name: { en: 'NORTH AMERICA', bg: 'СЕВЕРНА АМЕРИКА' }, coordinates: [-103, 47] },
  { name: { en: 'SOUTH AMERICA', bg: 'ЮЖНА АМЕРИКА' }, coordinates: [-61, -18] },
  { name: { en: 'AUSTRALIA', bg: 'АВСТРАЛИЯ' }, coordinates: [134, -25] },
];

const CITIES: { id: string; name: { en: string; bg: string }; coordinates: Coordinates }[] = [
  { id: 'sofia', name: { en: 'Sofia', bg: 'София' }, coordinates: [23.3219, 42.6977] },
  { id: 'london', name: { en: 'London', bg: 'Лондон' }, coordinates: [-0.1276, 51.5072] },
  { id: 'paris', name: { en: 'Paris', bg: 'Париж' }, coordinates: [2.3522, 48.8566] },
  { id: 'madrid', name: { en: 'Madrid', bg: 'Мадрид' }, coordinates: [-3.7038, 40.4168] },
  { id: 'rome', name: { en: 'Rome', bg: 'Рим' }, coordinates: [12.4964, 41.9028] },
  { id: 'berlin', name: { en: 'Berlin', bg: 'Берлин' }, coordinates: [13.405, 52.52] },
  { id: 'istanbul', name: { en: 'Istanbul', bg: 'Истанбул' }, coordinates: [28.9784, 41.0082] },
  { id: 'cairo', name: { en: 'Cairo', bg: 'Кайро' }, coordinates: [31.2357, 30.0444] },
  { id: 'new-york', name: { en: 'New York', bg: 'Ню Йорк' }, coordinates: [-74.006, 40.7128] },
  { id: 'mexico-city', name: { en: 'Mexico City', bg: 'Мехико' }, coordinates: [-99.1332, 19.4326] },
  { id: 'sao-paulo', name: { en: 'São Paulo', bg: 'Сао Пауло' }, coordinates: [-46.6333, -23.5505] },
  { id: 'delhi', name: { en: 'Delhi', bg: 'Делхи' }, coordinates: [77.1025, 28.7041] },
  { id: 'beijing', name: { en: 'Beijing', bg: 'Пекин' }, coordinates: [116.4074, 39.9042] },
  { id: 'tokyo', name: { en: 'Tokyo', bg: 'Токио' }, coordinates: [139.6917, 35.6895] },
  { id: 'sydney', name: { en: 'Sydney', bg: 'Сидни' }, coordinates: [151.2093, -33.8688] },
];

function isVisible(center: Coordinates, point: Coordinates, margin = 0.05) {
  return geoDistance(center, point) < Math.PI / 2 - margin;
}

export default function LivingPlanetFallbackGlobe({ reducedMotion, active = true }: { reducedMotion: boolean; active?: boolean }) {
  const { locale, t } = useAppLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const centerRef = useRef<Coordinates>([22, 43]);
  const velocityRef = useRef(0);
  const zoomRef = useRef(1);
  const pointersRef = useRef(new Map<number, Coordinates>());
  const previousRef = useRef<Coordinates>([0, 0]);
  const pinchRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const [detailedReady, setDetailedReady] = useState(false);

  useEffect(() => {
    if (!active) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    let reliefPixels: ImageData | null = null;
    let landMask: Uint8Array | null = null;
    let cloudMask: Uint8ClampedArray | null = null;
    let reliefRender: { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D; pixels: ImageData; size: number } | null = null;
    let hasShownDetailedGlobe = false;
    const reliefImage = new window.Image();
    reliefImage.onload = () => {
      const source = document.createElement('canvas');
      source.width = 1024;
      source.height = 512;
      const sourceContext = source.getContext('2d', { willReadFrequently: true });
      if (!sourceContext) return;
      sourceContext.drawImage(reliefImage, 0, 0, source.width, source.height);
      reliefPixels = sourceContext.getImageData(0, 0, source.width, source.height);
      landMask = new Uint8Array(source.width * source.height);
      cloudMask = new Uint8ClampedArray(source.width * source.height);
      const pixels = reliefPixels.data;
      for (let y = 0; y < source.height; y += 1) {
        const latitude = Math.PI / 2 - (y / source.height) * Math.PI;
        for (let x = 0; x < source.width; x += 1) {
          const index = y * source.width + x;
          const pixelIndex = index * 4;
          const red = pixels[pixelIndex];
          const green = pixels[pixelIndex + 1];
          const blue = pixels[pixelIndex + 2];
          const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
          const ocean = blue > red * 1.35 && blue > green * 1.08 && luminance < 82;
          landMask[index] = ocean ? 0 : 1;

          const longitude = (x / source.width) * Math.PI * 2 - Math.PI;
          const broadWeather = Math.sin(longitude * 2.2 + Math.sin(latitude * 2.7) * 2.1);
          const curledWeather = Math.sin(longitude * 6.7 - latitude * 5.1 + Math.sin(longitude * 1.4));
          const fineWeather = Math.sin(longitude * 14.8 + latitude * 9.3);
          const latitudeBands = 0.64 + 0.36 * Math.cos(latitude * 4.5) ** 2;
          const weather = (broadWeather * 0.54 + curledWeather * 0.31 + fineWeather * 0.15) * latitudeBands;
          cloudMask[index] = Math.round(Math.max(0, Math.min(1, (weather - 0.32) * 2.15)) * 96);
        }
      }
    };
    reliefImage.src = reliefUri;

    const drawRelief = (diameter: number, center: Coordinates) => {
      if (!reliefPixels || !landMask || !cloudMask) return null;
      const size = Math.min(360, Math.max(220, Math.round(diameter * 0.72)));
      if (!reliefRender || reliefRender.size !== size) {
        const reliefCanvas = document.createElement('canvas');
        reliefCanvas.width = size;
        reliefCanvas.height = size;
        const reliefContext = reliefCanvas.getContext('2d');
        if (!reliefContext) return null;
        reliefRender = { canvas: reliefCanvas, context: reliefContext, pixels: reliefContext.createImageData(size, size), size };
      }
      const output = reliefRender.pixels.data;
      const source = reliefPixels.data;
      const sourceWidth = reliefPixels.width;
      const sourceHeight = reliefPixels.height;
      const centerLongitude = center[0] * Math.PI / 180;
      const centerLatitude = center[1] * Math.PI / 180;
      const cosCenterLatitude = Math.cos(centerLatitude);
      const sinCenterLatitude = Math.sin(centerLatitude);
      for (let y = 0; y < size; y += 1) {
        const normalizedY = ((y + 0.5) / size) * 2 - 1;
        for (let x = 0; x < size; x += 1) {
          const normalizedX = ((x + 0.5) / size) * 2 - 1;
          const radiusSquared = normalizedX * normalizedX + normalizedY * normalizedY;
          const outputIndex = (y * size + x) * 4;
          if (radiusSquared >= 1) {
            output[outputIndex + 3] = 0;
            continue;
          }
          const surfaceZ = Math.sqrt(1 - radiusSquared);
          const surfaceY = -normalizedY;
          const latitude = Math.asin(surfaceY * cosCenterLatitude + surfaceZ * sinCenterLatitude);
          const longitude = centerLongitude + Math.atan2(
            normalizedX,
            surfaceZ * cosCenterLatitude - surfaceY * sinCenterLatitude,
          );
          const wrappedLongitude = ((longitude + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
          const sourceX = Math.min(sourceWidth - 1, Math.floor((wrappedLongitude / (Math.PI * 2)) * sourceWidth));
          const sourceY = Math.min(sourceHeight - 1, Math.max(0, Math.floor(((Math.PI / 2 - latitude) / Math.PI) * sourceHeight)));
          const sourceIndex = (sourceY * sourceWidth + sourceX) * 4;
          const directionalLight = Math.max(0, -normalizedX * 0.32 - normalizedY * 0.42 + surfaceZ * 0.86);
          const brightness = 0.58 + directionalLight * 0.52;
          const red = source[sourceIndex];
          const green = source[sourceIndex + 1];
          const blue = source[sourceIndex + 2];
          const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
          const isOcean = blue > red * 1.35 && blue > green * 1.08 && luminance < 82;
          if (isOcean) {
            const limbShade = 0.58 + surfaceZ * 0.42;
            const neighborOffset = 5;
            const left = sourceY * sourceWidth + ((sourceX - neighborOffset + sourceWidth) % sourceWidth);
            const right = sourceY * sourceWidth + ((sourceX + neighborOffset) % sourceWidth);
            const above = Math.max(0, sourceY - neighborOffset) * sourceWidth + sourceX;
            const below = Math.min(sourceHeight - 1, sourceY + neighborOffset) * sourceWidth + sourceX;
            const coast = landMask[left] || landMask[right] || landMask[above] || landMask[below] ? 1 : 0;
            const sourceVariation = Math.max(0, Math.min(1, (blue - 30) / 90));
            output[outputIndex] = Math.round((2 + directionalLight * 8 + coast * 4) * limbShade);
            output[outputIndex + 1] = Math.round((22 + directionalLight * 64 + sourceVariation * 14 + coast * 45) * limbShade);
            output[outputIndex + 2] = Math.round((55 + directionalLight * 104 + sourceVariation * 25 + coast * 55) * limbShade);
          } else {
            const saturation = 1.48;
            const contrast = 1.1;
            const adjust = (value: number) => ((luminance + (value - luminance) * saturation - 112) * contrast + 112) * brightness;
            output[outputIndex] = Math.min(255, Math.max(0, Math.round(adjust(red) * 1.02)));
            output[outputIndex + 1] = Math.min(255, Math.max(0, Math.round(adjust(green) * 1.06)));
            output[outputIndex + 2] = Math.min(255, Math.max(0, Math.round(adjust(blue))));
          }
          const cloudAlpha = (cloudMask[sourceY * sourceWidth + sourceX] / 255) * (0.55 + directionalLight * 0.35) * surfaceZ;
          if (cloudAlpha > 0.01) {
            output[outputIndex] = Math.round(output[outputIndex] * (1 - cloudAlpha) + 225 * cloudAlpha);
            output[outputIndex + 1] = Math.round(output[outputIndex + 1] * (1 - cloudAlpha) + 242 * cloudAlpha);
            output[outputIndex + 2] = Math.round(output[outputIndex + 2] * (1 - cloudAlpha) + 247 * cloudAlpha);
          }
          output[outputIndex + 3] = 255;
        }
      }
      reliefRender.context.putImageData(reliefRender.pixels, 0, 0);
      return reliefRender.canvas;
    };

    let previousTime = performance.now();
    const draw = (time: number) => {
      if (time - previousTime < 1000 / 30) {
        frameRef.current = requestAnimationFrame(draw);
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
      const pixelWidth = Math.max(1, Math.round(rect.width * ratio));
      const pixelHeight = Math.max(1, Math.round(rect.height * ratio));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);

      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      if (!reducedMotion && !draggingRef.current) {
        const inertial = Math.abs(velocityRef.current) > 0.04;
        centerRef.current[0] += inertial ? velocityRef.current * delta : 2.7 * delta;
        if (inertial) velocityRef.current *= Math.exp(-3.1 * delta);
      }

      const diameter = Math.min(rect.width, rect.height) * 0.91 * zoomRef.current;
      const projection = geoOrthographic()
        .translate([rect.width / 2, rect.height / 2])
        .scale(diameter / 2)
        .rotate([-centerRef.current[0], -centerRef.current[1], 0])
        .clipAngle(90)
        .precision(0.45);
      const path = geoPath(projection, context);
      const globeCenter: Coordinates = [rect.width / 2, rect.height / 2];
      const radius = diameter / 2;

      context.save();
      const atmosphere = context.createRadialGradient(
        globeCenter[0], globeCenter[1], radius * 0.88,
        globeCenter[0], globeCenter[1], radius * 1.16,
      );
      atmosphere.addColorStop(0, 'rgba(255, 255, 255, 0)');
      atmosphere.addColorStop(0.54, 'rgba(255, 255, 255, 0.04)');
      atmosphere.addColorStop(0.65, 'rgba(255, 255, 255, 0.20)');
      atmosphere.addColorStop(0.72, 'rgba(255, 255, 255, 0.05)');
      atmosphere.addColorStop(1, 'rgba(255, 255, 255, 0)');
      context.fillStyle = atmosphere;
      context.fillRect(globeCenter[0] - radius * 1.2, globeCenter[1] - radius * 1.2, radius * 2.4, radius * 2.4);
      context.restore();

      context.save();
      context.beginPath();
      path(sphere as any);
      context.shadowColor = 'rgba(32, 179, 255, 0.78)';
      context.shadowBlur = Math.max(20, radius * 0.1);
      const ocean = context.createRadialGradient(
        globeCenter[0] - radius * 0.32,
        globeCenter[1] - radius * 0.28,
        radius * 0.05,
        globeCenter[0],
        globeCenter[1],
        radius * 1.08,
      );
      ocean.addColorStop(0, '#0D7191');
      ocean.addColorStop(0.48, '#084357');
      ocean.addColorStop(0.82, '#041C2B');
      ocean.addColorStop(1, '#010811');
      context.fillStyle = ocean;
      context.fill();
      context.restore();

      context.save();
      context.beginPath();
      path(sphere as any);
      context.clip();
      context.beginPath();
      path(graticule as any);
      context.strokeStyle = 'rgba(171, 232, 204, 0.09)';
      context.lineWidth = 0.65;
      context.stroke();

      const relief = drawRelief(diameter, centerRef.current);
      if (relief) {
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(relief, globeCenter[0] - radius, globeCenter[1] - radius, diameter, diameter);
      } else {
        context.beginPath();
        path(countries);
        const land = context.createLinearGradient(0, globeCenter[1] - radius, 0, globeCenter[1] + radius);
        land.addColorStop(0, '#6EA77B');
        land.addColorStop(0.44, '#3D805A');
        land.addColorStop(1, '#174833');
        context.fillStyle = land;
        context.fill();
      }
      context.beginPath();
      path(countries);
      context.strokeStyle = 'rgba(210, 242, 211, 0.30)';
      context.lineWidth = Math.max(0.42, radius / 680);
      context.stroke();

      const oceanShine = context.createRadialGradient(
        globeCenter[0] - radius * 0.46,
        globeCenter[1] - radius * 0.34,
        0,
        globeCenter[0] - radius * 0.24,
        globeCenter[1] - radius * 0.18,
        radius * 0.92,
      );
      oceanShine.addColorStop(0, 'rgba(123, 243, 255, 0.11)');
      oceanShine.addColorStop(0.35, 'rgba(46, 196, 226, 0.035)');
      oceanShine.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.globalCompositeOperation = 'screen';
      context.fillStyle = oceanShine;
      context.fillRect(globeCenter[0] - radius, globeCenter[1] - radius, diameter, diameter);
      context.globalCompositeOperation = 'source-over';

      const shade = context.createLinearGradient(globeCenter[0] - radius, 0, globeCenter[0] + radius, 0);
      shade.addColorStop(0, 'rgba(170,255,218,0.13)');
      shade.addColorStop(0.52, 'rgba(0,0,0,0)');
      shade.addColorStop(0.78, 'rgba(0,7,18,0.30)');
      shade.addColorStop(1, 'rgba(0,3,12,0.76)');
      context.fillStyle = shade;
      context.fillRect(globeCenter[0] - radius, globeCenter[1] - radius, diameter, diameter);
      context.restore();

      context.save();
      context.beginPath();
      path(sphere as any);
      context.strokeStyle = 'rgba(255, 255, 255, 0.58)';
      context.lineWidth = Math.max(0.8, radius / 270);
      context.shadowColor = 'rgba(255, 255, 255, 0.42)';
      context.shadowBlur = 8;
      context.stroke();
      context.restore();

      const geographicCenter = centerRef.current;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      for (const continent of CONTINENTS) {
        if (!isVisible(geographicCenter, continent.coordinates, 0.18)) continue;
        const point = projection(continent.coordinates);
        if (!point) continue;
        context.font = `600 ${Math.max(9, Math.min(13, radius / 31))}px Manrope, sans-serif`;
        context.fillStyle = 'rgba(233, 247, 228, 0.62)';
        context.shadowColor = 'rgba(0, 17, 24, 0.95)';
        context.shadowBlur = 5;
        context.fillText(continent.name[locale], point[0], point[1]);
      }

      context.textAlign = 'left';
      const occupiedLabels: { left: number; right: number; top: number; bottom: number }[] = [];
      for (const city of CITIES) {
        if (!isVisible(geographicCenter, city.coordinates, 0.12)) continue;
        const point = projection(city.coordinates);
        if (!point) continue;
        context.beginPath();
        const cityName = city.name[locale];
        context.arc(point[0], point[1], city.id === 'sofia' ? 3.5 : 2.3, 0, Math.PI * 2);
        context.fillStyle = city.id === 'sofia' ? '#F4FFD1' : '#C6F177';
        context.shadowColor = '#C6F177';
        context.shadowBlur = 8;
        context.fill();
        const fontSize = Math.max(9, Math.min(12, radius / 35));
        context.font = `${city.id === 'sofia' ? '700' : '500'} ${fontSize}px Manrope, sans-serif`;
        const labelLeft = point[0] + 7;
        const labelTop = point[1] - fontSize - 5;
        const labelWidth = context.measureText(cityName).width;
        const labelBounds = { left: labelLeft - 2, right: labelLeft + labelWidth + 3, top: labelTop - 2, bottom: labelTop + fontSize + 4 };
        const overlaps = occupiedLabels.some((other) => !(labelBounds.right < other.left || labelBounds.left > other.right || labelBounds.bottom < other.top || labelBounds.top > other.bottom));
        if (overlaps && city.id !== 'sofia') continue;
        occupiedLabels.push(labelBounds);
        context.fillStyle = '#F5F8E8';
        context.shadowColor = 'rgba(0, 10, 16, 0.98)';
        context.shadowBlur = 4;
        context.fillText(cityName, labelLeft, point[1] - 5);
      }

      if (relief && !hasShownDetailedGlobe) {
        hasShownDetailedGlobe = true;
        setDetailedReady(true);
      }

      frameRef.current = requestAnimationFrame(draw);
    };
    frameRef.current = requestAnimationFrame(draw);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [active, locale, reducedMotion]);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>): Coordinates => [event.clientX, event.clientY];
  const endPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.delete(event.pointerId);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    pinchRef.current = null;
    draggingRef.current = pointersRef.current.size > 0;
  };

  return (
    <>
      <style>{`
        .living-planet-concept { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; object-position: center; background: #03151B; }
        .living-planet-fallback-canvas { position: absolute; top: 10%; bottom: 21%; left: 0; width: 100%; height: 69%; }
        @media (max-width: 760px) { .living-planet-fallback-canvas { top: 12%; bottom: 22%; left: 0; width: 100%; height: 66%; } }
      `}</style>
      <img
        src={conceptUri}
        alt={t('Living Planet concept centered on Europe', 'Живата планета, центрирана към Европа')}
        aria-hidden={detailedReady}
        className="living-planet-concept"
        style={{ display: detailedReady ? 'none' : 'block' }}
      />
      <canvas
        ref={canvasRef}
        className="living-planet-fallback-canvas"
        role="img"
        aria-label={t('True rotating Living Planet globe with continent and city labels. Drag to rotate and scroll to zoom.', 'Истински въртящ се глобус Живата планета с имена на континенти и градове. Плъзнете, за да завъртите, и превъртете, за да приближите.')}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture?.(event.pointerId);
        const point = getPoint(event);
        pointersRef.current.set(event.pointerId, point);
        previousRef.current = point;
        draggingRef.current = true;
        velocityRef.current = 0;
      }}
      onPointerMove={(event) => {
        if (!draggingRef.current) return;
        const point = getPoint(event);
        pointersRef.current.set(event.pointerId, point);
        if (pointersRef.current.size >= 2) {
          const [first, second] = [...pointersRef.current.values()];
          const distance = Math.hypot(second[0] - first[0], second[1] - first[1]);
          if (pinchRef.current) zoomRef.current = Math.max(0.72, Math.min(1.38, zoomRef.current * (distance / pinchRef.current)));
          pinchRef.current = distance;
          return;
        }
        const dx = point[0] - previousRef.current[0];
        const dy = point[1] - previousRef.current[1];
        centerRef.current[0] -= dx * 0.28;
        centerRef.current[1] = Math.max(-72, Math.min(72, centerRef.current[1] + dy * 0.22));
        velocityRef.current = -dx * 6.5;
        previousRef.current = point;
      }}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onWheel={(event) => {
        event.preventDefault();
        zoomRef.current = Math.max(0.72, Math.min(1.38, zoomRef.current - event.deltaY * 0.0008));
      }}
        style={{ cursor: draggingRef.current ? 'grabbing' : 'grab', touchAction: 'none', visibility: detailedReady ? 'visible' : 'hidden' }}
      />
    </>
  );
}
