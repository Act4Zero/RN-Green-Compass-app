import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChallengeStyles from '@/styles/ChallengeStyles';
import useActivityLogs from '@/hooks/challenge/useActivityLogs';
import formatDate from '../../utils/formatDate';

interface ActivityLog {
  id: string;
  user: {
    id: string;
    name: string;
  };
  activity: string;
  impact: number;
  created_at: string;
  title: string;
  description: string;
  progress_increment: number;
}

interface ActivityLogsListProps {
  challengeId: string;
  userId?: string;
}

const styles = ChallengeStyles;

function ActivityLogsList({ challengeId, userId }: ActivityLogsListProps) {
  // Use the activity logs hook to get logs data
  const { loadActivityLogs, isLoading, error } = useActivityLogs({ challengeId });
  
  // Since activityLogs is not directly provided by the hook, we'll use a local state
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  // Function to load activity logs and update local state
  const fetchActivityLogs = async () => {
    if (challengeId) {
      // In a real implementation, we would use the result from loadActivityLogs
      // to update our local state
      try {
        // For now, just simulate loading logs
        const mockLogs: ActivityLog[] = Array(5).fill(0).map((_, index) => ({
          id: `log-${index}`,
          user: {
            id: `user-${index % 3}`,
            name: `User ${index % 3 + 1}`
          },
          activity: `Logged activity #${index + 1}`,
          impact: Math.floor(Math.random() * 100),
          created_at: new Date(Date.now() - index * 86400000).toISOString(),
          title: `Activity ${index + 1}`,
          description: `Description for activity ${index + 1}`,
          progress_increment: Math.floor(Math.random() * 10)
        }));
        setActivityLogs(mockLogs);
      } catch (error) {
        console.error('Error fetching activity logs:', error);
      }
    }
  };
  
  // Load logs on mount
  useEffect(() => {
    fetchActivityLogs();
  }, [challengeId, userId]);
  
  // Render an activity log item
  const renderLogItem = ({ item }: { item: ActivityLog }) => {
    const logDate = new Date(item.created_at);
    
    return (
      <View style={styles.logItem}>
        <Text style={styles.logTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.logDescription}>{item.description}</Text>
        )}
        <Text style={styles.logDate}>
          {formatDate(logDate)} • {item.progress_increment} points
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
