import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0f0f1a',
  },
  cycleType: {
    fontSize: 24,
    fontWeight: '600',
    color: '#e94560',
    marginBottom: 8,
  },
  progress: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 32,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timer: {
    fontSize: 72,
    fontWeight: '200',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  timerOvertime: {
    color: '#e94560',
  },
  timerLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginTop: 8,
  },
  status: {
    fontSize: 12,
    color: '#6a6a6a',
    letterSpacing: 2,
    marginBottom: 48,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  button: {
    padding: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#1a1a2e',
  },
  primaryButton: {
    padding: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#e94560',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
