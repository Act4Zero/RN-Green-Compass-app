# Notification System

A centralized, queue-based notification system for the Green Compass app that provides consistent user feedback across the application.

## Overview

The notification system provides a flexible, unified way to display various types of notifications throughout the app. It handles:

- Toast messages (brief notifications at the bottom of the screen)
- Banners (persistent notifications at the top of the screen)
- Modals (overlay dialogs for important interactions)
- Alerts (native system alerts)

All notifications are managed through a centralized queue to ensure they display one at a time without overlapping or cluttering the UI.

## Implementation Details

### Architecture

The notification system uses React's Context API to provide app-wide notification capabilities:

- **NotificationContext**: Manages the global state of notifications
- **NotificationContainer**: Handles rendering the correct notification component
- **Notification Components**: Specialized components for each notification type

### Core Components

1. **NotificationContext.tsx**: 
   - Manages the notification queue
   - Provides methods to add and remove notifications
   - Controls notification lifecycle

2. **NotificationContainer.tsx**:
   - Renders the current notification from the queue
   - Handles automatic dismissal of notifications
   - Manages transitions between notifications

3. **Notification Types**:
   - `ToastNotification.tsx`: Brief messages at the bottom of the screen
   - `BannerNotification.tsx`: Persistent messages at the top of the screen
   - `ModalNotification.tsx`: Dialog overlays for important interactions
   - `AlertNotification.tsx`: Native system alerts

4. **NotificationExample.tsx**:
   - Example component demonstrating all notification types
   - Can be used for testing or as a reference

## Integration

The notification system is integrated at the app root level in `app/_layout.tsx`:

```tsx
// Inside the component tree
<FeatureFlagsProvider>
  <NotificationProvider>
    <AuthProvider>
      {/* Other providers */}
      {/* Routes */}
      <NotificationContainer />
    </AuthProvider>
  </NotificationProvider>
</FeatureFlagsProvider>
```

## Usage

### Basic Usage

You can use the notification system from any component by accessing the context with the `useNotification` hook:

```tsx
import { useNotification } from '@/context/NotificationContext';

function MyComponent() {
  const { addNotification } = useNotification();
  
  const handleSuccess = () => {
    addNotification({
      type: 'toast',
      message: 'Action completed successfully!',
      severity: 'success',
    });
  };
}
```

### Notification Types

#### Toast Notifications

Quick, temporary messages that appear at the bottom of the screen:

```tsx
addNotification({
  type: 'toast',
  message: 'Profile updated successfully!',
  severity: 'success',  // 'success', 'info', 'warning', 'error'
  duration: 3000,       // Auto-dismiss after 3 seconds
});
```

#### Banner Notifications

More prominent notifications that appear at the top of the screen:

```tsx
addNotification({
  type: 'banner',
  message: 'Your session will expire soon.',
  severity: 'warning',
  duration: 5000,
  action: {
    label: 'Extend',
    onPress: () => extendSession(),
  },
});
```

#### Modal Notifications

Dialog overlays for important information or interactions:

```tsx
addNotification({
  type: 'modal',
  title: 'Information',  // Optional title
  message: 'Here is some important information about your account.',
  severity: 'info',
  autoClose: false,      // Will not auto-dismiss
  action: {              // Optional action button
    label: 'OK',
    onPress: () => console.log('User acknowledged'),
  },
});
```

#### Alert Notifications

Native system alerts (uses React Native's Alert API):

```tsx
addNotification({
  type: 'alert',
  title: 'Confirm Delete',
  message: 'Are you sure you want to delete this item?',
  severity: 'warning',
  action: {
    label: 'Delete',
    onPress: () => deleteItem(),
  },
});
```

### Notification Properties

All notifications accept these common properties:

| Property    | Type                   | Description                                        | Default     |
|-------------|-----------------------|----------------------------------------------------|-------------|
| `type`      | NotificationType      | 'toast', 'banner', 'modal', or 'alert'             | Required    |
| `message`   | string                | Main notification text                             | Required    |
| `title`     | string                | Title for modal and alert notifications            | Optional    |
| `severity`  | NotificationSeverity  | 'success', 'info', 'warning', or 'error'           | 'info'      |
| `duration`  | number                | Time in ms before auto-dismissal                   | 3000        |
| `autoClose` | boolean               | Whether notification should dismiss automatically   | true        |
| `action`    | Object                | Action button configuration                        | Optional    |
| `data`      | Record<string, any>   | Additional custom data                             | Optional    |

## Best Practices

### When to Use Each Type

- **Toast**: Brief success/error messages that don't require user action
- **Banner**: Important notices that might need attention but shouldn't block interaction
- **Modal**: Critical information that requires focused attention or user action
- **Alert**: Confirmation of destructive actions or system-level permissions

### Notification Content Guidelines

1. **Be concise**: Keep messages short and direct
2. **Be specific**: Clearly state what happened or what action is required
3. **Use appropriate severity**: Don't use 'error' for informational messages
4. **Provide actions when needed**: If user action is required, include an action button

### Common Use Cases

#### Success Confirmation

```tsx
addNotification({
  type: 'toast',
  message: 'Habit logged successfully!',
  severity: 'success',
});
```

#### Error Handling

```tsx
addNotification({
  type: 'toast',
  message: 'Failed to save changes. Please try again.',
  severity: 'error',
  duration: 5000,
});
```

#### Important Announcements

```tsx
addNotification({
  type: 'banner',
  message: 'New challenge available! Join now to earn bonus points.',
  severity: 'info',
  action: {
    label: 'View',
    onPress: () => router.push('/community/challenges'),
  },
});
```

#### Critical Warnings

```tsx
addNotification({
  type: 'modal',
  title: 'Account Security',
  message: 'We detected a login from a new device. Was this you?',
  severity: 'warning',
  autoClose: false,
  action: {
    label: 'Review Activity',
    onPress: () => router.push('/profile/security'),
  },
});
```

## Extending the System

To add custom notification types or behavior:

1. Create a new notification component in `src/components/notifications/`
2. Add the new type to the `NotificationType` union in `NotificationContext.tsx`
3. Update the `NotificationContainer` to handle the new type
4. Update this documentation to reflect the changes

## Troubleshooting

### Common Issues

- **Notifications not appearing**: Ensure the `NotificationProvider` and `NotificationContainer` are properly integrated at the root level
- **Styling inconsistencies**: Check the component styles for the specific notification type
- **Queue not advancing**: Verify that `removeNotification` is being called either by auto-dismiss or user interaction

### Debug Tips

You can monitor the notification queue state for debugging:

```tsx
const { state } = useNotification();
console.log('Current notification queue:', state.notifications);
```
