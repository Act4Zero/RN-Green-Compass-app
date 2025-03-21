# Google Analytics Integration

This document outlines how Google Analytics is implemented in the Green Compass app.

## Overview

The Green Compass app uses Google Analytics 4 (GA4) to track user behavior, screen views, and key events. This helps us understand how users interact with the app and make data-driven decisions for improvements. The implementation is focused on web platform analytics using the standard gtag.js script.

## Setup

### Dependencies

No external dependencies are required for the web implementation. The analytics service uses the standard Google Analytics gtag.js script which is loaded dynamically.

### Environment Variables

Analytics configuration uses the following environment variables:

```
EXPO_PUBLIC_GA_MEASUREMENT_ID=your_firebase_measurement_id
```

This variable is defined in:
- `.env` for development
- `.env.production` for production

## Analytics Service

The analytics functionality is centralized in the `analyticsService.ts` file located in `app/services/`. This service provides methods for:

1. Tracking screen views
2. Tracking events
3. Setting user IDs
4. Setting user properties

### Key Methods

```typescript
// Initialize analytics
initialize()

// Track screen views
trackScreenView(screenName: string, screenClass?: string)

// Track events
trackEvent(eventName: string, params?: Record<string, any>)

// Track user authentication events
trackSignUp(method: string)
trackLogin(method: string)

// User identification
setUserId(userId: string | null)

// User properties
setUserProperties(properties: Record<string, string>)
```

## Implementation Details

The analytics service uses the following approach:

### Web Platform Implementation

For web platforms, the service:

1. Dynamically injects the Google Analytics gtag.js script if not already present
2. Initializes gtag with the measurement ID from environment variables
3. Uses standard gtag.js methods for tracking events and user properties

```javascript
// Example of how gtag is initialized
window.dataLayer = window.dataLayer || [];
window.gtag = function() {
  window.dataLayer.push(arguments);
};
window.gtag('js', new Date());
window.gtag('config', GA_MEASUREMENT_ID);
```

### Native Platform Implementation

For native platforms, the service currently provides placeholder functionality that logs events to the console. This can be extended in the future if native analytics tracking is needed.

### App Initialization

- `_layout.tsx`: Initializes the analytics service when the app starts

## Usage Examples

### Tracking Screen Views

```typescript
import analyticsService from '../services/analyticsService';

// In a component
useEffect(() => {
  analyticsService.trackScreenView('HomeScreen');
}, []);
```

### Tracking Events

```typescript
import analyticsService from '../services/analyticsService';

// Track a button click
const handleButtonPress = () => {
  analyticsService.trackEvent('button_click', { button_name: 'signup_button' });
  // Rest of your logic
};
```

### Tracking Authentication

```typescript
import analyticsService from '../services/analyticsService';

// Track login
const handleLogin = async (credentials) => {
  // Login logic
  analyticsService.trackLogin('email');
};

// Track sign-up
const handleSignUp = async (userData) => {
  // Sign-up logic
  analyticsService.trackSignUp('email');
};
```

## Best Practices

When adding new analytics tracking:

1. **Use the analytics service**: Always use the centralized service instead of directly calling gtag methods
2. **Be consistent with naming**: Use clear, descriptive names for events and screens
3. **Track meaningful events**: Focus on tracking events that provide actionable insights
4. **Respect user privacy**: Don't track personally identifiable information unless necessary
5. **Document new events**: Update this documentation when adding new tracked events

## Viewing Analytics Data

Analytics data can be viewed in the Google Analytics dashboard. The same Google Analytics property (G-GQ22KWZV7Q) is used for both the mobile app and the landing page, allowing for a unified view of the user journey.

## Event Naming Conventions

We follow Google Analytics 4 naming conventions for events. Some key events we track:

- `page_view`: When a user views a screen (web standard)
- `login`: When a user logs in
- `sign_up`: When a user signs up
- `button_click`: When a user clicks a button

## Privacy Considerations

- User IDs are anonymized and not connected to personally identifiable information
- We only collect data necessary for improving the app experience
- Analytics respects user privacy settings and can be disabled

## Debugging

To debug analytics in development:

1. Open browser developer tools
2. Look for network requests to `google-analytics.com`
3. Check console logs for analytics events (we log all events to console)
