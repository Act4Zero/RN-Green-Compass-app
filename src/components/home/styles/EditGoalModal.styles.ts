import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface EditGoalModalStyles {
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  modalHeader: ViewStyle;
  modalTitle: TextStyle;
  modalCloseButton: ViewStyle;
  modalForm: ViewStyle;
  modalLabel: TextStyle;
  modalInput: ViewStyle;
  modalButtonContainer: ViewStyle;
  deleteButton: ViewStyle;
  deleteButtonText: TextStyle;
  timeChip: ViewStyle;
  timeChipText: TextStyle;
}

export const editGoalModalStyles = StyleSheet.create<EditGoalModalStyles>({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalForm: {
    width: '100%',
  },
  modalLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 8,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D32F2F',
    backgroundColor: '#FFEBEE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  deleteButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: '600',
  },
  timeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#E8F5E9',
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginRight: 10,
    marginBottom: 10,
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
});

// Default export to fix the "missing required default export" warning
export default editGoalModalStyles;
