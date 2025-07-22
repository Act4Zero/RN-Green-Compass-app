// Adding proper type declarations for the map components imported in index.tsx
import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Allow these components to be used as JSX elements
      'MapView': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'MapSidebar': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'CoverageAlert': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'MapFooter': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
