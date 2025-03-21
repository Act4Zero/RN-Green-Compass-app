import React, { useCallback } from 'react';
import { useNavigation, useFocusEffect } from 'expo-router';
import Welcome from './components/Welcome';
import { useAuth } from './context/AuthContext';

export default function Index() {
  // This component renders the Green Compass Welcome page
  const { user, loading } = useAuth();
  const navigation = useNavigation();

  // Prevent "back" navigation unless shouldPreventBack is false
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        e.preventDefault();
      });

      return unsubscribe;
    }, [navigation])
  );

  return <Welcome />;
}
