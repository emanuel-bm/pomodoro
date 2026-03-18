import { registerRootComponent } from 'expo';
import { setupBackgroundEventHandler } from '@/notifications';
import App from './App';

setupBackgroundEventHandler();

registerRootComponent(App);
