# Premium White Redesign Masterplan

Status: **Auto-approved by the product owner and in implementation.**

## Outcome

Redesign all 36 route-backed screens of JailTime: Focus Court into one premium, clean, tactile white card system while preserving every route, store action, premium gate, timer, notification flow, purchase path, and iOS Screen Time workflow. The product remains iOS-only for iPhone and iPad.

## Guardrails

- Keep all 36 route files and their purposes exactly as recorded in `docs/SCREEN_INVENTORY.md`.
- Do not change Zustand state shape, business rules, RevenueCat behavior, notification behavior, FamilyControls/ManagedSettings/DeviceActivity contracts, native bridge method names, App Group identifiers, or entitlements as part of this visual pass.
- Do not add Android or web targets, scripts, services, permissions, or fallbacks.
- Do not introduce lessons, XP, mascots, or other new product mechanics. Existing court identity and artwork remain supporting content.
- Use native iOS interaction conventions, SF Symbols for functional icons, 44-point minimum touch targets, dark-content status bars, Dynamic Type-safe layouts, and Reduce Motion-aware transitions.

## Visual acceptance contract

- Canvas: `#F7F8FA`; secondary canvas: `#F3F4F6`; cards: `#FFFFFF`.
- Primary text: `#272B30`; secondary: `#6F7680`; muted: `#9AA0A8`.
- Card border: `#E7E9ED`; tactile bottom edge: `#DFE2E7`.
- Standard cards use a 20–24 point radius, 1.5 point border, 4 point bottom edge, restrained shadow, and about 20 points of padding.
- Interactive surfaces move down about 3 points and collapse their raised edge when pressed.
- Blue `#356AE6` is the primary action color. Red, orange, green, and purple are reserved for destructive, warning, success, and premium states.
- At least 80% of each screen remains neutral. Selected states use a light tint, border, marker, or check—not a large saturated panel.
- Avoid decorative blur, glassmorphism, neon, large gradients, glowing shadows, and perpetual decorative animation. Functional hold, countdown, and breathing motion may remain.

## Implementation phases

### 1. Foundation and shell

- Finalize semantic tokens in `src/constants/theme.ts`.
- Rebuild `CourtBackground`, `CourtCard`, `CourtButton`, `ScreenHeader`, and `StampBadge` around the tactile white contract.
- Force light appearance in Expo/iOS configuration.
- Replace the floating glass navigation with an opaque white raised tab bar and native symbols.

### 2. Shared domain surfaces

- Migrate onboarding scaffold and form controls.
- Migrate evidence, law, suspect, blocked-app, distraction, progress, parole, sentence, permission, character, parchment, and premium-gate components.
- Preserve every public prop, callback, and data path used by route files.

### 3. Onboarding — 16 screens

- Apply one light progress/hero/form/CTA hierarchy to all onboarding routes.
- Keep illustrations inside bounded neutral media stages.
- Verify allow, deny, skip, already-granted, and completion navigation states.

### 4. Main and hidden tabs — 6 screens

- Courtroom: case status, metrics, parole, evidence, rewards, and report actions.
- Culprits: laws, app categories, app limits, editing sheet, picker links, and Pro locks.
- Jail: custody status, timer, blocked apps, focus action, bypass, and unblock routes.
- Laws, Evidence, Parole: migrate their carousels, filters, charts, history, and premium states.

### 5. Modals and enforcement fallback — 13 screens

- Migrate all 12 modal workflows and `/blocked/[appId]` without changing routing or state transitions.
- Keep multi-stage behavior in charge, sentence, timer, emergency, unblock, purchase, restore, and app-picker flows.
- Align launch and ManagedSettings shield presentation with the light theme without modifying enforcement policy.

### 6. Accessibility, consistency, and cleanup

- Add appropriate roles, labels, selected/disabled state, hit areas, and readable contrast to custom controls.
- Remove remaining decorative blur, gradients, old brown surfaces, copied glass highlights, and non-functional looping motion.
- Verify long labels, keyboard avoidance, safe areas, compact/large iPhones, and iPad widths.
- Keep this document and `docs/PREMIUM_WHITE_UI.md` as the implementation contract for future agents.

## Verification gates

1. `npm run typecheck` passes.
2. The route manifest still contains 36 route-backed screens, three visible tabs, three hidden tab routes, and 12 modals.
3. `app.config.ts`, package scripts, and native services remain iOS-only.
4. A source audit finds no decorative `BlurView`, `LinearGradient`, old dark-brown backgrounds, or non-functional `withRepeat` loops.
5. On macOS, run the app on a compact iPhone, a current large iPhone, and an iPad; complete onboarding, law/app setup, charge-to-parole, Screen Time permission/picker, paywall/restore, and blocked-app flows.
6. Validate VoiceOver order, Dynamic Type, Reduce Motion, selected/disabled/loading/error states, keyboard layouts, safe areas, and tactile press behavior.

## Definition of done

Every route and major UI state uses the same off-white canvas, white tactile cards, dark typography, restrained semantic color, and consistent iOS controls. No workflow, data contract, purchase path, permission path, route purpose, or native enforcement rule changes. Static checks pass in this workspace; final native visual QA is completed on macOS and a physical iOS device.
