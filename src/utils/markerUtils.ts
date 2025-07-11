/**
 * Utilities for handling map markers and icons
 */

/**
 * Convert SVG string to base64 for use in marker icons
 */
export function svgToBase64(svg: string): string {
  if (typeof window !== 'undefined' && window.btoa) {
    return window.btoa(unescape(encodeURIComponent(svg)));
  } else {
    // fallback for Node.js, not expected in browser
    return Buffer.from(svg).toString('base64');
  }
}

/**
 * Generate SVG marker with icon
 */
export function generateMarkerSvg(iconPath: string, iconColor: string): string {
  return `
    <svg xmlns='http://www.w3.org/2000/svg' width='32' height='42' viewBox='0 0 32 42' fill='none' color='white'>
      <path d='M16 42C16 42 28 26.5 28 18C28 8.05887 21.9411 2 16 2C10.0589 2 4 8.05887 4 18C4 26.5 16 42 16 42Z' fill='${iconColor}' stroke='white' stroke-width='2'/>
      <g transform='translate(7,12) scale(0.8)'>
        ${iconPath}
      </g>
    </svg>
  `;
}

/**
 * Create a marker icon URL from SVG
 */
export function createMarkerIconUrl(iconPath: string, iconColor: string): string {
  const svgMarkerString = generateMarkerSvg(iconPath, iconColor);
  const svgBase64 = svgToBase64(svgMarkerString);
  return `data:image/svg+xml;base64,${svgBase64}`;
}
