import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FeedStyles from '@/styles/FeedStyles';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const styles = FeedStyles;

function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  return (
    <View style={[styles.errorContainer, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.danger, borderWidth: 1 }]}>
      <Text style={[styles.errorText, { color: theme.colors.danger }]}>{t('We couldn’t load the latest posts. The rest of Community is still available.', 'Последните публикации не можаха да се заредят. Останалата част от Общността остава достъпна.')}</Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
        onPress={onRetry}
      >
        <Text style={styles.retryButtonText}>{t('Retry', 'Опитай отново')}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default ErrorState;
