# iOS-Only Product Scope

JailTime: Focus Court is being built and shipped for iOS only.

## Current platform boundary

- Expo configuration contains an iOS target only: bundle ID `com.zemolabs.jailtime`.
- EAS build profiles contain iOS simulator/device settings only.
- The repository contains the iOS native app and its `JailTimeMonitor` and `JailTimeShield` extension targets.
- Android native project files, Android screen-time service stubs, web build artifacts, and Android/web package scripts have been removed.
- RevenueCat configuration accepts the iOS API key only.

## Native enforcement model

The JavaScript layer calls `src/services/screenTime/IosScreenTimeService.ts`, which bridges to `ios/JailTime/FocusCourtModule.swift`. iOS enforcement is based on:

1. FamilyControls authorization and `FamilyActivityPicker` for app selection.
2. ManagedSettings shields for immediate blocking.
3. DeviceActivity monitoring for scheduled/daily policies.
4. App Group storage shared with the monitor and shield extensions.

The `MockScreenTimeService` remains available for UI development and environments without the native module. It is not a second production platform.

## Required iOS guardrails

Agents must keep iOS permission IDs and requirements in `src/data/permissions.ts`, preserve the FamilyControls/application-group entitlements in `app.config.ts` and the native project, and use `npm run ios` for native verification. Do not reintroduce `android`, `web`, `run:android`, Android UsageStats/overlay/accessibility permissions, or Android RevenueCat keys unless the product scope is explicitly changed first.

## Known MVP limitation

The iOS bridge can authorize, select apps, apply/clear policies, and apply/clear immediate shields. Detailed usage reports and richer history still use the local court-store simulation until the Device Activity report extension is completed.
