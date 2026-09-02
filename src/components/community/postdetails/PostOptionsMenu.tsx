import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWindowDimensions } from 'react-native';
import { useAppLocale } from '@/context/AppLocaleContext';

interface PostOptionsMenuProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
}

interface Styles {
  overlayContainer: ViewStyle;
  overlay: ViewStyle;
  menuContainer: ViewStyle;
  titleText: TextStyle;
  optionItem: ViewStyle;
  optionText: TextStyle;
  divider: ViewStyle;
}

export function PostOptionsMenu({ 
  postId, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: PostOptionsMenuProps) {
  const { width } = useWindowDimensions();
  const { t } = useAppLocale();
  const isTabletOrLarger = width >= 768;

  if (!isOpen) return null;

  return (
    <View style={styles.overlayContainer}>
      {/* Full screen overlay that closes the menu when tapped */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      />
      
      {/* Options menu */}
      <View style={[
        styles.menuContainer,
        { width: isTabletOrLarger ? 240 : 200 }
      ]}>
        <Text style={styles.titleText}>{t('Post Options', 'Опции за публикацията')}</Text>
        
        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => onEdit(postId)}
        >
          <Ionicons name="pencil-outline" size={20} color="#2E7D32" />
          <Text style={[styles.optionText, { color: '#424242' }]}>{t('Edit Post', 'Редактирай')}</Text>
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => onDelete(postId)}
        >
          <Ionicons name="trash-outline" size={20} color="#D32F2F" />
          <Text style={[styles.optionText, { color: '#D32F2F' }]}>{t('Delete Post', 'Изтрий')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Type imports for styles
import { ViewStyle, TextStyle } from 'react-native';

const styles = StyleSheet.create<Styles>({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
    justifyContent: 'center',
    alignItems: 'center'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 9999
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10000,
    zIndex: 10000
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#424242',
    textAlign: 'center'
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10
  },
  optionText: {
    fontSize: 16,
    marginLeft: 10
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 8
  }
});

export default PostOptionsMenu;
