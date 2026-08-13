import type { ConfigContext, ExpoConfig } from 'expo/config';

const boolFromEnv = (value: string | undefined) => value === 'true';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'JailTime: Focus Court',
  slug: 'jailtime-focus-court',
  version: '1.0.0',
  icon: './assets/icon.png',
  platforms: ['ios'],
  orientation: 'portrait',
  scheme: 'zemolabsjailtime',
  userInterfaceStyle: 'light',
  newArchEnabled: false,
  assetBundlePatterns: ['assets/**/*'],
  plugins: [
    'expo-router',
    'expo-notifications',
    'expo-asset',
  ],
  experiments: {
    typedRoutes: false,
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.zemolabs.jailtime',
    requireFullScreen: true,
    infoPlist: {
      NSUserNotificationsUsageDescription:
        'JailTime sends focus warnings, bedtime notices, and parole reminders.',
      NSFamilyControlsUsageDescription:
        'JailTime uses Screen Time authorization to let you select and shield distracting apps.',
      UILaunchStoryboardName: 'LaunchScreen',
      CFBundleIconName: 'AppIcon',
    },
    entitlements: {
      'com.apple.developer.family-controls': true,
      'com.apple.security.application-groups': ['group.com.zemolabs.jailtime'],
    },
  },
  extra: {
    // ─── RevenueCat ──────────────────────────────────────────────────────────
    // Live values are baked in as defaults so the app works without env vars.
    // Override per-build via EXPO_PUBLIC_* env vars:
    //   EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
    revenueCatIosApiKey:
      process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '',
    revenueCatUseTestStore: boolFromEnv(process.env.EXPO_PUBLIC_REVENUECAT_USE_TEST_STORE),
  },
});
