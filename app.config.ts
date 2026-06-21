import type { ConfigContext, ExpoConfig } from 'expo/config';

const boolFromEnv = (value: string | undefined) => value === 'true';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'JailTime: Focus Court',
  slug: 'jailtime-focus-court',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'jailtimefocuscourt',
  userInterfaceStyle: 'dark',
  newArchEnabled: false,
  assetBundlePatterns: ['assets/**/*'],
  plugins: [
    'expo-router',
    'expo-notifications',
    'expo-asset',
    'expo-tracking-transparency',
  ],
  experiments: {
    typedRoutes: false,
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.jailtime.focuscourt',
    requireFullScreen: true,
    infoPlist: {
      NSUserNotificationsUsageDescription:
        'JailTime sends focus warnings, bedtime notices, and parole reminders.',
      NSFamilyControlsUsageDescription:
        'JailTime uses Screen Time authorization to let you select and shield distracting apps.',
      NSUserTrackingUsageDescription:
        'Allow JailTime to track your activity across other companies\u2019 apps and websites to measure how digital distractions impact your focus goals.',
      UILaunchStoryboardName: 'LaunchScreen',
    },
    entitlements: {
      'com.apple.developer.family-controls': true,
      'com.apple.security.application-groups': ['group.com.jailtime.focuscourt'],
    },
  },
  android: {
    package: 'com.jailtime.focuscourt',
    permissions: [
      'android.permission.INTERNET',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.PACKAGE_USAGE_STATS',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.QUERY_ALL_PACKAGES',
      'android.permission.VIBRATE',
    ],
    adaptiveIcon: {
      backgroundColor: '#180B08',
    },
  },
  web: {
    bundler: 'metro',
    output: 'single',
  },
  extra: {
    // ─── RevenueCat ──────────────────────────────────────────────────────────
    // Live values are baked in as defaults so the app works without env vars.
    // Override per-build via EXPO_PUBLIC_* env vars:
    //   EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
    //   EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
    revenueCatIosApiKey:
      process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '',
    revenueCatAndroidApiKey:
      process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '',
    revenueCatUseTestStore: boolFromEnv(process.env.EXPO_PUBLIC_REVENUECAT_USE_TEST_STORE),
  },
});
