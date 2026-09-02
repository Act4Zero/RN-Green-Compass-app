import { View, Text, FlatList, ListRenderItem } from 'react-native';
import { historyStyles } from '@/styles/historyStyles';
import { HabitLog } from '../../../types/supabase';

const styles = historyStyles;

export function HabitsHistory({
  selectedDate,
  filteredLogs,
  renderLogItem,
  formatSelectedDate
}: {
  selectedDate: Date | null;
  filteredLogs: HabitLog[];
  renderLogItem: ListRenderItem<HabitLog>;
  formatSelectedDate: (date: Date) => string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedDate ? `Навици на ${formatSelectedDate(selectedDate)}` : 'Избери дата'}
        </Text>
        {selectedDate && filteredLogs.length > 0 && (
          <View style={styles.actionCountBadge}>
            <Text style={styles.actionCountText}>
              {filteredLogs.length} {filteredLogs.length === 1 ? 'действие' : 'действия'}
            </Text>
          </View>
        )}
      </View>
      {filteredLogs.length > 0 ? (
        <FlatList
          data={filteredLogs}
          renderItem={renderLogItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {selectedDate ? 'Няма записани навици за тази дата и филтър' : 'Избери дата, за да видиш записаните навици'}
          </Text>
        </View>
      )}
    </View>
  );
}

export default HabitsHistory;
