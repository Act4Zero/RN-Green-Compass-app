import LogStyles from '@/styles/LogStyles';
import { View, Text, TouchableOpacity } from 'react-native';
import { Habit } from '../../../types/supabase';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';
import { localizeHabit } from '@/features/habits/localization';

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
    const { theme } = useAppTheme();
    const { locale, t } = useAppLocale();
    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('3. Select an action', '3. Избери действие')}</Text>
            
            <View style={styles.habitsContainer}>
              {/* If a habit is selected, only show that habit in the list */}
              {(selectedHabit ? [selectedHabit] : availableHabits).map((habit) => {
                const copy = localizeHabit(habit, locale);
                return (
                <TouchableOpacity
                  key={habit.id}
                  style={[styles.habitItemWrapper]}
                  onPress={() => handleSelectHabit(habit)}
                >
                  <View 
                    style={[
                      styles.habitItem,
                      { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                      selectedHabit?.id === habit.id && styles.habitItemSelected,
                      selectedHabit?.id === habit.id && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                    ]}
                  >
                    <View style={styles.habitItemContent}>
                      <Text
                        style={[
                          styles.habitTitle,
                          { color: selectedHabit?.id === habit.id ? theme.colors.textInverse : theme.colors.text },
                        ]}
                        numberOfLines={2}
                      >
                        {copy.name}
                      </Text>
                      <Text
                        style={[
                          styles.habitDescription,
                          { color: selectedHabit?.id === habit.id ? theme.colors.primarySoft : theme.colors.textMuted },
                        ]}
                        numberOfLines={3}
                      >
                        {copy.description}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.habitCO2,
                        { color: selectedHabit?.id === habit.id ? theme.colors.textInverse : theme.colors.primary },
                      ]}
                    >
                      {habit.estimated_co2_saving} kg CO₂
                    </Text>
                  </View>
                </TouchableOpacity>
                );
              })}
            </View>
          </View>
    )
}

export default HabitsSection;
