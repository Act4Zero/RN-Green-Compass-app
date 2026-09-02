import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { quickActionsStyles } from './styles/QuickActions.styles';
import { useAppLocale } from '@/context/AppLocaleContext';

export default function QuickActions() {
  const router = useRouter();
  const { t } = useAppLocale();

  return (
    <View style={quickActionsStyles.quickActionsContainer}>
      <TouchableOpacity 
        style={quickActionsStyles.quickActionItem}
        onPress={() => router.push('/habits/log' as any)}
      >
        <View style={quickActionsStyles.quickActionIcon}>
          <Ionicons name="add-outline" size={24} color="#2E7D32" />
        </View>
        <Text style={quickActionsStyles.quickActionText}>{t('Log Action', 'Запиши действие')}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={quickActionsStyles.quickActionItem}
        onPress={() => router.push('/habits/history' as any)}
      >
        <View style={quickActionsStyles.quickActionIcon}>
          <Ionicons name="calendar-outline" size={24} color="#2E7D32" />
        </View>
        <Text style={quickActionsStyles.quickActionText}>{t('View History', 'Виж историята')}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={quickActionsStyles.quickActionItem}
        onPress={() => router.push('/community' as any)}
      >
        <View style={quickActionsStyles.quickActionIcon}>
          <Ionicons name="people-outline" size={24} color="#2E7D32" />
        </View>
        <Text style={quickActionsStyles.quickActionText}>{t('Community', 'Общност')}</Text>
      </TouchableOpacity>
    </View>
  );
}
