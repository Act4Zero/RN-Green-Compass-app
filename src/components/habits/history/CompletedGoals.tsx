import { View, Text, FlatList } from 'react-native';
import { historyStyles } from '@/styles/historyStyles';
import { UserGoal } from '@/app/types/supabase';

const styles = historyStyles;

export function CompletedGoals({
  completedGoals,
  renderCompletedGoalItem
}: {
  completedGoals: UserGoal[];
  renderCompletedGoalItem: (item: UserGoal) => React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Completed Goals</Text>
      <View style={{ paddingBottom: 16 }} />

      {completedGoals.length > 0 ? (
        <FlatList
          data={completedGoals}
          renderItem={renderCompletedGoalItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No completed goals yet. Keep working towards your targets!
          </Text>
        </View>
      )}
    </View>
  );
}

export default CompletedGoals;
  