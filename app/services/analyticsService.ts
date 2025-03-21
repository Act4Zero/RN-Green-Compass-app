import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get the Google Analytics measurement ID from environment variables
const GA_MEASUREMENT_ID = Constants.expoConfig?.extra?.gaMeasurementId;

/**
 * Simple analytics service for tracking user behavior across the app
 * Uses Google Analytics 4 for both web and native platforms
 */
const analyticsService = {
  /**
   * Initialize analytics tracking
   */
  initialize: () => {
    try {
      // For web platforms, we'll use the gtag.js script that's loaded in the HTML
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Check if gtag is available (should be loaded in index.html)
        if (typeof window.gtag === 'undefined') {
          // Inject Google Analytics script if not already loaded
          const script = document.createElement('script');
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
          document.head.appendChild(script);
          
          // Initialize gtag
          window.dataLayer = window.dataLayer || [];
          window.gtag = function() {
            window.dataLayer.push(arguments);
          };
          window.gtag('js', new Date());
          window.gtag('config', GA_MEASUREMENT_ID);
        }
        console.log('Web Analytics initialized successfully');
      } else {
        // For native platforms, we'll use a different approach or just log
        console.log('Native Analytics initialized (placeholder)');
      }
      return true;
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
      return false;
    }
  },

  /**
   * Track a screen view
   * @param screenName Name of the screen being viewed
   * @param screenClass Class name of the screen (optional)
   */
  trackScreenView: (screenName: string, screenClass?: string) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.gtag) {
        // For web, use gtag to track page view
        window.gtag('event', 'page_view', {
          page_title: screenName,
          page_location: screenName
        });
        console.log(`Screen view tracked: ${screenName}`);
      } else {
        // For native platforms, just log for now
        console.log(`Screen view would be tracked: ${screenName}`);
      }
    } catch (error) {
      console.error('Failed to track screen view:', error);
    }
  },

  /**
   * Track a custom event
   * @param eventName Name of the event
   * @param params Additional parameters for the event
   */
  trackEvent: (eventName: string, params?: Record<string, any>) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.gtag) {
        // For web, use gtag to track custom event
        window.gtag('event', eventName, params || {});
        console.log(`Event tracked: ${eventName}`);
      } else {
        // For native platforms, just log for now
        console.log(`Event would be tracked: ${eventName}`, params || {});
      }
    } catch (error) {
      console.error(`Failed to track event ${eventName}:`, error);
    }
  },

  /**
   * Track user sign-in
   * @param method The sign-in method used (e.g., 'email', 'google')
   */
  trackLogin: (method: string) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.gtag) {
        // For web, use gtag to track login
        window.gtag('event', 'login', { method });
        console.log(`Login tracked with method: ${method}`);
      } else {
        // For native platforms, just log for now
        console.log(`Login would be tracked with method: ${method}`);
      }
    } catch (error) {
      console.error('Failed to track login:', error);
    }
  },

  /**
   * Track user sign-up
   * @param method The sign-up method used (e.g., 'email', 'google')
   */
  trackSignUp: (method: string) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.gtag) {
        // For web, use gtag to track sign up
        window.gtag('event', 'sign_up', { method });
        console.log(`Sign up tracked with method: ${method}`);
      } else {
        // For native platforms, just log for now
        console.log(`Sign up would be tracked with method: ${method}`);
      }
    } catch (error) {
      console.error('Failed to track sign up:', error);
    }
  },

  /**
   * Set user ID for tracking
   * @param userId User's unique identifier
   */
  setUserId: (userId: string | null) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.gtag) {
        // For web, use gtag to set user ID
        window.gtag('config', GA_MEASUREMENT_ID, {
          user_id: userId
        });
        console.log('User ID set successfully');
      } else {
        // For native platforms, just log for now
        console.log(`User ID would be set: ${userId}`);
      }
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  },

  /**
   * Set user properties for segmentation
   * @param properties User properties to set
   */
  setUserProperties: (properties: Record<string, string>) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.gtag) {
        // For web, use gtag to set user properties
        // Convert properties to Google Analytics user_properties format
        window.gtag('set', 'user_properties', properties);
        console.log('User properties set successfully');
      } else {
        // For native platforms, just log for now
        console.log('User properties would be set:', properties);
      }
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }
};

// Add TypeScript interface for window to include gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default analyticsService;