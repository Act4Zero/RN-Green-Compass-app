import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import FeedStyles from '@/styles/FeedStyles';
import { useAppTheme } from '@/theme';

const styles = FeedStyles;

function FeedHeader() {
  const router = useRouter();
  const { theme } = useAppTheme();
  
  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (typeof router.canGoBack === 'function' ? router.canGoBack() : false) {
              router.back();
            } else {
              router.replace('/home');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Community</Text>
      </View>
      <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Share what works. Find people who keep you moving.</Text>
    </>
  );
}

export default FeedHeader;
