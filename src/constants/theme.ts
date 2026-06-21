// ─── Apple Glass UI Design System ────────────────────────────────────────────
// visionOS / iOS Liquid Glass inspired aesthetic.
// Deep translucency, multi-layer depth, specular highlights, natural motion.
// Every surface is glass-first. Depth over shadows. Floating components.

export const colors = {
  // ── Backgrounds ──
  background: '#F2F2F7',          // iOS system background (light gray)
  background2: '#FFFFFF',          // Pure white for layered surfaces
  backgroundDark: '#1C1C1E',       // Dark surface (for dark-mode cards)

  // ── Glass Surfaces ──
  glassWhite: 'rgba(255,255,255,0.72)',
  glassWhiteStrong: 'rgba(255,255,255,0.88)',
  glassWhiteMid: 'rgba(255,255,255,0.56)',
  glassWhiteSubtle: 'rgba(255,255,255,0.32)',
  glassDark: 'rgba(28,28,30,0.72)',
  glassDarkMid: 'rgba(28,28,30,0.56)',
  glassBlue: 'rgba(0,122,255,0.12)',
  glassPurple: 'rgba(88,86,214,0.12)',
  glassRed: 'rgba(255,59,48,0.12)',
  glassGreen: 'rgba(52,199,89,0.12)',
  glassOrange: 'rgba(255,149,0,0.12)',
  glassAmber: 'rgba(255,204,0,0.12)',

  // ── iOS System Colors ──
  blue: '#007AFF',               // iOS blue (primary action)
  blueDark: '#0056CC',
  blueLight: 'rgba(0,122,255,0.18)',
  indigo: '#5856D6',
  purple: '#AF52DE',
  purpleLight: 'rgba(175,82,222,0.18)',
  pink: '#FF2D55',
  red: '#FF3B30',
  redDark: '#C0392B',
  redLight: 'rgba(255,59,48,0.16)',
  orange: '#FF9500',
  orangeDark: '#CC7700',
  orangeLight: 'rgba(255,149,0,0.16)',
  yellow: '#FFCC00',
  yellowDark: '#CCA300',
  yellowLight: 'rgba(255,204,0,0.16)',
  green: '#34C759',
  greenDark: '#248A3D',
  greenLight: 'rgba(52,199,89,0.16)',
  teal: '#30B0C7',
  mint: '#00C7BE',
  cyan: '#32ADE6',

  // ── Text (semantic) ──
  label: '#000000',               // Primary text (iOS label)
  labelSecondary: 'rgba(60,60,67,0.6)',
  labelTertiary: 'rgba(60,60,67,0.3)',
  labelQuaternary: 'rgba(60,60,67,0.18)',
  white: '#FFFFFF',
  black: '#000000',

  // ── Fill (semantic) ──
  fillPrimary: 'rgba(120,120,128,0.2)',
  fillSecondary: 'rgba(120,120,128,0.16)',
  fillTertiary: 'rgba(118,118,128,0.12)',
  fillQuaternary: 'rgba(116,116,128,0.08)',

  // ── Separator ──
  separator: 'rgba(60,60,67,0.12)',
  separatorOpaque: '#C6C6C8',

  // ── Legacy aliases kept for backward compat with non-redesigned code ──
  gold: '#FFCC00',
  deepGold: '#CCA300',
  cream: '#FFFFFF',
  parchment: 'rgba(60,60,67,0.6)',
  parchmentDark: 'rgba(60,60,67,0.36)',
  ink: '#1C1C1E',
  danger: '#FF3B30',
  dangerDark: '#C0392B',
  success: '#34C759',
  successDark: '#248A3D',
  muted: 'rgba(60,60,67,0.36)',
  background3: '#F2F2F7',
  wood: 'rgba(255,149,0,0.14)',
  woodDark: 'rgba(255,149,0,0.08)',
  courtroomBrown: 'rgba(255,149,0,0.22)',
  purpleDark: '#5856D6',
  purpleDeep: '#3A34B0',
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 40,
};

export const shadows = {
  // iOS-style shadows — very soft, large spread, low opacity
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  soft: {
    shadowColor: '#000000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  strong: {
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  }),
};

export const type = {
  largeTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: 0.37,
  },
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.35,
  },
  title3: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
  },
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
  },
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
  },
  subhead: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
  },
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.06,
  },
  // Convenience aliases
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  section: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
};

// ── Glass-specific helpers ────────────────────────────────────────────────────
export const glass = {
  light: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
  },
  lightStrong: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderColor: 'rgba(255,255,255,1)',
    borderWidth: 1,
  },
  medium: {
    backgroundColor: 'rgba(255,255,255,0.56)',
    borderColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
  },
  subtle: {
    backgroundColor: 'rgba(255,255,255,0.32)',
    borderColor: 'rgba(255,255,255,0.48)',
    borderWidth: 1,
  },
  dark: {
    backgroundColor: 'rgba(28,28,30,0.72)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
  },
};
