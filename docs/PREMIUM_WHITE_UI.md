# Premium White UI Contract

Use this guide for every new or edited UI surface.

## Tokens

Import semantic values from `src/constants/theme.ts`; do not introduce a second palette.

- Canvas: `colors.background` / `colors.background2`
- Card: `colors.surface`
- Secondary surface: `colors.surfaceMuted`
- Text: `colors.label`, `colors.labelSecondary`, `colors.labelTertiary`
- Structure: `colors.border`, `colors.borderStrong`, `colors.depthEdge`
- Primary action: `colors.blue`; selected background: `colors.blueLight`
- Status: green for success, red for destructive, orange for warning, purple for premium

## Cards and rows

- Default to a white surface, `radius.xl`, 1.5 point neutral border, 4 point bottom edge, and `shadows.soft` or `shadows.card`.
- Use one small accent bar, side marker, icon tint, or corner wash for semantic emphasis.
- Group related metrics and list rows when separate nested cards would add noise.
- Keep artwork in a light neutral stage. Do not use illustrations as dark full-screen backgrounds.

## Interaction

- Interactive surfaces use `Pressable`, have a 44-point minimum target, and expose an accessibility role/state.
- A pressed surface translates down about 3 points and reduces its bottom edge. Keep feedback fast and restrained.
- Primary buttons are solid blue; secondary buttons are white and raised; ghost buttons use a muted neutral surface.
- Inputs are white/light gray with a clear border and dark text. Selected options use light blue plus a blue border or indicator.

## Typography and icons

- Use the iOS system font and semantic type tokens where practical.
- Avoid heavy all-caps except short eyebrows and status labels.
- Use SF Symbols through `expo-image` for navigation and functional actions. Product illustrations may support content but must not replace functional icons.

## Motion and effects

- Do not add glassmorphism, decorative blur, neon, glow, large gradients, or perpetual floating/pulsing motion.
- Brief entrance transitions and functional progress/countdown/hold/breathing animations are allowed. Respect Reduce Motion when adding new animation.

## Platform boundary

This app targets iOS only. Do not add Android or web conditionals, targets, scripts, services, packages, or UI fallbacks.
