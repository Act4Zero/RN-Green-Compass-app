import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PointEvent } from '@/types/community/points';
import { formatPointSource, getPointEventDescription } from '@/utils/pointsFormatters';
import pointsStyles from '@/styles/community/Points.styles';

interface PointsHistoryItemProps {
  pointEvent: PointEvent;
}

function PointsHistoryItem({ pointEvent }: PointsHistoryItemProps) {
  // Get icon based on point source
  const getIconName = () => {
    switch (pointEvent.source) {
      case 'daily_login':
        return 'calendar-outline';
      case 'habit_log':
        return 'leaf-outline';
      case 'discussion_participation':
        return 'chatbubbles-outline';
      default:
        return 'star-outline';
    }
  };

  // Format the date in a readable format
  const formattedDate = new Date(pointEvent.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <View style={pointsStyles.historyItem}>
      <View style={pointsStyles.pointSourceIcon}>
        <Ionicons 
          name={getIconName()} 
          size={20} 
          color="#2E7D32" 
        />
      </View>

      <View style={pointsStyles.historyItemContent}>
        <View style={pointsStyles.historyItemHeader}>
          <Text style={pointsStyles.pointsDescription}>
            {formatPointSource(pointEvent.source)}
          </Text>
          <Text style={pointsStyles.pointsAmount}>+{pointEvent.points}</Text>
        </View>
        <Text style={pointsStyles.pointsDescription}>
          {getPointEventDescription(pointEvent)}
        </Text>
        <Text style={pointsStyles.historyItemDate}>{formattedDate}</Text>
      </View>
    </View>
  );
}

export default PointsHistoryItem;
