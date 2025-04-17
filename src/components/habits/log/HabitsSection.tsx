import LogStyles from '@/styles/LogStyles';
import { View, Text, TouchableOpacity } from 'react-native';
import { Habit } from '../../../types/supabase';

const styles = LogStyles;

export function HabitsSection({
    availableHabits,
    selectedHabit,
    handleSelectHabit
}: {
    availableHabits: Habit[];
    selectedHabit: Habit | null;
    handleSelectHabit: (habit: Habit) => void;
}) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select a Habit</Text>
            
            <View style={styles.habitsContainer}>
              {/* If a habit is selected, only show that habit in the list */}
              {(selectedHabit ? [selectedHabit] : availableHabits).map((habit) => (
                <TouchableOpacity
                  key={habit.id}
                  style={[styles.habitItemWrapper]}
                  onPress={() => handleSelectHabit(habit)}
                >
                  <View 
                    style={[
                      styles.habitItem,
                      selectedHabit?.id === habit.id && styles.habitItemSelected,
                    ]}
                  >
                    <View style={styles.habitItemContent}>
                      <Text
                        style={[
                          styles.habitTitle,
                          { color: selectedHabit?.id === habit.id ? '#FFFFFF' : '#333333' },
                        ]}
                        numberOfLines={2}
                      >
                        {habit.name}
                      </Text>
                      <Text
                        style={[
                          styles.habitDescription,
                          { color: selectedHabit?.id === habit.id ? '#E0E0E0' : '#555555' },
                        ]}
                        numberOfLines={3}
                      >
                        {habit.description}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.habitCO2,
                        { color: selectedHabit?.id === habit.id ? '#FFFFFF' : '#2E7D32' },
                      ]}
                    >
                      {habit.estimated_co2_saving} kg CO₂
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
    )
}

export default HabitsSection;
