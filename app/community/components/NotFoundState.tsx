import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import PostDetailStyles from '../styles/PostDetailStyles';

const styles = PostDetailStyles;

interface NotFoundStateProps {
  message?: string;
  buttonText?: string;
}

function NotFoundState({
  message = "Post not found",
  buttonText = "Go Back"
}: NotFoundStateProps) {
  const router = useRouter();
  
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default NotFoundState;
