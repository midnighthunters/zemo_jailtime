import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, radius, shadows } from '@/src/constants/theme';

type TabIconProps = {
  emoji: string;
  label: string;
  focused: boolean;
};

function TabIcon({ emoji, label, focused }: TabIconProps) {
  const scale = useSharedValue(focused ? 1.12 : 1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.12 : 1, { damping: 14, stiffness: 260 });
  }, [focused, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.iconWrap, animStyle]}>
      {focused ? (
        <View style={styles.activePill}>
          <Text style={styles.activeEmoji}>{emoji}</Text>
        </View>
      ) : (
        <Text style={styles.inactiveEmoji}>{emoji}</Text>
      )}
    </Animated.View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: colors.labelSecondary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.1,
          marginTop: -2,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          height: 72,
          borderRadius: radius.xxl,
          borderTopWidth: 0,
          backgroundColor: 'rgba(255,255,255,0.82)',
          borderWidth: 1.5,
          borderColor: 'rgba(255,255,255,0.95)',
          paddingBottom: 0,
          paddingTop: 0,
          ...shadows.card,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      }}
    >
      <Tabs.Screen
        name="courtroom"
        options={{
          title: 'Court',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚖️" label="Court" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="culprits"
        options={{
          title: 'Culprits',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" label="Culprits" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="jail"
        options={{
          title: 'Jail',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔒" label="Jail" focused={focused} />,
        }}
      />
      {/* Hidden routes for deep-link compat */}
      <Tabs.Screen name="laws" options={{ href: null }} />
      <Tabs.Screen name="evidence" options={{ href: null }} />
      <Tabs.Screen name="parole" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 32,
  },
  activePill: {
    backgroundColor: colors.blueLight,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeEmoji: {
    fontSize: 18,
  },
  inactiveEmoji: {
    fontSize: 18,
    opacity: 0.65,
  },
});
