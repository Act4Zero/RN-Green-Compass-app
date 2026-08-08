import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { EnhancedGoal } from '@/types/goal.types';
import GoalCard from './GoalCard';
import { homeStyles } from '../../styles/Home.styles';
import { useAppTheme } from '@/theme';

interface GoalsListProps {
  goals: EnhancedGoal[];
  onEditGoal: (goal: EnhancedGoal) => void;
}

export function GoalsList({ goals, onEditGoal }: GoalsListProps) {
  const router = useRouter();
  const { theme } = useAppTheme();

  // Empty state for no goals
  if (!goals || goals.length === 0) {
    return (
      <View style={[homeStyles.emptyGoalsContainer, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radii.md }]}>
        <Text style={[homeStyles.emptyGoalsText, theme.typography.body, { color: theme.colors.textMuted }]}>
          No active goals yet. Add one small target to make your next step visible.
        </Text>
      </View>
    );
  }

  // Single row of goals if less than 4
  if (!goals || goals.length < 4) {
    return (
      <FlatList
        data={goals || []}
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={homeStyles.goalsContainer}
        style={homeStyles.scrollViewStyle}
        keyExtractor={(item) => item.id}
        renderItem={({item: goal}) => (
          <GoalCard goal={goal} onEdit={onEditGoal} />
        )}
      />
    );
  }

  // Split into two rows if 4+ goals
  return (
    <View>
      {/* First row */}
      <FlatList
        data={(goals || []).slice(0, Math.ceil((goals || []).length / 2))}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={homeStyles.goalsContainer}
        style={homeStyles.scrollViewStyle}
        keyExtractor={(item) => item.id}
        renderItem={({item: goal}) => (
          <GoalCard goal={goal} onEdit={onEditGoal} />
        )}
      />
      
      {/* Second row */}
      <View style={{ marginTop: 12 }}>
        <FlatList
          data={(goals || []).slice(Math.ceil((goals || []).length / 2))}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={homeStyles.goalsContainer}
          style={homeStyles.scrollViewStyle}
          keyExtractor={(item) => item.id}
          renderItem={({item: goal}) => (
            <GoalCard goal={goal} onEdit={onEditGoal} />
          )}
        />
      </View>
    </View>
  );
}

export function GoalsHeader({ onAddGoal }: { onAddGoal: () => void }) {
  const { theme } = useAppTheme();
  return (
    <View style={homeStyles.sectionHeader}>
      <Text style={[theme.typography.h2, { color: theme.colors.text }]}>Your goals</Text>
      <TouchableOpacity 
        accessibilityRole="button"
        style={[homeStyles.addGoalButton, { minHeight: 44, paddingHorizontal: 12, backgroundColor: theme.colors.primarySoft, borderRadius: theme.radii.md }]}
        onPress={onAddGoal}
      >
        <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
        <Text style={[homeStyles.addGoalText, theme.typography.label, { color: theme.colors.primary }]}>Add goal</Text>
      </TouchableOpacity>
    </View>
  );
}

// Default export to fix the "missing required default export" warning
const GoalsListComponent = { GoalsList, GoalsHeader };
export default GoalsListComponent;
