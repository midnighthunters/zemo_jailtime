// Premium white tactile design system.
// Surfaces stay neutral; color is reserved for actions, status, and progress.

export const colors = {
  background: '#F7F8FA',
  background2: '#F3F4F6',
  background3: '#EEF0F3',
  backgroundDark: '#272B30',

  surface: '#FFFFFF',
  surfaceMuted: '#F3F4F6',
  surfacePressed: '#ECEEF2',
  border: '#E7E9ED',
  borderStrong: '#D9DDE3',
  depthEdge: '#DFE2E7',

  blue: '#356AE6',
  blueDark: '#2855BE',
  blueLight: '#E9F0FF',
  indigo: '#6757D9',
  purple: '#8357C5',
  purpleLight: '#F1EDFB',
  pink: '#D94C7D',
  red: '#E25555',
  redDark: '#B53F43',
  redLight: '#FCEBEC',
  orange: '#E8913A',
  orangeDark: '#B96B22',
  orangeLight: '#FFF1E3',
  yellow: '#E4B83B',
  yellowDark: '#A87E11',
  yellowLight: '#FFF7D9',
  green: '#35A86B',
  greenDark: '#267C50',
  greenLight: '#E7F6ED',
  teal: '#319EA8',
  mint: '#51B88C',
  cyan: '#4D9FCC',

  label: '#272B30',
  labelSecondary: '#6F7680',
  labelTertiary: '#9AA0A8',
  labelQuaternary: '#BEC3CA',
  white: '#FFFFFF',
  black: '#1F2328',

  fillPrimary: '#E4E7EB',
  fillSecondary: '#ECEEF1',
  fillTertiary: '#F1F2F4',
  fillQuaternary: '#F5F6F7',
  separator: '#E7E9ED',
  separatorOpaque: '#D9DDE3',

  // Compatibility aliases used throughout existing route styles.
  gold: '#356AE6',
  deepGold: '#2855BE',
  cream: '#272B30',
  parchment: '#6F7680',
  parchmentDark: '#D9DDE3',
  ink: '#272B30',
  danger: '#E25555',
  dangerDark: '#B53F43',
  success: '#35A86B',
  successDark: '#267C50',
  muted: '#9AA0A8',
  wood: '#FFF6EA',
  woodDark: '#F3F4F6',
  courtroomBrown: '#F4E8DA',
  purpleDark: '#6757D9',
  purpleDeep: '#4F43B2',

  // Legacy glass aliases now resolve to opaque or restrained white surfaces.
  glassWhite: '#FFFFFF',
  glassWhiteStrong: '#FFFFFF',
  glassWhiteMid: '#FAFBFC',
  glassWhiteSubtle: '#F5F6F8',
  glassDark: '#272B30',
  glassDarkMid: '#343940',
  glassBlue: '#E9F0FF',
  glassPurple: '#F1EDFB',
  glassRed: '#FCEBEC',
  glassGreen: '#E7F6ED',
  glassOrange: '#FFF1E3',
  glassAmber: '#FFF7D9',
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const shadows = {
  card: {
    shadowColor: '#141E32',
    shadowOpacity: 0.055,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  soft: {
    shadowColor: '#141E32',
    shadowOpacity: 0.045,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  strong: {
    shadowColor: '#141E32',
    shadowOpacity: 0.09,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  }),
};

export const tactile = {
  surface: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderBottomColor: colors.depthEdge,
    borderBottomWidth: 4,
  },
  pressed: {
    transform: [{ translateY: 3 }],
    borderBottomWidth: 1,
  },
};

export const type = {
  largeTitle: { fontSize: 34, lineHeight: 40, fontWeight: '700' as const, letterSpacing: -0.7 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, letterSpacing: -0.5 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const, letterSpacing: -0.35 },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600' as const, letterSpacing: -0.25 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const, letterSpacing: -0.2 },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '400' as const, letterSpacing: -0.15 },
  callout: { fontSize: 15, lineHeight: 21, fontWeight: '500' as const, letterSpacing: -0.1 },
  subhead: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const, letterSpacing: -0.08 },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const, letterSpacing: 0 },
  caption1: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const, letterSpacing: 0 },
  caption2: { fontSize: 11, lineHeight: 14, fontWeight: '500' as const, letterSpacing: 0.04 },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0 },
  section: { fontSize: 20, lineHeight: 25, fontWeight: '700' as const, letterSpacing: -0.25 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, letterSpacing: -0.5 },
};

export const glass = {
  light: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1.5 },
  lightStrong: { backgroundColor: colors.surface, borderColor: colors.borderStrong, borderWidth: 1.5 },
  medium: { backgroundColor: '#FAFBFC', borderColor: colors.border, borderWidth: 1.5 },
  subtle: { backgroundColor: colors.surfaceMuted, borderColor: colors.border, borderWidth: 1 },
  dark: { backgroundColor: colors.backgroundDark, borderColor: '#3E444C', borderWidth: 1 },
};
