import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import type { CycleType, HistoryEntry, Settings } from '@/types';
import { getCycleLabel } from '@/cycleLogic';
import {
  applyDurationEdit,
  applyEndEdit,
  applyStartEdit,
  applyTypeChange,
  buildHistoryEntryFromTriangle,
  computePlannedBaselineSeconds,
  initTriangleDefault,
  initTriangleFromEntry,
  isValidTriangle,
  type TimeTriangleState,
} from '@/timeEntryLogic';
import { styles } from '@/components/TimeEntryModal/styles';

export interface TimeEntryModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialEntry?: HistoryEntry;
  settings: Settings;
  onSave: (entry: HistoryEntry, isNew: boolean) => void;
  onClose: () => void;
}

const CREATE_TYPES: CycleType[] = ['focus', 'short_break'];
const EDIT_TYPES: CycleType[] = ['focus', 'short_break', 'long_break'];

function typeLabel(cycleType: CycleType, mode: 'create' | 'edit'): string {
  if (mode === 'create' && cycleType === 'short_break') return 'Break';
  return getCycleLabel(cycleType);
}

function formatDateTime(date: Date): string {
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function pickDateTime(initial: Date, onConfirm: (date: Date) => void) {
  DateTimePickerAndroid.open({
    value: initial,
    mode: 'date',
    onChange: (dateEvent, selectedDate) => {
      if (dateEvent.type !== 'set' || !selectedDate) return;
      DateTimePickerAndroid.open({
        value: initial,
        mode: 'time',
        is24Hour: true,
        onChange: (timeEvent, selectedTime) => {
          if (timeEvent.type !== 'set' || !selectedTime) return;
          const combined = new Date(selectedDate);
          combined.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
          onConfirm(combined);
        },
      });
    },
  });
}

export function TimeEntryModal({
  visible,
  mode,
  initialEntry,
  settings,
  onSave,
  onClose,
}: TimeEntryModalProps) {
  const [state, setState] = useState<TimeTriangleState>(() =>
    mode === 'edit' && initialEntry
      ? initTriangleFromEntry(initialEntry)
      : initTriangleDefault('focus', settings)
  );
  const [durationText, setDurationText] = useState(String(Math.round(state.durationMinutes)));

  useEffect(() => {
    if (!visible) return;
    const initial =
      mode === 'edit' && initialEntry
        ? initTriangleFromEntry(initialEntry)
        : initTriangleDefault('focus', settings);
    setState(initial);
    setDurationText(String(Math.round(initial.durationMinutes)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialEntry, mode]);

  const availableTypes = mode === 'create' ? CREATE_TYPES : EDIT_TYPES;
  const typeChanged = mode === 'edit' && initialEntry != null && state.cycleType !== initialEntry.cycleType;
  const plannedDurationSeconds = computePlannedBaselineSeconds(
    state.cycleType,
    settings,
    mode === 'edit' ? initialEntry ?? null : null,
    typeChanged
  );
  const willOvertime = state.durationMinutes * 60 > plannedDurationSeconds;
  const valid = isValidTriangle(state);

  const handleTypeChange = (newType: CycleType) => {
    const next = applyTypeChange(state, newType, settings);
    setState(next);
    setDurationText(String(Math.round(next.durationMinutes)));
  };

  const handleDurationChange = (text: string) => {
    setDurationText(text.replace(/[^0-9]/g, ''));
  };

  const handleDurationBlur = () => {
    const minutes = parseInt(durationText, 10);
    if (!Number.isFinite(minutes) || minutes < 0) {
      setDurationText(String(Math.round(state.durationMinutes)));
      return;
    }
    setState((s) => applyDurationEdit(s, minutes));
  };

  const handlePickStart = () => {
    pickDateTime(state.start, (picked) => {
      setState((s) => applyStartEdit(s, picked));
    });
  };

  const handlePickEnd = () => {
    pickDateTime(state.end, (picked) => {
      setState((s) => applyEndEdit(s, picked));
    });
  };

  useEffect(() => {
    setDurationText(String(Math.round(state.durationMinutes)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.start, state.end]);

  const handleSave = () => {
    if (!valid) return;
    const entry = buildHistoryEntryFromTriangle(
      state,
      plannedDurationSeconds,
      mode === 'edit' ? initialEntry?.id : undefined
    );
    onSave(entry, mode === 'create');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />
        <View style={styles.container}>
          <Text style={styles.title}>
            {mode === 'create' ? 'Registrar tempo' : 'Editar registro'}
          </Text>

          <View style={styles.typeRow}>
            {availableTypes.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeChip, state.cycleType === t && styles.typeChipActive]}
                onPress={() => handleTypeChange(t)}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    state.cycleType === t && styles.typeChipTextActive,
                  ]}
                >
                  {typeLabel(t, mode)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Duração (minutos)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={durationText}
              onChangeText={handleDurationChange}
              onBlur={handleDurationBlur}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Início</Text>
            <TouchableOpacity style={styles.valueButton} onPress={handlePickStart}>
              <Text style={styles.valueButtonText}>{formatDateTime(state.start)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Fim</Text>
            <TouchableOpacity style={styles.valueButton} onPress={handlePickEnd}>
              <Text style={styles.valueButtonText}>{formatDateTime(state.end)}</Text>
            </TouchableOpacity>
          </View>

          {!valid && (
            <Text style={styles.error}>Fim precisa ser depois do início.</Text>
          )}
          {valid && willOvertime && (
            <Text style={styles.error}>Será registrado com overtime.</Text>
          )}

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, !valid && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={!valid}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={onClose} activeOpacity={0.8}>
              <Text style={[styles.buttonText, styles.buttonTextCancel]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
