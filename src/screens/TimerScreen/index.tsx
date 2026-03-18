import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useApp } from '@/context/AppContext';
import { getCycleLabel, getCycleProgress } from '@/cycleLogic';
import { styles } from '@/screens/TimerScreen/styles';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function TimerScreen() {
  const {
    timerState,
    settings,
    startCycle,
    pauseCycle,
    resumeCycle,
    resetCycle,
    finishCycle,
    remainingSeconds,
    elapsedSeconds,
    isOvertime,
  } = useApp();

  const { current, total } = getCycleProgress(
    timerState.cycleType,
    timerState.currentFocusCount,
    settings.longBreakInterval
  );
  const cycleLabel = getCycleLabel(timerState.cycleType);

  const handleFinish = () => {
    finishCycle(false);
  };

  const displaySeconds = isOvertime ? elapsedSeconds - timerState.plannedDurationSeconds : remainingSeconds;
  const isOvertimeDisplay = isOvertime;

  return (
    <View style={styles.container}>
      <Text style={styles.cycleType}>{cycleLabel}</Text>
      <Text style={styles.progress}>
        {timerState.cycleType === 'focus'
          ? `Focus ${current} of ${total}`
          : cycleLabel}
      </Text>

      <View style={styles.timerContainer}>
        <Text
          style={[
            styles.timer,
            isOvertimeDisplay && styles.timerOvertime,
          ]}
        >
          {isOvertimeDisplay ? '+' : ''}{formatTime(displaySeconds)}
        </Text>
        <Text style={styles.timerLabel}>
          {isOvertimeDisplay ? 'Overtime' : 'Remaining'}
        </Text>
      </View>

      <Text style={styles.status}>{timerState.status.toUpperCase()}</Text>

      <View style={styles.controls}>
        {timerState.status === 'idle' && (
          <TouchableOpacity style={styles.primaryButton} onPress={startCycle}>
            <Text style={styles.primaryButtonText}>Start</Text>
          </TouchableOpacity>
        )}

        {timerState.status === 'running' && (
          <>
            <TouchableOpacity style={styles.button} onPress={pauseCycle}>
              <Text style={styles.buttonText}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
              <Text style={styles.primaryButtonText}>Finish</Text>
            </TouchableOpacity>
          </>
        )}

        {timerState.status === 'paused' && (
          <>
            <TouchableOpacity style={styles.button} onPress={resumeCycle}>
              <Text style={styles.buttonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={resetCycle}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
              <Text style={styles.primaryButtonText}>Finish</Text>
            </TouchableOpacity>
          </>
        )}

        {timerState.status === 'overtime' && (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={() => finishCycle(false)}
            >
              <Text style={styles.buttonText}>
                Record {formatTime(timerState.plannedDurationSeconds)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => finishCycle(true)}
            >
              <Text style={styles.primaryButtonText}>
                Record {formatTime(elapsedSeconds)} (overtime)
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
