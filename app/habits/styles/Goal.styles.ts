import { ViewStyle, TextStyle, StyleSheet } from "react-native";

export interface Styles {
    keyboardAvoidingContainer: ViewStyle;
    scrollContent: ViewStyle;
    content: ViewStyle;
    backButton: ViewStyle;
    header: ViewStyle;
    title: TextStyle;
    subtitle: TextStyle;
    section: ViewStyle;
    sectionTitle: TextStyle;
    sectionSubtitle: TextStyle;
    optionsContainer: ViewStyle;
    optionItem: ViewStyle;
    optionItemSelected: ViewStyle;
    optionText: TextStyle;
    optionIcon: ViewStyle;
    optionIconSelected: ViewStyle;
    frequencyContainer: ViewStyle;
    frequencyOption: ViewStyle;
    frequencyOptionSelected: ViewStyle;
    frequencyText: TextStyle;
    goalInputContainer: ViewStyle;
    goalNumberContainer: ViewStyle;
    goalNumber: TextStyle;
    goalNumberButton: ViewStyle;
    goalNumberButtonText: TextStyle;
    summaryContainer: ViewStyle;
    summaryText: TextStyle;
    summaryHighlight: TextStyle;
    buttonContainer: ViewStyle;
    skipContainer: ViewStyle;
    skipButton: ViewStyle;
    skipText: TextStyle;
  }

  export const goalStyles = StyleSheet.create<Styles>({
    keyboardAvoidingContainer: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    scrollContent: {
      flexGrow: 1,
      padding: 16,
    },
    content: {
      padding: 24,
    },
    backButton: {
      marginRight: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#2E7D32',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: '#555555',
      lineHeight: 24,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333333',
      marginBottom: 8,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: '#555555',
      marginBottom: 16,
    },
    optionsContainer: {
      flexDirection: 'column',
      gap: 12,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    optionItemSelected: {
      backgroundColor: '#2E7D32',
      borderColor: '#2E7D32',
    },
    optionText: {
      fontSize: 16,
      fontWeight: '500',
      marginLeft: 12,
    },
    optionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#F0F0F0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionIconSelected: {
      backgroundColor: '#FFFFFF',
    },
    frequencyContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      flexWrap: 'wrap',
      gap: 8,
    },
    frequencyOption: {
      flex: 1,
      minWidth: '22%',
      padding: 12,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      marginHorizontal: 2,
      alignItems: 'center',
    },
    frequencyOptionSelected: {
      backgroundColor: '#2E7D32',
      borderColor: '#2E7D32',
    },
    frequencyText: {
      fontSize: 16,
      fontWeight: '500',
    },
    goalInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
    },
    goalNumberContainer: {
      width: 80,
      height: 60,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 16,
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    goalNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2E7D32',
      width: '100%',
      height: '100%',
      textAlignVertical: 'center',
      textAlign: 'center',
      paddingVertical: 0,
    },
    goalNumberButton: {
      width: 50,
      height: 50,
      backgroundColor: '#E8F5E9',
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
    },
    goalNumberButtonText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2E7D32',
    },
    summaryContainer: {
      backgroundColor: '#E8F5E9',
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    summaryText: {
      fontSize: 16,
      color: '#333333',
      lineHeight: 24,
    },
    summaryHighlight: {
      fontWeight: 'bold',
      color: '#2E7D32',
    },
    buttonContainer: {
      marginTop: 24,
      marginBottom: 40,
    },
    skipContainer: {
      alignItems: 'flex-end',
      marginBottom: 8,
    },
    skipButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
    },
    skipText: {
      color: '#666',
      marginRight: 4,
      fontSize: 14,
    },
  });
    
export default goalStyles;