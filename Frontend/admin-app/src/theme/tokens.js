import { Platform } from 'react-native';

export const colors = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceHover: '#F3F4F6',
  surfaceSecondary: '#F4F5F7',
  input: '#F3F4F6',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  accent: '#111827',
  accentLight: '#374151',
  accentGlow: 'rgba(17,24,39,0.06)',
  primary: '#2563EB',
  primaryTint: 'rgba(37,99,235,0.1)',
  primaryForeground: '#FFFFFF',
  success: '#16A34A',
  successTint: 'rgba(22,163,74,0.1)',
  warning: '#F59E0B',
  warningTint: 'rgba(245,158,11,0.12)',
  danger: '#EF4444',
  dangerTint: 'rgba(239,68,68,0.1)',
  purple: '#7C5CFC',
  purpleTint: 'rgba(124,92,252,0.1)',
  navy: '#0B3877',
  navyTint: '#EAF2FF',
  white: '#FFFFFF',
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 16,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const shadows = {
  soft: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
    android: {
      elevation: 1,
    },
    default: {},
  }),
  strong: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),
};

export const fontFamily = 'Inter_400Regular';

export const typography = {
  headlineLg: { fontFamily: 'Inter_700Bold', fontSize: 24, lineHeight: 29, letterSpacing: -0.4 },
  headline: { fontFamily: 'Inter_700Bold', fontSize: 20, lineHeight: 24, letterSpacing: -0.3 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 16, lineHeight: 20, letterSpacing: -0.2 },
  subtitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, lineHeight: 20 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
  bodySm: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 16 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 12, lineHeight: 16 },
  labelSm: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 14 },
  micro: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 13 },
};