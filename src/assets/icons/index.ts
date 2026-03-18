import ClockIcon from '@/assets/icons/clock.svg';
import ChartColumnIncreasingIcon from '@/assets/icons/chart-column-increasing.svg';
import SettingsIcon from '@/assets/icons/settings.svg';

export const icons = {
  clock: ClockIcon,
  'chart-column-increasing': ChartColumnIncreasingIcon,
  settings: SettingsIcon,
} as const;

export type IconName = keyof typeof icons;
