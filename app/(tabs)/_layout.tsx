import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, radius } from '@/src/constants/theme';

function TabGlyph({ label, focused }: { label: string; focused: boolean }) {
  const scale = useSharedValue(focused ? 1.16 : 1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.16 : 1, { damping: 12, stiffness: 240 });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: focused ? -2 : 0 }],
  }));

  return (
    <Animated.Text style={[{ color: focused ? colors.gold : colors.muted, fontWeight: '900', fontSize: 15 }, animatedStyle]}>
      {label}
    </Animated.Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '900' },
        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: 12,
          height: 68,
          borderRadius: radius.xl,
          borderTopWidth: 0,
          backgroundColor: 'rgba(42, 18, 12, 0.96)',
          borderWidth: 1,
          borderColor: 'rgba(255, 200, 61, 0.18)',
        },
      }}
    >
      <Tabs.Screen name="courtroom" options={{ title: 'Court', tabBarIcon: ({ focused }) => <TabGlyph label="C" focused={focused} /> }} />
      <Tabs.Screen name="culprits" options={{ title: 'Culprits', tabBarIcon: ({ focused }) => <TabGlyph label="🔍" focused={focused} /> }} />
      <Tabs.Screen name="jail" options={{ title: 'Jail', tabBarIcon: ({ focused }) => <TabGlyph label="J" focused={focused} /> }} />
      {/* Laws, Evidence and Parole are now sections inside the Court tab — kept here as hidden routes so existing deep-links still work */}
      <Tabs.Screen name="laws" options={{ href: null }} />
      <Tabs.Screen name="evidence" options={{ href: null }} />
      <Tabs.Screen name="parole" options={{ href: null }} />
    </Tabs>
  );
}
