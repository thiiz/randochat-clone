'use client';

import { useThemeConfig } from '@/components/active-theme';
import NextTopLoader from 'nextjs-toploader';

const THEME_COLORS = {
  emerald: '#10b981',
  'emerald-scaled': '#10b981',
  blue: '#3b82f6',
  'blue-scaled': '#3b82f6',
  green: '#65a30d',
  'green-scaled': '#65a30d',
  amber: '#d97706',
  'amber-scaled': '#d97706',
  default: '#525252',
  'default-scaled': '#525252',
  'mono-scaled': '#525252'
};

export function TopLoader() {
  const { activeTheme } = useThemeConfig();
  const color = THEME_COLORS[activeTheme as keyof typeof THEME_COLORS] || THEME_COLORS.blue;

  return <NextTopLoader color={color} showSpinner={false} />;
}
