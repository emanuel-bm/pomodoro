import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#2a2a4a',
  },
  typeChipActive: {
    backgroundColor: '#e94560',
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a0a0a0',
  },
  typeChipTextActive: {
    color: '#fff',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#a0a0a0',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#2a2a4a',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#fff',
  },
  valueButton: {
    backgroundColor: '#2a2a4a',
    borderRadius: 10,
    padding: 12,
  },
  valueButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  error: {
    fontSize: 13,
    color: '#e94560',
    marginBottom: 12,
  },
  buttons: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#2a2a4a',
  },
  buttonPrimary: {
    backgroundColor: '#e94560',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3a3a5a',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonTextCancel: {
    color: '#a0a0a0',
    fontWeight: '500',
  },
});
