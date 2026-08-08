import LogStyles from '@/styles/LogStyles';
import { View, Text, TouchableOpacity } from 'react-native';
import Button from '../../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../../../types/supabase';
import Input from '@/components/Input';
import { useAppTheme } from '@/theme';

const styles = LogStyles;

export function SelectedHabitSection({
    selectedHabit,
    decrementQuantity,
    incrementQuantity,
    quantity,
    notes,
    setNotes,
    selectHabit,
    handleLogHabit,
    isSubmitting,
    loading,
}: {
    selectedHabit: Habit | null;
    decrementQuantity: () => void;
    incrementQuantity: () => void;
    quantity: number;
    notes: string;
    setNotes: (notes: string) => void;
    selectHabit: (habit: Habit | null) => void;
    handleLogHabit: () => void;
    isSubmitting: boolean;
    loading: boolean;
}) {
    const { theme } = useAppTheme();
    return (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {selectedHabit ? '4. Add the details' : '4. Add the details'}
          </Text>
          
          {selectedHabit ? (
            <View style={[styles.selectedHabitContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.selectedHabitHeader}>
                <View style={styles.selectedHabitInfo}>
                  <Text style={[styles.selectedHabitTitle, { color: theme.colors.text }]}>{selectedHabit.name}</Text>
                  <Text style={[styles.selectedHabitCO2, { color: theme.colors.primary }]}>{selectedHabit.estimated_co2_saving} kg CO₂</Text>
                </View>
                <TouchableOpacity 
                  style={styles.deselectButton}
                  onPress={() => selectHabit(null)}
                >
                  <Ionicons name="close-circle-outline" size={24} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.selectedHabitDescription, { color: theme.colors.textMuted }]}>{selectedHabit.description}</Text>
              
              <View style={styles.quantityContainer}>
                <Text style={[styles.quantityLabel, { color: theme.colors.text }]}>How many times did you do this?</Text>
                
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={[styles.quantityButton, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}
                    onPress={decrementQuantity}
                  >
                    <Text style={[styles.quantityButtonText, { color: theme.colors.primary }]}>-</Text>
                  </TouchableOpacity>
                  
                  <Text style={[styles.quantityValue, { color: theme.colors.text }]}>{quantity}</Text>
                  
                  <TouchableOpacity
                    style={[styles.quantityButton, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}
                    onPress={incrementQuantity}
                  >
                    <Text style={[styles.quantityButtonText, { color: theme.colors.primary }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.notesContainer}>
                <Text style={[styles.notesLabel, { color: theme.colors.text }]}>Notes (optional)</Text>
                <Input
                  value={notes}
                  onChangeText={(text) => {
                    // Limit input length during typing
                    if (text.length <= 500) {
                      setNotes(text);
                    }
                  }}
                  placeholder="Add any additional details... (max 500 characters)"
                  multiline
                  numberOfLines={3}
                  maxLength={500} // Enforce character limit at the UI level
                />
              </View>
              
              <Button
                title="Log Habit"
                onPress={handleLogHabit}
                variant="primary"
                style={styles.confirmButton}
                loading={isSubmitting || loading}
                disabled={isSubmitting || loading}
              />
            </View>
          ) : (
            <View style={[styles.noHabitSelectedContainer, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border }]}>
              <Text style={[styles.noHabitText, { color: theme.colors.textMuted }]}>Select an action above to see impact and logging controls.</Text>
            </View>
          )}
        </View>
    )
}

export default SelectedHabitSection;
