import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import { styles } from '@/components/Alert/styles';

export type AlertButtonStyle = 'default' | 'cancel' | 'destructive';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: AlertButtonStyle;
}

export interface AlertOptions {
  title: string;
  message?: string;
  buttons: AlertButton[];
}

interface AlertContextValue {
  alert: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within AlertProvider');
  return ctx;
}

interface AlertState extends AlertOptions {
  visible: boolean;
}

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AlertState>({
    visible: false,
    title: '',
    buttons: [],
  });

  const hide = useCallback(() => {
    setState((s) => ({ ...s, visible: false }));
  }, []);

  const alert = useCallback((options: AlertOptions) => {
    setState({
      visible: true,
      title: options.title,
      message: options.message,
      buttons: options.buttons,
    });
  }, []);

  const handlePress = useCallback(
    (button: AlertButton) => {
      hide();
      button.onPress?.();
    },
    [hide]
  );

  return (
    <AlertContext.Provider value={{ alert }}>
      {children}
      <Modal
        visible={state.visible}
        transparent
        animationType="fade"
        onRequestClose={hide}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={hide}
          />
          <View style={styles.container}>
            <Text style={styles.title}>{state.title}</Text>
            {state.message ? (
              <Text style={styles.message}>{state.message}</Text>
            ) : null}
            <View style={styles.buttons}>
              {state.buttons.map((btn, i) => {
                const isCancel = btn.style === 'cancel';
                const isDestructive = btn.style === 'destructive';
                const isPrimary = !isCancel && (isDestructive || !isCancel);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.button,
                      isPrimary && styles.buttonPrimary,
                      isDestructive && styles.buttonDestructive,
                      isCancel && styles.buttonCancel,
                    ]}
                    onPress={() => handlePress(btn)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        isCancel && styles.buttonTextCancel,
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}
