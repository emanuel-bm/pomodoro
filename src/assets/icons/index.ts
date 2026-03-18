import ClockIcon from './clock.svg';
import ChartColumnIncreasingIcon from './chart-column-increasing.svg';
import SettingsIcon from './settings.svg';

export const icons = {
  clock: ClockIcon,
  'chart-column-increasing': ChartColumnIncreasingIcon,
  settings: SettingsIcon,
} as const;

export type IconName = keyof typeof icons;
