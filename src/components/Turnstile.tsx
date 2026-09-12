import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (code?: string) => void;
  style?: ViewStyle;
}

export interface TurnstileHandle {
  reset: () => void;
}

const turnstileSiteKey = process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY
  || Constants.expoConfig?.extra?.turnstileSiteKey
  || '';
const turnstileBaseUrl = process.env.EXPO_PUBLIC_TURNSTILE_BASE_URL
  || Constants.expoConfig?.extra?.turnstileBaseUrl
  || 'https://rn-green-compass-app.vercel.app';

export const isTurnstileConfigured = Boolean(turnstileSiteKey);

const getTurnstileHTML = (siteKey: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
</head>
<body>
  <div id="turnstile-container"></div>
  <script>
    function postMessage(type, payload) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, ...payload }));
    }

    function waitForTurnstile(attempt) {
      if (window.turnstile) {
        window.turnstileWidgetId = window.turnstile.render('#turnstile-container', {
          sitekey: ${JSON.stringify(siteKey)},
          callback: function(token) { postMessage('verify', { token: token }); },
          'expired-callback': function() { postMessage('expired', {}); },
          'error-callback': function(code) { postMessage('error', { code: code }); },
          'timeout-callback': function() { postMessage('error', { code: 'challenge-timeout' }); },
          theme: 'auto',
          size: 'compact',
          appearance: 'interaction-only',
          action: 'auth'
        });
      } else if (attempt < 150) {
        setTimeout(function() { waitForTurnstile(attempt + 1); }, 100);
      } else {
        postMessage('error', { code: 'load-timeout' });
      }
    }

    window.onload = function() { waitForTurnstile(0); };
  </script>
</body>
</html>
`;

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

const WebTurnstile = forwardRef<TurnstileHandle, TurnstileProps>(function WebTurnstile(
  { onVerify, onExpire, onError },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);
  const [isLoaded, setIsLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => { onVerifyRef.current = onVerify; }, [onVerify]);
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  useEffect(() => {
    if (!turnstileSiteKey || window.turnstile) {
      setIsLoaded(Boolean(window.turnstile));
      return;
    }

    let script = document.querySelector<HTMLScriptElement>('script[src*="turnstile/v0/api.js"]');
    if (script?.dataset.gcTurnstileFailed === 'true') {
      script.remove();
      script = null;
    }
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const handleScriptError = () => {
      if (script) script.dataset.gcTurnstileFailed = 'true';
      onErrorRef.current?.('script-load-failed');
    };
    script.addEventListener('error', handleScriptError);

    let attempts = 0;
    const poll = window.setInterval(() => {
      attempts += 1;
      if (window.turnstile) {
        window.clearInterval(poll);
        setIsLoaded(true);
      } else if (attempts >= 150) {
        window.clearInterval(poll);
        if (script) script.dataset.gcTurnstileFailed = 'true';
        onErrorRef.current?.('load-timeout');
      }
    }, 100);

    return () => {
      window.clearInterval(poll);
      script?.removeEventListener('error', handleScriptError);
    };
  }, [attempt]);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.turnstile || widgetIdRef.current) return;

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: turnstileSiteKey,
        callback: (token: string) => onVerifyRef.current(token),
        'expired-callback': () => onExpireRef.current?.(),
        'error-callback': (code: string) => onErrorRef.current?.(code),
        'timeout-callback': () => onErrorRef.current?.('challenge-timeout'),
        theme: 'auto',
        size: 'compact',
        appearance: 'interaction-only',
        action: 'auth',
      });
    } catch (error) {
      console.error('Error rendering Turnstile widget:', error);
      onErrorRef.current?.('render-failed');
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.error('Error removing Turnstile widget:', error);
        }
      }
      widgetIdRef.current = null;
    };
  }, [isLoaded, attempt]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (typeof window === 'undefined') return;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
          return;
        } catch {
          // A removed or failed widget needs a fresh render.
        }
      }
      setIsLoaded(Boolean(window.turnstile));
      setAttempt(value => value + 1);
    },
  }), []);

  return (
    <div style={{ alignSelf: 'center', maxWidth: '100%' }}>
      <div ref={containerRef} />
    </div>
  );
});

const MobileTurnstile = forwardRef<TurnstileHandle, TurnstileProps>(function MobileTurnstile(
  { onVerify, onExpire, onError, style },
  ref,
) {
  const webViewRef = useRef<WebView>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      webViewRef.current?.reload();
    },
  }), []);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: getTurnstileHTML(turnstileSiteKey), baseUrl: turnstileBaseUrl }}
        originWhitelist={['https://*', 'about:*']}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'verify' && data.token) onVerify(data.token);
            if (data.type === 'expired') onExpire?.();
            if (data.type === 'error') onError?.(data.code);
          } catch (error) {
            console.error('Error parsing Turnstile message:', error);
            onError?.('invalid-message');
          }
        }}
        onError={() => onError?.('webview-load-failed')}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
      />
    </View>
  );
});

const Turnstile = forwardRef<TurnstileHandle, TurnstileProps>(function Turnstile(props, ref) {
  if (!isTurnstileConfigured) return null;
  return Platform.OS === 'web'
    ? <WebTurnstile ref={ref} {...props} />
    : <MobileTurnstile ref={ref} {...props} />;
});

export default Turnstile;

const styles = StyleSheet.create({
  container: {
    height: 156,
    width: '100%',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
