import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
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
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttons: {
    gap: 12,
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
  buttonDestructive: {
    backgroundColor: '#e94560',
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
