import analytics from '@react-native-firebase/analytics';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get the Google Analytics measurement ID from environment variables
const GA_MEASUREMENT_ID = Constants.expoConfig?.extra?.gaMeasurementId;

/**
 * Analytics service for tracking user behavior across the app
 * Uses Firebase Analytics to send events to Google Analytics
 */
class AnalyticsService {
  /**
   * Initialize Firebase Analytics
   */
  async initialize() {
    try {
      // For web platforms, we need to configure Firebase with the web measurement ID
      if (Platform.OS === 'web') {
        // Web configuration would go here if needed
        console.log('Analytics initialized for web');
      }
      
      await analytics().setAnalyticsCollectionEnabled(true);
      console.log('Analytics initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
      return false;
    }
  }

  /**
   * Track a screen view
   * @param screenName Name of the screen being viewed
   * @param screenClass Class name of the screen (Android only)
   */
  async trackScreenView(screenName: string, screenClass?: string) {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
    } catch (error) {
      console.error('Failed to track screen view:', error);
    }
  }

  /**
   * Track a custom event
   * @param eventName Name of the event
   * @param params Additional parameters for the event
   */
  async trackEvent(eventName: string, params?: Record<string, any>) {
    try {
      await analytics().logEvent(eventName, params);
    } catch (error) {
      console.error(`Failed to track event ${eventName}:`, error);
    }
  }

  /**
   * Track user sign-in
   * @param method The sign-in method used (e.g., 'email', 'google')
   */
  async trackLogin(method: string) {
    try {
      await analytics().logLogin({
        method: method
      });
    } catch (error) {
      console.error('Failed to track login:', error);
    }
  }

  /**
   * Track user sign-up
   * @param method The sign-up method used (e.g., 'email', 'google')
   */
  async trackSignUp(method: string) {
    try {
      await analytics().logSignUp({
        method: method
      });
    } catch (error) {
      console.error('Failed to track sign up:', error);
    }
  }

  /**
   * Set user ID for tracking
   * @param userId User's unique identifier
   */
  async setUserId(userId: string | null) {
    try {
      await analytics().setUserId(userId);
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }

  /**
   * Set user properties for segmentation
   * @param properties User properties to set
   */
  async setUserProperties(properties: Record<string, string>) {
    try {
      await analytics().setUserProperties(properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;