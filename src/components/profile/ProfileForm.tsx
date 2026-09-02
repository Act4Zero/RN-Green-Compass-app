import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  TouchableOpacity,
  Image,
  ScrollView,
  ViewStyle,
  TextStyle,
  ImageStyle,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SUSTAINABILITY_INTERESTS } from '../../types/profiles';
import { useAppLocale } from '@/context/AppLocaleContext';

const INTERESTS_BG: Record<string, string> = {
  'Zero Waste': 'Нулеви отпадъци', 'Clean Energy': 'Чиста енергия', 'Sustainable Food': 'Устойчива храна',
  'Ethical Fashion': 'Етична мода', Conservation: 'Опазване на природата', 'Climate Action': 'Действия за климата',
  'Water Conservation': 'Опазване на водата', 'Green Transportation': 'Зелен транспорт', Permaculture: 'Пермакултура',
  'Sustainable Building': 'Устойчиво строителство',
};

interface Styles {
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  formContainer: ViewStyle;
  heading: TextStyle;
  formGroup: ViewStyle;
  label: TextStyle;
  input: TextStyle;
  switchRow: ViewStyle;
  switchLabel: TextStyle;
  switchDescription: TextStyle;
  interestsContainer: ViewStyle;
  interestItem: ViewStyle;
  interestSelected: ViewStyle;
  interestText: TextStyle;
  selectedInterestText: TextStyle;
  errorText: TextStyle;
  submitButton: ViewStyle;
  submitButtonText: TextStyle;
  avatarContainer: ViewStyle;
  avatar: ImageStyle;
  avatarPlaceholder: ViewStyle;
  uploadButton: ViewStyle;
  uploadButtonText: TextStyle;
}

interface ProfileFormProps {
  initialValues?: {
    display_name: string;
    is_anonymous: boolean;
    interests: string[];
    avatar_url?: string | null;
  };
  onSubmit: (values: {
    display_name: string;
    is_anonymous: boolean;
    interests: string[];
    avatar?: any;
  }) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export default function ProfileForm({
  initialValues = {
    display_name: '',
    is_anonymous: false,
    interests: [],
    avatar_url: null,
  },
  onSubmit,
  isLoading,
  error,
}: ProfileFormProps) {
  const { locale, t } = useAppLocale();
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const [displayName, setDisplayName] = useState(initialValues.display_name);
  const [isAnonymous, setIsAnonymous] = useState(initialValues.is_anonymous);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(Array.isArray(initialValues.interests) ? initialValues.interests : []);
  const [avatar, setAvatar] = useState<any>(null);
  // Ensure avatarUrl is always a string or null, never undefined
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialValues.avatar_url || null);
  const [validationErrors, setValidationErrors] = useState<{
    displayName?: string;
    interests?: string;
  }>({});
  
  const router = useRouter();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert(t('Sorry, we need photo library permission to make this work!', 'Необходимо е разрешение за достъп до снимките.'));
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets[0]) {
      setAvatar(result.assets[0]);
      setAvatarUrl(result.assets[0].uri);
    }
  };
  
  const toggleInterest = (interest: string) => {
    // Verify the interest is from the allowed list
    if (!SUSTAINABILITY_INTERESTS.includes(interest)) {
      console.warn('Attempted to toggle invalid interest:', interest);
      return;
    }
    
    // Ensure selectedInterests is an array before using array methods
    const currentInterests = Array.isArray(selectedInterests) ? selectedInterests : [];
    
    if (currentInterests.includes(interest)) {
      setSelectedInterests(currentInterests.filter(item => item !== interest));
    } else {
      setSelectedInterests([...currentInterests, interest]);
    }
    
    // Clear validation error when user selects interests
    if (validationErrors.interests) {
      setValidationErrors(prev => ({ ...prev, interests: undefined }));
    }
  };
  
  const validateDisplayName = (name: string): boolean => {
    // Trim the display name to remove any leading/trailing whitespace
    const trimmedName = name.trim();
    
    // Only validate if not anonymous
    if (isAnonymous) {
      return true;
    }
    
    if (!trimmedName) {
      setValidationErrors(prev => ({ ...prev, displayName: t('Display name is required when not anonymous', 'Името е задължително, когато профилът не е анонимен') }));
      return false;
    } else if (trimmedName.length > 40) {
      setValidationErrors(prev => ({ ...prev, displayName: t('Display name is too long', 'Името е твърде дълго') }));
      return false;
    }
    
    // Check for potentially dangerous characters (HTML/script injection)
    const dangerousCharsRegex = /[<>\\]/;
    if (dangerousCharsRegex.test(trimmedName)) {
      setValidationErrors(prev => ({ ...prev, displayName: t('Display name contains invalid characters', 'Името съдържа невалидни знаци') }));
      return false;
    }
    
    // Remove displayName error if validation passes
    setValidationErrors(prev => ({ ...prev, displayName: undefined }));
    return true;
  };
  
  const validateInterests = (): boolean => {
    // Ensure selectedInterests is an array before using array methods
    const interestsArray = Array.isArray(selectedInterests) ? selectedInterests : [];
    
    if (interestsArray.length === 0) {
      setValidationErrors(prev => ({ ...prev, interests: t('Please select at least one interest', 'Изберете поне един интерес') }));
      return false;
    }
    
    // Validate that each interest is from the allowed list
    const invalidInterests = interestsArray.filter(interest => 
      !SUSTAINABILITY_INTERESTS.includes(interest)
    );
    
    if (invalidInterests.length > 0) {
      setValidationErrors(prev => ({ ...prev, interests: t('Contains invalid interest selections', 'Има невалидно избрани интереси') }));
      return false;
    }
    
    // Remove interests error if validation passes
    setValidationErrors(prev => ({ ...prev, interests: undefined }));
    return true;
  };
  
  const validateForm = (): boolean => {
    // Reset all validation errors
    setValidationErrors({});
    
    const isDisplayNameValid = validateDisplayName(displayName);
    const areInterestsValid = validateInterests();
    
    return isDisplayNameValid && areInterestsValid;
  };
  
  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        // Sanitize inputs before submission
        const sanitizedDisplayName = displayName.trim();
        
        // Validate interests one more time to ensure they're from allowed list
        const validInterests = selectedInterests.filter(interest => 
          SUSTAINABILITY_INTERESTS.includes(interest)
        );
        
        await onSubmit({
          display_name: sanitizedDisplayName,
          is_anonymous: isAnonymous,
          interests: validInterests,
          avatar: avatar,
        });
      } catch (err) {
        console.error('Profile submission error:', err);
      }
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingContainer}
    >
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={[styles.formContainer, isTabletOrLarger && { maxWidth: 600, alignSelf: 'center' }]}>
          {/* Avatar Upload */}
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image 
                source={{ uri: avatarUrl }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={{ color: '#2E7D32' }}>{t('No Image', 'Няма снимка')}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.uploadButtonText}>
                {avatarUrl ? t('Change Photo', 'Смени снимката') : t('Upload Photo', 'Качи снимка')}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Display Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('Display Name', 'Показвано име')}</Text>
            <TextInput
              style={styles.input as any}
              value={displayName}
              onChangeText={(text) => {
                setDisplayName(text);
                // Clear validation error when user types
                if (validationErrors.displayName) {
                  setValidationErrors(prev => ({ ...prev, displayName: undefined }));
                }
              }}
              placeholder={t('How would you like to be known?', 'Как искате да ви познават?')}
              autoCapitalize="words"
              maxLength={40}
              onBlur={() => validateDisplayName(displayName)}
            />
            {validationErrors.displayName && (
              <Text style={styles.errorText}>{validationErrors.displayName}</Text>
            )}
          </View>
          
          {/* Anonymity Toggle */}
          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{t('Stay Anonymous', 'Остани анонимен')}</Text>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: '#767577', true: '#2E7D32' }}
                thumbColor={isAnonymous ? '#4CAF50' : '#f4f3f4'}
              />
            </View>
            <Text style={styles.switchDescription}>
              {isAnonymous
                ? t('Your identity will be hidden in community features', 'Самоличността ви ще бъде скрита в общността')
                : t('Your display name will be visible to others', 'Показваното ви име ще е видимо за другите')}
            </Text>
          </View>
          
          {/* Interests Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('Your Sustainability Interests', 'Вашите интереси в устойчивостта')}</Text>
            <View style={styles.interestsContainer}>
              {SUSTAINABILITY_INTERESTS.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.interestItem,
                    selectedInterests.includes(interest) && styles.interestSelected,
                  ]}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text
                    style={[
                      styles.interestText,
                      selectedInterests.includes(interest) && styles.selectedInterestText,
                    ]}
                  >
                    {locale === 'bg' ? INTERESTS_BG[interest] || interest : interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {validationErrors.interests && (
              <Text style={styles.errorText}>{validationErrors.interests}</Text>
            )}
          </View>
          
          {/* Error Message */}
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? t('Saving...', 'Запазване...') : t('Save Profile', 'Запази профила')}
            </Text>
          </TouchableOpacity>
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
  formContainer: {
    width: '100%',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#2E7D32',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: '#333333',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.3)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  } as TextStyle,
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  switchDescription: {
    fontSize: 12,
    color: '#555555',
    marginBottom: 4,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  interestItem: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.3)',
  },
  interestSelected: {
    backgroundColor: '#2E7D32',
    borderColor: '#1B5E20',
  },
  interestText: {
    color: '#2E7D32',
  },
  selectedInterestText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    color: '#D32F2F',
    marginTop: 5,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.3)',
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
