# Feature Flags

This document provides an overview of the feature flags system in the Green Compass app, explaining how to use and manage feature flags throughout the application.

## Overview

Feature flags allow you to enable or disable functionality in the application without deploying new code. The system provides real-time updates, so any changes to feature flags in the database are immediately reflected in the app.

## Database Structure

Feature flags are stored in the `feature_flags` table in the Supabase database with the following structure:

| Column      | Type      | Description                              |
|-------------|-----------|------------------------------------------|
| key         | text      | Unique identifier for the feature        |
| enabled     | boolean   | Whether the feature is enabled           |
| updated_at  | timestamp | When the flag was last updated           |

## Usage Examples

### 1. Using the FeatureToggle Component

The `FeatureToggle` component conditionally renders content based on a feature flag's state:

```tsx
import { FeatureToggle } from '@/components/common/FeatureToggle';
import { View, Text } from 'react-native';

function ExampleComponent() {
  return (
    <View>
      {/* Only render this content when the feature is enabled */}
      <FeatureToggle featureKey="new_dashboard">
        <Text>This is the new dashboard!</Text>
      </FeatureToggle>
      
      {/* Show alternative content when the feature is disabled */}
      <FeatureToggle 
        featureKey="enhanced_profile"
        fallback={<Text>Basic profile view</Text>}
      >
        <Text>Enhanced profile with additional features</Text>
      </FeatureToggle>
    </View>
  );
}
```

### 2. Using the useFeatureFlag Hook

The `useFeatureFlag` hook allows you to check if a feature is enabled within functional components:

```tsx
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { View, Text, Button } from 'react-native';

function FeatureExample() {
  const isNewSearchEnabled = useFeatureFlag('new_search');
  const isExperimentalFeatureEnabled = useFeatureFlag('experimental_feature', false);
  
  return (
    <View>
      {isNewSearchEnabled && (
        <Text>New search experience is enabled!</Text>
      )}
      
      <Button 
        title={isExperimentalFeatureEnabled ? "New Experience" : "Classic Mode"}
        onPress={() => {/* Your action here */}}
      />
    </View>
  );
}
```

### 3. Accessing All Flags

For advanced use cases or admin interfaces, you can access all feature flags at once:

```tsx
import { useFeatureFlagsContext } from '@/context/FeatureFlagsContext';
import { View, Text, ActivityIndicator } from 'react-native';

function FeatureFlagsDashboard() {
  const { flags, isLoading } = useFeatureFlagsContext();
  
  if (isLoading) {
    return <ActivityIndicator />;
  }
  
  return (
    <View>
      <Text style={{ fontWeight: 'bold' }}>Active Feature Flags:</Text>
      {Object.entries(flags).map(([key, enabled]) => (
        <Text key={key}>
          {key}: {enabled ? '✅ Enabled' : '❌ Disabled'}
        </Text>
      ))}
    </View>
  );
}
```

## Managing Feature Flags

### Adding a New Feature Flag

To add a new feature flag, insert a row into the `feature_flags` table through the Supabase dashboard or directly via SQL:

```sql
INSERT INTO public.feature_flags (key, enabled, updated_at)
VALUES ('my_new_feature', false, NOW());
```

### Toggling a Feature Flag

To enable or disable a feature flag:

```sql
UPDATE public.feature_flags 
SET enabled = true, updated_at = NOW()
WHERE key = 'my_new_feature';
```

To toggle a flag's current value:

```sql
UPDATE public.feature_flags 
SET enabled = NOT enabled, updated_at = NOW()
WHERE key = 'my_new_feature';
```

### Checking Feature Flag Values

To view all feature flags:

```sql
SELECT * FROM public.feature_flags ORDER BY key;
```

## Best Practices

1. **Use descriptive keys**: Name your feature flags clearly to indicate their purpose (e.g., `new_profile_page`, `enhanced_search`).

2. **Default values**: Always provide default values when using `useFeatureFlag` to handle cases where the flag doesn't exist.

3. **Clean up old flags**: Remove feature flags that are no longer needed after a feature has been fully adopted or rejected.

4. **Categorize flags**: Consider adding a category column to organize flags (e.g., `experimental`, `beta`, `internal`).

5. **Documentation**: Document the purpose of each flag in a central location.

## Technical Implementation

The feature flags system consists of:

- `FeatureFlagsService`: Handles fetching flags and real-time subscriptions
- `FeatureFlagsProvider`: Context provider that makes flags available throughout the app
- `useFeatureFlag`: Hook for checking specific flags
- `FeatureToggle`: Component for conditionally rendering based on flag state

The implementation uses Supabase's real-time subscription capabilities to ensure that flag changes are instantly reflected in the app without requiring a refresh.

## Troubleshooting

1. **Flag changes not updating**: Ensure that the `updated_at` field is set to `NOW()` when updating flags.

2. **Multiple subscriptions**: The system is designed to work with the React component lifecycle. Avoid creating multiple subscriptions outside of the provided hooks and components.

3. **Performance**: If you have many feature flags, consider optimizing to only subscribe to flags that are actually used in the current session.
