# Repository Guidelines

## Project Structure & Module Organization

JailTime: Focus Court is an Expo Router iOS app. Route files live in `app/`: onboarding is a 16-step flow, `(tabs)` contains three visible tabs plus three hidden deep-link routes, `modals` contains transient workflows, and `blocked/[appId].tsx` is the native-block fallback screen. See `docs/SCREEN_INVENTORY.md` before changing navigation. Persistent product state is in `src/store/useCourtStore.ts`; premium state is in `src/store/usePremiumStore.ts`. Domain fixtures and copy are under `src/data`, reusable UI is under `src/components`, and device integrations are under `src/services`. The `ios/` directory contains the app target plus FamilyControls, DeviceActivity, ManagedSettings, and App Group native targets.

## Build, Test, and Development Commands

- `npm install` installs dependencies.
- `npm run assets:extract` regenerates the 64 transparent UI assets from `public/data/ui`.
- `npm run start` starts Expo after asset extraction.
- `npm run ios` extracts assets and runs the iOS native project.
- `npm run typecheck` runs strict TypeScript validation.

There is no test runner configured in `package.json`; use `npm run typecheck` plus an iOS simulator/device smoke test for changes.

## Coding Style & Naming Conventions

TypeScript is strict and uses the `@/*` path alias from `tsconfig.json`. Follow the existing function-component and Zustand-selector patterns. Keep route files focused on screen composition and put reusable visual pieces in `src/components`. There is no repository formatter or linter configured.

## Agent Instructions

This repository is iOS-only. Do not add Android or web scripts, Expo targets, dependencies, permissions, routes, or platform services. Keep iOS entitlements and native extension behavior aligned with `docs/IOS_ONLY.md`. The mock screen-time service is allowed for UI development, but production enforcement belongs behind the iOS native bridge. Update `docs/SCREEN_INVENTORY.md` whenever a route is added, removed, or changes purpose. All UI work must follow `docs/PREMIUM_WHITE_UI.md`; the approved rollout and verification gates live in `docs/PREMIUM_WHITE_REDESIGN_MASTERPLAN.md`.

## Commit & Pull Request Guidelines

Recent history uses short `Commit #N` messages and there is no PR template. Keep changes scoped and include the relevant validation command in the handoff.
