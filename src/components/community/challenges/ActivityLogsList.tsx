import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChallengeStyles from '@/styles/community/ChallengeStyles';
import useActivityLogs from '@/hooks/challenge/useActivityLogs';
import { ActivityLog } from '@/types/challenge';
import formatDate from '../../utils/formatDate';

interface ActivityLogsListProps {
  challengeId: string;
  userId?: string;
}

const styles = ChallengeStyles;

function ActivityLogsList({ challengeId, userId }: ActivityLogsListProps) {
  // Use the activity logs hook to get logs data
  const { logs: activityLogs, loadActivityLogs, isLoading, error } = useActivityLogs({ challengeId, userId });
  
  // Load logs on mount
  useEffect(() => {
    if (challengeId) loadActivityLogs();
  }, [challengeId, loadActivityLogs]);
  
  // Render an activity log item
  const renderLogItem = ({ item }: { item: ActivityLog }) => {
    const logDate = new Date(item.created_at);
    
    return (
      <View style={styles.logItem}>
        <Text style={styles.logTitle}>{item.title || item.description || item.user?.full_name || 'Unknown'}</Text>
        <Text style={styles.logDescription}>{item.description}</Text>
        <Text style={styles.logDate}>
          {formatDate(logDate)} • {item.impact_value} points
        </Text>
      </View>
    );
  };
  
  return (
    <View style={styles.detailCard}>
      <Text style={styles.progressLabel}>
        {userId ? 'Your Activity Logs' : 'Recent Activities'}
      </Text>
      
      {isLoading ? (
        <View style={{ padding: 16, alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#2E7D32" />
        </View>
      ) : error ? (
        <Text style={{ color: '#F44336', padding: 16, textAlign: 'center' }}>
          {error}
        </Text>
      ) : activityLogs.length === 0 ? (
        <View style={{ alignItems: 'center', padding: 16 }}>
          <Ionicons name="document-text-outline" size={32} color="#777777" />
          <Text style={{ fontSize: 14, color: '#777777', marginTop: 8 }}>
            No activity logs yet. Log your first activity!
          </Text>
        </View>
      ) : (
        <FlatList
          data={activityLogs}
          renderItem={renderLogItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

export default ActivityLogsList;
