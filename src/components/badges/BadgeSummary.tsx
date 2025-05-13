import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface BadgeSummaryProps {
  badgeCount: number;
}

function BadgeSummary({ badgeCount }: BadgeSummaryProps) {
  const router = useRouter();

  const handleViewAllBadges = () => {
    router.push('/profile/badges' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.summaryHeader}>
        <View style={styles.titleContainer}>
          <Ionicons name="trophy" size={20} color="#2E7D32" style={{marginRight: 8}} />
          <Text style={styles.title}>Achievements</Text>
        </View>
        <Text style={styles.count}>
          {badgeCount} {badgeCount === 1 ? 'badge' : 'badges'} earned
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.viewAllButton} 
        onPress={handleViewAllBadges}
      >
        <Text style={styles.viewAllButtonText}>View all badges</Text>
        <Ionicons name="chevron-forward" size={16} color="#2E7D32" />
      </TouchableOpacity>
    </View>
  );
}

interface Styles {
  container: ViewStyle;
  summaryHeader: ViewStyle;
  titleContainer: ViewStyle;
  titleIcon: ViewStyle;
  title: TextStyle;
  count: TextStyle;
  viewAllButton: ViewStyle;
  viewAllButtonText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: '100%' as any,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  count: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.3)',
  },
  viewAllButtonText: {
    color: '#2E7D32',
    marginRight: 5,
    fontWeight: '600',
  },
});

export default BadgeSummary;
