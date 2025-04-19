import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChallengeStyles from '@/styles/ChallengeStyles';
import useParticipants from '@/hooks/challenge/useParticipants';
import { ChallengeParticipant } from '@/types/challenge';

interface ChallengeParticipantsProps {
  challengeId: string;
}

const styles = ChallengeStyles;

// Create image-specific styles to avoid type errors
const imageStyles = {
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
  },
};

function ChallengeParticipants({ challengeId }: ChallengeParticipantsProps) {
  const { participants, isLoading, error, loadParticipants } = useParticipants({ challengeId });
  
  // Load participants when the component mounts
  useEffect(() => {
    if (challengeId) {
      loadParticipants();
    }
  }, [challengeId, loadParticipants]);

  // Function to load more participants if pagination is supported by the hook
  const loadMore = () => {
    // This would need to be implemented in the hook that provides participants data
    // Currently just a placeholder for future implementation
  };

  const renderParticipant = ({ item }: { item: ChallengeParticipant }) => {
    const { user, progress_metric } = item;
    const displayName = user?.full_name || '';
    const initial = displayName.length > 0 ? displayName.charAt(0) : '?';
    return (
      <View style={styles.participantItem}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ 
            width: 32, 
            height: 32, 
            borderRadius: 16, 
            backgroundColor: '#E0E0E0', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginRight: 8
          }}>
            <Text style={{ fontWeight: 'bold' }}>{initial}</Text>
          </View>
          <Text style={styles.participantName}>{displayName || 'Unknown'}</Text>
        </View>
        <Text style={{ color: '#2E7D32' }}>{progress_metric}</Text>
      </View>
    );
  };

  // If there are no participants, show a message
  if (!isLoading && participants.length === 0) {
    return (
      <View style={styles.detailCard}>
        <Text style={styles.progressLabel}>Participants</Text>
        <View style={{ alignItems: 'center', padding: 16 }}>
          <Text style={{ fontSize: 14, color: '#777777', marginTop: 8 }}>
            No participants yet. Be the first to join!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.detailCard}>
      <Text style={styles.progressLabel}>Participants ({participants.length})</Text>
      
      {isLoading ? (
        <View style={{ padding: 16, alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#2E7D32" />
        </View>
      ) : error ? (
        <Text style={{ color: '#F44336', padding: 16, textAlign: 'center' }}>
          {error}
        </Text>
      ) : (
        <FlatList
          data={participants}
          renderItem={renderParticipant}
          keyExtractor={(item, index) => `participant-${index}-${item?.user?.id || index}`}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', padding: 16, color: '#777777' }}>
              No participants yet.
            </Text>
          }
        />
      )}
    </View>
  );
}

export default ChallengeParticipants;
