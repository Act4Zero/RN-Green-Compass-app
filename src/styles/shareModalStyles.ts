import { StyleSheet } from 'react-native';

export const shareModalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: '100%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  closeButton: {
    padding: 4,
    margin: -4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
    marginHorizontal: -16,
  },
  cardContainer: {
    marginVertical: 12,
    alignItems: 'center',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  sharingOptions: {
    marginTop: 12,
    alignItems: 'center',
  },
  sharingOptionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  platformButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
    maxWidth: '100%',
    gap: 10,
  },
  platformRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  successMessage: {
    marginTop: 12,
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  errorMessage: {
    marginTop: 12,
    fontSize: 13,
    color: '#D32F2F',
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 2,
    minWidth: 64,
  }
});

export type ShareModalStyles = typeof shareModalStyles;
