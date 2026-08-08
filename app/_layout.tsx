// Crash prevention — must be the very first import so global error handlers
// are registered before any other module code runs, and so that
// react-native-gesture-handler / react-native-reanimated are eagerly
// initialised on the JS thread before any component tree mounts.
// See bootstrap/crashGuard.ts for details.
import '../bootstrap/crashGuard';

import { Component, type ReactNode, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AssetBootstrapService } from '@/src/services/assets/AssetBootstrapService';
import { NotificationService } from '@/src/services/notifications/NotificationService';
import { initBlockingBridge, syncAppSelectionFromNative } from '@/src/services/screenTime/BlockingBridge';
import { CourtClerk } from '@/src/services/court/CourtClerk';
import { useCourtStore } from '@/src/store/useCourtStore';
import { usePremiumStore } from '@/src/store/usePremiumStore';
import { colors } from '@/src/constants/theme';

// Keep the splash screen visible while initial state loads.
SplashScreen.preventAutoHideAsync();

// ── Startup Error Boundary ─────────────────────────────────────────────────
// Catches any render-time JS error during startup and shows a readable message
// instead of a blank crash. This is the last line of defence — the crash guard
// in bootstrap/crashGuard.ts handles pre-render fatal errors.
class StartupErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: '' };

  componentDidCatch(error: Error) {
    this.setState({ hasError: true, message: error.message });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorScreen}>
          <Text style={styles.errorTitle}>Startup failed</Text>
          <Text style={styles.errorMessage}>{this.state.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// ── Root Layout ────────────────────────────────────────────────────────────
export default function RootLayout() {
  useEffect(() => {
    // Initialise RevenueCat IAP as early as possible.
    usePremiumStore.getState().initializeRevenueCat();
    NotificationService.configure();
    AssetBootstrapService.preload().catch(() => undefined);
    initBlockingBridge();
    // Read the real app selection back from the system on every launch.
    syncAppSelectionFromNative().catch(() => undefined);

    // Hide splash screen once everything is bootstrapped.
    SplashScreen.hideAsync().catch(() => {
      // Already hidden — fine.
    });
  }, []);

  // Failsafe splash-hide: force-hide after 5 s so a slow native module
  // delay can never leave the user staring at the splash forever.
  useEffect(() => {
    const failsafeTimeout = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {
        // Already hidden — fine.
      });
    }, 5000);
    return () => clearTimeout(failsafeTimeout);
  }, []);

  // Global heartbeat: renew the docket on a new day, bank focus seconds against
  // the case being served, settle finished sessions, and let the clerk file any
  // law breaks it can see.
  useEffect(() => {
    let ticks = 0;
    const timer = setInterval(() => {
      const store = useCourtStore.getState();
      store.renewDocket();
      store.tickDocket();
      store.tickFocusSession();
      // Poll the shared policy for a real limit breach. The monitor extension
      // can fire while the app is closed, so this also catches it on resume.
      if (ticks % 15 === 0) CourtClerk.checkDeviceLimit().catch(() => undefined);
      ticks += 1;
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <StartupErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>

        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="report" />
          <Stack.Screen name="blocked/[appId]" />
          <Stack.Screen name="modals/charges-filed" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modals/sentence" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modals/parole-granted" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modals/emergency-bypass" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modals/law-editor" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modals/screen-time-settings" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modals/paywall" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modals/focus-timer" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modals/weekly-report" options={{ presentation: 'modal' }} />
        </Stack>
      </GestureHandlerRootView>
    </StartupErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  errorTitle: {
    color: colors.label,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  errorMessage: {
    color: colors.red,
    fontSize: 14,
    textAlign: 'center',
  },
});
