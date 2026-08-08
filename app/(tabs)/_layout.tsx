import { Tabs } from 'expo-router';
import { colors, radius, shadows } from '@/src/constants/theme';

/**
 * Two visible tabs: Court (docket, custody, verdicts, focus) and Culprits
 * (laws, distractions, enforcement switch). Laws, Evidence, and Parole stay
 * registered for deep links.
 *
 * The tab bar is label-only. See docs/DAILY_DOCKET_MASTERPLAN.md.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: colors.labelTertiary,
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
          letterSpacing: -0.1,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: 16,
          height: 66,
          borderRadius: radius.xl,
          borderCurve: 'continuous',
          borderWidth: 1.5,
          borderTopWidth: 1.5,
          borderColor: colors.border,
          borderBottomWidth: 4,
          borderBottomColor: colors.depthEdge,
          backgroundColor: colors.surface,
          paddingBottom: 6,
          paddingTop: 6,
          overflow: 'hidden',
          ...shadows.strong,
        },
        tabBarItemStyle: {
          borderRadius: radius.lg,
          paddingVertical: 6,
        },
      }}
    >
      <Tabs.Screen name="courtroom" options={{ title: 'Court' }} />
      <Tabs.Screen name="culprits" options={{ title: 'Culprits' }} />
      <Tabs.Screen name="laws" options={{ href: null }} />
      <Tabs.Screen name="evidence" options={{ href: null }} />
      <Tabs.Screen name="parole" options={{ href: null }} />
    </Tabs>
  );
}
