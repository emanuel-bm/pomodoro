import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { icons, type IconName } from '@/assets/icons';

export interface IconProps extends Omit<SvgProps, 'style'> {
  name: IconName;
  style?: StyleProp<ViewStyle>;
  width?: number;
  height?: number;
  color?: string;
  stroke?: string;
  fill?: string;
}

export function Icon({
  name,
  style,
  width = 24,
  height = 24,
  color,
  stroke = 'currentColor',
  fill = 'none',
  ...props
}: IconProps) {
  const SvgComponent = icons[name];
  return (
    <SvgComponent
      width={width}
      height={height}
      stroke={color ?? stroke}
      fill={fill}
      style={style}
      {...props}
    />
  );
}
