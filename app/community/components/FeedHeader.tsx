import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import FeedStyles from '../styles/FeedStyles';

const styles = FeedStyles;

function FeedHeader() {
  const router = useRouter();
  
  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.title}>Community</Text>
      </View>
      <Text style={styles.subtitle}>Share and learn with fellow eco-enthusiasts</Text>
    </>
  );
}

export default FeedHeader;
