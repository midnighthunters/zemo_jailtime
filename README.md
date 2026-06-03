# JailTime: Focus Court

Break focus laws. Serve jail time. Earn parole. Reclaim your life.

JailTime: Focus Court is a courtroom-themed screen-time discipline app built with Expo SDK 54, Expo Router, TypeScript, Zustand, RevenueCat-safe premium scaffolding, local notifications, and mocked screen-time enforcement.

## Run

```bash
npm install
npm run assets:extract
npm run start
```

The extraction script reads exactly 8 PNG sheets from `public/data/ui`, splits each sheet into 8 cells, removes the generated checkerboard background, trims the cutout, pads it, and writes 64 transparent assets into `assets/focus-court`.

## Current MVP

- UI complete with onboarding, court tabs, modals, paywall, and blocked screen.
- Local mocked screen-time logic.
- 64 extracted transparent UI assets.
- Fake laws, charges, sentence, jail, and parole reward loop.
- RevenueCat service with guarded configure, offerings, purchase, restore, and entitlement checks.
- Missing RevenueCat keys do not crash the app.
- Local notifications scaffolding.
- Free/pro gating for suspects, laws, strict mode, reports, and custom laws.

## Roadmap

### Phase 2 - Android Native Enforcement

- Create config plugin/native module.
- UsageStatsManager permission screen.
- Detect foreground apps.
- Track installed apps.
- Usage thresholds.
- Blocking activity.
- Optional AccessibilityService only if policy-compliant.
- Foreground service for monitoring.
- Play Store policy declarations.

### Phase 3 - iOS Screen Time Enforcement

- Request FamilyControls entitlement.
- FamilyActivityPicker.
- DeviceActivityMonitor extension.
- ManagedSettings shields.
- DeviceActivityReport extension.
- App group storage.
- Custom shield actions where allowed.
- App Store compliance review.

### Phase 4 - Real Analytics

- Local SQLite history.
- Weekly trial reports.
- Trend charts.
- Danger hour heatmaps.
- App-specific evidence.
- Sleep/focus correlation.

### Phase 5 - Deeper Gamification

- Courtroom upgrade shop.
- Character outfits.
- Seasonal court events.
- Streak protection.
- Evidence replay.
- Dream recovery milestones.
- Full pardon certificates.

### Phase 6 - Backend / Cloud

- Optional login.
- Cloud sync.
- Device transfer.
- Remote config.
- A/B tests.
- RevenueCat webhooks.
- Push notification campaigns.

### Phase 7 - Widgets

- iOS widgets.
- Android widgets.
- Jail timer widget.
- Clean record widget.
- Bedtime law widget.
