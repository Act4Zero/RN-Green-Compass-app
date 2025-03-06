import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import Welcome from './components/Welcome';
import { useAuth } from './context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  // If the user is authenticated, redirect to the home screen
  if (user && !loading) {
    return <Redirect href="/home" />;
  }

  // Show loading indicator while checking authentication status
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  // If user is not authenticated, show the welcome screen
  return <Welcome />;
}
