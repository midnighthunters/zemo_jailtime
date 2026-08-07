import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { colors, radius, shadows } from '@/src/constants/theme';

type TabIconProps = {
  symbol: string;
  focused: boolean;
};

function TabIcon({ symbol, focused }: TabIconProps) {
  return (
    <View style={[styles.iconStage, focused && styles.iconStageFocused]}>
      <Image
        source={`sf:${symbol}`}
        contentFit="contain"
        tintColor={focused ? colors.blue : colors.labelTertiary}
        style={styles.icon}
      />
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
        tabBarInactiveTintColor: colors.labelTertiary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0,
          marginTop: -3,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: 16,
          height: 78,
          borderRadius: radius.xl,
          borderCurve: 'continuous',
          borderWidth: 1.5,
          borderTopWidth: 1.5,
          borderColor: colors.border,
          borderBottomWidth: 4,
          borderBottomColor: colors.depthEdge,
          backgroundColor: colors.surface,
          paddingBottom: 4,
          paddingTop: 5,
          overflow: 'hidden',
          ...shadows.strong,
        },
        tabBarItemStyle: {
          borderRadius: radius.lg,
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="courtroom"
        options={{
          title: 'Court',
          tabBarIcon: ({ focused }) => <TabIcon symbol="building.columns.fill" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="culprits"
        options={{
          title: 'Culprits',
          tabBarIcon: ({ focused }) => <TabIcon symbol="person.2.fill" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="jail"
        options={{
          title: 'Jail',
          tabBarIcon: ({ focused }) => <TabIcon symbol="lock.fill" focused={focused} />,
        }}
      />
      <Tabs.Screen name="laws" options={{ href: null }} />
      <Tabs.Screen name="evidence" options={{ href: null }} />
      <Tabs.Screen name="parole" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconStage: {
    width: 42,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStageFocused: {
    backgroundColor: colors.blueLight,
    borderWidth: 1,
    borderColor: '#D5E0F8',
  },
  icon: {
    width: 20,
    height: 20,
  },
});
