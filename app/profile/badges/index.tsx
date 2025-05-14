import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useBadges } from '@/context/BadgesContext';
import BadgeList from '@/components/badges/BadgeList';
import badgesStyles from '@/styles/Badges.styles';
import { Badge, BadgeCategoryType } from '@/types/community/badges';

export default function BadgesScreen() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const styles = badgesStyles;
  
  const {
    userBadges,
    badgesWithEarnedStatus,
    availableCategories,
    getBadgesByCategory,
    isLoading,
    error,
    loadUserBadges,
    loadAllBadges
  } = useBadges();
  
  const [earnedCategory, setEarnedCategory] = useState<BadgeCategoryType | 'all'>('all');
  const [availableCategory, setAvailableCategory] = useState<BadgeCategoryType | 'all'>('all');
  
  // Map userBadges to a UI-friendly type with badge details and earned status
const mappedEarnedBadges = userBadges
  .map(ub => ub.badge ? { ...ub.badge, isEarned: true, awarded_at: ub.awarded_at } : null)
  .filter((b): b is Badge & { isEarned: boolean; awarded_at: string } => b !== null);

const earnedBadgesByCategory = getBadgesByCategory(mappedEarnedBadges, earnedCategory);
  // Map icon_url to imageUrl for BadgeList
  const allBadgesByCategory = getBadgesByCategory(badgesWithEarnedStatus, availableCategory).map(badge => ({
    ...badge,
    imageUrl: badge.icon_url || undefined,
  }));
  
  // Redirect to signin if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/signin');
    }
  }, [user, authLoading, router]);
  
  // Load badges data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        const loadData = async () => {
          try {
            await Promise.all([
              loadAllBadges(),
              loadUserBadges()
            ]);
          } catch (err) {
            console.error('Error loading badges data:', err);
          }
        };
        
        loadData();
      }
    }, [user, loadAllBadges, loadUserBadges])
  );
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading badges...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingContainer}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentContainer, isTabletOrLarger && { width: '60%', maxWidth: 700 }]}>
          {/* Header */}
          <View style={styles.pageHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#2E7D32" />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Badges</Text>
              <Text style={styles.subtitle}>Track your achievements</Text>
            </View>
          </View>
          
          {/* Earned Badges Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.sectionTitle}>Your Earned Badges</Text>
              <Text style={styles.badgeCountLabel}>
                {userBadges.length} {userBadges.length === 1 ? 'badge' : 'badges'} earned
              </Text>
            </View>
            
            <BadgeList
              title=""
              badges={earnedBadgesByCategory}
              availableCategories={availableCategories}
              selectedCategory={earnedCategory}
              onSelectCategory={setEarnedCategory}
              emptyMessage="You haven't earned any badges yet. Complete activities to earn badges!"
            />
          </View>
          
          {/* Available Badges Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.sectionTitle}>All Available Badges</Text>
              <Text style={styles.badgeCountLabel}>
                {badgesWithEarnedStatus.length} total badges
              </Text>
            </View>
            
            <BadgeList
              title=""
              badges={allBadgesByCategory}
              availableCategories={availableCategories}
              selectedCategory={availableCategory}
              onSelectCategory={setAvailableCategory}
              emptyMessage="No available badges found."
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
