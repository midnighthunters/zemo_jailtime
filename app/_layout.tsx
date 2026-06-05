import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { AssetBootstrapService } from '@/src/services/assets/AssetBootstrapService';
import { NotificationService } from '@/src/services/notifications/NotificationService';
import { useCourtStore } from '@/src/store/useCourtStore';
import { usePremiumStore } from '@/src/store/usePremiumStore';
import { colors } from '@/src/constants/theme';

export default function RootLayout() {
  useEffect(() => {
    usePremiumStore.getState().initializeRevenueCat();
    NotificationService.configure();
    AssetBootstrapService.preload().catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      useCourtStore.getState().tickSentence();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="blocked/[appId]" />
        <Stack.Screen name="modals/charges-filed" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/sentence" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/parole-granted" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/emergency-bypass" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/law-editor" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/screen-time-settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/paywall" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modals/weekly-report" options={{ presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
