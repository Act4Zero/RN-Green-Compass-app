import { ViewStyle, TextStyle, StyleSheet } from 'react-native';

export interface LogStyles {
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  categoriesContainer: ViewStyle;
  categoryItem: ViewStyle;
  categoryItemSelected: ViewStyle;
  categoryText: TextStyle;
  categoryIcon: ViewStyle;
  subcategoriesContainer: ViewStyle;
  subcategoryItem: ViewStyle;
  subcategoryItemSelected: ViewStyle;
  subcategoryText: TextStyle;
  habitsContainer: ViewStyle;
  habitItem: ViewStyle;
  habitItemSelected: ViewStyle;
  habitTitle: TextStyle;
  habitDescription: TextStyle;
  habitCO2: TextStyle;
  quantityContainer: ViewStyle;
  quantityLabel: TextStyle;
  quantityControls: ViewStyle;
  quantityButton: ViewStyle;
  quantityButtonText: TextStyle;
  quantityValue: TextStyle;
  notesContainer: ViewStyle;
  confirmButton: ViewStyle;
  toastWrapper: ViewStyle;
  toastContainer: ViewStyle;
  toastText: TextStyle;
  habitItemContent: ViewStyle;
  habitItemWrapper: ViewStyle;
  // New style properties for selected habit section
  selectedHabitContainer: ViewStyle;
  selectedHabitHeader: ViewStyle;
  selectedHabitInfo: ViewStyle;
  selectedHabitTitle: TextStyle;
  selectedHabitCO2: TextStyle;
  selectedHabitDescription: TextStyle;
  deselectButton: ViewStyle;
  notesLabel: TextStyle;
  noHabitSelectedContainer: ViewStyle;
  noHabitText: TextStyle;
}

export const LogStyles = StyleSheet.create<LogStyles>({
    keyboardAvoidingContainer: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    scrollContent: {
      flexGrow: 1,
      padding: 16,
    },
    content: {
      width: '100%',
      maxWidth: 500,
      padding: 24,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    backButton: {
      marginRight: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2E7D32',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: '#555555',
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333333',
      marginBottom: 16,
    },
    categoriesContainer: {
      flexDirection: 'row',
      paddingBottom: 8,
      gap: 12,
    },
    categoryItem: {
      alignItems: 'center',
      padding: 12,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      minWidth: 100,
    },
    categoryItemSelected: {
      backgroundColor: '#2E7D32',
      borderColor: '#2E7D32',
    },
    categoryText: {
      fontSize: 14,
      fontWeight: '500',
      marginTop: 8,
    },
    categoryIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#F0F0F0',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    // Subcategory styles
    subcategoriesContainer: {
      flexDirection: 'row',
      paddingBottom: 8,
      paddingRight: 16,
      gap: 12,
    },
    subcategoryItem: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      minWidth: 100,
      width: 110,  // Fixed width for consistent appearance
      height: 60,  // Fixed height for consistent appearance
      marginRight: 4, // Extra spacing between items
    },
    subcategoryItemSelected: {
      backgroundColor: '#2E7D32',
      borderColor: '#2E7D32',
    },
    subcategoryText: {
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
    },
    // Habit container styles
    habitsContainer: {
      flexDirection: 'column',
      gap: 12,
    },
    habitItemWrapper: {
      width: '100%',
    },
    habitItemContent: {
      flex: 1,
      paddingRight: 8,
    },
    habitItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start', // Align to top for better layout with long descriptions
      padding: 16,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    habitItemSelected: {
      backgroundColor: '#2E7D32',
      borderColor: '#2E7D32',
    },
    habitTitle: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 4,
      flexShrink: 1, // Allow text to shrink if needed
    },
    habitDescription: {
      fontSize: 14,
      flexShrink: 1, // Allow text to shrink if needed
    },
    habitCO2: {
      fontSize: 14,
      fontWeight: 'bold',
      marginLeft: 8,
      flexShrink: 0, // Don't allow CO2 value to shrink
      alignSelf: 'flex-start', // Align to top
    },
    // Selected habit section styles
    selectedHabitContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      padding: 16,
      marginBottom: 16,
    },
    selectedHabitHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    selectedHabitInfo: {
      flex: 1,
      paddingRight: 8,
    },
    selectedHabitTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#2E7D32',
      marginBottom: 4,
    },
    selectedHabitDescription: {
      fontSize: 14,
      color: '#555555',
      marginBottom: 16,
    },
    selectedHabitCO2: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#2E7D32',
    },
    deselectButton: {
      padding: 4,
    },
    noHabitSelectedContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      height: 100,
    },
    noHabitText: {
      fontSize: 16,
      color: '#757575',
      textAlign: 'center',
    },
    notesLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333333',
      marginBottom: 8,
    },
    quantityContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      marginBottom: 16,
    },
    quantityLabel: {
      fontSize: 16,
      color: '#333333',
      marginBottom: 16,
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    quantityButton: {
      width: 40,
      height: 40,
      backgroundColor: '#E8F5E9',
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityButtonText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2E7D32',
    },
    quantityValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2E7D32',
      marginHorizontal: 24,
    },
    notesContainer: {
      marginBottom: 16,
    },
    confirmButton: {
      marginBottom: 40,
    },
    toastWrapper: {
      position: 'absolute',
      bottom: 40,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    toastContainer: {
      backgroundColor: '#2E7D32',
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      width: '85%',
      maxWidth: 500,
    },
    toastText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#FFFFFF',
      marginLeft: 8,
    },
  });

  export default LogStyles;
  