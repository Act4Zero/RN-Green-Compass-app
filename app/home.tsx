import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useAuth } from './context/AuthContext';
import Button from './components/Button';
import Input from './components/Input';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';
import useHabitStats from './hooks/useHabitStats';
import useGoals from './hooks/useGoals';

interface Styles {
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  welcomeText: TextStyle;
  userName: TextStyle;
  card: ViewStyle;
  cardTitle: TextStyle;
  cardContent: TextStyle;
  statsContainer: ViewStyle;
  statItem: ViewStyle;
  statValue: TextStyle;
  statLabel: TextStyle;
  actionButton: ViewStyle;
  actionButtonText: TextStyle;
  logoutButton: ViewStyle;
  section: ViewStyle;
  goalsContainer: ViewStyle;
  goalCard: ViewStyle;
  goalCardHeader: ViewStyle;
  goalTitle: TextStyle;
  goalCategory: TextStyle;
  goalProgress: ViewStyle;
  goalProgressBar: ViewStyle;
  goalProgressFill: ViewStyle;
  goalProgressText: TextStyle;
  goalActions: ViewStyle;
  goalActionButton: ViewStyle;
  goalActionText: TextStyle;
  quickActionsContainer: ViewStyle;
  quickActionItem: ViewStyle;
  quickActionIcon: ViewStyle;
  quickActionText: TextStyle;
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  modalHeader: ViewStyle;
  modalTitle: TextStyle;
  modalCloseButton: ViewStyle;
  modalForm: ViewStyle;
  modalLabel: TextStyle;
  modalInput: ViewStyle;
  modalButtonContainer: ViewStyle;
}

export default function Home() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { user, signOut } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard state to prevent accidental "pop" or back navigation
  // until we explicitly allow it (for sign out, etc.).
  const [shouldPreventBack, setShouldPreventBack] = useState(true);

  const { totalCO2Saved, totalActions, overallStreak } = useHabitStats();
  const { userGoals, loading: goalsLoading, updateExistingGoal } = useGoals();

  // Use real goals data from the database
  const [goals, setGoals] = useState<any[]>([]);
  
  // State for goal editing modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [editedGoalName, setEditedGoalName] = useState('');
  const [editedGoalCategory, setEditedGoalCategory] = useState('');
  const [editedGoalTarget, setEditedGoalTarget] = useState('');
  const [editedGoalCurrent, setEditedGoalCurrent] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  // Update goals when userGoals changes
  useEffect(() => {
    if (userGoals && userGoals.length > 0) {
      // Transform userGoals to match the expected format
      const formattedGoals = userGoals.map((goal) => ({
        id: goal.id,
        title: goal.goal_name, // Using goal_name instead of name to match DB schema
        category: goal.category || 'other',
        progress: goal.current_value || 0, // Using current_value instead of progress
        target: goal.target_value || 5, // Using target_value instead of target
        // Store the original goal object for easier updates
        originalGoal: goal,
      }));
      setGoals(formattedGoals);
    }
  }, [userGoals]);

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1) Temporarily disable the back-navigation guard
      setShouldPreventBack(false);

      const { error } = await signOut();

      if (error) {
        // If sign-out fails, re-enable guard
        setShouldPreventBack(true);

        setError('Failed to sign out. Please try again.');
        Alert.alert('Error', 'Failed to sign out. Please try again.');
      } else {
        // Redirect to signin screen after successful logout
        router.replace('/authentication/signin');
      }
    } catch (err) {
      // If anything unexpected happens, re-enable guard
      setShouldPreventBack(true);

      setError('An unexpected error occurred. Please try again.');
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prevent "back" navigation unless shouldPreventBack is false
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        if (!shouldPreventBack) {
          // If we explicitly turned off prevention, let them navigate
          return;
        }
        // Otherwise, block navigation
        e.preventDefault();
      });

      return unsubscribe;
    }, [navigation, shouldPreventBack])
  );

  // Open edit modal and set initial values
  const handleEditGoal = (goal: any) => {
    setSelectedGoal(goal);
    setEditedGoalName(goal.title);
    setEditedGoalCategory(goal.category);
    setEditedGoalTarget(goal.target.toString());
    setEditedGoalCurrent(goal.progress.toString());
    setIsEditModalVisible(true);
  };

  // Close modal and reset values
  const handleCloseModal = () => {
    setIsEditModalVisible(false);
    setSelectedGoal(null);
    setEditedGoalName('');
    setEditedGoalCategory('');
    setEditedGoalTarget('');
    setEditedGoalCurrent('');
    setError(null);
  };

  // Save updated goal
  const handleSaveGoal = async () => {
    if (!selectedGoal) return;
    
    setUpdateLoading(true);
    setError(null);
    
    try {
      // Validate inputs
      if (!editedGoalName.trim()) {
        setError('Goal name is required');
        setUpdateLoading(false);
        return;
      }
      
      const targetValue = parseFloat(editedGoalTarget);
      if (isNaN(targetValue) || targetValue <= 0) {
        setError('Target value must be a positive number');
        setUpdateLoading(false);
        return;
      }
      
      const currentValue = parseFloat(editedGoalCurrent);
      if (isNaN(currentValue) || currentValue < 0) {
        setError('Current value must be a non-negative number');
        setUpdateLoading(false);
        return;
      }
      
      // Prepare updates
      const updates = {
        goal_name: editedGoalName.trim(),
        category: editedGoalCategory.trim() || 'other',
        target_value: targetValue,
        current_value: currentValue,
      };
      
      // Call the update function
      const success = await updateExistingGoal(selectedGoal.id, updates);
      
      if (success) {
        // Close modal after successful update
        handleCloseModal();
        Alert.alert('Success', 'Goal updated successfully');
      } else {
        setError('Failed to update goal. Please try again.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error updating goal:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    > 
    <ScrollView 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.content, isTabletOrLarger && { alignSelf: 'center', width: '60%', maxWidth: 700 }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.userName}>Green Compass</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={24} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Sustainability Dashboard</Text>
          <Text style={styles.cardContent}>
            Track your progress and see how your actions are making a difference.
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalActions || 0}</Text>
              <Text style={styles.statLabel}>Actions Taken</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalCO2Saved?.toFixed(1) || '0'}</Text>
              <Text style={styles.statLabel}>CO₂ Saved (kg)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{overallStreak || 0}</Text>
              <Text style={styles.statLabel}>Streak Days</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.cardTitle}>Your Goals</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.goalsContainer}
          >
            {goals.map((goal) => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalCardHeader}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalCategory}>{goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}</Text>
                </View>
                
                <View style={styles.goalProgress}>
                  <View style={styles.goalProgressBar}>
                    <View 
                      style={[styles.goalProgressFill, { width: `${(goal.progress / goal.target) * 100}%` }]}
                    />
                  </View>
                  <Text style={styles.goalProgressText}>
                    {goal.progress} of {goal.target} actions completed
                  </Text>
                </View>
                
                <View style={styles.goalActions}>
                  <TouchableOpacity 
                    style={styles.goalActionButton}
                    onPress={() => handleEditGoal(goal)}
                  >
                    <Text style={styles.goalActionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.goalActionButton, { marginLeft: 8 }]}
                    onPress={() => router.push('/habits/log' as any)}
                  >
                    <Text style={styles.goalActionText}>Log Action</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickActionItem}
            onPress={() => router.push('/habits/log' as any)}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="add-outline" size={24} color="#2E7D32" />
            </View>
            <Text style={styles.quickActionText}>Log Action</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionItem}
            onPress={() => router.push('/habits/history' as any)}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="calendar-outline" size={24} color="#2E7D32" />
            </View>
            <Text style={styles.quickActionText}>View History</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          style={{ marginTop: 24, marginBottom: 40 }}
          loading={loading}
          disabled={loading}
        />
      </View>
      
      {/* Goal Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Goal</Text>
              <TouchableOpacity style={styles.modalCloseButton} onPress={handleCloseModal}>
                <Ionicons name="close" size={24} color="#2E7D32" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalForm}>
              {error && (
                <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
              )}
              
              <Text style={styles.modalLabel}>Goal Name</Text>
              <Input
                value={editedGoalName}
                onChangeText={setEditedGoalName}
                placeholder="Enter goal name"
              />
              
              <Text style={styles.modalLabel}>Category</Text>
              <Input
                value={editedGoalCategory}
                onChangeText={setEditedGoalCategory}
                placeholder="Enter category (e.g., transport, energy)"
              />
              
              <Text style={styles.modalLabel}>Target Value</Text>
              <Input
                value={editedGoalTarget}
                onChangeText={setEditedGoalTarget}
                placeholder="Enter target value"
                keyboardType="numeric"
              />
              
              <View style={styles.modalButtonContainer}>
                <Button
                  title="Cancel"
                  onPress={handleCloseModal}
                  variant="outline"
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title={updateLoading ? "Saving..." : "Save Changes"}
                  onPress={handleSaveGoal}
                  disabled={updateLoading}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create<Styles>({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  content: {
    width: '100%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#555555',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#555555',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  goalsContainer: {
    paddingBottom: 8,
    paddingTop: 8,
    gap: 12,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: 250,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalCardHeader: {
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  goalCategory: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  goalProgress: {
    marginBottom: 16,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 4,
  },
  goalProgressText: {
    fontSize: 12,
    color: '#555555',
    textAlign: 'right',
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  goalActionButton: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  goalActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2E7D32',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  quickActionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flex: 1,
    minWidth: 90,
    marginHorizontal: 4,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalForm: {
    width: '100%',
  },
  modalLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
