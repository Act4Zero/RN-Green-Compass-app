import { View, Text, FlatList, ListRenderItem } from 'react-native';
import { historyStyles } from '@/styles/historyStyles';
import { UserGoal } from '@/types/supabase';

const styles = historyStyles;

export function CompletedGoals({
  completedGoals,
  renderCompletedGoalItem
}: {
  completedGoals: UserGoal[];
  renderCompletedGoalItem: ListRenderItem<UserGoal>;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Завършени цели</Text>
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
            Все още няма завършени цели. Продължавай към целта си!
          </Text>
        </View>
      )}
    </View>
  );
}

export default CompletedGoals;
