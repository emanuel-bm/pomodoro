import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  summary: {
    padding: 20,
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#6a6a6a',
    marginBottom: 12,
    marginLeft: 4,
  },
  item: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cycleType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e94560',
  },
  deleteText: {
    fontSize: 14,
    color: '#e94560',
  },
  detail: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 4,
  },
  overtime: {
    fontSize: 14,
    color: '#e94560',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#6a6a6a',
    marginTop: 4,
  },
  empty: {
    fontSize: 16,
    color: '#6a6a6a',
    textAlign: 'center',
    marginTop: 48,
  },
});
