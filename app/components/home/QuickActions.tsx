import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { quickActionsStyles } from './styles/QuickActions.styles';

export default function QuickActions() {
  const router = useRouter();

  return (
    <View style={quickActionsStyles.quickActionsContainer}>
      <TouchableOpacity 
        style={quickActionsStyles.quickActionItem}
        onPress={() => router.push('/habits/log' as any)}
      >
        <View style={quickActionsStyles.quickActionIcon}>
          <Ionicons name="add-outline" size={24} color="#2E7D32" />
        </View>
        <Text style={quickActionsStyles.quickActionText}>Log Action</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={quickActionsStyles.quickActionItem}
        onPress={() => router.push('/habits/history' as any)}
      >
        <View style={quickActionsStyles.quickActionIcon}>
          <Ionicons name="calendar-outline" size={24} color="#2E7D32" />
        </View>
        <Text style={quickActionsStyles.quickActionText}>View History</Text>
      </TouchableOpacity>
    </View>
  );
}
