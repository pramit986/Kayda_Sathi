// ============================================================
// Kayda Sathi — Design System Theme
// ============================================================

export const Colors = {
  // Primary palette — Deep navy, trust-inspiring
  primary: {
    50: '#EBF0FF',
    100: '#D6E0FF',
    200: '#ADC1FF',
    300: '#85A3FF',
    400: '#5C84FF',
    500: '#1A3A8F',  // Main brand
    600: '#152E72',
    700: '#0F2255',
    800: '#0A1738',
    900: '#05101F',
  },

  // Neutral — Clean grays
  neutral: {
    0: '#FFFFFF',
    50: '#F8F9FB',
    100: '#F1F3F6',
    200: '#E4E7EC',
    300: '#CDD3DC',
    400: '#98A2B3',
    500: '#667085',
    600: '#475467',
    700: '#344054',
    800: '#1D2939',
    900: '#101828',
  },

  // Success — Muted, professional green
  success: {
    50: '#ECFDF3',
    100: '#D1FADF',
    200: '#A6F4C5',
    300: '#6CE9A6',
    400: '#32D583',
    500: '#12B76A',
    600: '#039855',
    700: '#027A48',
    800: '#05603A',
  },

  // Warning — Amber
  warning: {
    50: '#FFFAEB',
    100: '#FEF0C7',
    200: '#FEDF89',
    300: '#FEC84B',
    400: '#FDB022',
    500: '#F79009',
    600: '#DC6803',
    700: '#B54708',
  },

  // Error — Restrained red (urgent only)
  error: {
    50: '#FEF3F2',
    100: '#FEE4E2',
    200: '#FECDCA',
    300: '#FDA29B',
    400: '#F97066',
    500: '#F04438',
    600: '#D92D20',
    700: '#B42318',
  },

  // Info blue
  info: {
    50: '#EFF8FF',
    100: '#D1E9FF',
    200: '#B2DDFF',
    300: '#84CAFF',
    400: '#53B1FD',
    500: '#2E90FA',
    600: '#1570EF',
    700: '#175CD3',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

export const FontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 30,
  '5xl': 36,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const BorderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const Theme = {
  colors: Colors,
  spacing: Spacing,
  fontSize: FontSize,
  fontWeight: FontWeight,
  borderRadius: BorderRadius,
  shadow: Shadow,
};

export default Theme;
