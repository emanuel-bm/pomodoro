import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import { AlertProvider } from './src/components/Alert';
import { Icon } from './src/components/ui/Icon';
import TimerScreen from './src/screens/TimerScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function TabIcon({
  name,
  focused,
  color,
  size = 24,
}: {
  name: React.ComponentProps<typeof Icon>['name'];
  focused: boolean;
  color: string;
  size?: number;
}) {
  return <Icon name={name} width={size} height={size} color={color} />;
}

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#e94560',
    background: '#0f0f1a',
    card: '#1a1a2e',
    text: '#fff',
    border: '#2a2a4a',
    notification: '#e94560',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AlertProvider>
          <NavigationContainer theme={theme}>
          <Tab.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: '#1a1a2e' },
              headerTintColor: '#fff',
              tabBarStyle: { backgroundColor: '#1a1a2e' },
              tabBarActiveTintColor: '#e94560',
              tabBarInactiveTintColor: '#6a6a6a',
            }}
          >
            <Tab.Screen
              name="Timer"
              component={TimerScreen}
              options={{
                title: 'Pomodoro',
                tabBarIcon: ({ focused, color, size }) => (
                  <TabIcon name="clock" focused={focused} color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="History"
              component={HistoryScreen}
              options={{
                tabBarIcon: ({ focused, color, size }) => (
                  <TabIcon name="chart-column-increasing" focused={focused} color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                tabBarIcon: ({ focused, color, size }) => (
                  <TabIcon name="settings" focused={focused} color={color} size={size} />
                ),
              }}
            />
          </Tab.Navigator>
          </NavigationContainer>
          <StatusBar style="light" />
        </AlertProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
