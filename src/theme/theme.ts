import type {ThemeConfig} from 'antd';

// Driftive brand colors - teal/cyan theme representing "drift"
export const colors = {
  // Primary - Teal
  primary: '#0891b2',
  primaryHover: '#0e7490',
  primaryActive: '#155e75',
  primaryLight: '#ecfeff',

  // Status colors
  success: '#10b981',
  successBg: '#ecfdf5',
  warning: '#f59e0b',
  warningBg: '#fffbeb',
  error: '#ef4444',
  errorBg: '#fef2f2',

  // Neutrals
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  background: '#f8fafc',
  cardBg: '#ffffff',
};

export const theme: ThemeConfig = {
  token: {
    // Colors
    colorPrimary: colors.primary,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.error,
    colorInfo: colors.primary,

    // Typography
    colorText: colors.text,
    colorTextSecondary: colors.textSecondary,

    // Borders
    colorBorder: colors.border,
    borderRadius: 8,
    borderRadiusLG: 12,

    // Layout
    colorBgContainer: colors.cardBg,
    colorBgLayout: colors.background,

    // Shadows
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },
  components: {
    Button: {
      primaryShadow: '0 2px 4px rgba(8, 145, 178, 0.3)',
      defaultBorderColor: colors.border,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Table: {
      headerBg: colors.background,
      rowHoverBg: '#f0fdfa',
    },
    Menu: {
      itemHoverBg: '#f0fdfa',
      itemSelectedBg: '#ccfbf1',
      itemSelectedColor: colors.primary,
    },
    Tag: {
      defaultBg: colors.background,
    },
    Statistic: {
      titleFontSize: 13,
      contentFontSize: 22,
    },
  },
};

// CSS variables for use in styled components or inline styles
export const cssVars = {
  '--color-primary': colors.primary,
  '--color-primary-hover': colors.primaryHover,
  '--color-success': colors.success,
  '--color-warning': colors.warning,
  '--color-error': colors.error,
  '--hover-transition': 'all 0.2s ease-in-out',
};
