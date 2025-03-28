import LogStyles from "../styles/LogStyles";
import { View, Text, TouchableOpacity } from 'react-native';
import Button from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../../types/supabase';
import Input from "@/app/components/Input";

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
    return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedHabit ? 'Selected Habit' : 'No Habit Selected'}
          </Text>
          
          {selectedHabit ? (
            <View style={styles.selectedHabitContainer}>
              <View style={styles.selectedHabitHeader}>
                <View style={styles.selectedHabitInfo}>
                  <Text style={styles.selectedHabitTitle}>{selectedHabit.name}</Text>
                  <Text style={styles.selectedHabitCO2}>{selectedHabit.estimated_co2_saving} kg CO₂</Text>
                </View>
                <TouchableOpacity 
                  style={styles.deselectButton}
                  onPress={() => selectHabit(null)}
                >
                  <Ionicons name="close-circle-outline" size={24} color="#555555" />
                </TouchableOpacity>
              </View>
              <Text style={styles.selectedHabitDescription}>{selectedHabit.description}</Text>
              
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>How many times did you do this?</Text>
                
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={decrementQuantity}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={incrementQuantity}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes (Optional)</Text>
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
            <View style={styles.noHabitSelectedContainer}>
              <Text style={styles.noHabitText}>Please select a habit from the list above</Text>
            </View>
          )}
        </View>
    )
}

export default SelectedHabitSection;
