/**
 * Theme Utilities for Social & Nerd Modes
 * Centralized color and styling functions
 */

type Theme = 'social' | 'nerd';

export const themeColors = {
  social: {
    primary: '#a855f7',
    secondary: '#ec4899',
    accent: '#f43f5e',
    bg: '#ffffff',
    surface: '#f9fafb',
    text: '#0f172a',
    muted: '#6b7280',
    border: '#e5e7eb',
  },
  nerd: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#3b82f6',
    bg: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    muted: '#64748b',
    border: '#cbd5e1',
  },
};

export const themeClasses = {
  social: {
    // Backgrounds
    bgPrimary: 'bg-purple-500',
    bgSecondary: 'bg-pink-500',
    bgSurface: 'bg-gray-50',
    // Text
    textPrimary: 'text-purple-600',
    textSecondary: 'text-pink-600',
    textMuted: 'text-gray-600',
    // Borders
    borderPrimary: 'border-purple-500',
    borderSecondary: 'border-pink-500',
    // Buttons
    btnPrimary: 'bg-purple-600 hover:bg-purple-700 text-white',
    btnSecondary: 'bg-pink-600 hover:bg-pink-700 text-white',
    // Cards
    card: 'bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md',
    // Badges
    badge: 'bg-purple-100 text-purple-700',
  },
  nerd: {
    // Backgrounds
    bgPrimary: 'bg-blue-500',
    bgSecondary: 'bg-slate-500',
    bgSurface: 'bg-slate-50',
    // Text
    textPrimary: 'text-blue-600',
    textSecondary: 'text-slate-600',
    textMuted: 'text-slate-600',
    // Borders
    borderPrimary: 'border-blue-500',
    borderSecondary: 'border-slate-500',
    // Buttons
    btnPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    btnSecondary: 'bg-slate-600 hover:bg-slate-700 text-white',
    // Cards
    card: 'bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md',
    // Badges
    badge: 'bg-blue-100 text-blue-700',
  },
};

/**
 * Get theme-aware class names
 */
export function getThemeClass(theme: Theme, key: keyof typeof themeClasses.nerd): string {
  return themeClasses[theme][key];
}

/**
 * Get theme-aware color value
 */
export function getThemeColor(theme: Theme, key: keyof typeof themeColors.nerd): string {
  return themeColors[theme][key];
}

/**
 * Mobile-first responsive utilities
 */
export const mobileFirst = {
  container: 'max-w-2xl mx-auto',
  padding: 'px-3 sm:px-4',
  navHeight: 'h-14 sm:h-16',
  navPadding: 'py-2 sm:py-3',
  cardPadding: 'p-3 sm:p-4',
  spacing: {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  },
};

/**
 * Typography utilities for mobile
 */
export const typography = {
  h1: 'text-2xl sm:text-3xl font-bold',
  h2: 'text-xl sm:text-2xl font-bold',
  h3: 'text-lg sm:text-xl font-semibold',
  subtitle: 'text-sm sm:text-base font-medium',
  body: 'text-sm sm:text-base',
  caption: 'text-xs sm:text-sm',
};

/**
 * Shadow utilities (soft, professional)
 */
export const shadows = {
  xs: 'shadow-xs',
  sm: 'shadow-sm',
  base: 'shadow',
  md: 'shadow-md',
};

/**
 * Rounded corner utilities (compact)
 */
export const rounded = {
  xs: 'rounded-xs',
  sm: 'rounded-sm',
  base: 'rounded-base',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
};
