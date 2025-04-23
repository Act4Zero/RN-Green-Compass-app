import React, { useRef, useState, useEffect } from 'react';
import { View, Platform, StyleSheet, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

interface TurnstileProps {
  onVerify: (token: string) => void;
  style?: ViewStyle;
}

const turnstileSiteKey = Constants.expoConfig?.extra?.turnstileSiteKey || '';

// HTML content for the Turnstile widget - Invisible mode
const getTurnstileHTML = (siteKey: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Turnstile</title>
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      overflow: hidden;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #turnstile-container {
      width: 100%;
      height: 100px;
    }
  </style>
</head>
<body>
  <div id="turnstile-container"></div>
  <script>
    // Wait for turnstile to be available
    function waitForTurnstile() {
      if (window.turnstile) {
        renderTurnstile();
      } else {
        setTimeout(waitForTurnstile, 100);
      }
    }

    function renderTurnstile() {
      window.turnstile.render('#turnstile-container', {
        sitekey: '${siteKey}',
        callback: function(token) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'verify', token: token }));
        },
        'theme': 'light',
        'size': 'invisible',
        'action': 'auth'
      });
    }

    // Start waiting for turnstile when page loads
    window.onload = waitForTurnstile;
  </script>
</body>
</html>
`;

// Declare the global window interface to include Turnstile properties
declare global {
  interface Window {
    onloadTurnstileCallback?: () => void;
    turnstile?: {
      render: (container: HTMLElement, options: any) => string;
      execute: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

// Web implementation using the Turnstile script directly
const WebTurnstile: React.FC<TurnstileProps> = ({ onVerify, style }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if the Turnstile script is already loaded
    if (!document.querySelector('script[src*="turnstile/v0/api.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onloadTurnstileCallback';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      window.onloadTurnstileCallback = () => {
        setIsLoaded(true);
      };
    } else {
      setIsLoaded(true);
    }

    return () => {
      // Clean up if needed
      if (window.onloadTurnstileCallback) {
        delete window.onloadTurnstileCallback;
      }
    };
  }, []);

  useEffect(() => {
    let widgetId: string | null = null;
    
    if (isLoaded && containerRef.current && window.turnstile) {
      try {
        // Render the widget
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: turnstileSiteKey,
          callback: onVerify,
          theme: 'light',
          size: 'invisible',
          action: 'auth',
        });
      } catch (error) {
        console.error('Error rendering Turnstile widget:', error);
      }
    }
    
    // Clean up function
    return () => {
      try {
        if (widgetId && window.turnstile) {
          window.turnstile.remove(widgetId);
        }
      } catch (error) {
        console.error('Error removing Turnstile widget:', error);
      }
    };
  }, [isLoaded, onVerify]);

  // Use inline style object for React DOM - invisible mode
  return (
    <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <div ref={containerRef} />
    </div>
  );
};

// Mobile implementation using WebView
const MobileTurnstile: React.FC<TurnstileProps> = ({ onVerify, style }) => {
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'verify' && data.token) {
        onVerify(data.token);
      }
    } catch (error) {
      console.error('Error parsing Turnstile message:', error);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html: getTurnstileHTML(turnstileSiteKey) }}
        onMessage={handleMessage}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

// Platform-specific component export
export default function Turnstile(props: TurnstileProps) {
  return Platform.OS === 'web' ? (
    <WebTurnstile {...props} />
  ) : (
    <MobileTurnstile {...props} />
  );
}

const styles = StyleSheet.create({
  container: {
    // For invisible Captcha, we need a small container that can be positioned off-screen
    height: 100,
    width: '100%',
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: -1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
