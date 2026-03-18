import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useApp } from '@/context/AppContext';
import { styles } from '@/screens/SettingsScreen/styles';

const BOUNDS = {
  focusMinutes: { min: 1, max: 120 },
  shortBreakMinutes: { min: 1, max: 60 },
  longBreakMinutes: { min: 1, max: 60 },
  longBreakInterval: { min: 1, max: 10 },
} as const;

type SettingKey = keyof typeof BOUNDS;

function useSettingInput(
  key: SettingKey,
  value: number,
  onUpdate: (updates: Partial<Record<SettingKey, number>>) => void
) {
  const [local, setLocal] = useState(String(value));

  useEffect(() => {
    setLocal(String(value));
  }, [value]);

  const handleBlur = useCallback(() => {
    const n = parseInt(local, 10);
    const bounds = BOUNDS[key];
    if (!isNaN(n) && n >= bounds.min && n <= bounds.max) {
      onUpdate({ [key]: n });
    } else {
      const fallback = value;
      setLocal(String(fallback));
      onUpdate({ [key]: fallback });
    }
  }, [local, key, value, onUpdate]);

  return { local, setLocal, handleBlur };
}

export default function SettingsScreen() {
  const { settings, updateSettings } = useApp();

  const focus = useSettingInput('focusMinutes', settings.focusMinutes, updateSettings);
  const shortBreak = useSettingInput('shortBreakMinutes', settings.shortBreakMinutes, updateSettings);
  const longBreak = useSettingInput('longBreakMinutes', settings.longBreakMinutes, updateSettings);
  const interval = useSettingInput('longBreakInterval', settings.longBreakInterval, updateSettings);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Time</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Focus (minutes)</Text>
          <TextInput
            style={styles.input}
            value={focus.local}
            onChangeText={focus.setLocal}
            onBlur={focus.handleBlur}
            keyboardType="number-pad"
            placeholder="25"
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Short break (minutes)</Text>
          <TextInput
            style={styles.input}
            value={shortBreak.local}
            onChangeText={shortBreak.setLocal}
            onBlur={shortBreak.handleBlur}
            keyboardType="number-pad"
            placeholder="5"
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Long break (minutes)</Text>
          <TextInput
            style={styles.input}
            value={longBreak.local}
            onChangeText={longBreak.setLocal}
            onBlur={longBreak.handleBlur}
            keyboardType="number-pad"
            placeholder="15"
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Focus cycles before long break</Text>
          <TextInput
            style={styles.input}
            value={interval.local}
            onChangeText={interval.setLocal}
            onBlur={interval.handleBlur}
            keyboardType="number-pad"
            placeholder="4"
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Behavior</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Auto start next cycle</Text>
          <Switch
            value={settings.autoStartNextCycle}
            onValueChange={(v) => updateSettings({ autoStartNextCycle: v })}
            trackColor={{ false: '#333', true: '#e94560' }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Sound on completion</Text>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(v) => updateSettings({ soundEnabled: v })}
            trackColor={{ false: '#333', true: '#e94560' }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Vibration on completion</Text>
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={(v) => updateSettings({ vibrationEnabled: v })}
            trackColor={{ false: '#333', true: '#e94560' }}
            thumbColor="#fff"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
