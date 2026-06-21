/**
 * Crash Prevention Bootstrap — JailTime: Focus Court
 *
 * Sets up global error handlers as early as possible to prevent silent crashes.
 * Import this at the very top of app/_layout.tsx, before any other imports.
 *
 * Catches fatal JS errors and Hermes unhandled promise rejections so the app
 * does not silently crash at startup with no JS bundle or during runtime.
 */

// ── Global JS error handler ────────────────────────────────────────────────
// Catches fatal and non-fatal JS errors thrown anywhere in the app tree.
const originalHandler = (global as any).ErrorUtils?.getGlobalHandler?.();
(global as any).ErrorUtils?.setGlobalHandler?.((error: Error, isFatal: boolean) => {
  console.error('[GlobalErrorHandler] isFatal:', isFatal, error);
  if (originalHandler) originalHandler(error, isFatal);
});

// ── Hermes unhandled promise rejections ────────────────────────────────────
// Hermes doesn't surface unhandled promise rejections to ErrorUtils by default.
// This makes them visible in the console so they aren't silently swallowed.
if ((global as any).HermesInternal) {
  (global as any).HermesInternal.enablePromiseRejectionTracker?.({
    allRejections: true,
    onUnhandled: (id: number, error: unknown) => {
      console.error('[UnhandledPromiseRejection]', id, error);
    },
  });
}

// ── Reanimated / Worklets eager init ──────────────────────────────────────
// Importing these here (before any component tree mounts) forces the native
// modules to register on the JS thread synchronously, preventing the race
// where a component tries to call into worklets before the module is ready.
import 'react-native-gesture-handler';
import 'react-native-reanimated';

export {};
