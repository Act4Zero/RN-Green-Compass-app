# Google Analytics Integration

This document outlines how Google Analytics is implemented in the Green Compass app.

## Overview

The Green Compass app uses Google Analytics via Firebase to track user behavior, screen views, and key events. This helps us understand how users interact with the app and make data-driven decisions for improvements.

## Setup

### Dependencies

The following dependencies are used for analytics:

```json
"@react-native-firebase/analytics": "^18.3.0",
"@react-native-firebase/app": "^18.3.0"
```

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
initializeAnalytics()

// Track screen views
trackScreenView(screenName: string)

// Track events
trackEvent(eventName: string, eventParams?: Record<string, any>)

// Track user authentication events
trackSignUp(method: string)
trackLogin(method: string)
trackLogout()

// User identification
setUserId(userId: string)

// User properties
setUserProperties(properties: Record<string, string>)
```

## Implementation

Analytics tracking is implemented in the following key components:

### Authentication

- `AuthContext.tsx`: Tracks sign-up, sign-in, and logout events
- `signup.tsx`: Tracks screen views for the signup page
- `signin.tsx`: Tracks screen views for the signin page

### Navigation

- `Welcome.tsx`: Tracks button clicks for navigation to signup and signin pages
- `index.tsx`: Tracks screen views for the Welcome page
- `home.tsx`: Tracks screen views for the Home page and sets user properties

### App Initialization

- `_layout.tsx`: Initializes the analytics service when the app starts

## Best Practices

When adding new analytics tracking:

1. **Use the analytics service**: Always use the centralized service instead of directly calling Firebase methods
2. **Be consistent with naming**: Use clear, descriptive names for events and screens
3. **Track meaningful events**: Focus on tracking events that provide actionable insights
4. **Respect user privacy**: Don't track personally identifiable information unless necessary
5. **Document new events**: Update this documentation when adding new tracked events

## Viewing Analytics Data

Analytics data can be viewed in the Google Analytics dashboard or Firebase console. The same Google Analytics property is used for both the mobile app and the landing page, allowing for a unified view of the user journey.
