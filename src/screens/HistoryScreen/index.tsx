import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import type { HistoryEntry } from '../../types';
import { getCycleLabel } from '../../cycleLogic';
import { styles } from './styles';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (s === 0) return `${m} min`;
  return `${m} min ${s} sec`;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString();
}

function HistoryItem({
  entry,
  onDelete,
}: {
  entry: HistoryEntry;
  onDelete: () => void;
}) {
  const label = getCycleLabel(entry.cycleType);
  const overtime = entry.hadOvertime
    ? entry.recordedDurationSeconds - entry.plannedDurationSeconds
    : 0;

  return (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.cycleType}>{label}</Text>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.detail}>
        Planned: {formatDuration(entry.plannedDurationSeconds)}
      </Text>
      <Text style={styles.detail}>
        Recorded: {formatDuration(entry.recordedDurationSeconds)}
      </Text>
      {entry.hadOvertime && (
        <Text style={styles.overtime}>
          Overtime: +{formatDuration(overtime)}
        </Text>
      )}
      <Text style={styles.time}>
        {formatTime(entry.startedAt)} - {formatTime(entry.endedAt)}
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const { history, deleteHistoryItem, refreshHistory } = useApp();

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const today = new Date().toDateString();
  const todayFocus = history.filter(
    (e) =>
      e.cycleType === 'focus' &&
      new Date(e.endedAt).toDateString() === today
  );
  const todayBreaks = history.filter(
    (e) =>
      (e.cycleType === 'short_break' || e.cycleType === 'long_break') &&
      new Date(e.endedAt).toDateString() === today
  );
  const focusSecondsToday = todayFocus.reduce(
    (acc, e) => acc + e.recordedDurationSeconds,
    0
  );
  const breakSecondsToday = todayBreaks.reduce(
    (acc, e) => acc + e.recordedDurationSeconds,
    0
  );

  const grouped = history.reduce<Record<string, HistoryEntry[]>>((acc, e) => {
    const date = new Date(e.endedAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(e);
    return acc;
  }, {});
  const sections = Object.entries(grouped).sort(
    ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
  );

  const handleDelete = (id: string) => {
    Alert.alert('Delete Entry', 'Remove this session from history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHistoryItem(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Today</Text>
        <Text style={styles.summaryText}>
          Focus: {todayFocus.length} cycles, {formatDuration(focusSecondsToday)}
        </Text>
        <Text style={styles.summaryText}>
          Breaks: {todayBreaks.length} cycles, {formatDuration(breakSecondsToday)}
        </Text>
      </View>

      <FlatList
        data={sections}
        keyExtractor={([date]) => date}
        renderItem={({ item: [date, entries] }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{formatDate(entries[0].endedAt)}</Text>
            {entries.map((entry) => (
              <HistoryItem
                key={entry.id}
                entry={entry}
                onDelete={() => handleDelete(entry.id)}
              />
            ))}
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No sessions yet</Text>
        }
      />
    </View>
  );
}
