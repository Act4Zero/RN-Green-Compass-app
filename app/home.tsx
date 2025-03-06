import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from './context/AuthContext';
import Button from './components/Button';
import { Ionicons } from '@expo/vector-icons';

interface Styles {
  container: ViewStyle;
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
}

export default function Home() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    // Navigation will be handled by the index.tsx redirect
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.content, isTabletOrLarger && { paddingHorizontal: 48 }]}>
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
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Actions Taken</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>CO₂ Saved (kg)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Streak Days</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Take Your First Action</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tips for Today</Text>
          <Text style={styles.cardContent}>
            Try using a reusable water bottle instead of buying bottled water. This simple switch can save hundreds of plastic bottles per year.
          </Text>
        </View>

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          style={{ marginTop: 24, marginBottom: 40 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 24,
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
});
