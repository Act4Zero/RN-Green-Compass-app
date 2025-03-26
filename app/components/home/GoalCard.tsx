import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { EnhancedGoal } from './types/goal.types';
import { goalCardStyles } from './styles/GoalCard.styles';

interface GoalCardProps {
  goal: EnhancedGoal;
  onEdit: (goal: EnhancedGoal) => void;
}

export default function GoalCard({ goal, onEdit }: GoalCardProps) {
  const router = useRouter();

  return (
    <View style={goalCardStyles.goalCard}>
      <View style={goalCardStyles.goalCardHeader}>
        <Text style={goalCardStyles.goalTitle}>{goal.title}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={goalCardStyles.goalCategory}>
            {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
          </Text>
          {goal.timeFrequency !== 'none' && (
            <View style={goalCardStyles.timeChip}>
              <Text style={goalCardStyles.timeChipText}>{goal.timeFrequency}</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={goalCardStyles.goalProgress}>
        <View style={goalCardStyles.goalProgressBar}>
          <View 
            style={[goalCardStyles.goalProgressFill, { width: `${(goal.progress / goal.target) * 100}%` }]}
          />
        </View>
        <Text style={goalCardStyles.goalProgressText}>
          {goal.progress} of {goal.target} actions completed
        </Text>
      </View>
      
      <View style={goalCardStyles.goalActions}>
        <TouchableOpacity 
          style={goalCardStyles.goalActionButton}
          onPress={() => onEdit(goal)}
        >
          <Text style={goalCardStyles.goalActionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[goalCardStyles.goalActionButton, { marginLeft: 8 }]}
          onPress={() => router.push({
            pathname: '/habits/log',
            params: { category: goal.category }
          } as any)}
        >
          <Text style={goalCardStyles.goalActionText}>Log Action</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
