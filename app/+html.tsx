import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#174C35" />
        <meta name="description" content="Green Compass turns everyday sustainable actions into visible, shared progress." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Green Compass — Every action counts" />
        <meta property="og:description" content="Build better habits, measure your impact, and move with a community." />
        <meta property="og:image" content="/green-compass-social.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/green-compass-social.jpg" />
        <title>Green Compass</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `
          html, body, #root { min-height: 100%; }
          body { margin: 0; background: #F3F6F0; }
          * { box-sizing: border-box; }
          :focus-visible { outline: 3px solid #B8E36B; outline-offset: 3px; }
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
          }
        ` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
