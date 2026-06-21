import { BlurView } from 'expo-blur';
import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, radius } from '@/src/constants/theme';

type TabIconProps = {
  emoji: string;
  label: string;
  focused: boolean;
};

function TabIcon({ emoji, label, focused }: TabIconProps) {
  const scale = useSharedValue(focused ? 1.14 : 1);
  const pillScale = useSharedValue(focused ? 1 : 0.7);
  const pillOpacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.14 : 1, {
      damping: 14,
      stiffness: 280,
      mass: 0.8,
    });
    pillScale.value = withSpring(focused ? 1 : 0.7, {
      damping: 16,
      stiffness: 300,
      mass: 0.7,
    });
    pillOpacity.value = withSpring(focused ? 1 : 0, {
      damping: 16,
      stiffness: 300,
    });
  }, [focused, scale, pillScale, pillOpacity]);

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pillScale.value }],
    opacity: pillOpacity.value,
  }));

  return (
    <View style={tabStyles.iconWrap}>
      {/* Active pill indicator */}
      <Animated.View style={[tabStyles.activePill, pillStyle]} />
      <Animated.Text style={[tabStyles.emoji, emojiStyle]}>
        {emoji}
      </Animated.Text>
    </View>
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
        // The tab bar itself — floating glass capsule
        tabBarStyle: {
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 18,
          height: 76,
          borderRadius: 38,
          borderTopWidth: 0,
          // Transparent so the BlurView behind shows through
          backgroundColor: 'transparent',
          elevation: 0,
          paddingBottom: 0,
          paddingTop: 0,
          // Prevent clipping of the blur
          overflow: 'hidden',
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFillObject}>
            {/* Native glass blur — the real iOS tab bar material */}
            {Platform.OS !== 'web' ? (
              <BlurView
                tint="systemChromeMaterial"
                intensity={24}
                style={StyleSheet.absoluteFillObject}
              />
            ) : (
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.88)' }]} />
            )}
            {/* Glass tint */}
            <View style={[StyleSheet.absoluteFillObject, tabStyles.tint]} />
            {/* Top specular highlight edge */}
            <View style={tabStyles.topEdge} />
            {/* Border ring */}
            <View style={tabStyles.borderRing} />
          </View>
        ),
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

const tabStyles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 36,
  },
  activePill: {
    position: 'absolute',
    width: 38,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.blueLight,
  },
  emoji: {
    fontSize: 19,
  },
  // Glass tint overlay
  tint: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 38,
  },
  // Specular top edge highlight
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  // Outer border ring
  borderRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
