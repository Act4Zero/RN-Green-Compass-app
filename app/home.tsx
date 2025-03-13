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
} from 'react-native';
import { useAuth } from './context/AuthContext';
import Button from './components/Button';
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
  const { userGoals, loading: goalsLoading } = useGoals();

  // Use real goals data from the database
  const [goals, setGoals] = useState<any[]>([]);

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
});
